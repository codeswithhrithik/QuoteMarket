/**
 * ============================================================================
 * OTP Model
 * ============================================================================
 * Stores time-sensitive 6-digit one-time passwords for email verification
 * and secure password reset.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

const MongoOTPModel = mongoose.model('OTP', OTPSchema);
module.exports = createHybridModel('OTP', MongoOTPModel);
