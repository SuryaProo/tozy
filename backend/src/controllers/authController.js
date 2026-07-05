const User = require('../models/User');
const { sendWelcomeEmail, sendOtpEmail } = require('../utils/email');
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

    // Generate email verification OTP and send immediately
    const verifyCode = generateOtp();
    const verifyExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await Otp.create({ email, code: verifyCode, purpose: 'email-verify', expiresAt: verifyExpiry });

    // Send welcome + verification email (non-blocking)
    sendWelcomeEmail(email, name).catch(() => {});
    sendOtpEmail(email, verifyCode).catch(() => {});

    res.status(201).json({ success: true, user: user.toSafeJSON(), token, emailVerifyOtpSent: true });
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

    await Otp.deleteMany({ phone, purpose: 'login' });

    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({ phone, code, purpose: 'login', expiresAt });

    // Try SMS
    const smsResult = await sendOtpSms(phone, code);

    // Always try email if user has one registered
    const existingUser = await User.findOne({ phone });
    let emailSent = false;
    if (existingUser?.email) {
      try {
        await sendOtpEmail(existingUser.email, code);
        emailSent = true;
      } catch (_) {}
    }

    // Build message
    let message = '';
    if (smsResult.sent) {
      message = `OTP sent to +91${phone} via SMS.`;
      if (emailSent) message += ` Also sent to your email.`;
    } else if (emailSent) {
      message = `SMS unavailable. OTP sent to your registered email.`;
    } else {
      message = `OTP generated. Valid for ${OTP_EXPIRY_MINUTES} minutes.`;
    }

    res.json({
      success: true,
      message,
      smsSent:   smsResult.sent,
      emailSent,
      ...(process.env.SHOW_DEV_OTP === 'true' && { devOtp: code }),
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

// ── Address Management ────────────────────────────────────────────────────────

// GET /api/auth/addresses  (protected)
const getAddresses = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    res.json({ success: true, addresses: user.addresses ?? [] });
  } catch (err) { next(err); }
};

// POST /api/auth/addresses  (protected) — add new address
const addAddress = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    const { firstName, lastName, phone, street, city, state, pin, label, isDefault } = req.body;

    // If this is default, unset others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({ firstName, lastName, phone, street, city, state: state || '', pin, label: label || 'Home', isDefault: isDefault || user.addresses.length === 0 });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

// DELETE /api/auth/addresses/:addressId  (protected)
const deleteAddress = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

// PUT /api/auth/addresses/:addressId/default
const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.addressId; });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

module.exports = Object.assign(module.exports, { getAddresses, addAddress, deleteAddress, setDefaultAddress });

// ── Email Verification ────────────────────────────────────────────────────────

// POST /api/auth/email/send-verify  (protected — must be logged in)
const sendEmailVerification = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.email) {
      return res.status(400).json({ success: false, message: 'No email on this account.' });
    }
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email already verified.' });
    }

    await Otp.deleteMany({ email: user.email, purpose: 'email-verify' });
    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.create({ email: user.email, code, purpose: 'email-verify', expiresAt });
    await sendOtpEmail(user.email, code);

    res.json({ success: true, message: `Verification OTP sent to ${user.email}` });
  } catch (err) { next(err); }
};

// POST /api/auth/email/verify  (protected)  body: { code }
const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await require('../models/User').findById(req.user._id);

    const record = await Otp.findOne({
      email: user.email, purpose: 'email-verify', expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }
    if (record.code !== code) {
      record.attempts += 1; await record.save();
      return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
    }

    await Otp.deleteOne({ _id: record._id });
    user.emailVerified = true;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!', user: user.toSafeJSON() });
  } catch (err) { next(err); }
};

module.exports = Object.assign(module.exports, { sendEmailVerification, verifyEmail });
