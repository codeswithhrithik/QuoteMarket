/**
 * ============================================================================
 * Template 3: Executive Slate
 * ============================================================================
 * Premium dark-slate header banner with white typography, two-column party cards,
 * zebra alternating rows, and bank details block.
 */

import React from 'react';
import Badge from '../components/common/Badge';

export default function TemplateSlate({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white text-slate-900 font-sans shadow-md max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-300">
      {/* Dark Slate Top Banner */}
      <div className="bg-slate-900 text-white p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            {owner.logoUrl ? (
              <img src={owner.logoUrl} alt="Logo" className="h-14 w-auto object-contain bg-white/10 p-1 rounded-lg" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl text-amber-400">
                {(owner.companyName || 'E').charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{owner.companyName || 'Executive Enterprises'}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{owner.companyAddress || 'Corporate Plaza'}</p>
              <p className="text-xs text-slate-400">{owner.companyEmail} • {owner.companyPhone}</p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">PRICE ESTIMATE</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">{quote.quotationNumber}</h2>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10 space-y-6">
        {/* Two Column From / To Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">To Customer:</span>
            <p className="text-base font-bold text-slate-900">{quote.party?.name}</p>
            {quote.party?.receiverName && <p className="text-slate-700 font-medium">Attn: {quote.party.receiverName}</p>}
            {quote.party?.address && <p className="text-slate-600 mt-1">{quote.party.address}</p>}
            <p className="text-slate-600 mt-1">{quote.party?.phone} {quote.party?.email && `• ${quote.party.email}`}</p>
            {quote.party?.taxId && <p className="text-slate-500 mt-0.5">Tax ID: {quote.party.taxId}</p>}
          </div>

          <div className="space-y-2 sm:text-right">
            <div>
              <span className="text-slate-500 font-semibold">Issue Date:</span>
              <span className="font-bold text-slate-800 ml-2">{quote.quoteDate}</span>
            </div>
            {quote.validUntil && (
              <div>
                <span className="text-slate-500 font-semibold">Valid Until:</span>
                <span className="font-bold text-slate-800 ml-2">{quote.validUntil}</span>
              </div>
            )}
            {owner.taxId && (
              <div>
                <span className="text-slate-500 font-semibold">Company GST/Tax:</span>
                <span className="font-medium text-slate-800 ml-2">{owner.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subject & Inquiring Appreciation */}
        <div className="space-y-2 text-xs">
          <p className="font-semibold text-slate-800">
            Dear {quote.party?.receiverName || quote.party?.name || 'Customer'},
          </p>
          <p className="text-slate-600 italic">
            {quote.openingNote || 'Thank you for inquiring with us. We are pleased to submit this quotation.'}
          </p>
          {quote.subject && (
            <div className="p-2.5 bg-slate-100 rounded-lg font-bold text-slate-900 text-xs">
              Subject: {quote.subject}
            </div>
          )}
        </div>

        {/* Itemized Table with Zebra Striping */}
        <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #334155' }}>
          <table className="w-full table-fixed text-left text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#ffffff', fontWeight: 'bold' }}>
                <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center', borderRight: '1px solid #475569' }}>#</th>
                <th style={{ padding: '8px 10px', width: 'auto', borderRight: '1px solid #475569' }}>Item / Description</th>
                <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #475569' }}>Qty</th>
                <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center', borderRight: '1px solid #475569' }}>Unit</th>
                <th style={{ padding: '8px 8px', width: '85px', textAlign: 'right', borderRight: '1px solid #475569' }}>Rate</th>
                {quote.totalTax > 0 && <th style={{ padding: '8px 6px', width: '55px', textAlign: 'right', borderRight: '1px solid #475569' }}>Tax%</th>}
                <th style={{ padding: '8px 10px', width: '95px', textAlign: 'right' }}>Total</th>
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
                    <p className="font-bold text-slate-900" style={{ margin: 0 }}>{item.name}</p>
                    {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-wrap" style={{ margin: '2px 0 0 0' }}>{item.description}</p>}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>{item.qty}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{item.unit || 'pcs'}</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', color: '#334155', borderRight: '1px solid #e2e8f0' }}>{currency} {formatMoney(item.rate)}</td>
                  {quote.totalTax > 0 && (
                    <td style={{ padding: '8px 6px', textAlign: 'right', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{item.taxPercent || 0}%</td>
                  )}
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>{currency} {formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financials & Amount in Words */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2 text-xs">
          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 self-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Amount In Spoken Words
            </span>
            <p className="font-bold text-slate-900 italic text-sm">
              {quote.totalInWords || 'Zero Only'}
            </p>
          </div>

          <div className="w-full sm:w-72 bg-slate-900 text-white p-5 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-300 text-xs">
              <span>Subtotal:</span>
              <span>{currency} {formatMoney(quote.subtotal)}</span>
            </div>
            {quote.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 text-xs">
                <span>Discount:</span>
                <span>- {currency} {formatMoney(quote.totalDiscount)}</span>
              </div>
            )}
            {quote.totalTax > 0 && (
              <div className="flex justify-between text-slate-300 text-xs">
                <span>Tax:</span>
                <span>+ {currency} {formatMoney(quote.totalTax)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline text-sm font-bold">
              <span>Grand Total:</span>
              <span className="text-xl font-extrabold text-amber-400">
                {currency} {formatMoney(quote.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-[11px] text-slate-600">
          <div>
            {quote.termsAndConditions && (
              <div className="mb-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Terms:</span>
                <p className="whitespace-pre-line leading-relaxed">{quote.termsAndConditions}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Notes:</span>
                <p className="whitespace-pre-line leading-relaxed">{quote.notes}</p>
              </div>
            )}
          </div>

          <div>
            {quote.remarks && (
              <div className="mb-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Remarks:</span>
                <p className="whitespace-pre-line leading-relaxed">{quote.remarks}</p>
              </div>
            )}
            {owner.bankDetails && owner.bankDetails.bankName && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Bank Remittance:</span>
                <p>Bank: {owner.bankDetails.bankName}</p>
                <p>A/C: {owner.bankDetails.accountNumber}</p>
                <p>Code: {owner.bankDetails.ifscOrSwift}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Signature */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          <p className="text-slate-600 italic max-w-sm">
            {quote.closingNote || 'Thank you for inquiring with us!'}
          </p>

          <div className="text-center sm:text-right shrink-0">
            <div className="h-16 flex items-center justify-center sm:justify-end">
              {quote.signatureData ? (
                quote.signatureData.startsWith('data:image') ? (
                  <img src={quote.signatureData} alt="Signature" className="max-h-16 object-contain" />
                ) : (
                  <span className="font-serif italic text-xl text-slate-900">{quote.signatureData}</span>
                )
              ) : (
                <div className="w-32 border-b border-slate-300 h-8" />
              )}
            </div>
            <p className="font-bold text-slate-900 mt-1">{quote.signerName || owner.name}</p>
            <p className="text-[11px] text-slate-500">{quote.signerTitle || 'Authorized Signatory'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
