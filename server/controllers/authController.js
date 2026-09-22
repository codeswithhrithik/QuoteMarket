/**
 * ============================================================================
 * Auth Controller
 * ============================================================================
 * Handles user onboarding (sign up / sign in) and company profile settings.
 * Supports auto sign-up for first-time owners and password encryption.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendRegistrationOTP, sendPasswordResetOTP } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'quotecraft_secure_jwt_token_secret_key_2026';

/**
 * Generate a JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Calculate user trial/plan status and days remaining
 */
function enrichUserPlan(user) {
  if (!user) return user;
  const now = new Date();
  const uid = (user._id || user.id)?.toString();
  
  if (user.role === 'superadmin' || user.email === 'hrithikyadav05@gmail.com') {
    return {
      ...user,
      id: uid,
      _id: uid,
      daysRemaining: 9999,
      planStatus: 'active',
      isPlanDue: false,
      isSuperAdmin: true
    };
  }

  let planExpiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  // If no planExpiresAt, default to 3 days trial from createdAt
  if (!planExpiresAt) {
    const created = user.createdAt ? new Date(user.createdAt) : now;
    planExpiresAt = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
  }

  const diffMs = planExpiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isPlanDue = daysRemaining <= 0;
  const planStatus = isPlanDue ? 'expired' : (user.planStatus || 'trial');

  return {
    ...user,
    id: uid,
    _id: uid,
    planExpiresAt,
    daysRemaining: Math.max(0, daysRemaining),
    planStatus,
    isPlanDue
  };
}

/**
 * Send 6-Digit Verification OTP for Registration
 * POST /api/auth/send-registration-otp
 */
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent duplicate registrations
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear any existing registration OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail, type: 'registration' });

    // Store new OTP with 10-minute expiry
    await OTP.create({
      email: normalizedEmail,
      otp,
      type: 'registration',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send email
    const mailResult = await sendRegistrationOTP(normalizedEmail, otp, name);

    return res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}!`,
      simulated: mailResult.simulated,
      simulatedOtp: mailResult.simulated ? otp : undefined
    });
  } catch (error) {
    console.error('sendRegistrationOTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code.' });
  }
};

/**
 * Register a new business owner (with OTP verification)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, username, password, companyName, companyPhone, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // If OTP is provided, verify it
    if (otp) {
      const otpRecord = await OTP.findOne({
        email: normalizedEmail,
        type: 'registration'
      });

      if (!otpRecord || otpRecord.otp !== String(otp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code. Please check and try again.'
        });
      }

      if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        });
      }

      // Remove used OTP
      await OTP.deleteMany({ email: normalizedEmail, type: 'registration' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3 Days Free Trial Expiration
    const trialExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Create user document
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username: (username || normalizedEmail.split('@')[0] || '').toLowerCase().trim(),
      password: hashedPassword,
      companyName: companyName ? companyName.trim() : `${name.trim()}'s Business`,
      companyPhone: companyPhone ? companyPhone.trim() : '',
      companyEmail: normalizedEmail,
      currency: '₹',
      currencyCode: 'INR',
      role: 'user',
      isEmailVerified: Boolean(otp),
      planExpiresAt: trialExpiry,
      planStatus: 'trial',
      trialDays: 3,
      pdfCredits: 1
    });

    const token = generateToken(user);

    // Return sanitized user object with plan info
    const rawUser = user.toObject ? user.toObject() : (user._doc || { ...user });
    const userResponse = enrichUserPlan(rawUser);
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to QuoteMarket (3 Days Free Trial Active).',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

/**
 * Send Password Reset OTP
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear prior reset OTPs
    await OTP.deleteMany({ email: normalizedEmail, type: 'password_reset' });

    // Store OTP with 10-minute expiry
    await OTP.create({
      email: normalizedEmail,
      otp,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send email
    const mailResult = await sendPasswordResetOTP(normalizedEmail, otp, user.name);

    return res.json({
      success: true,
      message: `Password reset code sent to ${normalizedEmail}!`,
      simulated: mailResult.simulated,
      simulatedOtp: mailResult.simulated ? otp : undefined
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
};

/**
 * Verify OTP & Reset Password
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are required.'
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 5 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      type: 'password_reset'
    });

    if (!otpRecord || otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or incorrect reset code.'
      });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new code.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(user._id || user.id, { password: hashedPassword });

    // Clean up OTP
    await OTP.deleteMany({ email: normalizedEmail, type: 'password_reset' });

    return res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const identifier = email.toLowerCase().trim();
    // Allow login by email or username (e.g. demo1, demo)
    let user = await User.findOne({ email: identifier });
    if (!user) {
      user = await User.findOne({ username: identifier });
    }
    if (!user && !identifier.includes('@')) {
      user = await User.findOne({ email: `${identifier}@quotemarket.com` });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password. Please check your credentials.'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.' + (user.suspendReason ? ` Reason: ${user.suspendReason}` : '')
      });
    }

    const token = generateToken(user);

    const rawUser = user.toObject ? user.toObject() : (user._doc || { ...user });
    const userResponse = enrichUserPlan(rawUser);
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sign in. Please try again.'
    });
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.'
      });
    }

    const userResponse = enrichUserPlan({ ...user });
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.'
    });
  }
};

exports.enrichUserPlan = enrichUserPlan;

exports.updateProfile = async (req, res) => {
  try {
    const existing = await User.findById(req.user.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const enriched = enrichUserPlan({ ...existing });
    if (enriched.isPlanDue) {
      return res.status(403).json({
        success: false,
        message: 'Profile settings are locked because your subscription has expired. Please renew your plan.'
      });
    }

    const updates = { ...req.body };
    delete updates.password; // Prevent modifying password via this endpoint
    delete updates.email;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userResponse = enrichUserPlan({ ...updatedUser });
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully!',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};
