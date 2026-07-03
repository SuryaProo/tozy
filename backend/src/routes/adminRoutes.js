const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats, getAnalytics,
  getAllOrders, updateOrderStatus,
  getAllCustomers, toggleCustomerStatus,
  updateStock,
} = require('../controllers/adminController');
const {
  getProducts, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');

// All admin routes require login + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/stats',     getDashboardStats);
router.get('/analytics', getAnalytics);

// Orders
router.get('/orders',                      getAllOrders);
router.put('/orders/:orderId/status',      updateOrderStatus);

// Products (CRUD)
router.get('/products',        getProducts);
router.post('/products',       createProduct);
router.put('/products/:slug',  updateProduct);
router.delete('/products/:slug', deleteProduct);

// Customers
router.get('/customers',               getAllCustomers);
router.put('/customers/:id/toggle',    toggleCustomerStatus);

// Inventory
router.put('/inventory/:slug/stock',   updateStock);

module.exports = router;
