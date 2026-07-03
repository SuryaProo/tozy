const rateLimit = require('express-rate-limit');

// Generic auth endpoints (login/register) — 20 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP request — stricter, 5 per 10 min per IP (prevents SMS bombing)
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify — 10 attempts per 10 min (prevents brute-forcing the 6-digit code)
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many verification attempts. Please request a new OTP.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, otpRequestLimiter, otpVerifyLimiter };
