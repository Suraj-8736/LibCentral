const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudentDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/admin', protect, authorize('admin', 'librarian'), getAdminDashboard);
router.get('/student', protect, getStudentDashboard);

module.exports = router;
