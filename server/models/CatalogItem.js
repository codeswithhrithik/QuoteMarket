/**
 * ============================================================================
 * Catalog Item / Material Model
 * ============================================================================
 * Stores predefined materials, products, and services that can be reused
 * across multiple quotations or quickly chosen in the quotation builder.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const CatalogItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Material / Item name is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  unit: {
    type: String,
    default: 'pcs' // pcs, hrs, kg, sq ft, meter, set, box, etc.
  },
  defaultRate: {
    type: Number,
    required: [true, 'Default rate is required'],
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0 // percentage e.g. 18 for 18% GST
  },
  category: {
    type: String,
    default: 'General'
  }
}, {
  timestamps: true
});

const MongoCatalogModel = mongoose.model('CatalogItem', CatalogItemSchema);
module.exports = createHybridModel('CatalogItem', MongoCatalogModel);
