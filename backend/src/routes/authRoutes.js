const express = require('express');
const router = express.Router();
const { register, login, requestOtp, verifyOtp, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, otpRequestLimiter, otpVerifyLimiter } = require('../middleware/rateLimiters');

// Email + password
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Mobile + OTP
router.post('/otp/request', otpRequestLimiter, requestOtp);
router.post('/otp/verify', otpVerifyLimiter, verifyOtp);

// Session
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
