/**
 * ============================================================================
 * Email Service (Nodemailer)
 * ============================================================================
 * Handles sending OTPs for registration verification and password recovery.
 * Supports Gmail SMTP, custom SMTP, and graceful simulation fallback when
 * credentials are not yet configured in .env.
 */

const nodemailer = require('nodemailer');

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return null;
}

/**
 * Send 6-Digit OTP for Registration Verification
 */
async function sendRegistrationOTP(email, otp, name = '') {
  const transporter = getTransporter();
  const subject = `Your QuoteMarket Verification Code: ${otp}`;
  const senderEmail = process.env.EMAIL_USER || 'noreply@quotemarket.com';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #2563eb; color: #ffffff; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-weight: 900; font-size: 20px;">Q</div>
        <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">Verify Your Email</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Welcome to QuoteMarket! Complete your registration below.</p>
      </div>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Your One-Time Passcode</span>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1e293b; margin: 12px 0; font-family: monospace;">${otp}</div>
        <p style="color: #ef4444; font-size: 11px; margin: 0; font-weight: 600;">Valid for 10 minutes only. Do not share this code.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
        ${name ? `Hello <strong>${name}</strong>, enter` : 'Enter'} this code on the registration page to activate your <strong>3-Day Free Trial</strong> and start creating professional quotations.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        If you did not request this verification, please safely ignore this email.<br>
        &copy; ${new Date().getFullYear()} QuoteMarket. All rights reserved.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n========================================================`);
    console.log(`📨 [SIMULATED EMAIL] Registration OTP for ${email}: ${otp}`);
    console.log(`ℹ️ To send real emails, set EMAIL_USER and EMAIL_PASS in .env`);
    console.log(`========================================================\n`);
    return { success: true, simulated: true, otp };
  }

  try {
    await transporter.sendMail({
      from: `"QuoteMarket" <${senderEmail}>`,
      to: email,
      subject,
      html
    });
    console.log(`✅ [Email] Registration OTP sent successfully to ${email}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send email to ${email}:`, error.message);
    // Return simulated fallback so registration is never blocked on credentials error
    return { success: true, simulated: true, otp, error: error.message };
  }
}

/**
 * Send 6-Digit OTP for Password Reset
 */
async function sendPasswordResetOTP(email, otp, name = '') {
  const transporter = getTransporter();
  const subject = `QuoteMarket Password Reset Code: ${otp}`;
  const senderEmail = process.env.EMAIL_USER || 'noreply@quotemarket.com';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #dc2626; color: #ffffff; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-weight: 900; font-size: 20px;">🔒</div>
        <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">Password Reset Request</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">We received a request to reset your QuoteMarket password.</p>
      </div>

      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="color: #9f1239; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Reset Passcode</span>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #9f1239; margin: 12px 0; font-family: monospace;">${otp}</div>
        <p style="color: #be123c; font-size: 11px; margin: 0; font-weight: 600;">Valid for 10 minutes. Never share this code with anyone.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
        Enter this code in QuoteMarket along with your new password to restore access to your account.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        If you did not request a password reset, please contact support or secure your account.<br>
        &copy; ${new Date().getFullYear()} QuoteMarket. All rights reserved.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`\n========================================================`);
    console.log(`🔐 [SIMULATED EMAIL] Password Reset OTP for ${email}: ${otp}`);
    console.log(`ℹ️ To send real emails, set EMAIL_USER and EMAIL_PASS in .env`);
    console.log(`========================================================\n`);
    return { success: true, simulated: true, otp };
  }

  try {
    await transporter.sendMail({
      from: `"QuoteMarket Security" <${senderEmail}>`,
      to: email,
      subject,
      html
    });
    console.log(`✅ [Email] Password reset OTP sent successfully to ${email}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send email to ${email}:`, error.message);
    return { success: true, simulated: true, otp, error: error.message };
  }
}

module.exports = {
  sendRegistrationOTP,
  sendPasswordResetOTP
};
