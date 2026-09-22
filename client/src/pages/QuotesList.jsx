/**
 * ============================================================================
 * Quotations List Page
 * ============================================================================
 * Searchable, filterable table of all quotations with instant status switcher,
 * PDF download, WhatsApp/Email sharing, and delete management.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Share2, 
  Download, 
  Trash2, 
  Edit, 
  Eye,
  CheckCircle,
  Clock,
  ChevronDown,
  Lock,
  QrCode
} from 'lucide-react';
import { quoteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import ShareModal from '../components/quote/ShareModal';

export default function QuotesList() {
  const { user, openScannerModal } = useAuth();
  const { addToast } = useToast();
  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'hrithikyadav05@gmail.com';
  const isPlanDue = !isSuperAdmin && Boolean(user?.isPlanDue || (user?.daysRemaining !== undefined && user?.daysRemaining <= 0));
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalQuote, setShareModalQuote] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const STATUS_TABS = ['All', 'Pending', 'In Process', 'Approved', 'Rejected', 'Draft'];
  const ALL_STATUSES = ['Draft', 'Pending', 'In Process', 'Approved', 'Rejected'];

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await quoteAPI.getAll({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      setQuotes(res.data.quotes || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      addToast('Failed to fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuotes();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await quoteAPI.updateStatus(id, { status: newStatus, note: `Status updated via list to ${newStatus}` });
      addToast(`Quotation status marked as ${newStatus}`);
      setUpdatingStatusId(null);
      // Update local state
      setQuotes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: newStatus } : q))
      );
    } catch (error) {
      console.error('Status update failed:', error);
      addToast('Failed to update quotation status', 'error');
    }
  };

  const handleDelete = async (id, quoteNum) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quoteNum}?`)) {
      return;
    }
    try {
      await quoteAPI.delete(id);
      addToast(`Quotation ${quoteNum} deleted.`);
      setQuotes((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error('Error deleting quote:', error);
      addToast('Failed to delete quotation', 'error');
    }
  };

  const currency = user?.currency || '₹';

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-xs text-slate-500">Create, manage, and track quotations for your clients</p>
        </div>
        {isPlanDue ? (
          <button
            type="button"
            onClick={() => {
              addToast('⚠️ Quotation drafting is locked because your plan has expired. Please renew.', 'warning');
              openScannerModal && openScannerModal('3m');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs shadow-xs transition-all self-start border border-slate-300"
          >
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Create New Quotation (Locked)</span>
          </button>
        ) : (
          <Link
            to="/quotes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            Create New Quotation
          </Link>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs font-semibold">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search quote #, party, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : quotes.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No quotations found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No quotations match your current filters. Try changing your search or create a new quote.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Client / Party</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      <Link 
                        to={isPlanDue ? `/view-quote/${q.shareToken || q._id}` : `/quotes/${q._id}`} 
                        className="hover:underline flex items-center gap-1"
                        title={isPlanDue ? 'View Quotation (Preview & Download)' : 'Edit Quotation'}
                      >
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
                    <td className="py-3.5 px-4 text-center">
                      {/* Interactive Status Changer */}
                      <div className="relative inline-block text-left">
                        <select
                          disabled={isPlanDue}
                          value={q.status}
                          onChange={(e) => handleStatusChange(q._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${
                            isPlanDue
                              ? 'opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200'
                              : q.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : q.status === 'In Process'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : q.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : q.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title={isPlanDue ? 'Status updates locked while plan is expired' : 'Change Status'}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setShareModalQuote(q)}
                          title="Share / Download PDF"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`/view-quote/${q.shareToken || q._id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Preview & Download PDF"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {isPlanDue ? (
                          <button
                            type="button"
                            onClick={() => {
                              addToast('⚠️ Quotation editing is locked because your plan has expired. Please renew to edit.', 'warning');
                              openScannerModal && openScannerModal('3m');
                            }}
                            title="Editing Locked (Plan Expired - Click to Renew)"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : (
                          <Link
                            to={`/quotes/${q._id}`}
                            title="Edit Quotation"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          disabled={isPlanDue}
                          onClick={() => handleDelete(q._id, q.quotationNumber)}
                          title={isPlanDue ? 'Locked' : 'Delete'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isPlanDue ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          onDownloadPdf={() => window.open(`/view-quote/${shareModalQuote.shareToken || shareModalQuote._id}`, '_blank')}
        />
      )}
    </div>
  );
}
