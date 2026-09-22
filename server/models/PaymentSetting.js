/**
 * ============================================================================
 * Payment Setting Model
 * ============================================================================
 * Stores configurable price per PDF download, merchant UPI details,
 * free trial credits, and credit pack pricing.
 */

const mongoose = require('mongoose');
const { createHybridModel } = require('../config/db');

const PaymentSettingSchema = new mongoose.Schema({
  settingKey: {
    type: String,
    default: 'global_payment_config',
    unique: true
  },
  pricePerPdf: {
    type: Number,
    default: 2 // Currently 2 rupees per PDF download
  },
  upiId: {
    type: String,
    default: 'hrithikyadav05@okaxis'
  },
  merchantName: {
    type: String,
    default: 'QuoteCraft - Hrithik King'
  },
  isPaymentRequired: {
    type: Boolean,
    default: true
  },
  packs: [
    {
      credits: { type: Number, default: 1 },
      price: { type: Number, default: 2 },
      label: { type: String, default: '1 PDF Download' }
    },
    {
      credits: { type: Number, default: 10 },
      price: { type: Number, default: 18 },
      label: { type: String, default: '10 PDFs (Save 10%)' }
    },
    {
      credits: { type: Number, default: 50 },
      price: { type: Number, default: 80 },
      label: { type: String, default: '50 PDFs (Save 20%)' }
    }
  ]
}, {
  timestamps: true
});

const MongoPaymentSettingModel = mongoose.model('PaymentSetting', PaymentSettingSchema);
module.exports = createHybridModel('PaymentSetting', MongoPaymentSettingModel);
