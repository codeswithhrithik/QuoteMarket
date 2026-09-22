/**
 * ============================================================================
 * Business Profile & Settings Page
 * ============================================================================
 * Manage company brand identity, currency preferences, default notes/terms,
 * bank details, uploaded logos, and default authorized signature.
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Coins, 
  Image as ImageIcon, 
  PenTool, 
  FileText, 
  CreditCard, 
  Save, 
  CheckCircle,
  Layout,
  Palette,
  CheckCircle2,
  Eye,
  Sparkles,
  QrCode,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Crown,
  Calendar,
  Zap,
  ArrowRight,
  Lock
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SignaturePad from '../components/quote/SignaturePad';
import QuoteTemplateRenderer from '../templates/QuoteTemplateRenderer';
import { SUBSCRIPTION_PLANS } from '../components/subscription/ScannerPromptModal';

export default function Settings() {
  const { user, updateUser, openScannerModal } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyPincode: '',
    companySubtitle: '',
    companyFactoryAddress: '',
    taxId: '',
    panNo: '',
    currency: '₹',
    currencyCode: 'INR',
    defaultTemplate: 'clean-paper',
    logoUrl: '',
    signatureUrl: '',
    defaultNotes: '',
    defaultTerms: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscOrSwift: '',
      accountName: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.companyName || '',
        companyPhone: user.companyPhone || '',
        companyEmail: user.companyEmail || '',
        companyAddress: user.companyAddress || '',
        companyCity: user.companyCity || '',
        companyState: user.companyState || '',
        companyPincode: user.companyPincode || '',
        companySubtitle: user.companySubtitle || '',
        companyFactoryAddress: user.companyFactoryAddress || '',
        taxId: user.taxId || '',
        panNo: user.panNo || '',
        currency: user.currency || '₹',
        currencyCode: user.currencyCode || 'INR',
        defaultTemplate: user.defaultTemplate || 'clean-paper',
        logoUrl: user.logoUrl || '',
        signatureUrl: user.signatureUrl || '',
        defaultNotes: user.defaultNotes || '',
        defaultTerms: user.defaultTerms || '',
        bankDetails: {
          bankName: user.bankDetails?.bankName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscOrSwift: user.bankDetails?.ifscOrSwift || '',
          accountName: user.bankDetails?.accountName || ''
        }
      });
    }
  }, [user]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      addToast('Company settings & preferences saved successfully!');
    } catch (error) {
      console.error('Settings update error:', error);
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const TEMPLATES = [
    { 
      id: 'clean-paper', 
      name: 'Professional Clean', 
      tag: 'Recommended (Match Reference)', 
      description: 'Clean A4 layout with solid grid borders, multi-line descriptions, and embedded totals box.' 
    },
    { 
      id: 'industrial-paper', 
      name: 'Standard Industrial', 
      tag: 'Heavy Boxed Paper Format', 
      description: 'Heavy solid borders, factory/office addresses in header, and formal industrial quote format.' 
    },
    { 
      id: 'classic-corporate', 
      name: 'Classic Corporate', 
      tag: 'Traditional Navy', 
      description: 'Deep navy accents, gold line dividers, formal corporate presentation.' 
    },
    { 
      id: 'modern-minimal', 
      name: 'Modern Minimal', 
      tag: 'Contemporary Minimalist', 
      description: 'Generous whitespace, sleek typography, subtle slate borders, clean aesthetic.' 
    },
    { 
      id: 'executive-slate', 
      name: 'Executive Slate', 
      tag: 'Dark Accent Theme', 
      description: 'Bold dark slate banner header with high-contrast text and executive badges.' 
    },
    { 
      id: 'clean-indigo', 
      name: 'Industrial Indigo', 
      tag: 'High Contrast', 
      description: 'Indigo colored accents with rounded summary pill cards and modern badges.' 
    }
  ];

  const sampleQuote = {
    quotationNumber: 'QT-SAMPLE-001',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    templateId: formData.defaultTemplate || 'clean-paper',
    subject: 'Quotation for Supply and Engineering Services',
    openingNote: 'Thank you for inquiring with us. We are pleased to submit our most competitive quotation as requested.',
    party: {
      name: 'Acme Heavy Engineering Corp.',
      receiverName: 'Mr. Rajesh Sharma',
      address: 'Plot No. 42, Sector 9, Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411019',
      phone: '+91 98230 12345',
      email: 'rajesh@acmeeng.com',
      taxId: '27AABCU9603R1ZM'
    },
    items: [
      {
        name: 'Electric Overhead Traveling Crane (5 Ton Single Girder)',
        description: 'Heavy duty 18m span crane, up down speed 3-5 m/min, wire rope 12mm, radio remote control & fail-safe limit switches.',
        qty: 1,
        unit: 'set',
        rate: 245000,
        discountPercent: 0,
        taxPercent: 18,
        amount: 245000
      },
      {
        name: 'LT Wheel & Reduction Gearbox Kit (250mm Dia)',
        description: 'Hardened EN-8 forged steel wheels with high-torque reduction gearbox and fail-safe electromagnetic brake.',
        qty: 2,
        unit: 'nos',
        rate: 18500,
        discountPercent: 0,
        taxPercent: 18,
        amount: 37000
      }
    ],
    subtotal: 282000,
    totalDiscount: 0,
    totalTax: 50760,
    grandTotal: 332760,
    totalInWords: 'Rupees Three Lakh Thirty Two Thousand Seven Hundred Sixty Only',
    notes: formData.defaultNotes || 'Payment terms: 50% advance, balance on delivery.',
    termsAndConditions: formData.defaultTerms || '1. Quotation valid for 30 days.\n2. Standard 12-month manufacturer warranty applies.',
    currency: formData.currency || '₹',
    currencyCode: formData.currencyCode || 'INR'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Profile & Defaults</h1>
        <p className="text-xs text-slate-500">
          Configure branding, currency, theme styling, bank details, and default quotation statements
        </p>
      </div>

      {/* ================================================================ */}
      {/* Account Details & Active Subscription Section */}
      {/* ================================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md text-lg font-black shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{user?.name || 'Account Holder'}</h2>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : user?.isPlanDue
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : user?.planStatus === 'trial'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {isSuperAdmin
                    ? 'Super Admin'
                    : user?.isPlanDue
                    ? 'Plan Expired'
                    : user?.planStatus === 'trial'
                    ? '3-Day Free Trial'
                    : 'Active Subscription'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.email} {user?.username ? `• @${user.username}` : ''}
              </p>
            </div>
          </div>

          {!isSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                addToast('Opening QR Scanner to Change / Upgrade Plan...', 'info');
                openScannerModal && openScannerModal('3m');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Change Plan / Pay via QR</span>
            </button>
          )}
        </div>

        {/* Plan Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Current Plan
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-900">
                {isSuperAdmin 
                  ? 'Lifetime Unlimited' 
                  : user?.isPlanDue 
                  ? 'Expired (Payment Due)' 
                  : user?.planStatus === 'trial' 
                  ? '3-Day Free Trial' 
                  : 'Active Subscription'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {isSuperAdmin 
                ? 'Full superadmin access' 
                : user?.isPlanDue 
                ? 'Select a plan below to reactivate' 
                : 'Full quotation drafting & sharing unlocked'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Days Left
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-2xl font-black ${
                isSuperAdmin ? 'text-indigo-600' : user?.isPlanDue ? 'text-rose-600' : 'text-indigo-600'
              }`}>
                {isSuperAdmin ? '∞' : (user?.daysRemaining ?? 0)}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {isSuperAdmin ? 'Days' : (user?.daysRemaining === 1 ? 'Day Remaining' : 'Days Remaining')}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {user?.planExpiresAt 
                ? `Valid until ${new Date(user.planExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : isSuperAdmin ? 'Never expires' : 'Trial period'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Account Validity
            </span>
            <div className="mt-1">
              <span className="text-sm font-bold text-slate-800">
                {user?.planExpiresAt 
                  ? new Date(user.planExpiresAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : isSuperAdmin ? 'Unlimited' : 'Active'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
            </span>
          </div>
        </div>

        {/* Change / Upgrade Subscription Plan Cards */}
        {!isSuperAdmin && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Available Plans & Rate Switcher
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select a subscription plan below to generate an instant QR payment code
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between hover:shadow-md ${
                    plan.isPopular
                      ? 'border-emerald-400 bg-emerald-50/40 shadow-sm'
                      : plan.isAnnual
                      ? 'border-amber-400 bg-amber-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <span className="text-xs font-black text-slate-900 block">{plan.title}</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-[10px] font-semibold text-slate-500">/ {plan.durationDays} days</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {plan.monthlyRate} {plan.savings && <span className="font-bold text-emerald-700">({plan.savings})</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToast(`Selected ${plan.title} (₹${plan.price}) plan. Scan QR code to complete payment!`, 'info');
                      openScannerModal && openScannerModal(plan.id);
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      plan.isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Choose ₹{plan.price}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Locked Banner when plan is expired */}
      {isPlanDue && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-center gap-3.5 text-rose-900 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">Company Profile Settings are Locked</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Your subscription plan has expired. Profile settings, branding, and defaults are locked in read-only mode. Please choose a subscription plan above to unlock and reactivate your profile.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <fieldset disabled={isPlanDue} className="space-y-6 group-disabled:opacity-75">
        {/* Company Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Company Identity & Contact Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner / Authorized Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Phone / WhatsApp</label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.companyCity}
                onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.companyState}
                  onChange={(e) => setFormData({ ...formData, companyState: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.companyPincode}
                  onChange={(e) => setFormData({ ...formData, companyPincode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Subtitle / Work Description</label>
              <input
                type="text"
                placeholder="e.g. Crane Mfg & repairing maintenance chain pulley block"
                value={formData.companySubtitle}
                onChange={(e) => setFormData({ ...formData, companySubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Factory / Workshop Address</label>
              <input
                type="text"
                placeholder="e.g. Factory : W-8, M.I.D.C Ambad Nashik"
                value={formData.companyFactoryAddress}
                onChange={(e) => setFormData({ ...formData, companyFactoryAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax ID / GSTIN (Displayed Top-Left)</label>
              <input
                type="text"
                placeholder="e.g. 27AFDP..."
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN NO (Displayed Top-Right)</label>
              <input
                type="text"
                placeholder="e.g. APDP..."
                value={formData.panNo}
                onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Branding */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Coins className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Currency & Logo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">Supports ₹ (INR), $ (USD), € (EUR), £ (GBP), etc.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code (For Words)</label>
                <select
                  value={formData.currencyCode}
                  onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="INR">INR (Indian Rupee - Lakh/Crore)</option>
                  <option value="USD">USD (US Dollar - Millions)</option>
                  <option value="EUR">EUR (Euro - Millions)</option>
                  <option value="GBP">GBP (British Pound - Millions)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Logo</label>
              <div className="flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="w-24 h-24 border rounded-2xl p-2 bg-slate-50 flex items-center justify-center shrink-0">
                    <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] mt-1">No Logo</span>
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Bank Details for Direct Remittance</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank Ltd / Chase"
                value={formData.bankDetails.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC / SWIFT / Sort Code</label>
              <input
                type="text"
                value={formData.bankDetails.ifscOrSwift}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, ifscOrSwift: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Beneficiary Name</label>
              <input
                type="text"
                placeholder="Leave blank to use company name"
                value={formData.bankDetails.accountName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Default Notes & Terms */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800">Default Quotation Terms & Notes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Payment Notes</label>
              <textarea
                rows={3}
                value={formData.defaultNotes}
                onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Terms & Conditions</label>
              <textarea
                rows={3}
                value={formData.defaultTerms}
                onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quotation Theme Selection & Live Preview Window */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">Quotation Theme & Visual Styling</h2>
                <p className="text-xs text-slate-500">
                  Select your default theme below and review the live preview rendered with your company details
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              Live Theme Preview
            </span>
          </div>

          {/* Theme Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((tmpl) => {
              const isSelected = (formData.defaultTemplate || 'clean-paper') === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, defaultTemplate: tmpl.id })}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        {tmpl.tag}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{tmpl.name}</h3>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Live Theme Preview Window */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">
                  Live Preview: {TEMPLATES.find((t) => t.id === (formData.defaultTemplate || 'clean-paper'))?.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  (Renders in real-time with your company identity & branding)
                </span>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="border border-slate-300/80 rounded-2xl bg-slate-100/80 p-4 sm:p-6 overflow-auto max-h-[650px] shadow-inner flex justify-center">
              <div className="w-full max-w-[800px] bg-white shadow-md rounded-lg overflow-hidden transition-all">
                <QuoteTemplateRenderer quote={sampleQuote} owner={formData} />
              </div>
            </div>
          </div>
        </div>

        </fieldset>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || isPlanDue}
            className={`flex items-center gap-2 px-8 py-3 font-bold text-sm rounded-2xl shadow-lg transition-all ${
              isPlanDue
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95 disabled:opacity-50'
            }`}
          >
            {isPlanDue ? <Lock className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isPlanDue ? 'Profile Locked (Plan Expired)' : 'Save Profile & Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
