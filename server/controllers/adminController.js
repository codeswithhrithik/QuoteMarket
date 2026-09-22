/**
 * ============================================================================
 * Super Admin Controller
 * ============================================================================
 * Provides Super Admin capabilities:
 * - View & manage all registered users
 * - Add / Gift PDF download credits (1 free, 10 free, custom)
 * - Update PDF download price (currently ₹2) and merchant UPI details
 * - Inspect transaction logs and system health metrics
 */

const User = require('../models/User');
const PaymentSetting = require('../models/PaymentSetting');
const Transaction = require('../models/Transaction');
const Quotation = require('../models/Quotation');

// 1. Get Admin Overview Statistics
exports.getAdminStats = async (req, res) => {
  try {
    const [users, quotes, transactions, setting] = await Promise.all([
      User.find({}),
      Quotation.find({}),
      Transaction.find({}),
      PaymentSetting.findOne({ settingKey: 'global_payment_config' })
    ]);

    const totalRevenue = transactions
      .filter((t) => t.status === 'Success')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalCreditsGifted = transactions
      .filter((t) => t.paymentMethod === 'Admin Gift')
      .reduce((sum, t) => sum + (Number(t.creditsAdded) || 0), 0);

    const now = new Date();
    let activePlansCount = 0;
    let duePlansCount = 0;

    users.forEach((u) => {
      if (u.role === 'superadmin' || u.email === 'hrithikyadav05@gmail.com') {
        activePlansCount++;
        return;
      }
      let exp = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
      if (!exp) {
        const created = u.createdAt ? new Date(u.createdAt) : now;
        exp = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
      }
      if (exp.getTime() > now.getTime()) {
        activePlansCount++;
      } else {
        duePlansCount++;
      }
    });

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activePlansCount,
        duePlansCount,
        totalQuotations: quotes.length,
        totalTransactions: transactions.length,
        totalRevenue,
        totalCreditsGifted,
        currentPricePerPdf: setting?.pricePerPdf || 2
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// 2. Get All Registered Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (Array.isArray(users)) {
      users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    const quotes = await Quotation.find({});

    // Count quotations per user
    const quoteCountMap = {};
    quotes.forEach((q) => {
      const uid = String(q.userId || q.user);
      quoteCountMap[uid] = (quoteCountMap[uid] || 0) + 1;
    });

    const now = new Date();
    const userList = users.map((u) => {
      const uid = String(u._id || u.id);
      const isSuper = u.role === 'superadmin' || u.email === 'hrithikyadav05@gmail.com';
      
      let exp = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
      if (!exp && !isSuper) {
        const created = u.createdAt ? new Date(u.createdAt) : now;
        exp = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
      }

      let daysRemaining = 0;
      let isPlanDue = false;

      if (isSuper) {
        daysRemaining = 9999;
        isPlanDue = false;
      } else if (exp) {
        const diffMs = exp.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isPlanDue = daysRemaining <= 0;
      }

      const planStatus = isSuper ? 'active' : (isPlanDue ? 'expired' : (u.planStatus || 'trial'));

      return {
        id: uid,
        name: u.name,
        email: u.email,
        username: u.username || '',
        role: u.role || 'user',
        companyName: u.companyName || '',
        companyPhone: u.companyPhone || u.phone || '',
        isEmailVerified: Boolean(u.isEmailVerified),
        pdfCredits: u.pdfCredits || 0,
        savedUpiId: u.savedUpiId || '',
        planExpiresAt: exp,
        daysRemaining: Math.max(0, daysRemaining),
        planStatus,
        isSuspended: Boolean(u.isSuspended),
        suspendReason: u.suspendReason || '',
        quotationsCount: quoteCountMap[uid] || 0,
        createdAt: u.createdAt
      };
    });

    return res.json({ success: true, users: userList });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list' });
  }
};

// 2.2 Suspend / Reactivate User Account
exports.toggleSuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin' || user.email === 'hrithikyadav05@gmail.com') {
      return res.status(400).json({ success: false, message: 'Cannot suspend Super Admin account' });
    }

    const newSuspendedState = !Boolean(user.isSuspended);
    await User.findByIdAndUpdate(
      userId,
      {
        isSuspended: newSuspendedState,
        suspendReason: newSuspendedState ? (reason || 'Suspended by Super Admin') : ''
      },
      { new: true }
    );

    // Record audit log
    await Transaction.create({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      amount: 0,
      creditsAdded: 0,
      paymentMethod: 'Admin Action',
      status: 'Success',
      notes: `Admin ${newSuspendedState ? 'suspended' : 'unsuspended'} user ${user.name} (${user.email}) - ${reason || 'Status update'}`
    });

    return res.json({
      success: true,
      message: `User ${user.email} is now ${newSuspendedState ? 'suspended' : 'active'}!`,
      isSuspended: newSuspendedState
    });
  } catch (error) {
    console.error('toggleSuspendUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user suspension status' });
  }
};

