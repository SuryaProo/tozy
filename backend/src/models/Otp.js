const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone:     { type: String },
  email:     { type: String },
  code:      { type: String, required: true },
  purpose:   { type: String, enum: ['login', 'email-verify', 'password-reset'], default: 'login' },
  expiresAt: { type: Date, required: true },
  attempts:  { type: Number, default: 0 },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
