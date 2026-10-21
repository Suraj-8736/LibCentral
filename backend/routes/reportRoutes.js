const express = require('express');
const router = express.Router();
const {
  getSummaryReport,
  getMonthlyStatistics,
  getTopBorrowedBooks,
  getMostActiveStudents,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/summary', protect, authorize('admin', 'librarian'), getSummaryReport);
router.get('/monthly', protect, authorize('admin', 'librarian'), getMonthlyStatistics);
router.get('/top-books', protect, authorize('admin', 'librarian'), getTopBorrowedBooks);
router.get('/top-students', protect, authorize('admin', 'librarian'), getMostActiveStudents);

module.exports = router;
