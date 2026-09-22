/**
 * ============================================================================
 * Transaction Model
 * ============================================================================
 * Records payment logs, UPI reference numbers, credit purchases, and admin gifts.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  userEmail: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  creditsAdded: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Saved UPI', 'Card', 'Admin Gift', 'Free Trial', 'Admin Action'],
    default: 'UPI'
  },
  transactionRef: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
    default: 'Success'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const MongoTransactionModel = mongoose.model('Transaction', TransactionSchema);
module.exports = createHybridModel('Transaction', MongoTransactionModel);
