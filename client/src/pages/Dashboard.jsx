/**
 * ============================================================================
 * Dashboard Page
 * ============================================================================
 * Overview of business pipeline, metrics, recent quotations, and interactive
 * status workflow management (Pending, In Process, Approved, Rejected).
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Package, 
  ArrowUpRight, 
  Download, 
  Share2,
  TrendingUp,
  AlertCircle,
  Check,
  ChevronDown,
  Sparkles,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { quoteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import ShareModal from '../components/quote/ShareModal';
import { generateQuotationPdf } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user, openScannerModal } = useAuth();
  const { addToast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalQuote, setShareModalQuote] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';

  const STATUS_TABS = ['All', 'Pending', 'In Process', 'Approved', 'Rejected'];
  const ALL_STATUSES = ['Draft', 'Pending', 'In Process', 'Approved', 'Rejected'];

  const fetchQuotes = async () => {
    try {
      const res = await quoteAPI.getAll();
      setQuotes(res.data.quotes || []);
    } catch (error) {
      console.error('Error fetching quotes for dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Plan status toast notification on Dashboard
  useEffect(() => {
    if (user && !isSuperAdmin) {
      if (user.isPlanDue) {
        addToast('⚠️ Action Required: Subscription is due. Please scan QR to reactivate.', 'warning');
      } else if (user.planStatus === 'trial') {
        addToast(`🟡 3-Day Free Trial active (${user.daysRemaining ?? 3} days left). Click "Change Plan" to upgrade!`, 'info');
      }
    }
  }, [user?._id, isSuperAdmin]);

  // Status update handler right from Dashboard!
  const handleStatusChange = async (id, newStatus, quoteNumber = '') => {
    try {
      await quoteAPI.updateStatus(id, { 
        status: newStatus, 
        note: `Marked as ${newStatus} from Dashboard` 
      });
      addToast(`Quotation ${quoteNumber || ''} marked as ${newStatus}!`);
      setQuotes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: newStatus } : q))
      );
    } catch (error) {
      console.error('Status update failed:', error);
      addToast('Failed to update status', 'error');
    }
  };

  // Compute Metrics
  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
  const approvedQuotes = quotes.filter((q) => q.status === 'Approved');
  const approvedValue = approvedQuotes.reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
  const pendingQuotes = quotes.filter((q) => ['Pending', 'In Process'].includes(q.status));
  const rejectedQuotes = quotes.filter((q) => q.status === 'Rejected');

  const currency = user?.currency || '₹';

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleQuickDownload = async (quote) => {
    addToast('Opening quotation view for PDF export...', 'info');
    window.open(`/view-quote/${quote.shareToken || quote._id}`, '_blank');
  };

  // Filter quotations based on selected status tab
  const displayedQuotes = quotes.filter((q) => {
    if (statusFilter === 'All') return true;
    return q.status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 border border-white/10">
            <span>Welcome back, {user?.name || 'Owner'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {user?.companyName || 'Quotation Management'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            Create simple paper-friendly or modern quotations, track status, and mark them as Approved or Pending right here.
          </p>
        </div>

        <Link
          to="/quotes/new"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-lg shadow-black/10 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5 text-blue-600" />
          Create New Quotation
        </Link>
      </div>

      {/* Account & Subscription Status Banner */}
      {!isSuperAdmin && (
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          user?.isPlanDue
            ? 'bg-rose-50 border-rose-200'
            : user?.planStatus === 'trial'
            ? 'bg-amber-50/80 border-amber-200'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              user?.isPlanDue
                ? 'bg-rose-600 text-white'
                : user?.planStatus === 'trial'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {user?.isPlanDue ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  user?.isPlanDue
                    ? 'bg-rose-200 text-rose-900'
                    : user?.planStatus === 'trial'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {user?.isPlanDue
                    ? 'Plan Expired'
                    : user?.planStatus === 'trial'
                    ? '3-Day Free Trial'
                    : 'Active Subscription'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {user?.isPlanDue
                    ? 'Renewal Required to Continue'
                    : `${user?.daysRemaining ?? 3} Days Remaining`}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {user?.isPlanDue
                  ? 'Your trial has ended. Select a plan (1Mo ₹100, 3Mo ₹200, 6Mo ₹450, 1Yr ₹899) and scan the QR code to keep using QuoteMarket.'
                  : user?.planStatus === 'trial'
                  ? `Your complimentary trial is active (${user?.daysRemaining ?? 3}d left). You can change or extend your plan anytime with instant QR pay.`
                  : `Your plan is active and valid until ${user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('en-IN') : 'upcoming renewal'}.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="hidden lg:flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  addToast('Selected 1 Month (₹100) - Scan QR to complete payment', 'info');
                  openScannerModal && openScannerModal('1m');
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                title="1 Month for ₹100"
              >
                1M (₹100)
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast('Selected 3 Months (₹200) - Scan QR to complete payment', 'info');
                  openScannerModal && openScannerModal('3m');
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                title="3 Months for ₹200 (Most Popular)"
              >
                3M (₹200)
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast('Selected 6 Months (₹450) - Scan QR to complete payment', 'info');
                  openScannerModal && openScannerModal('6m');
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                title="6 Months for ₹450"
              >
                6M (₹450)
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast('Selected 1 Year (₹899) - Scan QR to complete payment', 'info');
                  openScannerModal && openScannerModal('1y');
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                title="1 Year for ₹899"
              >
                1Y (₹899)
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                addToast('Opening subscription plans & QR scanner...', 'info');
                openScannerModal && openScannerModal('3m');
              }}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
                user?.isPlanDue
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{user?.isPlanDue ? 'Scan & Pay Now' : 'Change Plan / Upgrade'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Metric Cards: Click to Filter Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value Card */}
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {currency} {formatMoney(totalValue)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{totalQuotes} total quotations</p>
        </button>

        {/* Approved Quotes Card */}
        <button
          onClick={() => setStatusFilter('Approved')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Approved'
              ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Value</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {currency} {formatMoney(approvedValue)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{approvedQuotes.length} approved deals</p>
        </button>

        {/* Pending / In Process Card */}
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Pending'
              ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingQuotes.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Awaiting customer decision</p>
        </button>

        {/* Rejected Card */}
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Rejected'
              ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{rejectedQuotes.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Declined quotations</p>
        </button>
      </div>

      {/* Quotation Management & Status Control Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header with Status Switcher Tabs */}
        <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quotations & Status Manager</h2>
            <p className="text-xs text-slate-500">
              Review quotes and directly mark them as <strong>Approved</strong>, <strong>Pending</strong>, or <strong>Rejected</strong>
            </p>
          </div>

          {/* Interactive Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
                {tab === 'Pending' && pendingQuotes.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] rounded-full font-black">
                    {pendingQuotes.length}
                  </span>
                )}
                {tab === 'Approved' && approvedQuotes.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-400 text-slate-900 text-[10px] rounded-full font-black">
                    {approvedQuotes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : displayedQuotes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {statusFilter === 'All' ? 'No quotations created yet' : `No ${statusFilter} quotations found`}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Draft your quotation with standard paper-friendly letterhead format.
            </p>
            <Link
              to="/quotes/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Quotation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Party / Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status (Click to Mark)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedQuotes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600 font-mono">
                      <Link to={`/quotes/${q._id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{q.party?.name}</p>
                      {q.party?.receiverName && (
                        <p className="text-[11px] text-slate-500">Attn: {q.party.receiverName}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{q.quoteDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{q.subject || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {q.currency || currency} {formatMoney(q.grandTotal)}
                    </td>

                    {/* Interactive Status Selector right on Dashboard! */}
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q._id, e.target.value, q.quotationNumber)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none transition-colors ${
                          q.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : q.status === 'In Process'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                            : q.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                            : q.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setShareModalQuote(q)}
                          title="Share via WhatsApp / Email"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickDownload(q)}
                          title="View / Download PDF"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/quotes/${q._id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Modal Dialog */}
      {shareModalQuote && (
        <ShareModal
          isOpen={!!shareModalQuote}
          onClose={() => setShareModalQuote(null)}
          quote={shareModalQuote}
          owner={user}
          onDownloadPdf={() => handleQuickDownload(shareModalQuote)}
        />
      )}
    </div>
  );
}
