/**
 * ============================================================================
 * Party / Client Model
 * ============================================================================
 * Stores recipient party details including organization name, contact receiver name,
 * billing/shipping address, phone, email, and tax credentials.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const PartySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Party / Company Name is required'],
    trim: true
  },
  receiverName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  taxId: {
    type: String, // GSTIN / VAT
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const MongoPartyModel = mongoose.model('Party', PartySchema);
module.exports = createHybridModel('Party', MongoPartyModel);
