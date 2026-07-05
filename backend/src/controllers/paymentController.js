const { sendOrderConfirmation } = require('../utils/email');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const Product  = require('../models/Product');

// Lazy init — server won't crash on startup if keys are missing
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }
    const Razorpay = require('razorpay');
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

const genOrderId = () => 'TZC' + Math.random().toString(36).slice(2, 9).toUpperCase();

// ── Step 1: Create Razorpay order ──────────────────────────────────────────
// Frontend calls this → gets razorpay_order_id → opens Razorpay checkout popup
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // ── EMAIL VERIFICATION CHECK ──────────────────────────────────────────
    const userDoc = await require('../models/User').findById(req.user._id);
    if (userDoc?.email && !userDoc?.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before placing an order.',
        requiresEmailVerification: true,
        email: userDoc.email,
      });
    }

    // Calculate total server-side (never trust client price)
    let total = 0;
    for (const item of items) {
      const product = await Product.findOne({ slug: item.productId, isActive: true });
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.productId}" not found.` });
      }
      total += product.price * item.quantity;
    }

    // Razorpay amount is in paise (₹1 = 100 paise)
    const razorpayOrder = await getRazorpay().orders.create({
      amount:   total * 100,
      currency: 'INR',
      receipt:  genOrderId(),
      notes: {
        customerName:  req.user.name  || '',
        customerEmail: req.user.email || '',
        customerPhone: req.user.phone || '',
      },
    });

    res.json({
      success:        true,
      razorpayOrderId: razorpayOrder.id,
      amount:          total,
      currency:        'INR',
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ── Step 2: Verify payment & save order ────────────────────────────────────
// Called after user completes payment in Razorpay popup
const verifyAndSaveOrder = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      paymentMethod,
    } = req.body;

    // 1. Verify signature (proves payment is authentic, not tampered)
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Please contact support.' });
    }

    // 2. Recalculate total & build enriched items
    const enrichedItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findOne({ slug: item.productId, isActive: true });
      if (!product) continue;
      subtotal += product.price * item.quantity;
      enrichedItems.push({
        product:    product._id,
        title:      product.title,
        titleLine2: product.titleLine2,
        emoji:      product.emoji,
        price:      product.price,
        size:       item.size,
        quantity:   item.quantity,
      });
    }

    // 3. Save order in database
    const order = await Order.create({
      orderId:           genOrderId(),
      user:              req.user._id,
      items:             enrichedItems,
      address,
      paymentMethod:     paymentMethod || 'card',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      subtotal,
      shipping: 0,
      total:    subtotal,
      status:   'Processing',
      paid:     true,
    });

    // Send order confirmation email (non-blocking)
    const populatedUser = await require('../models/User').findById(req.user._id);
    if (populatedUser?.email) {
      sendOrderConfirmation(order, populatedUser.email, populatedUser.name).catch(() => {});
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyAndSaveOrder };
