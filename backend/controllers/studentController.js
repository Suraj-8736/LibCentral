const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Private (Admin / Librarian)
const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      course,
      branch,
      year,
      status,
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { role: 'student' };

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { studentId: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (course && course !== 'All') query.course = course;
    if (branch && branch !== 'All') query.branch = branch;
    if (year && year !== 'All') query.year = year;
    if (status && status !== 'All') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach active loans and unpaid fines count for each student
    const studentIds = students.map((s) => s._id);

    const activeLoansCounts = await Transaction.aggregate([
      { $match: { userId: { $in: studentIds }, status: { $in: ['issued', 'overdue'] } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const activeLoansMap = {};
    activeLoansCounts.forEach((item) => {
      activeLoansMap[item._id.toString()] = item.count;
    });

    const pendingFines = await Fine.aggregate([
      { $match: { userId: { $in: studentIds }, status: 'pending' } },
      { $group: { _id: '$userId', total: { $sum: '$amount' } } },
    ]);

    const pendingFinesMap = {};
    pendingFines.forEach((item) => {
      pendingFinesMap[item._id.toString()] = item.total;
    });

    const enhancedStudents = students.map((s) => ({
      ...s.toObject(),
      activeLoans: activeLoansMap[s._id.toString()] || 0,
      unpaidFine: pendingFinesMap[s._id.toString()] || 0,
    }));

    res.json({
      success: true,
      count: enhancedStudents.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      students: enhancedStudents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with full borrowing history and fines
// @route   GET /api/students/:id
// @access  Private (Admin / Librarian / Student self)
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Authorization check: student can only view own profile
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== student._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile',
      });
    }

    // Active issues
    const activeTransactions = await Transaction.find({
      userId: student._id,
      status: { $in: ['issued', 'overdue'] },
    }).populate('bookId');

    // Complete transaction history
    const history = await Transaction.find({ userId: student._id })
      .populate('bookId')
      .sort({ createdAt: -1 });

    // Fines
    const fines = await Fine.find({ userId: student._id })
      .populate('bookId', 'title isbn author')
      .sort({ createdAt: -1 });

    const totalFines = fines.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingFines = fines
      .filter((f) => f.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      student,
      activeLoansCount: activeTransactions.length,
      activeTransactions,
      history,
      fines,
      totalFines,
      pendingFines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin / Librarian)
const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, studentId, course, branch, year, phone, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    let customStudentId = studentId;
    if (!customStudentId) {
      const count = await User.countDocuments({ role: 'student' });
      customStudentId = `STU${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    }

    const student = await User.create({
      name,
      email,
      password: password || 'student123',
      role: 'student',
      studentId: customStudentId,
      course: course || 'B.Tech',
      branch: branch || 'Computer Science & Engineering',
      year: year || '1st Year',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin / Librarian)
const updateStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const { name, email, studentId, course, branch, year, phone, status, password } = req.body;

    if (name) student.name = name;
    if (email) student.email = email;
    if (studentId) student.studentId = studentId;
    if (course) student.course = course;
    if (branch) student.branch = branch;
    if (year) student.year = year;
    if (phone !== undefined) student.phone = phone;
    if (status) student.status = status;
    if (password && password.trim().length >= 6) {
      student.password = password;
    }

    const updatedStudent = await student.save();

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin / Librarian)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check for active loans
    const activeLoans = await Transaction.countDocuments({
      userId: student._id,
      status: { $in: ['issued', 'overdue'] },
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete student: Student currently has ${activeLoans} unreturned book(s).`,
      });
    }

    // Check for unpaid fines
    const pendingFines = await Fine.countDocuments({
      userId: student._id,
      status: 'pending',
    });

    if (pendingFines > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete student: Student has ${pendingFines} unpaid fine(s).`,
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student active/suspended status
// @route   PATCH /api/students/:id/status
// @access  Private (Admin / Librarian)
const toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student.status = student.status === 'active' ? 'suspended' : 'active';
    await student.save();

    res.json({
      success: true,
      message: `Student account ${student.status === 'active' ? 'activated' : 'suspended'} successfully`,
      student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
};
