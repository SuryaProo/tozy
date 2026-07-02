const User = require('../models/User');
const Otp = require('../models/Otp');
const { signToken, sendTokenCookie } = require('../utils/jwt');
const { generateOtp, sendOtpSms } = require('../utils/otp');

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

// ════════════════════════════════════════
//  EMAIL + PASSWORD AUTH
// ════════════════════════════════════════

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered. Try signing in instead.' });
    }

    const user = await User.create({ name, email, password, authMethod: 'email' });
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({ success: true, user: user.toSafeJSON(), token });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({ success: true, user: user.toSafeJSON(), token });
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════
//  MOBILE NUMBER + OTP AUTH
// ════════════════════════════════════════

// POST /api/auth/otp/request   body: { phone }
const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    }

    // Invalidate any previous unused OTPs for this number
    await Otp.deleteMany({ phone, purpose: 'login' });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({ phone, code, purpose: 'login', expiresAt });
    await sendOtpSms(phone, code);

    res.json({
      success: true,
      message: `OTP sent to +91${phone}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      // devOtp is ONLY included outside production so you can test without real SMS.
      // It is automatically omitted once NODE_ENV=production.
      ...(process.env.NODE_ENV !== 'production' && { devOtp: code }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/otp/verify   body: { phone, code, name? }
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and OTP code are required.' });
    }

    const record = await Otp.findOne({ phone, purpose: 'login' }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (record.code !== code) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${MAX_OTP_ATTEMPTS - record.attempts} attempts remaining.`,
      });
    }

    // OTP correct — consume it
    await Otp.deleteOne({ _id: record._id });

    // Find existing user by phone, or create a new one
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phone,
        phoneVerified: true,
        authMethod: 'mobile',
        name: name || `User${phone.slice(-4)}`,
      });
      isNewUser = true;
    } else if (!user.phoneVerified) {
      user.phoneVerified = true;
      await user.save();
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({ success: true, user: user.toSafeJSON(), token, isNewUser });
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════
//  SESSION
// ════════════════════════════════════════

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out.' });
};

module.exports = { register, login, requestOtp, verifyOtp, getMe, logout };
