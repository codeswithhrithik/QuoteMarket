/**
 * ============================================================================
 * User Model
 * ============================================================================
 * Stores business owner account details, authentication info, company profile,
 * default quotation preferences (notes, terms), logo, and signature.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  // Company Profile Details
  companyName: {
    type: String,
    default: 'My Business Enterprise',
    trim: true
  },
  companyPhone: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: ''
  },
  companyAddress: {
    type: String,
    default: ''
  },
  companyCity: {
    type: String,
    default: ''
  },
  companyState: {
    type: String,
    default: ''
  },
  companyPincode: {
    type: String,
    default: ''
  },
  companySubtitle: {
    type: String,
    default: ''
  },
  companyFactoryAddress: {
    type: String,
    default: ''
  },
  taxId: {
    type: String, // GSTIN / VAT / EIN
    default: ''
  },
  panNo: {
    type: String, // PAN Number
    default: ''
  },
  currency: {
    type: String,
    default: '₹' // Supports $, ₹, €, £, etc.
  },
  currencyCode: {
    type: String,
    default: 'INR' // USD, INR, EUR, GBP
  },
  logoUrl: {
    type: String,
    default: ''
  },
  signatureUrl: {
    type: String, // Base64 or image URL
    default: ''
  },
  defaultNotes: {
    type: String,
    default: 'Prices are valid for 30 days from the date of quotation. Payment terms: 50% advance, 50% on completion.'
  },
  defaultTerms: {
    type: String,
    default: '1. Delivery will be made within 7-10 business days.\n2. Taxes as applicable.\n3. Goods once sold will not be taken back unless defective.'
  },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscOrSwift: { type: String, default: '' },
    accountName: { type: String, default: '' }
  },
  role: {
    type: String,
    enum: ['user', 'superadmin'],
    default: 'user'
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  defaultTemplate: {
    type: String,
    default: 'clean-paper'
  },
  planExpiresAt: {
    type: Date
  },
  planStatus: {
    type: String,
    enum: ['trial', 'active', 'expired'],
    default: 'trial'
  },
  trialDays: {
    type: Number,
    default: 3
  },
  pdfCredits: {
    type: Number,
    default: 1 // Gives 1 free PDF download upon sign up
  },
  savedUpiId: {
    type: String,
    default: ''
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendReason: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const MongoUserModel = mongoose.model('User', UserSchema);
module.exports = createHybridModel('User', MongoUserModel);
