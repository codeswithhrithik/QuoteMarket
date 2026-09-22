/**
 * ============================================================================
 * Super Admin Authorization Middleware
 * ============================================================================
 * Verifies that the authenticated user possesses the 'superadmin' role
 * or is the designated master admin email (hrithikyadav05@gmail.com).
 */

const User = require('../models/User');

module.exports = async function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isSuperAdmin =
      user.role === 'superadmin' ||
      user.email.toLowerCase() === 'hrithikyadav05@gmail.com';

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Super Admin privileges required.'
      });
    }

    req.user.role = 'superadmin';
    next();
  } catch (error) {
    console.error('adminMiddleware error:', error);
    return res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};
