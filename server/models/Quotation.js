/**
 * ============================================================================
 * Quotation Model
 * ============================================================================
 * Comprehensive schema for quotations, including party details, custom lines,
 * materials, auto-totals, words representation, status lifecycle, template ID,
 * notes, remarks, closing salutation, and digital signatures.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const QuotationItemSchema = new mongoose.Schema({
  itemId: { type: String, default: null }, // Optional catalog item reference
  name: { type: String, required: true },
  description: { type: String, default: '' },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'pcs' },
  rate: { type: Number, required: true, default: 0 },
  discountPercent: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const QuotationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  quotationNumber: {
    type: String,
    required: true
  },
  quoteDate: {
    type: String, // YYYY-MM-DD
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  validUntil: {
    type: String, // YYYY-MM-DD
    default: ''
  },
  // Selected or snapshot party details
  partyId: {
    type: String,
    default: null
  },
  party: {
    name: { type: String, required: true },
    receiverName: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    taxId: { type: String, default: '' }
  },
  // Subject & Inquiring greeting lines
  subject: {
    type: String,
    default: 'Quotation for Supply and Services'
  },
  openingNote: {
    type: String,
    default: 'Thank you for inquiring with us. We are pleased to submit our most competitive quotation as requested.'
  },
  // Material / Item Line items
  items: [QuotationItemSchema],
  
  // Totals & Computations
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  totalInWords: { type: String, default: '' },
  currency: { type: String, default: '₹' },
  currencyCode: { type: String, default: 'INR' },

  // Visual Template & Styling
  templateId: {
    type: String,
    enum: ['classic-corporate', 'modern-minimal', 'executive-slate', 'clean-indigo'],
    default: 'modern-minimal'
  },
  accentColor: {
    type: String,
    default: '#2563eb' // Tailwind blue-600
  },

  // Status Lifecycle
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'In Process', 'Approved', 'Rejected', 'Expired'],
    default: 'Pending'
  },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: String, default: () => new Date().toISOString() },
    note: { type: String, default: '' }
  }],

  // Footers, Notes, Terms & Remarks
  notes: {
    type: String,
    default: 'Payment terms: 50% advance, balance upon delivery.'
  },
  termsAndConditions: {
    type: String,
    default: '1. Quotation valid for 30 days.\n2. Goods once delivered are subject to standard warranty.'
  },
  remarks: {
    type: String,
    default: ''
  },
  closingNote: {
    type: String,
    default: 'Thank you for inquiring with us! We look forward to a long and successful business association.'
  },

  // Signature Block
  signatureType: {
    type: String,
    enum: ['draw', 'type', 'upload', 'owner_default', 'none'],
    default: 'owner_default'
  },
  signatureData: {
    type: String, // Data URL or Typed Name
    default: ''
  },
  signerName: {
    type: String,
    default: ''
  },
  signerTitle: {
    type: String,
    default: 'Authorized Signatory'
  },

  // Public Client Interaction (Approval / Rejection via shareable link)
  clientFeedback: {
    action: { type: String, default: null }, // 'Approved' | 'Rejected'
    clientRemarks: { type: String, default: '' },
    responseDate: { type: String, default: null }
  },
  shareToken: {
    type: String,
    default: () => Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}, {
  timestamps: true
});

const MongoQuotationModel = mongoose.model('Quotation', QuotationSchema);
module.exports = createHybridModel('Quotation', MongoQuotationModel);
