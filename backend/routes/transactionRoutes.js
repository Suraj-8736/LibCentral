const express = require('express');
const router = express.Router();
const {
  getTransactions,
  issueBook,
  returnBook,
  getMyTransactions,
  getOverdueTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyTransactions);
router.get('/overdue', protect, authorize('admin', 'librarian'), getOverdueTransactions);
router.get('/', protect, authorize('admin', 'librarian'), getTransactions);

router.post('/issue', protect, authorize('admin', 'librarian'), issueBook);
router.post('/return', protect, authorize('admin', 'librarian'), returnBook);

module.exports = router;
