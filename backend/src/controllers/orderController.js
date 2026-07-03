const Order = require('../models/Order');
const Product = require('../models/Product');

const genOrderId = () => 'TZC' + Math.random().toString(36).slice(2, 9).toUpperCase();

// POST /api/orders   (protected)
const placeOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Re-fetch product details server-side — never trust prices sent from the client
    const enrichedItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Frontend sends the product's slug (e.g. "shirt") as productId — resolve it here
      const product = await Product.findOne({ slug: item.productId, isActive: true });
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.productId}" not found.` });
      }
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      enrichedItems.push({
        product: product._id,
        title: product.title,
        titleLine2: product.titleLine2,
        emoji: product.emoji,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const shipping = 0; // free shipping — adjust here if you add shipping tiers later
    const total = subtotal + shipping;

    const order = await Order.create({
      orderId: genOrderId(),
      user: req.user._id,
      items: enrichedItems,
      address,
      paymentMethod: paymentMethod || 'card',
      subtotal,
      shipping,
      total,
      status: 'Processing',
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my   (protected — current user's orders only)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:orderId   (protected — must belong to requester)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById };
