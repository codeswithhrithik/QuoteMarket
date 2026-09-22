/**
 * ============================================================================
 * Super Admin & Payment System Seeder
 * ============================================================================
 * Automatically initializes or upgrades the Super Admin account:
 * - Email: hrithikyadav05@gmail.com
 * - Password: Ming@321#!
 * - Name: Hrithik King
 * - Role: superadmin
 * - Sets default PDF price to ₹2 and default UPI merchant info
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PaymentSetting = require('../models/PaymentSetting');

async function seedSuperAdmin() {
  try {
    const adminEmail = 'hrithikyadav05@gmail.com';
    const adminPassword = 'Ming@321#!';
    const adminName = 'Hrithik King';

    let adminUser = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (!adminUser) {
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
        pdfCredits: 9999,
        companyName: 'Hrithik King Enterprises',
        companyPhone: '+91 77580 20071',
        currency: '₹',
        currencyCode: 'INR'
      });
      console.log(`[Seed] 👑 Super Admin account created: ${adminEmail}`);
    } else {
      // Ensure superadmin role, correct password, and high credits
      await User.findByIdAndUpdate(adminUser._id || adminUser.id, {
        role: 'superadmin',
        name: adminName,
        password: hashedPassword,
        pdfCredits: Math.max(adminUser.pdfCredits || 0, 9999)
      });
      console.log(`[Seed] 👑 Super Admin verified & updated: ${adminEmail}`);
    }

    // Ensure payment setting exists
    let setting = await PaymentSetting.findOne({ settingKey: 'global_payment_config' });
    if (!setting) {
      await PaymentSetting.create({
        settingKey: 'global_payment_config',
        pricePerPdf: 2,
        upiId: 'hrithikyadav05@okaxis',
        merchantName: 'Hrithik King',
        isPaymentRequired: true,
        packs: [
          { credits: 1, price: 2, label: 'Single PDF Download (₹2)' },
          { credits: 10, price: 18, label: '10 PDFs Pack (₹18 - Save 10%)' },
          { credits: 50, price: 80, label: '50 PDFs Pro Pack (₹80 - Save 20%)' }
        ]
      });
      console.log('[Seed] 💳 Global payment setting initialized (₹2 per PDF).');
    }

    // Seed Demo User 1: demo1 / test1 (Active 3-Day Trial)
    let demo1 = await User.findOne({ email: 'demo1@quotemarket.com' });
    const demo1Hash = await bcrypt.hash('test1', salt);
    const demo1Expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    if (!demo1) {
      await User.create({
        name: 'Demo User 1',
        email: 'demo1@quotemarket.com',
        username: 'demo1',
        password: demo1Hash,
        role: 'user',
        companyName: 'Apex Machinery & Tools',
        companyPhone: '+91 98220 11111',
        currency: '₹',
        currencyCode: 'INR',
        planExpiresAt: demo1Expiry,
        planStatus: 'trial',
        trialDays: 3,
        pdfCredits: 1
      });
      console.log('[Seed] 👤 Demo User 1 created: demo1 / test1 (Active 3-day trial)');
    } else {
      await User.findByIdAndUpdate(demo1._id || demo1.id, {
        username: 'demo1',
        password: demo1Hash,
        planExpiresAt: demo1Expiry,
        planStatus: 'trial'
      });
      console.log('[Seed] 👤 Demo User 1 verified: demo1 / test1');
    }

    // Seed Demo User 2: demo / test2 (Expired Plan - triggers scanner prompt)
    let demo2 = await User.findOne({ email: 'demo@quotemarket.com' });
    const demo2Hash = await bcrypt.hash('test2', salt);
    const demo2ExpiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!demo2) {
      await User.create({
        name: 'Demo User (Plan Due)',
        email: 'demo@quotemarket.com',
        username: 'demo',
        password: demo2Hash,
        role: 'user',
        companyName: 'Global Fabrications Ltd',
        companyPhone: '+91 98230 22222',
        currency: '₹',
        currencyCode: 'INR',
        planExpiresAt: demo2ExpiredDate,
        planStatus: 'expired',
        trialDays: 3,
        pdfCredits: 0
      });
      console.log('[Seed] 👤 Demo User created: demo / test2 (Expired Plan - shows scanner prompt)');
    } else {
      await User.findByIdAndUpdate(demo2._id || demo2.id, {
        username: 'demo',
        password: demo2Hash,
        planExpiresAt: demo2ExpiredDate,
        planStatus: 'expired'
      });
      console.log('[Seed] 👤 Demo User verified: demo / test2');
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed super admin / payment settings:', error);
  }
}

module.exports = seedSuperAdmin;
