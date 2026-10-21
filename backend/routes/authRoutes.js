const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  heartbeat,
  disconnectBeacon,
  getStaffStatus,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendLoginOtp,
  loginWithOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/heartbeat', protect, heartbeat);
router.post('/disconnect', disconnectBeacon);
router.get('/staff-status', protect, authorize('admin', 'librarian'), getStaffStatus);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/send-login-otp', sendLoginOtp);
router.post('/login-with-otp', loginWithOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
