const express = require('express');
const router = express.Router();
const {
  getFines,
  getMyFines,
  payFine,
  waiveFine,
} = require('../controllers/fineController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyFines);
router.get('/', protect, authorize('admin', 'librarian'), getFines);
router.patch('/:id/pay', protect, authorize('admin', 'librarian'), payFine);
router.patch('/:id/waive', protect, authorize('admin'), waiveFine);

module.exports = router;
