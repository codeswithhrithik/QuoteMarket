/**
 * ============================================================================
 * Payment & PDF Download Checkout Modal
 * ============================================================================
 * Allows users to pay for PDF downloads/sharing via UPI (Google Pay, PhonePe, Paytm, QR)
 * or saved payment methods, or purchase multi-pack download credits.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { paymentAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  actionLabel = 'Download PDF'
}) {
  const { addToast } = useToast();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    pricePerPdf: 2,
    upiId: 'hrithikyadav05@okaxis',
    merchantName: 'Hrithik King',
    packs: [
      { credits: 1, price: 2, label: '1 PDF Download (₹2)' },
      { credits: 10, price: 18, label: '10 PDFs (₹18 - Save 10%)' },
      { credits: 50, price: 80, label: '50 PDFs Pro (₹80 - Save 20%)' }
    ]
  });

  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [saveUpi, setSaveUpi] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeTab, setActiveTab] = useState('upi_qr'); // 'upi_qr' | 'upi_id' | 'saved'

  // Load payment configuration & saved payment preferences
  useEffect(() => {
    if (!isOpen) return;

    async function loadConfig() {
      setLoading(true);
      try {
        const res = await paymentAPI.getConfig();
        if (res.data.success) {
          setPaymentConfig(res.data);
          const saved = res.data.savedUpiId || localStorage.getItem('quotecraft_saved_upi') || '';
          if (saved) {
            setUpiIdInput(saved);
            setActiveTab('saved');
          }
        }
      } catch (err) {
        console.error('Error loading payment config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPack = paymentConfig.packs?.[selectedPackIndex] || {
    credits: 1,
    price: paymentConfig.pricePerPdf || 2,
    label: '1 PDF Download'
  };

  const merchantUpi = paymentConfig.upiId || 'hrithikyadav05@okaxis';
  const merchantName = encodeURIComponent(paymentConfig.merchantName || 'Hrithik King');
  const upiIntentUrl = `upi://pay?pa=${merchantUpi}&pn=${merchantName}&am=${currentPack.price}&cu=INR&tn=Quotation_PDF_Download`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntentUrl)}`;

  const savedUpiId = user?.savedUpiId || localStorage.getItem('quotecraft_saved_upi') || '';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpi(true);
    addToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Complete & verify payment
  const handleVerifyAndPay = async (method = 'UPI') => {
    setSubmitting(true);
    try {
      const upiToUse = activeTab === 'saved' ? savedUpiId : upiIdInput.trim() || merchantUpi;

      const res = await paymentAPI.verify({
        amount: currentPack.price,
        credits: currentPack.credits,
        paymentMethod: method,
        upiId: upiToUse,
        saveUpi: saveUpi
      });

      if (res.data.success) {
        if (saveUpi && upiToUse) {
          localStorage.setItem('quotecraft_saved_upi', upiToUse);
        }

        // Update local user state
        if (updateUser) {
          updateUser({ pdfCredits: res.data.credits });
        }

        addToast(`Payment of ₹${currentPack.price} successful! ${currentPack.credits} PDF credit(s) added.`);
        onPaymentSuccess && onPaymentSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      addToast(err.response?.data?.message || 'Payment verification failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold block">
                Instant PDF Checkout
              </span>
              <h2 className="text-xl font-black tracking-tight">
                Unlock {actionLabel}
              </h2>
            </div>
          </div>

          <p className="text-xs text-blue-100/90 leading-relaxed">
            Standard download price is only <strong className="text-amber-300 font-bold">₹{paymentConfig.pricePerPdf || 2}</strong>. Pay via UPI or use your saved payment method to unlock your high-resolution quotation document immediately.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Select Credit Bundle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Package
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(paymentConfig.packs || []).map((pack, idx) => {
                const isSelected = selectedPackIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPackIndex(idx)}
                    className={`p-3 rounded-2xl border text-center transition-all relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {idx === 1 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    <span className="text-lg font-black text-slate-900 block">
                      ₹{pack.price}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      {pack.credits} {pack.credits === 1 ? 'PDF' : 'PDFs'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            {savedUpiId && (
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Saved UPI
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('upi_qr')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upi_qr'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              UPI QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upi_id')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upi_id'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              UPI Apps / ID
            </button>
          </div>

          {/* Tab 1: Saved Payment Method (1-Click Instant) */}
          {activeTab === 'saved' && savedUpiId && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Saved UPI Account
                    </span>
                    <span className="text-xs font-mono text-emerald-700 font-semibold">
                      {savedUpiId}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-md">
                  Fast Pay
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyAndPay('Saved UPI')}
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                {submitting ? 'Verifying & Unlocking...' : `Pay ₹${currentPack.price} & Download Instantly`}
              </button>
            </div>
          )}

          {/* Tab 2: UPI QR Code (Scan with GPay, PhonePe, Paytm) */}
          {activeTab === 'upi_qr' && (
            <div className="text-center space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-44 h-44 object-contain mx-auto rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Scan with Google Pay, PhonePe, Paytm or BHIM
                </p>
                <p className="text-[11px] text-slate-500">
                  Total Amount: <strong className="text-slate-900 font-bold">₹{currentPack.price}</strong>
                </p>
              </div>

              {/* Copyable UPI ID row */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-500">UPI ID:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                  {merchantUpi}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Direct UPI Intent Link on Mobile */}
              <div className="pt-1">
                <a
                  href={upiIntentUrl}
                  className="inline-flex sm:hidden items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Open in UPI App (GPay / PhonePe)
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyAndPay('UPI QR')}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Verifying Payment...' : `I Have Paid ₹${currentPack.price} - Unlock Now`}
              </button>
            </div>
          )}

          {/* Tab 3: UPI Apps / Manual UPI ID */}
          {activeTab === 'upi_id' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enter Your UPI ID (e.g. mobile@upi, name@okhdfcbank)
                </label>
                <input
                  type="text"
                  placeholder="yourname@okaxis"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-medium"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveUpi}
                  onChange={(e) => setSaveUpi(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Save this UPI ID for 1-click checkout next time</span>
              </label>

              {/* Mobile Quick Apps */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={upiIntentUrl}
                  className="p-2.5 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  Google Pay
                </a>
                <a
                  href={upiIntentUrl}
                  className="p-2.5 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  PhonePe / Paytm
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleVerifyAndPay('UPI Apps')}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Verifying Payment...' : `Complete Payment of ₹${currentPack.price}`}
              </button>
            </div>
          )}

          {/* Security Guarantee Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Secure UPI Payment • Direct Instant Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
