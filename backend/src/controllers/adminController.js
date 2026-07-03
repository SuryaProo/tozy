const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      ordersToday, revenueToday,
      ordersMonth, revenueMonth,
      totalOrders, totalRevenue,
      totalCustomers, newUsersToday,
      totalProducts, pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.aggregate([{ $match: { createdAt: { $gte: thisMonthStart }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'Processing' }),
      Product.countDocuments({ stock: { $lt: 10 }, isActive: true }),
    ]);

    res.json({
      success: true,
      stats: {
        ordersToday,
        revenueToday:    revenueToday[0]?.total    ?? 0,
        ordersMonth,
        revenueMonth:    revenueMonth[0]?.total    ?? 0,
        totalOrders,
        totalRevenue:    totalRevenue[0]?.total    ?? 0,
        totalCustomers,
        newUsersToday,
        totalProducts,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (err) { next(err); }
};

// ── Analytics — last 7 days revenue ─────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const days = 7;
    const from = new Date(); from.setDate(from.getDate() - days); from.setHours(0,0,0,0);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: from }, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.title', revenue: { $sum: { $multiply: ['$items.price','$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, dailyRevenue, topProducts, ordersByStatus });
  } catch (err) { next(err); }
};

// ── Orders ───────────────────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { status };
    if (trackingNumber) update.trackingNumber = trackingNumber;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      update,
      { new: true }
    ).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ── Customers ─────────────────────────────────────────────────────────────────
const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    // Attach order count per customer
    const withOrders = await Promise.all(customers.map(async c => {
      const orderCount = await Order.countDocuments({ user: c._id });
      const totalSpent = await Order.aggregate([
        { $match: { user: c._id, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);
      return { ...c.toSafeJSON(), orderCount, totalSpent: totalSpent[0]?.total ?? 0 };
    }));
    res.json({ success: true, customers: withOrders, total });
  } catch (err) { next(err); }
};

const toggleCustomerStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isDisabled = !user.isDisabled;
    await user.save();
    res.json({ success: true, message: user.isDisabled ? 'Customer disabled.' : 'Customer enabled.' });
  } catch (err) { next(err); }
};

// ── Inventory ─────────────────────────────────────────────────────────────────
const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboardStats, getAnalytics,
  getAllOrders, updateOrderStatus,
  getAllCustomers, toggleCustomerStatus,
  updateStock,
};
