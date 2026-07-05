const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ── Base HTML template ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f8f6; color: #0a0a0a; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
    .header { background: #0a0a0a; padding: 28px 36px; text-align: center; }
    .logo-t { color: #C41E3A; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .logo-c { color: #fff; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .tagline { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 36px; }
    .title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .subtitle { font-size: 15px; color: #666; margin-bottom: 28px; line-height: 1.6; }
    .order-box { background: #f8f8f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .order-id { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #C41E3A; margin-bottom: 4px; }
    .order-total { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
    .divider { height: 1px; background: rgba(0,0,0,0.07); margin: 20px 0; }
    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .item-name { font-size: 14px; font-weight: 600; }
    .item-meta { font-size: 12px; color: #888; }
    .item-price { font-size: 14px; font-weight: 700; }
    .addr-box { background: #f0f0ee; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .addr-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 6px; }
    .addr-text { font-size: 14px; line-height: 1.7; }
    .btn { display: inline-block; background: #C41E3A; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px; }
    .footer { background: #f8f8f6; padding: 20px 36px; text-align: center; }
    .footer p { font-size: 12px; color: #aaa; line-height: 1.7; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .status-processing { background: rgba(196,30,58,0.1); color: #C41E3A; }
    .status-shipped    { background: rgba(29,78,216,0.1); color: #1d4ed8; }
    .status-delivered  { background: rgba(22,163,74,0.1); color: #16a34a; }
    .otp-box { text-align: center; background: #0a0a0a; border-radius: 12px; padding: 28px; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #fff; }
    .otp-expiry { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div><span class="logo-t">TOZY</span><span class="logo-c">COZY</span></div>
        <div class="tagline">Luxury · Minimal · Conscious</div>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© 2024 TozYcozY. Made with passion.<br>
        If you have questions, reply to this email or contact us at ${process.env.EMAIL_USER}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

// ── Send helper ───────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [DEV - Email not configured] To: ${to} | Subject: ${subject}`);
    return true;
  }
  try {
    await transporter.sendMail({
      from: `"TozYcozY" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('📧 Email failed:', err.message);
    return false;
  }
};

// ── 1. OTP Email ──────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, otp) => {
  const html = baseTemplate(`
    <h2 class="title">Your Login OTP</h2>
    <p class="subtitle">Use this OTP to sign in to your TozYcozY account. Valid for 5 minutes.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-expiry">Expires in 5 minutes · Do not share with anyone</div>
    </div>
    <p style="font-size:13px;color:#888;">If you didn't request this OTP, please ignore this email.</p>
  `);
  return sendEmail({ to: email, subject: 'Your TozYcozY OTP', html });
};

// ── 2. Order Confirmation Email ───────────────────────────────────────────────
const sendOrderConfirmation = async (order, userEmail, userName) => {
  const itemsHtml = (order.items || []).map(item => `
    <div class="item-row">
      <div>
        <div class="item-name">${item.emoji || ''} ${item.title} ${item.titleLine2 || ''}</div>
        <div class="item-meta">Size: ${item.size} · Qty: ${item.quantity}</div>
      </div>
      <div class="item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
    </div>
  `).join('');

  const address = order.address || {};
  const addressText = `${address.firstName || ''} ${address.lastName || ''}<br>
    ${address.street || ''}, ${address.city || ''} — ${address.pin || ''}<br>
    📱 ${address.phone || ''}`;

  const html = baseTemplate(`
    <h2 class="title">Order Confirmed! 🎉</h2>
    <p class="subtitle">Hi ${userName || 'there'}, your order has been placed successfully. We'll update you when it ships.</p>

    <div class="order-box">
      <div class="order-id">Order #${order.orderId}</div>
      <div class="order-total">₹${(order.total || 0).toLocaleString('en-IN')}</div>
      <div style="margin-top:8px;">
        <span class="status-badge status-processing">Processing</span>
      </div>
    </div>

    <h3 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:12px;">Order Items</h3>
    ${itemsHtml}

    <div class="divider"></div>

    <div class="addr-box">
      <div class="addr-label">Delivery Address</div>
      <div class="addr-text">${addressText}</div>
    </div>

    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px;">
      <span style="color:#888;">Shipping</span><span style="color:#16a34a;font-weight:700;">Free</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;">
      <span>Total</span><span>₹${(order.total || 0).toLocaleString('en-IN')}</span>
    </div>
  `);

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmed #${order.orderId} — TozYcozY`,
    html,
  });
};

// ── 3. Order Status Update Email ──────────────────────────────────────────────
const sendOrderStatusUpdate = async (order, userEmail, userName) => {
  const statusMessages = {
    Shipped:   { emoji: '🚚', title: 'Your order is on the way!', msg: 'Your order has been shipped and is on its way to you.' },
    Delivered: { emoji: '✅', title: 'Order Delivered!',          msg: 'Your order has been delivered. We hope you love it!' },
    Cancelled: { emoji: '❌', title: 'Order Cancelled',           msg: 'Your order has been cancelled. Refund will be processed in 5-7 business days.' },
  };

  const info = statusMessages[order.status] || { emoji: '📦', title: 'Order Update', msg: `Your order status is now: ${order.status}` };
  const statusClass = `status-${order.status?.toLowerCase()}`;

  const html = baseTemplate(`
    <h2 class="title">${info.emoji} ${info.title}</h2>
    <p class="subtitle">Hi ${userName || 'there'}, ${info.msg}</p>

    <div class="order-box">
      <div class="order-id">Order #${order.orderId}</div>
      <div class="order-total">₹${(order.total || 0).toLocaleString('en-IN')}</div>
      <div style="margin-top:8px;">
        <span class="status-badge ${statusClass}">${order.status}</span>
      </div>
    </div>

    ${order.trackingNumber ? `
      <div class="addr-box">
        <div class="addr-label">Tracking Number</div>
        <div class="addr-text" style="font-size:18px;font-weight:900;letter-spacing:2px;">${order.trackingNumber}</div>
      </div>
    ` : ''}

    <p style="font-size:13px;color:#888;margin-top:16px;">
      Questions? Reply to this email and we'll help you out.
    </p>
  `);

  return sendEmail({
    to: userEmail,
    subject: `Order #${order.orderId} — ${order.status} | TozYcozY`,
    html,
  });
};

// ── 4. Welcome Email ──────────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, name) => {
  const html = baseTemplate(`
    <h2 class="title">Welcome to TozYcozY! 🎉</h2>
    <p class="subtitle">Hi ${name}, your account has been created successfully. Welcome to the inner circle.</p>

    <div class="order-box" style="text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">✦</div>
      <div style="font-size:16px;font-weight:700;">Premium Linen Shirts & Artisanal Leather Shoes</div>
      <div style="font-size:13px;color:#888;margin-top:4px;">Crafted for those who know the difference.</div>
    </div>

    <div class="divider"></div>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:20px;">
      Explore our collection of hand-crafted shirts and shoes — each piece made with premium materials and obsessive attention to detail.
    </p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">Shop Now →</a>
  `);

  return sendEmail({
    to: email,
    subject: 'Welcome to TozYcozY ✦',
    html,
  });
};

module.exports = { sendOtpEmail, sendOrderConfirmation, sendOrderStatusUpdate, sendWelcomeEmail };
