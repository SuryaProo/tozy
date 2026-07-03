/**
 * OTP utilities.
 *
 * generateOtp() makes a 6-digit code.
 * sendOtpSms() currently just LOGS the OTP to the server console —
 * this lets you test the full mobile-login flow with zero cost / zero setup.
 *
 * To go live with real SMS, replace the body of sendOtpSms() with a call to
 * Twilio, MSG91, Fast2SMS, or any Indian SMS gateway. The function signature
 * (phone, code) => Promise<void> stays the same, so nothing else changes.
 */

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

const sendOtpSms = async (phone, code) => {
  // ── DEV MODE: prints to terminal ──
  console.log('\n📱 ──────────────────────────────');
  console.log(`   OTP for +91${phone}: ${code}`);
  console.log('   (Replace utils/otp.js → sendOtpSms with a real SMS API in production)');
  console.log('────────────────────────────────\n');

  // ── PRODUCTION EXAMPLE (Twilio) — uncomment and fill in credentials ──
  // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  // await twilio.messages.create({
  //   body: `Your TozYcozY OTP is ${code}. Valid for 5 minutes.`,
  //   from: process.env.TWILIO_PHONE,
  //   to: `+91${phone}`,
  // });

  // ── PRODUCTION EXAMPLE (MSG91 / Fast2SMS, India-focused) ──
  // await fetch('https://api.msg91.com/api/v5/otp', {
  //   method: 'POST',
  //   headers: { authkey: process.env.MSG91_KEY, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ mobile: `91${phone}`, otp: code }),
  // });

  return true;
};

module.exports = { generateOtp, sendOtpSms };
