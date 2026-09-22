/**
 * ============================================================================
 * Catalog / Materials Controller
 * ============================================================================
 * Handles CRUD operations for reusable materials, items, and services.
 */

const CatalogItem = require('../models/CatalogItem');

/**
 * Get all catalog items saved by user
 * GET /api/catalog
 */
exports.getAllItems = async (req, res) => {
  try {
    const items = await CatalogItem.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve catalog items.'
    });
  }
};

/**
 * Create a new catalog item / material
 * POST /api/catalog
 */
exports.createItem = async (req, res) => {
  try {
    const { name, description, unit, defaultRate, taxRate, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Material / Item name is required.'
      });
    }

    const newItem = await CatalogItem.create({
      userId: req.user.id,
      name: name.trim(),
      description: description || '',
      unit: unit || 'pcs',
      defaultRate: Number(defaultRate) || 0,
      taxRate: Number(taxRate) || 0,
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      message: 'Material added to catalog!',
      item: newItem
    });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material item.'
    });
  }
};

/**
 * Update a catalog item
 * PUT /api/catalog/:id
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CatalogItem.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or unauthorized.'
      });
    }

    const updated = await CatalogItem.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully!',
      item: updated
    });
  } catch (error) {
    console.error('Error updating catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item.'
    });
  }
};

/**
 * Delete a catalog item
 * DELETE /api/catalog/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CatalogItem.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or unauthorized.'
      });
    }

    await CatalogItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Item removed from catalog.'
    });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item.'
    });
  }
};
