/**
 * ============================================================================
 * Template 1: Classic Corporate
 * ============================================================================
 * Traditional corporate presentation with navy blue headers, gold accent lines,
 * formal borders, and authorized stamp/signature area.
 */

import React from 'react';
import Badge from '../components/common/Badge';

export default function TemplateClassic({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-12 border border-slate-300 shadow-sm max-w-4xl mx-auto rounded-lg">
      {/* Top Header Banner */}
      <div className="border-b-4 border-navy-900 pb-6 mb-6" style={{ borderColor: '#1e3a8a' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {owner.logoUrl ? (
              <img src={owner.logoUrl} alt="Logo" className="h-16 w-auto max-w-[120px] object-contain" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {(owner.companyName || 'Q').charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {owner.companyName || 'Corporate Supplier & Services'}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">{owner.companyAddress || 'Main Commercial Area'}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                {owner.companyPhone && <span>Tel: {owner.companyPhone}</span>}
                {owner.companyEmail && <span>Email: {owner.companyEmail}</span>}
                {owner.taxId && <span>GSTIN: {owner.taxId}</span>}
                {owner.panNo && <span>PAN: {owner.panNo}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-extrabold uppercase tracking-wider text-blue-900">
              QUOTATION
            </h2>
          </div>
        </div>
      </div>

      {/* Reference & Recipient Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-xs">
        {/* Recipient Party Details */}
        <div>
          <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Quotation Prepared For:
          </span>
          <p className="text-sm font-bold text-slate-800">{quote.party?.name || 'Customer / Client'}</p>
          {quote.party?.receiverName && (
            <p className="text-slate-700 font-medium mt-0.5">
              Kind Attn: {quote.party.receiverName}
            </p>
          )}
          {quote.party?.address && (
            <p className="text-slate-600 mt-0.5 whitespace-pre-line">{quote.party.address}</p>
          )}
          {(quote.party?.city || quote.party?.state || quote.party?.pincode) && (
            <p className="text-slate-600">
              {[quote.party.city, quote.party.state, quote.party.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          <div className="mt-2 text-slate-600 space-y-0.5">
            {quote.party?.phone && <p>Contact: {quote.party.phone}</p>}
            {quote.party?.email && <p>Email: {quote.party.email}</p>}
            {quote.party?.taxId && <p>GST/Tax ID: {quote.party.taxId}</p>}
          </div>
        </div>

        {/* Quotation Metadata */}
        <div className="space-y-1.5 sm:text-right">
          <div className="flex justify-between sm:justify-end gap-3">
            <span className="text-slate-500 font-semibold">Quote Number:</span>
            <span className="font-bold text-slate-900">{quote.quotationNumber}</span>
          </div>
          <div className="flex justify-between sm:justify-end gap-3">
            <span className="text-slate-500 font-semibold">Quote Date:</span>
            <span className="font-medium text-slate-800">{quote.quoteDate}</span>
          </div>
          {quote.validUntil && (
            <div className="flex justify-between sm:justify-end gap-3">
              <span className="text-slate-500 font-semibold">Valid Until:</span>
              <span className="font-medium text-slate-800">{quote.validUntil}</span>
            </div>
          )}
        </div>
      </div>

      {/* Salutation, Inquiring Appreciation & Subject */}
      <div className="mb-6 space-y-2 text-xs">
        <p className="font-semibold text-slate-800">
          Dear {quote.party?.receiverName || quote.party?.name || 'Sir / Madam'},
        </p>
        <p className="text-slate-600 leading-relaxed italic">
          {quote.openingNote || 'Thank you for inquiring with us. We are pleased to submit our most competitive quotation as requested.'}
        </p>
        {quote.subject && (
          <div className="pt-2">
            <span className="font-bold text-slate-900 underline decoration-blue-800 underline-offset-2">
              Subject: {quote.subject}
            </span>
          </div>
        )}
      </div>

      {/* Items & Materials Table */}
      <div className="mb-6 overflow-hidden rounded-lg" style={{ border: '1px solid #1e3a8a' }}>
        <table className="w-full table-fixed text-left text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: 'bold' }}>
              <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center', borderRight: '1px solid #3b82f6' }}>#</th>
              <th style={{ padding: '8px 10px', width: 'auto', borderRight: '1px solid #3b82f6' }}>Item / Material Description</th>
              <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #3b82f6' }}>Qty</th>
              <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #3b82f6' }}>Unit</th>
              <th style={{ padding: '8px 8px', width: '90px', textAlign: 'right', borderRight: '1px solid #3b82f6' }}>Rate ({currency})</th>
              {quote.totalTax > 0 && <th style={{ padding: '8px 6px', width: '60px', textAlign: 'right', borderRight: '1px solid #3b82f6' }}>Tax%</th>}
              <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>Total ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                  verticalAlign: 'top',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                <td style={{ padding: '8px 10px', borderRight: '1px solid #e2e8f0', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  <span className="font-semibold text-slate-900 block">{item.name}</span>
                  {item.description && (
                    <span className="text-[11px] text-slate-500 block mt-0.5 whitespace-pre-wrap">{item.description}</span>
                  )}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>{item.qty}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{item.unit || 'pcs'}</td>
                <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>{formatMoney(item.rate)}</td>
                {quote.totalTax > 0 && (
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{item.taxPercent || 0}%</td>
                )}
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary & Amount in Words */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 text-xs">
        {/* Amount in words */}
        <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200 self-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Amount in Words:
          </span>
          <p className="font-bold text-slate-900 italic text-sm">
            {quote.totalInWords || 'Zero Only'}
          </p>
        </div>

        {/* Totals Calculation Column */}
        <div className="w-full sm:w-72 space-y-2 border-t sm:border-t-0 pt-3 sm:pt-0">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-medium text-slate-800">{currency} {formatMoney(quote.subtotal)}</span>
          </div>

          {quote.totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discount:</span>
              <span>- {currency} {formatMoney(quote.totalDiscount)}</span>
            </div>
          )}

          {quote.totalTax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax / GST:</span>
              <span className="font-medium text-slate-800">+ {currency} {formatMoney(quote.totalTax)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-800 text-sm font-bold text-blue-950">
            <span>Grand Total:</span>
            <span className="text-base font-extrabold">{currency} {formatMoney(quote.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Terms, Notes & Remarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-600 border-t border-slate-200 pt-6 mb-8">
        <div>
          {quote.termsAndConditions && (
            <div className="mb-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Terms & Conditions:
              </span>
              <p className="whitespace-pre-line leading-relaxed">{quote.termsAndConditions}</p>
            </div>
          )}
          {quote.notes && (
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Notes:
              </span>
              <p className="whitespace-pre-line leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>

        <div>
          {quote.remarks && (
            <div className="mb-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Remarks:
              </span>
              <p className="whitespace-pre-line leading-relaxed">{quote.remarks}</p>
            </div>
          )}
          {owner.bankDetails && owner.bankDetails.bankName && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Bank Transfer Details:
              </span>
              <p>Bank: {owner.bankDetails.bankName}</p>
              <p>A/C No: {owner.bankDetails.accountNumber}</p>
              <p>IFSC / SWIFT: {owner.bankDetails.ifscOrSwift}</p>
              <p>Beneficiary: {owner.bankDetails.accountName || owner.companyName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Closing Salutation & Signature Block */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
        <div className="max-w-md">
          <p className="text-slate-700 italic font-medium">
            {quote.closingNote || 'Thank you for inquiring with us! We assure you of our best service.'}
          </p>
        </div>

        <div className="text-center sm:text-right shrink-0">
          <p className="text-slate-500 font-semibold mb-2">For {owner.companyName || 'The Company'}</p>
          <div className="h-16 flex items-center justify-center sm:justify-end">
            {quote.signatureData ? (
              quote.signatureData.startsWith('data:image') ? (
                <img src={quote.signatureData} alt="Signature" className="max-h-16 object-contain" />
              ) : (
                <span className="font-serif italic text-xl text-blue-900">{quote.signatureData}</span>
              )
            ) : (
              <div className="w-36 border-b border-dashed border-slate-400 h-8" />
            )}
          </div>
          <p className="font-bold text-slate-800 mt-1">{quote.signerName || owner.name || 'Authorized Person'}</p>
          <p className="text-[11px] text-slate-500">{quote.signerTitle || 'Authorized Signatory'}</p>
        </div>
      </div>
    </div>
  );
}
