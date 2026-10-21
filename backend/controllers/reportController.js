const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');
const BookRequest = require('../models/BookRequest');

// @desc    Get summary analytical reports
// @route   GET /api/reports/summary
// @access  Private (Admin / Librarian)
const getSummaryReport = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableCopiesAgg = await Book.aggregate([
      { $group: { _id: null, totalCopies: { $sum: '$totalCopies' }, availableCopies: { $sum: '$availableCopies' } } },
    ]);

    const totalCopies = availableCopiesAgg[0]?.totalCopies || 0;
    const availableCopies = availableCopiesAgg[0]?.availableCopies || 0;
    const issuedBooks = totalCopies - availableCopies;

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalActiveStudents = await User.countDocuments({ role: 'student', status: 'active' });

    const totalTransactions = await Transaction.countDocuments();
    const currentlyIssued = await Transaction.countDocuments({ status: 'issued' });
    const totalReturned = await Transaction.countDocuments({ status: 'returned' });

    const today = new Date();
    const totalOverdue = await Transaction.countDocuments({
      status: 'issued',
      dueDate: { $lt: today },
    });

    const finesAgg = await Fine.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalFineCollected = 0;
    let totalFinePending = 0;
    finesAgg.forEach((item) => {
      if (item._id === 'paid') totalFineCollected = item.total;
      if (item._id === 'pending') totalFinePending = item.total;
    });

    const totalRequests = await BookRequest.countDocuments();
    const pendingRequests = await BookRequest.countDocuments({ status: 'pending' });

    // Category-wise Breakdown
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          bookTitlesCount: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
          timesBorrowed: { $sum: '$timesBorrowed' },
        },
      },
      { $sort: { bookTitlesCount: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        inventory: {
          totalBookTitles: totalBooks,
          totalCopies,
          availableCopies,
          issuedCopies: issuedBooks,
        },
        members: {
          totalStudents,
          activeStudents: totalActiveStudents,
          suspendedStudents: totalStudents - totalActiveStudents,
        },
        circulation: {
          totalTransactions,
          currentlyIssued,
          totalReturned,
          totalOverdue,
        },
        fines: {
          totalCollected: totalFineCollected,
          totalPending: totalFinePending,
          totalAssessed: totalFineCollected + totalFinePending,
        },
        requests: {
          totalRequests,
          pendingRequests,
        },
        categories: categoryStats.map((c) => ({
          category: c._id,
          titles: c.bookTitlesCount,
          totalCopies: c.totalCopies,
          availableCopies: c.availableCopies,
          issuedCopies: c.totalCopies - c.availableCopies,
          timesBorrowed: c.timesBorrowed,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly issue, return, and fine trends for charts
// @route   GET /api/reports/monthly
// @access  Private (Admin / Librarian)
const getMonthlyStatistics = async (req, res, next) => {
  try {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentDate = new Date();
    const monthlyData = [];

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthLabel = `${months[d.getMonth()]} ${d.getFullYear()}`;

      const issuesCount = await Transaction.countDocuments({
        issueDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const returnsCount = await Transaction.countDocuments({
        returnDate: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const fineSumAgg = await Fine.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalCollected: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] },
            },
            totalAssessed: { $sum: '$amount' },
          },
        },
      ]);

      monthlyData.push({
        month: monthLabel,
        issues: issuesCount,
        returns: returnsCount,
        finesCollected: fineSumAgg[0]?.totalCollected || 0,
        finesAssessed: fineSumAgg[0]?.totalAssessed || 0,
      });
    }

    res.json({
      success: true,
      monthlyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top 10 most borrowed books
// @route   GET /api/reports/top-books
// @access  Private (Admin / Librarian)
const getTopBorrowedBooks = async (req, res, next) => {
  try {
    const topBooks = await Book.find()
      .sort({ timesBorrowed: -1, createdAt: -1 })
      .limit(10)
      .select('title author category timesBorrowed totalCopies availableCopies coverImage');

    res.json({
      success: true,
      topBooks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get most active students by borrowing count
// @route   GET /api/reports/top-students
// @access  Private (Admin / Librarian)
const getMostActiveStudents = async (req, res, next) => {
  try {
    const topBorrowers = await Transaction.aggregate([
      { $group: { _id: '$userId', totalBorrowed: { $sum: 1 } } },
      { $sort: { totalBorrowed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          totalBorrowed: 1,
          name: '$student.name',
          email: '$student.email',
          studentId: '$student.studentId',
          course: '$student.course',
          branch: '$student.branch',
          avatar: '$student.avatar',
        },
      },
    ]);

    res.json({
      success: true,
      topStudents: topBorrowers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryReport,
  getMonthlyStatistics,
  getTopBorrowedBooks,
  getMostActiveStudents,
};
