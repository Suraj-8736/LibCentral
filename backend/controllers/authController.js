const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Register a new user / student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, course, branch, year, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Auto-generate studentId if role is student and not provided
    let autoStudentId = studentId;
    if ((!role || role === 'student') && !studentId) {
      const count = await User.countDocuments({ role: 'student' });
      autoStudentId = `STU${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      studentId: autoStudentId,
      course: course || 'B.Tech',
      branch: branch || 'Computer Science & Engineering',
      year: year || '1st Year',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        branch: user.branch,
        year: user.year,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the library administrator.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update online status and login history
    user.isOnline = true;
    user.lastLogin = new Date();
    user.lastActive = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({
      loginTime: new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Browser',
    });
    if (user.loginHistory.length > 100) {
      user.loginHistory = user.loginHistory.slice(0, 100);
    }
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        branch: user.branch,
        year: user.year,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, course, branch, year, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (course) user.course = course;
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const { sendEmail, generateOtpHtml } = require('../utils/sendEmail');

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your institutional email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact the administrator.',
      });
    }

    // Generate secure 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    // Send email with HTML template
    await sendEmail({
      to: user.email,
      subject: `Your LibCentral Verification OTP: ${otp}`,
      otp,
      type: 'reset',
      html: generateOtpHtml(otp, user.name, 'reset'),
      text: `Hello ${user.name},\n\nYour LibCentral password reset verification OTP is: ${otp}.\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.`,
    });

    res.json({
      success: true,
      message: `A 6-digit verification OTP has been sent to ${user.email}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit OTP',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+resetPasswordOtp +resetPasswordOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP request found. Please request a new OTP.',
      });
    }

    if (user.resetPasswordOtpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new OTP.',
      });
    }

    if (user.resetPasswordOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code entered. Please check and try again.',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You may now set your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password +resetPasswordOtp +resetPasswordOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP session found. Please request a new OTP.',
      });
    }

    if (user.resetPasswordOtpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new OTP.',
      });
    }

    if (user.resetPasswordOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Password reset aborted.',
      });
    }

    // Set new password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP to email for direct login
// @route   POST /api/auth/send-login-otp
// @access  Public
const sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your institutional email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact the administrator.',
      });
    }

    // Generate secure 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOtp = otp;
    user.loginOtpExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    // Send email with HTML template
    await sendEmail({
      to: user.email,
      subject: `Your LibCentral Sign In OTP: ${otp}`,
      otp,
      type: 'login',
      html: generateOtpHtml(otp, user.name, 'login'),
      text: `Hello ${user.name},\n\nYour LibCentral Instant Sign In OTP is: ${otp}.\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`,
    });

    res.json({
      success: true,
      message: `A 6-digit login OTP has been sent to ${user.email}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user using OTP
// @route   POST /api/auth/login-with-otp
// @access  Public
const loginWithOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit OTP',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+loginOtp +loginOtpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the library administrator.',
      });
    }

    if (!user.loginOtp || !user.loginOtpExpire) {
      return res.status(400).json({
        success: false,
        message: 'No active Login OTP found. Please request a new OTP.',
      });
    }

    if (user.loginOtpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new OTP.',
      });
    }

    if (user.loginOtp.trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code entered. Please check and try again.',
      });
    }

    // Clear OTP
    user.loginOtp = undefined;
    user.loginOtpExpire = undefined;
    user.isOnline = true;
    user.lastLogin = new Date();
    user.lastActive = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({
      loginTime: new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Browser',
    });
    if (user.loginHistory.length > 100) {
      user.loginHistory = user.loginHistory.slice(0, 100);
    }
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        branch: user.branch,
        year: user.year,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & update online/offline status
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.isOnline = false;
        user.lastLogout = new Date();
        if (user.loginHistory && user.loginHistory.length > 0 && !user.loginHistory[0].logoutTime) {
          user.loginHistory[0].logoutTime = new Date();
        }
        await user.save({ validateBeforeSave: false });
      }
    }
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user active heartbeat
// @route   POST /api/auth/heartbeat
// @access  Private
const heartbeat = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: true,
        lastActive: new Date(),
      });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Beacon logout / tab close disconnect
// @route   POST /api/auth/disconnect
// @access  Public
const disconnectBeacon = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.body && req.body.token) {
      token = req.body.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        if (user) {
          user.isOnline = false;
          user.lastLogout = new Date();
          if (user.loginHistory && user.loginHistory.length > 0 && !user.loginHistory[0].logoutTime) {
            user.loginHistory[0].logoutTime = new Date();
          }
          await user.save({ validateBeforeSave: false });
        }
      } catch (err) {
        // invalid token, silent return
      }
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff/librarians status & audit logs
// @route   GET /api/auth/staff-status
// @access  Private (Admin / Librarian)
const getStaffStatus = async (req, res, next) => {
  try {
    const roleFilter = req.query.role ? { role: req.query.role } : { role: { $in: ['admin', 'librarian'] } };
    const staff = await User.find(roleFilter)
      .select('name email role avatar isOnline lastLogin lastLogout lastActive phone branch loginHistory createdAt')
      .sort({ isOnline: -1, lastLogin: -1 });

    const now = new Date();
    for (const member of staff) {
      const lastActivity = member.lastActive || member.lastLogin;
      if (member.isOnline && lastActivity && (now - new Date(lastActivity) > 2.5 * 60 * 1000)) {
        member.isOnline = false;
        member.lastLogout = lastActivity;
        if (member.loginHistory && member.loginHistory.length > 0 && !member.loginHistory[0].logoutTime) {
          member.loginHistory[0].logoutTime = lastActivity;
        }
        await member.save({ validateBeforeSave: false });
      }
    }

    res.json({
      success: true,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

