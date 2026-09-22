/**
 * ============================================================================
 * Authentication Page (Sign In, OTP Registration & Password Recovery)
 * ============================================================================
 * Provides an intuitive onboarding experience for business owners:
 * - Secure Sign In
 * - First-time Owner Sign Up with 6-digit Email OTP Verification
 * - Forgot Password & Reset Passcode Flow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import { 
  FileText, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  X,
  HelpCircle
} from 'lucide-react';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyPhone: ''
  });
  const [regStep, setRegStep] = useState('form'); // 'form' | 'otp'
  const [regOtp, setRegOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Forgot Password Modal State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Send Registration OTP
  const handleRequestRegOTP = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please enter your name, email, and password.', 'error');
      return;
    }
    if (formData.password.length < 5) {
      addToast('Password must be at least 5 characters long.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authAPI.sendRegistrationOTP({
        email: formData.email,
        name: formData.name
      });

      if (res.data?.success) {
        setRegStep('otp');
        setCountdown(60);
        if (res.data.simulatedOtp) {
          addToast(`Verification code sent! (Simulated Mode: ${res.data.simulatedOtp})`, 'info');
        } else {
          addToast(res.data.message || 'Verification code sent to your email!', 'success');
        }
      }
    } catch (err) {
      console.error('Registration OTP request error:', err);
      addToast(err.response?.data?.message || 'Failed to send verification code.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Submit Registration with OTP
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!regOtp || regOtp.trim().length !== 6) {
      addToast('Please enter the 6-digit verification code sent to your email.', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        otp: regOtp.trim()
      });
      addToast('🎉 Email verified! Your 3-Day Free Trial is now active. Welcome aboard!', 'success');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      addToast(err.message || 'Registration failed. Please check the code and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend Registration OTP
  const handleResendRegOTP = async () => {
    if (countdown > 0) return;
    setSendingOtp(true);
    try {
      const res = await authAPI.sendRegistrationOTP({
        email: formData.email,
        name: formData.name
      });
      if (res.data?.success) {
        setCountdown(60);
        if (res.data.simulatedOtp) {
          addToast(`New code sent! (Simulated: ${res.data.simulatedOtp})`, 'info');
        } else {
          addToast('A new verification code has been sent to your email.', 'success');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend code.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Standard Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addToast('Please enter your email/username and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res?.user?.isPlanDue) {
        addToast('⚠️ Action Required: Subscription is due. Please scan QR to reactivate.', 'warning');
      } else if (res?.user?.planStatus === 'trial') {
        addToast(`Signed in! 3-Day Free Trial active (${res.user.daysRemaining ?? 3} days left).`, 'info');
      } else {
        addToast(`Signed in successfully! Welcome back, ${res?.user?.name || ''}`);
      }
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      addToast(error.message || 'Authentication failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Send OTP
  const handleRequestForgotOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast('Please enter your registered email address.', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail });
      if (res.data?.success) {
        setForgotStep('otp');
        if (res.data.simulatedOtp) {
          addToast(`Reset code sent! (Simulated: ${res.data.simulatedOtp})`, 'info');
        } else {
          addToast('Password reset code sent to your email!', 'success');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send password reset code.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Submit New Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      addToast('Please enter both the reset code and your new password.', 'error');
      return;
    }
    if (newPassword.length < 5) {
      addToast('New password must be at least 5 characters.', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email: forgotEmail,
        otp: forgotOtp.trim(),
        newPassword
      });
      if (res.data?.success) {
        addToast('Password reset successfully! Please sign in with your new password.', 'success');
        setForgotOpen(false);
        setForgotStep('email');
        setForgotOtp('');
        setNewPassword('');
        setFormData({ ...formData, email: forgotEmail, password: '' });
        setIsRegister(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-7 animate-scale-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isRegister 
              ? regStep === 'otp' ? 'Verify Your Email' : 'Start with QuoteMarket'
              : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-500">
            {isRegister
              ? regStep === 'otp'
                ? `Enter the 6-digit code sent to ${formData.email}`
                : 'Create your business account with instant email verification'
              : 'Sign in to access your quotations, parties, and catalog'}
          </p>
        </div>

        {/* Tab Toggle (Only visible when not on OTP step) */}
        {(!isRegister || regStep === 'form') && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setRegStep('form');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setRegStep('form');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              First-time Owner (Sign Up)
            </button>
          </div>
        )}

        {/* --- 1. SIGN IN FORM --- */}
        {!isRegister && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email or Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Email or Username (e.g. demo1, demo)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(formData.email || '');
                    setForgotStep('email');
                    setForgotOpen(true);
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all text-sm mt-6"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* --- 2. SIGN UP: STEP 1 (DETAILS) --- */}
        {isRegister && regStep === 'form' && (
          <form onSubmit={handleRequestRegOTP} className="space-y-4 text-xs">
            {/* Owner Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Owner / Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Company / Business Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Enterprise Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Acme Builders & Contractors"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Business Phone (WhatsApp) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="At least 5 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all text-sm mt-6"
            >
              {sendingOtp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Continue & Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* --- 3. SIGN UP: STEP 2 (OTP VERIFICATION) --- */}
        {isRegister && regStep === 'otp' && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-900">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Sent to:</span>
                <span className="font-bold text-xs truncate max-w-[200px] block">{formData.email}</span>
              </div>
              <button
                type="button"
                onClick={() => setRegStep('form')}
                className="text-[11px] font-bold text-blue-700 hover:underline bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-center font-bold text-slate-700 mb-2 uppercase tracking-wider text-[11px]">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••••"
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3.5 border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900"
                />
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Code expires in 10 minutes. Check your inbox and spam folder.
              </p>
            </div>

            {/* Resend button */}
            <div className="text-center">
              <button
                type="button"
                disabled={countdown > 0 || sendingOtp}
                onClick={handleResendRegOTP}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Didn’t receive code? Click to Resend'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || regOtp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Create Account
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRegStep('form')}
              className="w-full text-center text-slate-500 hover:text-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </button>
          </form>
        )}

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Multi-Template Quotes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Instant PDF Export</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Auto Amount in Words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>WhatsApp & Email Share</span>
          </div>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {forgotStep === 'email' ? 'Forgot Password' : 'Enter Reset Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStep === 'email' ? (
              <form onSubmit={handleRequestForgotOTP} className="space-y-4 text-xs">
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Enter your registered email address and we will send you a 6-digit verification code to reset your password.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {forgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600">
                  Reset code sent to <strong>{forgotEmail}</strong>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    6-Digit Reset Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-lg font-black font-mono tracking-widest py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 5 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6 || !newPassword}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset & Save Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
