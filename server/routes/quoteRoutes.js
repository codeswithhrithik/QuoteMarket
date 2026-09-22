/**
 * ============================================================================
 * Quotation Routes
 * ============================================================================
 * Endpoints for creating, updating, status transitioning, and public sharing.
 */

const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');

// Public endpoints (no login required for clients viewing or responding)
router.get('/public/:shareToken', quoteController.getPublicQuote);
router.post('/public/:shareToken/respond', quoteController.clientRespondQuote);

// Protected endpoints (for business owners)
router.use(authMiddleware);

router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);
router.post('/', quoteController.createQuote);
router.put('/:id', quoteController.updateQuote);
router.patch('/:id/status', quoteController.updateQuoteStatus);
router.delete('/:id', quoteController.deleteQuote);

module.exports = router;
