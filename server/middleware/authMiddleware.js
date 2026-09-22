/**
 * ============================================================================
 * Authentication Middleware
 * ============================================================================
 * Validates the JWT Bearer token sent in Authorization headers.
 * Populates req.user with decoded payload for protected controller routes.
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'quotecraft_secure_jwt_token_secret_key_2026';

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains { id: userId, email: userEmail }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.'
    });
  }
}

module.exports = authMiddleware;
