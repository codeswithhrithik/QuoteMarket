/**
 * ============================================================================
 * Quote Editor & Live Builder
 * ============================================================================
 * Comprehensive visual quotation designer featuring template switcher,
 * auto-date & party auto-completion, subject line, catalog & custom line items,
 * live Amount in Words calculation, notes/remarks, canvas signature,
 * real-time side-by-side template preview, and PDF/WhatsApp sharing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Save, 
  Download, 
  Share2, 
  Eye, 
  ArrowLeft, 
  Layout, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  Printer, 
  Sparkles,
  ChevronRight,
  Split,
  Maximize2,
  Lock,
  QrCode
} from 'lucide-react';
import { quoteAPI, partyAPI, catalogAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PartyPicker from '../components/party/PartyPicker';
import ItemList from '../components/quote/ItemList';
import QuoteTemplateRenderer from '../templates/QuoteTemplateRenderer';
import ShareModal from '../components/quote/ShareModal';
import PaymentModal from '../components/payment/PaymentModal';
import { generateQuotationPdf, printQuotation } from '../utils/pdfGenerator';
import { numberToWords } from '../utils/numberToWords';

export default function QuoteEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { user, updateUser, refreshUser, openScannerModal } = useAuth();
  const { addToast } = useToast();

  const printRef = useRef(null);

  // Reference data
  const [parties, setParties] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'

  // Pay-Before-Download State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [paymentActionLabel, setPaymentActionLabel] = useState('Download PDF');

  // Quotation State
  const [quoteData, setQuoteData] = useState({
    quotationNumber: '',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    templateId: user?.defaultTemplate || 'clean-paper',
    status: 'Pending',
    partyId: null,
    party: {
      name: '',
      receiverName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      taxId: ''
    },
    subject: 'Quotation for Supply and Services',
    openingNote: 'Thank you for inquiring with us. We are pleased to submit our most competitive quotation as requested.',
    items: [
      {
        itemId: null,
        name: '',
        description: '',
        qty: 1,
        unit: 'pcs',
        rate: 0,
        discountPercent: 0,
        taxPercent: 18,
        amount: 0
      }
    ],
    notes: user?.defaultNotes || 'Payment terms: 50% advance, balance upon delivery.',
    termsAndConditions: user?.defaultTerms || '1. Quotation valid for 30 days.\n2. Standard manufacturer warranty applies.',
    remarks: '',
    closingNote: 'Thank you for inquiring with us! We look forward to your positive response.',
    signatureType: 'owner_default',
    signatureData: user?.signatureUrl || '',
    signerName: user?.name || '',
    signerTitle: 'Authorized Signatory',
    currency: user?.currency || '₹',
    currencyCode: user?.currencyCode || 'INR',
    companyGstin: user?.taxId || '',
    companyPan: user?.panNo || ''
  });

  // Load parties and catalog
  useEffect(() => {
    async function loadAuxData() {
      try {
        const [partyRes, catRes] = await Promise.all([
          partyAPI.getAll(),
          catalogAPI.getAll()
        ]);
        setParties(partyRes.data.parties || []);
        setCatalog(catRes.data.items || []);
      } catch (err) {
        console.error('Aux data error:', err);
      }
    }
    loadAuxData();
  }, []);

  // Load existing quote if editing
  useEffect(() => {
    async function loadQuote() {
      if (!isEditing) {
        setLoading(false);
        return;
      }
      try {
        const res = await quoteAPI.getById(id);
        if (res.data.quote) {
          const loadedQuote = res.data.quote;
          if (!loadedQuote.templateId) {
            loadedQuote.templateId = 'industrial-paper';
          }
          setQuoteData(loadedQuote);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
        addToast('Failed to load quotation details', 'error');
        navigate('/quotes');
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [id, isEditing]);

  // Compute live totals for preview
  const computeTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    quoteData.items.forEach((it) => {
      const q = Math.max(0, Number(it.qty) || 0);
      const r = Math.max(0, Number(it.rate) || 0);
      const disc = Math.min(100, Math.max(0, Number(it.discountPercent) || 0));
      const tax = Math.max(0, Number(it.taxPercent) || 0);

      const base = q * r;
      const discAmt = (base * disc) / 100;
      const afterDisc = base - discAmt;
      const taxAmt = (afterDisc * tax) / 100;

      subtotal += base;
      totalDiscount += discAmt;
      totalTax += taxAmt;
    });

    const grandTotal = Number((subtotal - totalDiscount + totalTax).toFixed(2));
    const words = numberToWords(grandTotal, quoteData.currencyCode || 'INR');

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal,
      totalInWords: words
    };
  };

  const computedTotals = computeTotals();
  const liveQuote = {
    ...quoteData,
    ...computedTotals
  };

  // Save Quotation Handler
  const handleSave = async () => {
    if (!quoteData.party?.name) {
      addToast('Please enter the Party / Client Name.', 'error');
      return;
    }
    if (!quoteData.items || quoteData.items.length === 0 || !quoteData.items[0].name) {
      addToast('Please add at least one material/item to the quote.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await quoteAPI.update(id, liveQuote);
        addToast('Quotation updated successfully!');
      } else {
        const res = await quoteAPI.create(liveQuote);
        addToast('Quotation created successfully!');
        navigate(`/quotes/${res.data.quote._id}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      addToast(error.response?.data?.message || 'Failed to save quotation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Vector A4 Native Print Execution (Exact Margins & 100% Vector PDF)
  const executePrintVector = () => {
    if (!printRef.current) {
      addToast('Cannot find preview element for print.', 'error');
      return;
    }
    const fileName = `Quotation_${liveQuote.quotationNumber || 'Estimate'}`;
    printQuotation(printRef.current, fileName);
    addToast('Opening print preview (Select "Save as PDF" for vector A4 output)', 'info');
  };

  // PDF Export Execution
  const executeDownloadPdf = async () => {
    if (!printRef.current) {
      addToast('Cannot find preview element for PDF.', 'error');
      return;
    }
    addToast('Generating PDF document...', 'info');
    try {
      const fileName = `Quotation_${liveQuote.quotationNumber || 'Estimate'}.pdf`;
      const ok = await generateQuotationPdf(printRef.current, fileName);
      if (ok) {
        addToast('PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('PDF error:', error);
      addToast('Direct PDF generation failed, opening browser print dialog.', 'warning');
      executePrintVector();
    }
  };

  // Pay-Before-Download Interceptor: checks credit balance (₹2 or credit) before proceed
  const requireCreditAndExecute = async (actionFn, actionName = 'Download PDF') => {
    // Super admin has unlimited downloads
    if (user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com') {
      actionFn();
      return;
    }

    try {
      const res = await paymentAPI.consumeCredit();
      if (res.data?.success) {
        if (typeof res.data.remainingCredits === 'number') {
          updateUser && updateUser({ pdfCredits: res.data.remainingCredits });
        }
        actionFn();
      }
    } catch (err) {
      if (err.response?.status === 402 || err.response?.data?.paymentRequired) {
        setPendingAction(() => actionFn);
        setPaymentActionLabel(actionName);
        setPaymentModalOpen(true);
      } else {
        console.error('Credit check error:', err);
        addToast(err.response?.data?.message || 'Error processing download credits', 'error');
      }
    }
  };

  const handlePrintVector = () => {
    requireCreditAndExecute(executePrintVector, 'Print / Save PDF');
  };

  const handleDownloadPdf = () => {
    requireCreditAndExecute(executeDownloadPdf, 'Download PDF');
  };

  const handleShare = () => {
    requireCreditAndExecute(() => setShareModalOpen(true), 'Share Quotation');
  };

  const handlePaymentSuccess = () => {
    refreshUser && refreshUser();
    if (pendingAction) {
      const fn = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        fn();
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
        Loading quotation workspace...
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));

  if (isPlanDue) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Quotation Drafting is Locked
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your free trial or subscription plan has expired. While your plan is expired, you can still view and download all your previous quotations from the Quotations page.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              To draft new quotations or make edits, please renew your plan. Plans start at just ₹100/month.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                addToast('Opening QR Scanner to renew subscription...', 'info');
                openScannerModal && openScannerModal('3m');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan & Pay Now (QR)</span>
            </button>
            <Link
              to="/quotes"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>View & Download Previous Quotes</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const TEMPLATES = [
    { id: 'clean-paper', name: 'Professional Clean', tag: 'Standard (Like Image)', color: 'border-blue-600 bg-blue-50/60' },
    { id: 'industrial-paper', name: 'Standard Industrial', tag: 'Boxed Format', color: 'border-red-600 bg-red-50/50' },
    { id: 'classic-corporate', name: 'Classic Corporate', tag: 'Traditional Navy', color: 'border-indigo-800 bg-indigo-50/50' },
    { id: 'modern-minimal', name: 'Modern Minimal', tag: 'Contemporary', color: 'border-blue-500 bg-blue-50/50' },
    { id: 'executive-slate', name: 'Executive Slate', tag: 'Dark Theme', color: 'border-slate-800 bg-slate-100' },
    { id: 'clean-indigo', name: 'Industrial Indigo', tag: 'High Contrast', color: 'border-indigo-600 bg-indigo-50/60' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="sticky top-16 z-30 bg-slate-50/90 backdrop-blur-md py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {isEditing ? `Edit Quotation ${quoteData.quotationNumber}` : 'Draft New Quotation'}
            </h1>
            <p className="text-[11px] text-slate-500">
              {liveQuote.party?.name ? `For: ${liveQuote.party.name}` : 'Configure quotation details and see live preview'}
            </p>
          </div>
        </div>

        {/* Action Buttons & View Toggles */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Form Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Full Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintVector}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            title="Native A4 vector print / browser Save-as-PDF dialog (Recommended)"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            title="Download PDF directly to file"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            Share
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Quote'}
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Template Preview on Right */}
      <div className={`grid gap-8 ${viewMode === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Interactive Form Controls */}
        <div className={`space-y-6 ${viewMode === 'split' ? 'lg:col-span-6' : viewMode === 'preview' ? 'hidden' : 'max-w-4xl mx-auto w-full'}`}>
          {/* Active Quotation Theme Indicator (Configured in Settings) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Layout className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Active Theme
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {TEMPLATES.find((t) => t.id === quoteData.templateId)?.name || 'Professional Clean'}
                </span>
              </div>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 font-semibold text-xs border border-slate-200 transition-colors"
              title="Change default theme and preview styles in Settings"
            >
              <span>Change Theme in Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Section 2: Quotation Details & Dates */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800">Quotation Details & Issue Dates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Quote Number */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Quotation # (Auto-assigned)
                </label>
                <input
                  type="text"
                  placeholder="Auto (e.g. QT-2026-0001)"
                  value={quoteData.quotationNumber || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, quotationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-medium"
                />
              </div>

              {/* Quote Date */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Quote Date (Auto-picked)
                </label>
                <input
                  type="date"
                  required
                  value={quoteData.quoteDate}
                  onChange={(e) => setQuoteData({ ...quoteData, quoteDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={quoteData.validUntil || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Top GSTIN & PAN NO inputs for quote header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Your Company GSTIN (Header Box Top Left)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27AFDP..."
                  value={quoteData.companyGstin}
                  onChange={(e) => setQuoteData({ ...quoteData, companyGstin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Your Company PAN NO (Header Box Top Right)
                </label>
                <input
                  type="text"
                  placeholder="e.g. APDP..."
                  value={quoteData.companyPan}
                  onChange={(e) => setQuoteData({ ...quoteData, companyPan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Party Details Picker */}
          <PartyPicker
            parties={parties}
            selectedPartyId={quoteData.partyId}
            partyData={quoteData.party}
            onChange={({ partyId, party }) => setQuoteData({ ...quoteData, partyId, party })}
            onPartyCreated={(newParty) => setParties([...parties, newParty])}
          />

          {/* Section 4: Subject Line & Inquiring Appreciation Lines */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800">Subject & Appreciation Lines</h3>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                placeholder="e.g. Quotation for Supply of Acoustic Wall Panels & Soundproofing"
                value={quoteData.subject}
                onChange={(e) => setQuoteData({ ...quoteData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
              />
            </div>

            {/* Inquiring Thank you Greeting */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Opening Appreciation Note ("Thank you for inquiring...")
              </label>
              <textarea
                rows={2}
                value={quoteData.openingNote}
                onChange={(e) => setQuoteData({ ...quoteData, openingNote: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section 5: Materials / Line Items Table */}
          <ItemList
            items={quoteData.items}
            catalog={catalog}
            currency={quoteData.currency || user?.currency || '₹'}
            currencyCode={quoteData.currencyCode || user?.currencyCode || 'INR'}
            onChange={(items) => setQuoteData({ ...quoteData, items })}
          />

          {/* Section 6: Notes, Terms, Remarks & Closing Note */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 pb-2 border-b border-slate-100">
              Terms, Remarks & Closing Thank You Note
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Special Notes</label>
                <textarea
                  rows={3}
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={quoteData.termsAndConditions}
                  onChange={(e) => setQuoteData({ ...quoteData, termsAndConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Internal reference or customer delivery remark"
                  value={quoteData.remarks}
                  onChange={(e) => setQuoteData({ ...quoteData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Closing Thank You Note
                </label>
                <textarea
                  rows={2}
                  value={quoteData.closingNote}
                  onChange={(e) => setQuoteData({ ...quoteData, closingNote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Preview */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-6' : viewMode === 'edit' ? 'hidden' : 'w-full'}`}>
          <div className="sticky top-32 space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Template Preview
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Updates dynamically</span>
            </div>

            {/* Template Container */}
            <div className="bg-slate-200/50 p-2 sm:p-4 rounded-3xl border border-slate-300/80 shadow-inner overflow-x-auto max-h-[85vh] overflow-y-auto">
              <QuoteTemplateRenderer
                ref={printRef}
                quote={liveQuote}
                owner={{
                  ...user,
                  taxId: quoteData.companyGstin || user?.taxId || '',
                  panNo: quoteData.companyPan || user?.panNo || ''
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          quote={liveQuote}
          owner={{
            ...user,
            taxId: quoteData.companyGstin || user?.taxId || '',
            panNo: quoteData.companyPan || user?.panNo || ''
          }}
          onDownloadPdf={handleDownloadPdf}
          onPrintPdf={handlePrintVector}
        />
      )}

      {/* Pay-Before-Download Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPendingAction(null);
        }}
        actionLabel={paymentActionLabel}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
