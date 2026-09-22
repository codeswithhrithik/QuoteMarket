/**
 * ============================================================================
 * Scanner Prompt & Subscription Plan Renewal Modal
 * ============================================================================
 * Features:
 * - Dynamic High-Resolution Scannable QR Code generated via `qrcode`
 * - 4 Subscription Plans:
 *   1 Month: ₹100 (30 Days)
 *   3 Months: ₹200 (90 Days - Most Popular / Save 33%)
 *   6 Months: ₹450 (180 Days - Best Value)
 *   1 Year: ₹899 (365 Days - Annual Pro)
 * - Dynamic UPI Intent URL with auto-filled Payee & Amount
 * - Direct "Pay with UPI App" button for mobile/one-click payment
 * - Payee Details: hrithikyadav05@okaxis (Hrithik King)
 * - Instant Activation check button
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  AlertTriangle, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  X,
  Sparkles,
  Zap,
  ExternalLink,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SUBSCRIPTION_PLANS = [
  {
    id: '1m',
    title: '1 Month',
    durationDays: 30,
    price: 100,
    monthlyRate: '₹100/mo',
    badge: 'Starter',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    id: '3m',
    title: '3 Months',
    durationDays: 90,
    price: 200,
    monthlyRate: '₹67/mo',
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    savings: 'Save 33%',
    isPopular: true
  },
  {
    id: '6m',
    title: '6 Months',
    durationDays: 180,
    price: 450,
    monthlyRate: '₹75/mo',
    badge: 'Best Value',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    savings: 'Save 25%'
  },
  {
    id: '1y',
    title: '1 Year',
    durationDays: 365,
    price: 899,
    monthlyRate: '₹75/mo',
    badge: 'Annual Pro',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    savings: 'Save 25%',
    isAnnual: true
  }
];

export default function ScannerPromptModal({ isOpen, onClose, initialPlanId = '3m' }) {
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState(() => {
    return SUBSCRIPTION_PLANS.find((p) => p.id === initialPlanId) || SUBSCRIPTION_PLANS[1];
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (initialPlanId) {
      const match = SUBSCRIPTION_PLANS.find((p) => p.id === initialPlanId);
      if (match) setSelectedPlan(match);
    }
  }, [initialPlanId, isOpen]);

  const upiId = 'hrithikyadav05@okaxis';
  const payeeName = 'Hrithik King';

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));

  // Build standard UPI intent string
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent(`QuoteMarket ${selectedPlan.title} Subscription`)}`;

  // Generate crisp, pixel-perfect QR Code
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(upiIntentUrl, {
      width: 320,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiIntentUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    addToast('UPI ID copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const updated = await refreshUser();
      if (updated && !updated.isPlanDue && updated.daysRemaining > 0) {
        addToast(`🎉 Plan Activated! You have ${updated.daysRemaining} days remaining.`, 'success');
        onClose && onClose();
      } else {
        addToast('Plan not activated yet. Please complete payment and contact admin.', 'warning');
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={() => {
        if (onClose) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5 relative my-6 sm:my-8 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Close (View & Download Previous Quotations)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 1. Header Banner */}
        <div className={`p-5 sm:p-6 text-white relative overflow-hidden ${
          isPlanDue 
            ? 'bg-gradient-to-r from-slate-950 via-rose-950 to-indigo-950' 
            : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950'
        }`}>
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white backdrop-blur-md">
              {isPlanDue ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>3-DAY TRIAL EXPIRED • PAYMENT DUE</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SUBSCRIPTION & RENEWAL PORTAL</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isPlanDue ? 'Reactivate Your QuoteMarket Account' : 'Upgrade & Extend Subscription'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Choose your preferred plan below, scan the instant QR code using any UPI app, and unlock unlimited quotation creation.
            </p>
          </div>

          {/* Account status badge */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>
              User: <strong className="text-white font-bold">{user?.name}</strong> ({user?.email})
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPlanDue ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40' : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
            }`}>
              {isPlanDue ? 'Plan Due' : `${user?.daysRemaining ?? 3} Days Left`}
            </span>
          </div>
        </div>

        {/* 2. Interactive Subscription Plan Cards */}
        <div className="px-5 sm:px-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Select Subscription Plan:
            </label>
            <span className="text-[11px] font-semibold text-indigo-600">
              Instant activation via UPI
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    {plan.savings && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      {plan.title}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-slate-900">
                        ₹{plan.price}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {plan.monthlyRate}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{plan.durationDays} Days</span>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. High-Resolution Presentable QR Code Card */}
        <div className="px-5 sm:px-6">
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-5 text-center space-y-3.5 shadow-sm">
            {/* Accepted UPI Apps Banner */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Google Pay</span>
              <span>•</span>
              <span>PhonePe</span>
              <span>•</span>
              <span>Paytm</span>
              <span>•</span>
              <span>BHIM</span>
              <span>•</span>
              <span>Any UPI</span>
            </div>

            {/* Crisp QR Code Container */}
            <div className="inline-block relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md group">
              {/* Corner framing brackets for presentability */}
              <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-indigo-600 rounded-tl"></div>
              <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-indigo-600 rounded-tr"></div>
              <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-indigo-600 rounded-bl"></div>
              <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-indigo-600 rounded-br"></div>

              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Scan QR Code to pay ₹${selectedPlan.price} via UPI`}
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto block rounded-lg select-none"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-slate-50 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Amount to Pay Highlight */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-black text-sm">
              <span>Pay ₹{selectedPlan.price}</span>
              <span className="text-xs font-semibold text-emerald-700">({selectedPlan.title} Access)</span>
            </div>

            {/* UPI ID Pill & Direct Intent Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800 shadow-sm">
                <span>{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors p-0.5"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Direct UPI Intent Link for mobile / seamless checkout */}
              <a
                href={upiIntentUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open UPI App (₹{selectedPlan.price})</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Verified Payee: <strong className="text-slate-800">{payeeName}</strong>
            </p>
          </div>
        </div>

        {/* 4. Instructions & Contact */}
        <div className="px-5 sm:px-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span>
              Need manual activation or support? Contact Admin: <strong>hrithikyadav05@gmail.com</strong>
            </span>
            <span className="font-bold text-indigo-700">
              WhatsApp: +91 77580 20071
            </span>
          </div>
        </div>

        {/* 5. Bottom Actions */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking Activation Status...' : 'I Have Paid (Check Activation)'}
          </button>

          {isPlanDue && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Previous Quotes</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/auth';
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
