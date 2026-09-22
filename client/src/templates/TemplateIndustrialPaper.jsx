/**
 * ============================================================================
 * Template: Standard Industrial / Paper-Friendly (Exact Match to User Reference)
 * ============================================================================
 * Designed specifically for physical paper print & clean PDF export.
 * Features:
 * - Solid black border boxed header with company branding, addresses & phone.
 * - Top boxed sub-bar displaying GSTIN on left and PAN NO / Quote No on right.
 * - Standard "To," party recipient details and "Date / Quote No" alignment.
 * - Formal Subject line and inquiry appreciation greeting.
 * - Fixed-layout table with solid black borders and strict text wrapping so descriptions
 *   never push cells to the right.
 * - Embedded "In words" row and right-aligned financial summary.
 * - Standard "TERMS & Condition", Special Notes, and "Thankyou!" signatory block.
 */

import React from 'react';

export default function TemplateIndustrialPaper({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div
      className="industrial-paper-doc"
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '16px 20px',
        maxWidth: '820px',
        margin: '0 auto',
        fontSize: '11px',
        lineHeight: '1.4'
      }}
    >
      {/* 1. Top Boxed Header with Solid Black Border (Matching Reference Image) */}
      <div
        style={{
          border: '2px solid #000000',
          marginBottom: '12px',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Company Title, Subtitle, Addresses and Contacts */}
        <div style={{ padding: '10px 14px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 2px 0'
            }}
          >
            {owner.companyName || 'Ray Industries'}
          </h1>
          {owner.companySubtitle && (
            <p
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#1e40af',
                margin: '0 0 2px 0'
              }}
            >
              {owner.companySubtitle}
            </p>
          )}
          {owner.companyFactoryAddress && (
            <p style={{ fontSize: '10.5px', color: '#1f2937', margin: '0 0 2px 0' }}>
              Factory : {owner.companyFactoryAddress}
            </p>
          )}
          {owner.companyAddress && (
            <p style={{ fontSize: '10.5px', color: '#1f2937', margin: '0 0 2px 0' }}>
              Office : {owner.companyAddress}
              {owner.companyCity && `, ${owner.companyCity}`}
              {owner.companyPincode && ` - ${owner.companyPincode}`}
            </p>
          )}
          {owner.companyPhone && (
            <p style={{ fontSize: '10.5px', color: '#1f2937', margin: '0 0 2px 0' }}>
              Contact no : {owner.companyPhone}
            </p>
          )}
          {owner.companyEmail && (
            <p style={{ fontSize: '10px', color: '#4b5563', margin: '1px 0 0 0' }}>
              Email : {owner.companyEmail}
            </p>
          )}
        </div>

        {/* Top Boxed Sub-Bar: GSTIN (Left) and PAN NO (Right) */}
        <div
          style={{
            borderTop: '1.5px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: '#f9fafb'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            GSTIN :{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {owner.taxId || '27AFDP02720N1ZG'}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            PAN NO :{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {owner.panNo || 'APDPR2720N'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Recipient ("To,") and Date / Quote No Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
          fontSize: '11px'
        }}
      >
        {/* Left: To Recipient */}
        <div style={{ maxWidth: '420px', lineHeight: '1.35' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>To,</p>
          <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0 0 1px 0' }}>
            {quote.party?.name || 'Customer Name'}
          </p>
          {quote.party?.receiverName && (
            <p style={{ color: '#374151', margin: '0 0 1px 0' }}>Attn : {quote.party.receiverName}</p>
          )}
          {quote.party?.address && (
            <p style={{ color: '#374151', margin: '0 0 1px 0', whiteSpace: 'pre-line' }}>
              {quote.party.address}
            </p>
          )}
          {(quote.party?.city || quote.party?.pincode) && (
            <p style={{ color: '#374151', margin: '0 0 1px 0' }}>
              {[quote.party.city, quote.party.pincode].filter(Boolean).join(' - ')}
            </p>
          )}
          {quote.party?.phone && (
            <p style={{ color: '#4b5563', margin: '0 0 1px 0' }}>Phone : {quote.party.phone}</p>
          )}
          {quote.party?.taxId && (
            <p style={{ color: '#1f2937', fontWeight: 'bold', margin: '0 0 1px 0' }}>
              GSTIN : {quote.party.taxId}
            </p>
          )}
        </div>

        {/* Right: Date & Quotation Number */}
        <div style={{ textAlign: 'right', lineHeight: '1.4' }}>
          <p style={{ margin: '0 0 3px 0' }}>
            <strong>Date : </strong>
            <span>{quote.quoteDate}</span>
          </p>
          <p style={{ margin: '0 0 3px 0' }}>
            <strong>Quote No : </strong>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {quote.quotationNumber}
            </span>
          </p>
          {quote.validUntil && (
            <p style={{ color: '#4b5563', fontSize: '10.5px', margin: '0' }}>
              <span>Valid Until : </span>
              <span>{quote.validUntil}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Subject and Appreciation Line */}
      <div style={{ marginBottom: '10px', lineHeight: '1.4', fontSize: '11px' }}>
        {quote.subject && (
          <p style={{ fontWeight: 'bold', color: '#111827', margin: '0 0 3px 0' }}>
            Subject :-{' '}
            <span style={{ textDecoration: 'underline' }}>{quote.subject}</span>
          </p>
        )}
        <p style={{ color: '#1f2937', margin: '0' }}>
          {quote.openingNote ||
            'Thanks for valuable enquire about the above matter, We are submitting our valuable quotation. The details with terms & condition applicable.'}
        </p>
      </div>

      {/* 4. Solid Black Border Items Table (Strict table-layout: fixed to PREVENT pushing columns!) */}
      <div style={{ marginBottom: '12px' }}>
        <table
          style={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            border: '1.5px solid #000000',
            fontSize: '11px',
            backgroundColor: '#ffffff'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f3f4f6',
                borderBottom: '1.5px solid #000000',
                fontWeight: 'bold',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <th
                style={{
                  width: '45px',
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderRight: '1px solid #000000'
                }}
              >
                Sr.no
              </th>
              <th
                style={{
                  width: 'auto',
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRight: '1px solid #000000'
                }}
              >
                Description
              </th>
              <th
                style={{
                  width: '65px',
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderRight: '1px solid #000000'
                }}
              >
                Qty
              </th>
              <th
                style={{
                  width: '110px',
                  textAlign: 'right',
                  padding: '6px 8px'
                }}
              >
                Amount ({currency})
              </th>
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #000000',
                  verticalAlign: 'top',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                {/* Sr.No */}
                <td
                  style={{
                    width: '45px',
                    textAlign: 'center',
                    padding: '5px 4px',
                    borderRight: '1px solid #000000'
                  }}
                >
                  {idx + 1}
                </td>

                {/* Description with strict wrapping to prevent pushing cells */}
                <td
                  style={{
                    width: 'auto',
                    textAlign: 'left',
                    padding: '5px 8px',
                    borderRight: '1px solid #000000',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#111827' }}>
                    {item.name || 'Item'}
                  </div>
                  {item.description && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#4b5563',
                        marginTop: '2px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.3'
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Qty */}
                <td
                  style={{
                    width: '65px',
                    textAlign: 'center',
                    padding: '5px 4px',
                    borderRight: '1px solid #000000'
                  }}
                >
                  {item.qty} {item.unit || ''}
                </td>

                {/* Amount */}
                <td
                  style={{
                    width: '110px',
                    textAlign: 'right',
                    padding: '5px 8px',
                    fontWeight: '500'
                  }}
                >
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}

            {/* Bottom Summary Rows inside Table */}
            <tr
              style={{
                borderTop: '1.5px solid #000000',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              {/* In Words spanning row */}
              <td
                colSpan={2}
                rowSpan={quote.totalTax > 0 || quote.totalDiscount > 0 ? 3 : 2}
                style={{
                  borderRight: '1px solid #000000',
                  padding: '6px 10px',
                  verticalAlign: 'middle',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ fontSize: '10.5px' }}>
                  <span style={{ fontWeight: 'bold' }}>In words : </span>
                  <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                    {quote.totalInWords || 'Zero Only.'}
                  </span>
                </div>
              </td>
              <td
                style={{
                  borderRight: '1px solid #000000',
                  padding: '5px 6px',
                  textAlign: 'right',
                  fontSize: '10.5px',
                  fontWeight: 'bold'
                }}
              >
                Total Amount:
              </td>
              <td
                style={{
                  padding: '5px 8px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '10.5px'
                }}
              >
                {formatMoney(quote.subtotal)}
              </td>
            </tr>

            {quote.totalTax > 0 && (
              <tr
                style={{
                  borderTop: '1px solid #000000',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <td
                  style={{
                    borderRight: '1px solid #000000',
                    padding: '5px 6px',
                    textAlign: 'right',
                    fontSize: '10.5px',
                    fontWeight: 'bold'
                  }}
                >
                  GST Tax:
                </td>
                <td
                  style={{
                    padding: '5px 8px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '10.5px'
                  }}
                >
                  {formatMoney(quote.totalTax)}
                </td>
              </tr>
            )}

            <tr
              style={{
                borderTop: '1.5px solid #000000',
                backgroundColor: '#f3f4f6',
                fontWeight: 'bold',
                pageBreakInside: 'avoid',
                breakInside: 'avoid'
              }}
            >
              <td
                style={{
                  borderRight: '1px solid #000000',
                  padding: '6px 6px',
                  textAlign: 'right',
                  fontSize: '11px'
                }}
              >
                Grand Total:
              </td>
              <td
                style={{
                  padding: '6px 8px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: '900'
                }}
              >
                {formatMoney(quote.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Special Note */}
      {quote.notes && (
        <div
          style={{
            marginBottom: '10px',
            fontSize: '10.5px',
            lineHeight: '1.35',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          <p style={{ margin: '0' }}>
            <span style={{ fontWeight: 'bold', color: '#111827' }}>Note : </span>
            <span style={{ color: '#1f2937' }}>{quote.notes}</span>
          </p>
        </div>
      )}

      {/* 6. Terms & Conditions */}
      {quote.termsAndConditions && (
        <div
          style={{
            marginBottom: '12px',
            fontSize: '10.5px',
            lineHeight: '1.35',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          <p
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#111827',
              margin: '0 0 2px 0'
            }}
          >
            TERMS & Condition
          </p>
          <div
            style={{
              whiteSpace: 'pre-line',
              color: '#1f2937',
              paddingLeft: '8px'
            }}
          >
            {quote.termsAndConditions}
          </div>
        </div>
      )}

      {/* Remarks if any */}
      {quote.remarks && (
        <div
          style={{
            marginBottom: '10px',
            fontSize: '10.5px',
            color: '#4b5563',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          <strong>Remarks: </strong>
          <span>{quote.remarks}</span>
        </div>
      )}

      {/* 7. Signatory & Thank You Footer (As in Reference Image) */}
      <div
        style={{
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: '11px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <div style={{ maxWidth: '320px' }}>
          <p style={{ color: '#4b5563', fontStyle: 'italic', margin: '0' }}>
            {quote.closingNote || 'Thank you for inquiring with us.'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 2px 0' }}>Thankyou!</p>
          <p
            style={{
              fontWeight: 'bold',
              color: '#111827',
              fontSize: '12px',
              margin: '0 0 4px 0'
            }}
          >
            {owner.companyName || 'Ray Industries'}
          </p>

          {/* Signature Area */}
          <div
            style={{
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            {quote.signatureData ? (
              quote.signatureData.startsWith('data:image') ? (
                <img
                  src={quote.signatureData}
                  alt="Signature"
                  style={{ maxHeight: '48px', objectFit: 'contain' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    fontSize: '16px',
                    color: '#111827'
                  }}
                >
                  {quote.signatureData}
                </span>
              )
            ) : (
              <div style={{ width: '130px', borderBottom: '1px solid #000000', height: '24px' }} />
            )}
          </div>

          <p style={{ fontWeight: 'bold', color: '#1f2937', margin: '2px 0 0 0', fontSize: '10.5px' }}>
            {quote.signerName || owner.name || 'Authorized Signatory'}
          </p>
          <p style={{ color: '#6b7280', fontSize: '10px', margin: '0' }}>
            {quote.signerTitle || 'Authorized Signatory'}
          </p>
        </div>
      </div>
    </div>
  );
}
