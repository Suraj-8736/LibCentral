const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');
const BookRequest = require('../models/BookRequest');
const calculateFine = require('../utils/calculateFine');

// @desc    Get dashboard statistics for Admin / Librarian
// @route   GET /api/dashboard/admin
// @access  Private (Admin / Librarian)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const booksAgg = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
        },
      },
    ]);

    const totalCopies = booksAgg[0]?.totalCopies || 0;
    const availableCopies = booksAgg[0]?.availableCopies || 0;
    const issuedCopies = totalCopies - availableCopies;

    const totalStudents = await User.countDocuments({ role: 'student' });
    const today = new Date();
    const overdueCount = await Transaction.countDocuments({
      status: 'issued',
      dueDate: { $lt: today },
    });

    const finesAgg = await Fine.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalFineCollected = 0;
    let totalFinePending = 0;
    finesAgg.forEach((f) => {
      if (f._id === 'paid') totalFineCollected = f.total;
      if (f._id === 'pending') totalFinePending = f.total;
    });

    // Recent 7 Transactions
    const recentTransactions = await Transaction.find()
      .populate('userId', 'name studentId email avatar')
      .populate('bookId', 'title author isbn coverImage')
      .sort({ createdAt: -1 })
      .limit(7);

    // Recent 5 Pending Book Requests
    const recentRequests = await BookRequest.find({ status: 'pending' })
      .populate('userId', 'name studentId email avatar')
      .populate('bookId', 'title author coverImage availableCopies')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category Distribution (Top 6)
    const categoryDistribution = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Top 5 Borrowed Books
    const topBorrowed = await Book.find()
      .sort({ timesBorrowed: -1 })
      .limit(5)
      .select('title author category timesBorrowed coverImage availableCopies totalCopies');

    // Librarian live attendance and activity tracking (Admin only)
    let staffMembers = [];
    if (req.user && req.user.role === 'admin') {
      const librarians = await User.find({ role: 'librarian' })
        .select('name email role avatar isOnline lastLogin lastLogout lastActive phone branch loginHistory createdAt')
        .sort({ isOnline: -1, lastLogin: -1 });

      const now = new Date();
      for (const lib of librarians) {
        const lastActivity = lib.lastActive || lib.lastLogin;
        if (lib.isOnline && lastActivity && (now - new Date(lastActivity) > 2.5 * 60 * 1000)) {
          lib.isOnline = false;
          lib.lastLogout = lastActivity;
          if (lib.loginHistory && lib.loginHistory.length > 0 && !lib.loginHistory[0].logoutTime) {
            lib.loginHistory[0].logoutTime = lastActivity;
          }
          await lib.save({ validateBeforeSave: false });
        }
      }
      staffMembers = librarians;
    }

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        issuedCopies,
        totalStudents,
        overdueCount,
        totalFineCollected,
        totalFinePending,
      },
      categoryDistribution: categoryDistribution.map((c) => ({
        name: c._id,
        value: c.count,
        totalCopies: c.totalCopies,
      })),
      topBorrowed,
      recentTransactions,
      recentRequests,
      staffMembers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    // Active currently issued books
    const activeLoans = await Transaction.find({
      userId,
      status: 'issued',
    })
      .populate('bookId')
      .sort({ dueDate: 1 });

    const enrichedLoans = activeLoans.map((t) => {
      const obj = t.toObject();
      const due = new Date(obj.dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      obj.daysRemaining = diffDays;
      obj.isOverdue = diffDays < 0;
      if (diffDays < 0) {
        const { lateDays, fine } = calculateFine(obj.dueDate, today, 5);
        obj.currentLateDays = lateDays;
        obj.currentEstimatedFine = fine;
      }
      return obj;
    });

    // Total books borrowed lifetime
    const totalBorrowedLifetime = await Transaction.countDocuments({ userId });

    // Active pending requests
    const pendingRequestsCount = await BookRequest.countDocuments({
      userId,
      status: 'pending',
    });

    // Pending fines
    const pendingFinesAgg = await Fine.aggregate([
      { $match: { userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingFineAmount = pendingFinesAgg[0]?.total || 0;

    // Recent activity history (last 5)
    const recentActivity = await Transaction.find({ userId })
      .populate('bookId', 'title author coverImage category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recommended popular books
    const recommendedBooks = await Book.find({ availableCopies: { $gt: 0 } })
      .sort({ timesBorrowed: -1, createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        activeLoansCount: activeLoans.length,
        totalBorrowedLifetime,
        pendingRequestsCount,
        pendingFineAmount,
      },
      activeLoans: enrichedLoans,
      recentActivity,
      recommendedBooks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
};
