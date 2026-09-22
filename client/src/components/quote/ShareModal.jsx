/**
 * ============================================================================
 * Share Quotation Modal
 * ============================================================================
 * One-click sharing via WhatsApp, Email, Direct Link, and PDF download.
 */

import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check, 
  Download, 
  ExternalLink,
  Phone,
  Printer
} from 'lucide-react';
import { getWhatsAppShareUrl, getEmailShareUrl } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

export default function ShareModal({
  isOpen,
  onClose,
  quote,
  owner,
  onDownloadPdf,
  onPrintPdf
}) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState(quote?.party?.phone || '');

  if (!isOpen || !quote) return null;

  const publicUrl = `${window.location.origin}/view-quote/${quote.shareToken || quote._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    addToast('Public quotation link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const url = getWhatsAppShareUrl(quote, owner, customPhone);
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const url = getEmailShareUrl(quote, owner);
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Share Quotation {quote.quotationNumber}
              </h3>
              <p className="text-xs text-slate-500">Send directly to client or copy link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* WhatsApp Direct Share */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Share via WhatsApp
              </div>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                Instant Chat
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                Recipient Phone Number (with Country Code)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-3" />
                <input
                  type="tel"
                  placeholder="e.g. 919876543210"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp Message
            </button>
          </div>

          {/* Email Share, PDF Download & Vector Print */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleEmailShare}
              className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              Email
            </button>

            {onPrintPdf && (
              <button
                onClick={onPrintPdf}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                title="Vector A4 Print / Save PDF"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                Print / Save PDF
              </button>
            )}

            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                title="Download PDF File"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                Download PDF
              </button>
            )}
          </div>

          {/* Public Link Share Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Shareable Client View Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 outline-none font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Clients can view this quotation in the chosen template and click to Accept or Reject directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
