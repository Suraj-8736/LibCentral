const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getMyRequests,
  updateRequestStatus,
  deleteRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/', protect, authorize('admin', 'librarian'), getRequests);
router.patch('/:id/status', protect, authorize('admin', 'librarian'), updateRequestStatus);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
