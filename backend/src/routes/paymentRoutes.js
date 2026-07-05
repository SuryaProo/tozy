const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentOrder, verifyAndSaveOrder } = require('../controllers/paymentController');

// Both routes require login
router.use(protect);

// Step 1 — Create Razorpay order (get order_id)
router.post('/create-order', createPaymentOrder);

// Step 2 — Verify payment + save to DB
router.post('/verify', verifyAndSaveOrder);

module.exports = router;
