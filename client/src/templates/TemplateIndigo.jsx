/**
 * ============================================================================
 * Template 4: Clean Indigo / Contractor & Materials
 * ============================================================================
 * High-visibility indigo styling tailored for manufacturing, hardware,
 * engineering works, materials supply, and contracting estimates.
 */

import React from 'react';
import Badge from '../components/common/Badge';

export default function TemplateIndigo({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-12 border-2 border-indigo-600 shadow-sm max-w-4xl mx-auto rounded-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-indigo-100">
        <div>
          <div className="flex items-center gap-3">
            {owner.logoUrl ? (
              <img src={owner.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                {(owner.companyName || 'I').charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-black text-indigo-950 tracking-tight">
              {owner.companyName || 'Industrial Materials & Contracting'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-2">{owner.companyAddress}</p>
          <p className="text-xs text-slate-600">{owner.companyPhone} • {owner.companyEmail}</p>
          {owner.taxId && <p className="text-xs font-semibold text-indigo-900 mt-0.5">GST/Tax: {owner.taxId}</p>}
        </div>

        <div className="sm:text-right bg-indigo-50 p-4 rounded-xl border border-indigo-100 min-w-[200px]">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">ESTIMATE / QUOTE</span>
          <p className="text-xl font-black text-indigo-950 mt-0.5">{quote.quotationNumber}</p>
          <p className="text-xs text-slate-600 mt-1">Date: <span className="font-bold">{quote.quoteDate}</span></p>
          {quote.validUntil && (
            <p className="text-xs text-slate-600">Valid: <span className="font-bold">{quote.validUntil}</span></p>
          )}
        </div>
      </div>

      {/* Recipient Party Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-indigo-100 text-xs">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-900 block mb-1">
            Bill To / Consignee:
          </span>
          <p className="text-sm font-bold text-slate-900">{quote.party?.name}</p>
          {quote.party?.receiverName && (
            <p className="text-slate-700 font-semibold mt-0.5">Attn: {quote.party.receiverName}</p>
          )}
          {quote.party?.address && (
            <p className="text-slate-600 mt-0.5 whitespace-pre-line">{quote.party.address}</p>
          )}
          <p className="text-slate-600 mt-1">{quote.party?.phone} {quote.party?.email && `• ${quote.party.email}`}</p>
          {quote.party?.taxId && <p className="text-slate-700 font-medium">GSTIN: {quote.party.taxId}</p>}
        </div>

        <div className="space-y-2">
          {quote.subject && (
            <div className="bg-indigo-900 text-white p-3 rounded-lg text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Subject</span>
              <span className="font-semibold">{quote.subject}</span>
            </div>
          )}
          <p className="text-slate-600 italic">
            "{quote.openingNote || 'Thank you for inquiring with us. We are pleased to provide this price quote.'}"
          </p>
        </div>
      </div>

      {/* High Contrast Materials Table */}
      <div className="py-6">
        <div style={{ border: '1.5px solid #4338ca', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="w-full table-fixed text-left text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4338ca', color: '#ffffff', fontWeight: 'bold' }}>
                <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center', borderRight: '1px solid #6366f1' }}>#</th>
                <th style={{ padding: '8px 10px', width: 'auto', borderRight: '1px solid #6366f1' }}>Description of Material / Work</th>
                <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #6366f1' }}>Qty</th>
                <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #6366f1' }}>Unit</th>
                <th style={{ padding: '8px 8px', width: '85px', textAlign: 'right', borderRight: '1px solid #6366f1' }}>Rate</th>
                {quote.totalTax > 0 && <th style={{ padding: '8px 6px', width: '55px', textAlign: 'right', borderRight: '1px solid #6366f1' }}>Tax%</th>}
                <th style={{ padding: '8px 10px', width: '95px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(quote.items || []).map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #c7d2fe',
                    backgroundColor: idx % 2 === 1 ? '#eef2ff' : '#ffffff',
                    verticalAlign: 'top',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#4338ca', fontWeight: 'bold', borderRight: '1px solid #e0e7ff' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px', borderRight: '1px solid #e0e7ff', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    {item.description && <span className="text-[11px] text-slate-600 block mt-0.5 whitespace-pre-wrap">{item.description}</span>}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1e1b4b', borderRight: '1px solid #e0e7ff' }}>{item.qty}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#475569', borderRight: '1px solid #e0e7ff' }}>{item.unit || 'pcs'}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: '500', color: '#1e1b4b', borderRight: '1px solid #e0e7ff' }}>{currency} {formatMoney(item.rate)}</td>
                  {quote.totalTax > 0 && (
                    <td style={{ padding: '8px 6px', textAlign: 'right', color: '#6366f1', borderRight: '1px solid #e0e7ff' }}>{item.taxPercent || 0}%</td>
                  )}
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#312e81' }}>{currency} {formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financials & In Words */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-indigo-100 text-xs">
        <div className="flex-1 bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 self-start">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block mb-1">
            Total Amount (In Words):
          </span>
          <p className="font-bold text-indigo-950 italic text-sm">
            {quote.totalInWords || 'Zero Only'}
          </p>
        </div>

        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-bold">{currency} {formatMoney(quote.subtotal)}</span>
          </div>
          {quote.totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discount:</span>
              <span>- {currency} {formatMoney(quote.totalDiscount)}</span>
            </div>
          )}
          {quote.totalTax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax / GST:</span>
              <span className="font-bold">+ {currency} {formatMoney(quote.totalTax)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t-2 border-indigo-600 text-base font-black text-indigo-950">
            <span>Grand Total:</span>
            <span className="text-xl text-indigo-700">{currency} {formatMoney(quote.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-indigo-100 text-[11px] text-slate-600">
        <div>
          {quote.termsAndConditions && (
            <div className="mb-3">
              <span className="font-black text-indigo-900 uppercase block mb-1">Standard Terms:</span>
              <p className="whitespace-pre-line leading-relaxed">{quote.termsAndConditions}</p>
            </div>
          )}
          {quote.notes && (
            <div>
              <span className="font-black text-indigo-900 uppercase block mb-1">Special Notes:</span>
              <p className="whitespace-pre-line leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>

        <div>
          {quote.remarks && (
            <div className="mb-3">
              <span className="font-black text-indigo-900 uppercase block mb-1">Remarks:</span>
              <p className="whitespace-pre-line leading-relaxed">{quote.remarks}</p>
            </div>
          )}
          {owner.bankDetails && owner.bankDetails.bankName && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 uppercase block mb-1">Payment Instructions:</span>
              <p>Bank: {owner.bankDetails.bankName} | A/C: {owner.bankDetails.accountNumber}</p>
              <p>IFSC: {owner.bankDetails.ifscOrSwift}</p>
            </div>
          )}
        </div>
      </div>

      {/* Salutation & Signatures */}
      <div className="pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
        <p className="text-slate-700 font-medium italic max-w-sm">
          {quote.closingNote || 'Thank you for inquiring with us!'}
        </p>

        <div className="text-center sm:text-right shrink-0">
          <p className="text-xs font-bold text-slate-700 mb-1">For {owner.companyName}</p>
          <div className="h-16 flex items-center justify-center sm:justify-end">
            {quote.signatureData ? (
              quote.signatureData.startsWith('data:image') ? (
                <img src={quote.signatureData} alt="Signature" className="max-h-16 object-contain" />
              ) : (
                <span className="font-serif italic text-xl text-indigo-900">{quote.signatureData}</span>
              )
            ) : (
              <div className="w-32 border-b-2 border-indigo-400 h-8" />
            )}
          </div>
          <p className="font-bold text-slate-900 mt-1">{quote.signerName || owner.name || 'Authorized Signatory'}</p>
          <p className="text-[11px] text-slate-500">{quote.signerTitle || 'Authorized Signatory'}</p>
        </div>
      </div>
    </div>
  );
}
