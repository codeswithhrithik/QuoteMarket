/**
 * ============================================================================
 * Authentication Routes
 * ============================================================================
 * Endpoints for owner signup, signin, and profile configuration.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected profile routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
