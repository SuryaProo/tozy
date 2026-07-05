const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpSms = async (phone, code) => {

  // ── 2Factor ──────────────────────────────────────────────────────────────
  if (process.env.TWO_FACTOR_KEY) {
    try {
      // Method 1: AUTOGEN template (works without DLT)
      const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_KEY}/SMS/${phone}/AUTOGEN/TozYcozY`;
      const res  = await fetch(url);
      const data = await res.json();
      console.log('📱 2Factor AUTOGEN response:', JSON.stringify(data));

      if (data.Status === 'Success') {
        console.log(`📱 OTP SMS sent to +91${phone}`);
        return { sent: true };
      }

      // Method 2: Custom OTP with our code
      const url2 = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_KEY}/SMS/${phone}/${code}`;
      const res2  = await fetch(url2);
      const data2 = await res2.json();
      console.log('📱 2Factor direct response:', JSON.stringify(data2));

      if (data2.Status === 'Success') {
        console.log(`📱 OTP sent via direct method to +91${phone}`);
        return { sent: true };
      }

    } catch (err) {
      console.error('📱 2Factor error:', err.message);
    }
  }

  // ── Fast2SMS fallback ─────────────────────────────────────────────────────
  if (process.env.FAST2SMS_KEY) {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: { authorization: process.env.FAST2SMS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: 'q', message: `${code} is your TozYcozY OTP. Valid 5 mins.`, language: 'english', flash: 0, numbers: phone }),
      });
      const data = await res.json();
      if (data.return === true) return { sent: true };
    } catch (_) {}
  }

  console.log(`\n📱 [FALLBACK] OTP for +91${phone}: ${code}\n`);
  return { sent: false, devMode: true };
};

module.exports = { generateOtp, sendOtpSms };
