/**
 * ============================================================================
 * Public Client Quotation View Page
 * ============================================================================
 * Client-facing view accessible via shared link. Allows clients to view the
 * full quotation in its chosen template, download high-res PDF, print,
 * and directly Accept / Approve or Request Changes online.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  MessageSquare,
  Sparkles 
} from 'lucide-react';
import { quoteAPI } from '../services/api';
import QuoteTemplateRenderer from '../templates/QuoteTemplateRenderer';
import { generateQuotationPdf, printQuotation } from '../utils/pdfGenerator';
import Badge from '../components/common/Badge';

export default function PublicQuote() {
  const { token } = useParams();
  const [quote, setQuote] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientRemarks, setClientRemarks] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(null);

  const templateRef = useRef(null);

  useEffect(() => {
    async function loadPublicQuote() {
      try {
        const res = await quoteAPI.getPublic(token);
        setQuote(res.data.quote);
        setOwner(res.data.owner);
      } catch (err) {
        console.error('Error fetching public quote:', err);
        setError(err.response?.data?.message || 'Quotation not found or link has expired.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicQuote();
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!templateRef.current || !quote) return;
    try {
      await generateQuotationPdf(
        templateRef.current,
        `Quotation_${quote.quotationNumber}.pdf`
      );
    } catch (err) {
      printQuotation(templateRef.current, `Quotation_${quote.quotationNumber}`);
    }
  };

  const handlePrint = () => {
    if (!templateRef.current || !quote) return;
    printQuotation(templateRef.current, `Quotation_${quote.quotationNumber}`);
  };

  const handleClientAction = async (action) => {
    setSubmittingResponse(true);
    try {
      const res = await quoteAPI.clientRespond(token, {
        action,
        clientRemarks
      });
      setQuote(res.data.quote);
      setResponseSuccess(
        action === 'Approved'
          ? 'Quotation Approved successfully! The supplier has been notified.'
          : 'Your feedback has been sent to the supplier.'
      );

      if (action === 'Approved') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Quotation...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Quotation Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'This link may have expired or been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Floating Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-md flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {(owner?.companyName || 'Q').charAt(0)}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {owner?.companyName || 'Supplier'}
            </span>
            <span className="text-[11px] text-slate-500">
              Quotation Ref: <strong className="text-slate-700">{quote.quotationNumber}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={quote.status} />
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Quotation Document Container */}
      <div className="max-w-4xl mx-auto">
        <QuoteTemplateRenderer ref={templateRef} quote={quote} owner={owner} />
      </div>

      {/* Client Interaction Card (Accept / Reject) */}
      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg no-print space-y-4">
        {quote.status === 'Approved' ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Quotation Approved!</p>
              <p className="text-xs text-emerald-700">
                This quotation has been officially accepted. Thank you for doing business with {owner?.companyName}.
              </p>
            </div>
          </div>
        ) : quote.status === 'Rejected' ? (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Quotation Declined</p>
              <p className="text-xs text-rose-700">
                This quotation was marked as declined. Please contact the supplier for revisions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Respond to Quotation</h3>
              <p className="text-xs text-slate-500">
                You can approve this quote to proceed with the order, or request changes with your remarks.
              </p>
            </div>

            {responseSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                {responseSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Remarks / Feedback (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Approved, please schedule delivery for Monday. / Kindly revise rates for Item #2."
                value={clientRemarks}
                onChange={(e) => setClientRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={submittingResponse}
                onClick={() => handleClientAction('Approved')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & Accept Quotation
              </button>

              <button
                type="button"
                disabled={submittingResponse}
                onClick={() => handleClientAction('Rejected')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Decline / Request Revision
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
