const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public — anyone can browse products
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin only — this is how new products get added to the live site
router.post('/', protect, adminOnly, createProduct);
router.put('/:slug', protect, adminOnly, updateProduct);
router.delete('/:slug', protect, adminOnly, deleteProduct);

module.exports = router;
