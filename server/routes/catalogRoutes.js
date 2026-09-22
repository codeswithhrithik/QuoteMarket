/**
 * ============================================================================
 * Catalog / Materials Routes
 * ============================================================================
 * Endpoints for managing reusable products, materials, and services.
 */

const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const authMiddleware = require('../middleware/authMiddleware');

// All catalog endpoints require authentication
router.use(authMiddleware);

router.get('/', catalogController.getAllItems);
router.post('/', catalogController.createItem);
router.put('/:id', catalogController.updateItem);
router.delete('/:id', catalogController.deleteItem);

module.exports = router;
