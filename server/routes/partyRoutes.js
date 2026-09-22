/**
 * ============================================================================
 * Party / Client Routes
 * ============================================================================
 * Endpoints for managing quotation recipients (customers/parties).
 */

const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');
const authMiddleware = require('../middleware/authMiddleware');

// All party endpoints require authentication
router.use(authMiddleware);

router.get('/', partyController.getAllParties);
router.post('/', partyController.createParty);
router.put('/:id', partyController.updateParty);
router.delete('/:id', partyController.deleteParty);

module.exports = router;
