const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * protect — requires a valid logged-in user.
 * Reads the token from the httpOnly cookie first, falls back to
 * Authorization: Bearer <token> header (handy for non-browser clients / Postman).
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

/**
 * adminOnly — use after `protect` on routes that should only be reachable by admins
 * (e.g. POST /api/products to add new products from an admin panel).
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = { protect, adminOnly };
