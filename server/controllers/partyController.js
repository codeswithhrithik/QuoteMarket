/**
 * ============================================================================
 * Party / Customer Controller
 * ============================================================================
 * Handles CRUD operations for customer parties (recipients of quotations).
 */

const Party = require('../models/Party');

/**
 * Get all parties saved by this user
 * GET /api/parties
 */
exports.getAllParties = async (req, res) => {
  try {
    const parties = await Party.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      count: parties.length,
      parties
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve parties list.'
    });
  }
};

/**
 * Create a new party
 * POST /api/parties
 */
exports.createParty = async (req, res) => {
  try {
    const { name, receiverName, email, phone, address, city, state, pincode, taxId, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Party / Company Name is required.'
      });
    }

    const newParty = await Party.create({
      userId: req.user.id,
      name: name.trim(),
      receiverName: receiverName ? receiverName.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      taxId: taxId ? taxId.trim() : '',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Party saved successfully!',
      party: newParty
    });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create party.'
    });
  }
};

/**
 * Update an existing party
 * PUT /api/parties/:id
 */
exports.updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Party.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Party not found or unauthorized.'
      });
    }

    const updated = await Party.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: 'Party details updated successfully!',
      party: updated
    });
  } catch (error) {
    console.error('Error updating party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update party.'
    });
  }
};

/**
 * Delete a party
 * DELETE /api/parties/:id
 */
exports.deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Party.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Party not found or unauthorized.'
      });
    }

    await Party.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Party removed successfully.'
    });
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete party.'
    });
  }
};
