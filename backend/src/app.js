const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Security & performance ──
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// ── CORS — allows your React frontend to call this API with cookies ──
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required so the httpOnly auth cookie is sent/received
  })
);

// ── Body parsing ──
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging (dev only) ──
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TozYcozY API is running.', time: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 + error handling ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;
