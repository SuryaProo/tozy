const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: String,          // snapshot — survives even if product is later edited/deleted
    titleLine2: String,
    emoji: String,
    price: Number,
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pin: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // human-friendly e.g. TZC7K2M9P
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    address: addressSchema,
    paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], default: 'card' },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    trackingNumber:    { type: String, default: '' },
    razorpayOrderId:   { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    paid:              { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
