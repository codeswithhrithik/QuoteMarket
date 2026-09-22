/**
 * ============================================================================
 * Template 2: Modern Minimalist
 * ============================================================================
 * Contemporary design with clean typography, solid borders,
 * clear visual hierarchy, and reliable printing support.
 */

import React from 'react';
import Badge from '../components/common/Badge';

export default function TemplateModern({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '24px 28px',
        maxWidth: '820px',
        margin: '0 auto',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '11px',
        lineHeight: '1.4'
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '2px solid #0f172a'
        }}
      >
        <div>
          {owner.logoUrl ? (
            <img
              src={owner.logoUrl}
              alt="Company Logo"
              style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                marginBottom: '8px'
              }}
            >
              {(owner.companyName || 'M').charAt(0)}
            </div>
          )}
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px 0' }}>
            {owner.companyName || 'Business Name'}
          </h1>
          {owner.companySubtitle && (
            <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', margin: '0 0 2px 0' }}>
              {owner.companySubtitle}
            </p>
          )}
          <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 2px 0', maxWidth: '360px' }}>
            {owner.companyAddress}
          </p>
          <p style={{ fontSize: '10.5px', color: '#64748b', margin: '0 0 2px 0' }}>
            {owner.companyEmail} • {owner.companyPhone}
          </p>
          <div style={{ fontSize: '10.5px', color: '#334155', fontWeight: 'bold', marginTop: '4px' }}>
            {owner.taxId && <span style={{ marginRight: '12px' }}>GSTIN: {owner.taxId}</span>}
            {owner.panNo && <span>PAN: {owner.panNo}</span>}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #dbeafe'
            }}
          >
            Quotation
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '6px 0 2px 0' }}>
            #{quote.quotationNumber}
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0' }}>
            Date: <strong style={{ color: '#1e293b' }}>{quote.quoteDate}</strong>
          </p>
          {quote.validUntil && (
            <p style={{ fontSize: '10.5px', color: '#64748b', margin: '0 0 4px 0' }}>
              Valid until: <strong style={{ color: '#1e293b' }}>{quote.validUntil}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Recipient Details & Subject */}
      <div
        style={{
          padding: '14px 0',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '11px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '2px'
              }}
            >
              Prepared For
            </span>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 2px 0' }}>
              {quote.party?.name}
            </p>
            {quote.party?.receiverName && (
              <p style={{ color: '#475569', fontWeight: '500', margin: '0 0 2px 0' }}>
                Attn: {quote.party.receiverName}
              </p>
            )}
            {quote.party?.address && (
              <p style={{ color: '#64748b', margin: '0 0 2px 0', whiteSpace: 'pre-line' }}>
                {quote.party.address}
              </p>
            )}
            <p style={{ color: '#64748b', margin: '0 0 2px 0' }}>
              {quote.party?.phone} • {quote.party?.email}
            </p>
            {quote.party?.taxId && (
              <p style={{ color: '#334155', fontWeight: 'bold', margin: '2px 0 0 0' }}>
                Client GSTIN: {quote.party.taxId}
              </p>
            )}
          </div>

          {quote.subject && (
            <div
              style={{
                maxWidth: '320px',
                backgroundColor: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'right'
              }}
            >
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 'bold',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  display: 'block'
                }}
              >
                Subject
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>
                {quote.subject}
              </span>
            </div>
          )}
        </div>

        {quote.openingNote && (
          <p
            style={{
              color: '#334155',
              fontStyle: 'italic',
              backgroundColor: '#f0fdf4',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #dcfce7',
              margin: '10px 0 0 0',
              lineHeight: '1.4'
            }}
          >
            "{quote.openingNote}"
          </p>
        )}
      </div>

      {/* Modern Line Items Table */}
      <div style={{ padding: '14px 0' }}>
        <table
          style={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            border: '1px solid #94a3b8',
            fontSize: '11px'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f1f5f9',
                borderBottom: '1px solid #94a3b8',
                color: '#334155',
                fontWeight: 'bold',
                fontSize: '10.5px',
                textTransform: 'uppercase'
              }}
            >
              <th style={{ padding: '6px 4px', width: '40px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>#</th>
              <th style={{ padding: '6px 8px', width: 'auto', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Description</th>
              <th style={{ padding: '6px 4px', width: '55px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Qty</th>
              <th style={{ padding: '6px 4px', width: '55px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Unit</th>
              <th style={{ padding: '6px 6px', width: '85px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Price</th>
              {quote.totalTax > 0 && <th style={{ padding: '6px 4px', width: '55px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Tax</th>}
              <th style={{ padding: '6px 8px', width: '95px', textAlign: 'right' }}>Total</th>
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
                <td style={{ padding: '6px 4px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #cbd5e1' }}>
                  {idx + 1}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    textAlign: 'left',
                    borderRight: '1px solid #cbd5e1',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <p style={{ fontWeight: 'bold', color: '#0f172a', margin: '0' }}>{item.name}</p>
                  {item.description && (
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0', whiteSpace: 'pre-wrap' }}>
                      {item.description}
                    </p>
                  )}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '500', borderRight: '1px solid #cbd5e1' }}>
                  {item.qty}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #cbd5e1' }}>
                  {item.unit || 'pcs'}
                </td>
                <td style={{ padding: '6px 6px', textAlign: 'right', color: '#334155', borderRight: '1px solid #cbd5e1' }}>
                  {currency} {formatMoney(item.rate)}
                </td>
                {quote.totalTax > 0 && (
                  <td style={{ padding: '6px 4px', textAlign: 'right', color: '#64748b', borderRight: '1px solid #cbd5e1' }}>
                    {item.taxPercent || 0}%
                  </td>
                )}
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                  {currency} {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Dynamic Amount in Words */}
      <div
        style={{
          paddingTop: '8px',
          paddingBottom: '14px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          fontSize: '11px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 'bold',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: '2px'
            }}
          >
            Total in Words
          </span>
          <p style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#1e293b', margin: '0' }}>
            {quote.totalInWords || 'Zero Only'}
          </p>
        </div>

        <div style={{ width: '230px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
              {currency} {formatMoney(quote.subtotal)}
            </span>
          </div>
          {quote.totalDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
              <span>Discount:</span>
              <span style={{ fontWeight: 'bold' }}>
                - {currency} {formatMoney(quote.totalDiscount)}
              </span>
            </div>
          )}
          {quote.totalTax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Taxes / GST:</span>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                + {currency} {formatMoney(quote.totalTax)}
              </span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '6px',
              borderTop: '2px solid #0f172a',
              marginTop: '4px'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Grand Total:</span>
            <span style={{ fontSize: '15px', fontWeight: '900', color: '#2563eb' }}>
              {currency} {formatMoney(quote.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(quote.notes || quote.termsAndConditions) && (
        <div
          style={{
            padding: '12px 0',
            borderTop: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            fontSize: '10.5px',
            color: '#475569',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          {quote.termsAndConditions && (
            <div>
              <span style={{ fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Terms & Conditions
              </span>
              <p style={{ whiteSpace: 'pre-line', margin: '0', lineHeight: '1.4' }}>{quote.termsAndConditions}</p>
            </div>
          )}
          {quote.notes && (
            <div>
              <span style={{ fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Notes
              </span>
              <p style={{ whiteSpace: 'pre-line', margin: '0', lineHeight: '1.4' }}>{quote.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Closing & Signatures */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: '11px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <p style={{ color: '#64748b', fontStyle: 'italic', maxWidth: '340px', margin: '0' }}>
          {quote.closingNote || 'Thank you for inquiring with us!'}
        </p>

        <div style={{ textAlign: 'right' }}>
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {quote.signatureData ? (
              quote.signatureData.startsWith('data:image') ? (
                <img src={quote.signatureData} alt="Signature" style={{ maxHeight: '48px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '16px', color: '#1e3a8a' }}>
                  {quote.signatureData}
                </span>
              )
            ) : (
              <div style={{ width: '130px', borderBottom: '1px solid #94a3b8', height: '24px' }} />
            )}
          </div>
          <p style={{ fontWeight: 'bold', color: '#0f172a', margin: '3px 0 0 0' }}>
            {quote.signerName || owner.name || 'Authorized Signatory'}
          </p>
          <p style={{ fontSize: '10px', color: '#64748b', margin: '0' }}>
            {quote.signerTitle || 'Authorized Signatory'}
          </p>
        </div>
      </div>
    </div>
  );
}
