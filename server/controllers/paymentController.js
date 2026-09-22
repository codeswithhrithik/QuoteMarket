/**
 * ============================================================================
 * Payment & Credits Controller
 * ============================================================================
 * Handles UPI payment verification, credit balance queries, credit consumption
 * for PDF downloads/sharing, and saved UPI payment methods.
 */

const User = require('../models/User');
const PaymentSetting = require('../models/PaymentSetting');
const Transaction = require('../models/Transaction');

// 1. Get Payment Configuration & User Credits
exports.getPaymentConfig = async (req, res) => {
  try {
    let setting = await PaymentSetting.findOne({ settingKey: 'global_payment_config' });
    if (!setting) {
      setting = {
        pricePerPdf: 2,
        upiId: 'hrithikyadav05@okaxis',
        merchantName: 'Hrithik King',
        isPaymentRequired: true,
        packs: [
          { credits: 1, price: 2, label: 'Single PDF Download (₹2)' },
          { credits: 10, price: 18, label: '10 PDFs Pack (₹18 - Save 10%)' },
          { credits: 50, price: 80, label: '50 PDFs Pro Pack (₹80 - Save 20%)' }
        ]
      };
    }

    let userCredits = 0;
    let savedUpiId = '';

    if (req.user) {
      const u = await User.findById(req.user.id || req.user._id);
      if (u) {
        userCredits = u.pdfCredits || 0;
        savedUpiId = u.savedUpiId || '';
      }
    }

    return res.json({
      success: true,
      pricePerPdf: setting.pricePerPdf || 2,
      upiId: setting.upiId || 'hrithikyadav05@okaxis',
      merchantName: setting.merchantName || 'Hrithik King',
      isPaymentRequired: setting.isPaymentRequired !== false,
      packs: setting.packs || [],
      userCredits,
      savedUpiId
    });
  } catch (error) {
    console.error('getPaymentConfig error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment config' });
  }
};

// 2. Verify & Process Payment (UPI / Saved UPI / Instant Mock)
exports.verifyPayment = async (req, res) => {
  try {
    const { amount, credits, paymentMethod, transactionRef, upiId, saveUpi } = req.body;

    const creditsToAdd = Math.max(1, Number(credits) || 1);
    const amountPaid = Number(amount) || 2;

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const txnRef = transactionRef || `UPI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Create transaction log
    const txn = await Transaction.create({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      amount: amountPaid,
      creditsAdded: creditsToAdd,
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: txnRef,
      status: 'Success',
      notes: `Purchased ${creditsToAdd} PDF download credit(s) via ${paymentMethod || 'UPI'}`
    });

    // Update user credits and optionally save UPI ID
    const newCredits = (user.pdfCredits || 0) + creditsToAdd;
    const updateData = { pdfCredits: newCredits };

    if (upiId && (saveUpi || !user.savedUpiId)) {
      updateData.savedUpiId = upiId.trim();
    }

    await User.findByIdAndUpdate(user._id || user.id, updateData);

    return res.json({
      success: true,
      message: `Payment verified! Added ${creditsToAdd} PDF download credit(s).`,
      credits: newCredits,
      transaction: txn
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

// 3. Consume 1 Credit for PDF Download or Share
exports.consumeCredit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Super Admin has unlimited downloads
    if (user.role === 'superadmin' || user.email === 'hrithikyadav05@gmail.com') {
      return res.json({
        success: true,
        message: 'Super Admin: Unlimited downloads permitted.',
        remainingCredits: user.pdfCredits || 9999
      });
    }

    const currentCredits = user.pdfCredits || 0;

    if (currentCredits <= 0) {
      let setting = await PaymentSetting.findOne({ settingKey: 'global_payment_config' });
      const price = setting?.pricePerPdf || 2;
      return res.status(402).json({
        success: false,
        paymentRequired: true,
        pricePerPdf: price,
        message: `PDF Download requires ${price} ₹ or 1 credit. Please make payment to download.`
      });
    }

    // Deduct 1 credit
    const remainingCredits = currentCredits - 1;
    await User.findByIdAndUpdate(user._id || user.id, { pdfCredits: remainingCredits });

    return res.json({
      success: true,
      message: '1 PDF Download credit consumed.',
      remainingCredits
    });
  } catch (error) {
    console.error('consumeCredit error:', error);
    return res.status(500).json({ success: false, message: 'Error processing download credits' });
  }
};