// 2.3 Permanently Delete User Account
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'superadmin' || user.email === 'hrithikyadav05@gmail.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete Super Admin account' });
    }

    // Delete user document
    await User.findByIdAndDelete(userId);

    // Delete user's quotations
    await Quotation.deleteMany({ userId });

    // Record audit log
    await Transaction.create({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      amount: 0,
      creditsAdded: 0,
      paymentMethod: 'Admin Action',
      status: 'Success',
      notes: `Super Admin permanently deleted user account ${user.name} (${user.email}) and purged all associated quotations`
    });

    return res.json({
      success: true,
      message: `User ${user.name} (${user.email}) and all associated records have been permanently deleted.`
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// 2.5 Add / Extend Subscription & Trial Days
exports.addDaysToUser = async (req, res) => {
  try {
    const { userId, daysToAdd, reason } = req.body;
    const days = Number(daysToAdd);
    if (!userId || isNaN(days) || days <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user or days quantity' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt) : now;
    // If currently expired or past, extend from now; otherwise add to existing expiry
    const baseDate = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        planExpiresAt: newExpiry,
        planStatus: 'active'
      },
      { new: true }
    );

    // Record audit log
    await Transaction.create({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      amount: 0,
      creditsAdded: days,
      paymentMethod: 'Admin Plan Extension',
      referenceId: `EXT-${Date.now()}-${days}D`,
      status: 'Success',
      notes: reason || `Admin added ${days} days (valid until ${newExpiry.toISOString().split('T')[0]})`
    });

    const diffMs = newExpiry.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return res.json({
      success: true,
      message: `Successfully added ${days} days to ${user.name}! Plan active for ${daysRemaining} days (until ${newExpiry.toISOString().split('T')[0]}).`,
      planExpiresAt: newExpiry,
      daysRemaining,
      planStatus: 'active'
    });
  } catch (error) {
    console.error('addDaysToUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add days to user' });
  }
};

// 3. Add / Gift PDF Credits to User
exports.addCreditsToUser = async (req, res) => {
  try {
    const { userId, creditsToAdd, reason } = req.body;

    const count = Number(creditsToAdd);
    if (!userId || isNaN(count) || count === 0) {
      return res.status(400).json({ success: false, message: 'Invalid user or credit quantity' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newCredits = Math.max(0, (user.pdfCredits || 0) + count);
    await User.findByIdAndUpdate(userId, { pdfCredits: newCredits });

    // Log admin gift transaction
    await Transaction.create({
      userId: user._id || user.id,
      userName: user.name,
      userEmail: user.email,
      amount: 0,
      creditsAdded: count,
      paymentMethod: 'Admin Gift',
      transactionRef: `GIFT-${Date.now().toString().slice(-6)}`,
      status: 'Success',
      notes: reason || `Super Admin gifted ${count} free PDF credits`
    });

    return res.json({
      success: true,
      message: `Successfully granted ${count} PDF credits to ${user.name} (${user.email})!`,
      newCredits
    });
  } catch (error) {
    console.error('addCreditsToUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to allocate credits' });
  }
};

// 4. Get Payment & Pricing Settings
exports.getSettings = async (req, res) => {
  try {
    let setting = await PaymentSetting.findOne({ settingKey: 'global_payment_config' });
    if (!setting) {
      setting = await PaymentSetting.create({
        settingKey: 'global_payment_config',
        pricePerPdf: 2,
        upiId: 'hrithikyadav05@okaxis',
        merchantName: 'Hrithik King',
        isPaymentRequired: true
      });
    }

    return res.json({ success: true, settings: setting });
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// 5. Update Payment & Pricing Settings (e.g. Price, UPI, Packs)
exports.updateSettings = async (req, res) => {
  try {
    const { pricePerPdf, upiId, merchantName, isPaymentRequired, packs } = req.body;

    const updated = await PaymentSetting.findOneAndUpdate(
      { settingKey: 'global_payment_config' },
      {
        pricePerPdf: Number(pricePerPdf) || 2,
        upiId: upiId || 'hrithikyadav05@okaxis',
        merchantName: merchantName || 'Hrithik King',
        isPaymentRequired: isPaymentRequired !== false,
        ...(packs ? { packs } : {})
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Payment and pricing settings updated successfully!',
      settings: updated
    });
  } catch (error) {
    console.error('updateSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payment settings' });
  }
};

// 6. Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    if (Array.isArray(transactions)) {
      transactions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return res.json({ success: true, transactions });
  } catch (error) {
    console.error('getAllTransactions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transaction logs' });
  }
};
