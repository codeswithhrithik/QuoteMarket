/**
 * ============================================================================
 * Payment & Download Routes
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Public or optional auth config endpoint
router.get('/config', (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    return authMiddleware(req, res, () => paymentController.getPaymentConfig(req, res));
  }
  return paymentController.getPaymentConfig(req, res);
});

// Verify & process UPI or card payment (authenticated)
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Consume 1 credit before download / share (authenticated)
router.post('/consume', authMiddleware, paymentController.consumeCredit);

module.exports = router;
