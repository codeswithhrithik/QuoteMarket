/**
 * ============================================================================
 * Super Admin Routes
 * ============================================================================
 * Secured routes for Super Admin only (Hrithik King / hrithikyadav05@gmail.com).
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all admin routes with authentication + superadmin check
router.use(authMiddleware, adminMiddleware);

// Overview stats
router.get('/stats', adminController.getAdminStats);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users/credits', adminController.addCreditsToUser);
router.post('/users/days', adminController.addDaysToUser);
router.put('/users/:userId/suspend', adminController.toggleSuspendUser);
router.delete('/users/:userId', adminController.deleteUser);

// Payment settings & pricing
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Transactions log
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
