/**
 * ============================================================================
 * Template: Clean Professional Paper (Exact Match to User Reference Image)
 * ============================================================================
 * Features:
 * - Top Left: Bold Blue Company Title + Company Slogan.
 * - Top Right: "Quote" header + Date, Quote No, Expiration Date.
 * - Subheader: 2-column "TO :" (Client) and "Prepared by :" (Supplier).
 * - Table: Solid bordered table with ITEMS, DESCRIPTION, QUANTITY, TOTAL.
 * - Right-aligned Totals Box: SUB TOTAL, TAX %, GRAND TOTAL.
 * - INSTRUCTIONS: Terms, notes & payment guidelines.
 * - Acceptance & 3-cell Signature Block: NAME | SIGNATURE | DATE.
 * - Footer: "THANK YOU FOR YOUR BUSINESS!", query helpline, Tel, Fax, Email, Web.
 * - Print-safe with exact A4 margins (15mm) and row-break prevention.
 */

import React from 'react';
import { numberToWords } from '../utils/numberToWords';

export default function TemplateCleanPaper({ quote, owner = {} }) {
  const currency = quote.currency || '₹';

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Expiration date (defaults to validUntil or +30 days)
  const expirationDate =
    quote.validUntil ||
    (quote.quoteDate
      ? new Date(new Date(quote.quoteDate).getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      : '30 Days');

  return (
    <div
      className="clean-paper-quotation"
      style={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '30px 36px',
        maxWidth: '820px',
        margin: '0 auto',
        fontSize: '11px',
        lineHeight: '1.45',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Section: Company Name & Slogan (Left) vs "Quote" & Dates (Right) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}
      >
        {/* Left: Company Name & Slogan */}
        <div style={{ maxWidth: '450px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2554a5',
              letterSpacing: '-0.02em',
              margin: '0'
            }}
          >
            {owner.companyName || 'My Company name'}
          </h1>
        </div>

        {/* Right: "Quote" & Metadata */}
        <div style={{ textAlign: 'right', minWidth: '220px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 'normal',
              color: '#2554a5',
              letterSpacing: '0.02em',
              margin: '0 0 10px 0'
            }}
          >
            Quote
          </h2>
          <div style={{ fontSize: '10.5px', color: '#334155', lineHeight: '1.6' }}>
            <p style={{ margin: '0' }}>
              <strong style={{ letterSpacing: '0.04em' }}>DATE : </strong>
              <span>{quote.quoteDate}</span>
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ letterSpacing: '0.04em' }}>QUOTE NO : </strong>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                # {quote.quotationNumber || '1112222'}
              </span>
            </p>
            <p style={{ margin: '0' }}>
              <strong style={{ letterSpacing: '0.04em' }}>EXPIRATION DATE : </strong>
              <span>{expirationDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Subheader: "TO :" (Client) and "Prepared by :" (Supplier) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '22px',
          fontSize: '10.5px'
        }}
      >
        {/* Left: TO : */}
        <div style={{ lineHeight: '1.4' }}>
          <p
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              color: '#0f172a',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0'
            }}
          >
            TO :
          </p>
          {quote.party?.receiverName && (
            <p style={{ margin: '0 0 1px 0', color: '#1e293b' }}>
              {quote.party.receiverName}
            </p>
          )}
          <p
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0f172a',
              margin: '0 0 1px 0'
            }}
          >
            {quote.party?.name || 'COMPANY NAME'}
          </p>
          {quote.party?.address && (
            <p style={{ color: '#475569', margin: '0 0 1px 0', textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
              {quote.party.address}
            </p>
          )}
          {(quote.party?.city || quote.party?.pincode) && (
            <p style={{ color: '#475569', margin: '0 0 1px 0', textTransform: 'uppercase' }}>
              {[quote.party.city, quote.party.state, quote.party.pincode].filter(Boolean).join(' ')}
            </p>
          )}
          {quote.party?.phone && (
            <p style={{ color: '#475569', margin: '0 0 1px 0' }}>
              PHONE : {quote.party.phone}
            </p>
          )}
          {quote.party?.taxId && (
            <p style={{ color: '#334155', fontWeight: 'bold', margin: '0' }}>
              GSTIN : {quote.party.taxId}
            </p>
          )}
        </div>

        {/* Right: Prepared by : */}
        <div style={{ lineHeight: '1.4', paddingLeft: '20px' }}>
          <p
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              color: '#0f172a',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0'
            }}
          >
            Prepared by :
          </p>
          <p
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0f172a',
              margin: '0 0 1px 0'
            }}
          >
            {owner.companyName || 'YOUR COMPANY NAME'}
          </p>
          {owner.companyFactoryAddress && (
            <p style={{ color: '#475569', margin: '0 0 1px 0', textTransform: 'uppercase' }}>
              Factory: {owner.companyFactoryAddress}
            </p>
          )}
          {owner.companyAddress && (
            <p style={{ color: '#475569', margin: '0 0 1px 0', textTransform: 'uppercase' }}>
              {owner.companyAddress}
            </p>
          )}
          {(owner.companyCity || owner.companyPincode) && (
            <p style={{ color: '#475569', margin: '0 0 1px 0', textTransform: 'uppercase' }}>
              {[owner.companyCity, owner.companyState, owner.companyPincode].filter(Boolean).join(' ')}
            </p>
          )}
          {owner.companyPhone && (
            <p style={{ color: '#475569', margin: '0 0 1px 0' }}>
              PHONE : {owner.companyPhone}
            </p>
          )}
          {owner.taxId && (
            <p style={{ color: '#334155', fontWeight: 'bold', margin: '0 0 1px 0' }}>
              GSTIN : {owner.taxId}
            </p>
          )}
          {owner.panNo && (
            <p style={{ color: '#334155', fontWeight: 'bold', margin: '0' }}>
              PAN : {owner.panNo}
            </p>
          )}
        </div>
      </div>

      {/* Subject Line & Opening Appreciation Note */}
      {(quote.subject || quote.openingNote) && (
        <div style={{ marginBottom: '14px', fontSize: '11px', color: '#1e293b', lineHeight: '1.5' }}>
          {quote.subject && (
            <div style={{ marginBottom: quote.openingNote ? '3px' : '0' }}>
              <strong>Subject : </strong>
              <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{quote.subject}</span>
            </div>
          )}
          {quote.openingNote && (
            <div style={{ color: '#475569', fontStyle: 'italic' }}>
              {quote.openingNote}
            </div>
          )}
        </div>
      )}

      {/* 3. Items Table (Solid Outer & Vertical Grid Lines as in Reference Image) */}
      <div style={{ marginBottom: '0px' }}>
        <table
          style={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            border: '1.5px solid #475569',
            fontSize: '10.5px'
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1.5px solid #475569',
                color: '#334155',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: '#ffffff'
              }}
            >
              <th
                style={{
                  width: '8%',
                  textAlign: 'center',
                  padding: '7px 4px',
                  borderRight: '1.5px solid #475569'
                }}
              >
                ITEMS
              </th>
              <th
                style={{
                  width: '54%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRight: '1.5px solid #475569'
                }}
              >
                DESCRIPTION
              </th>
              <th
                style={{
                  width: '18%',
                  textAlign: 'center',
                  padding: '7px 4px',
                  borderRight: '1.5px solid #475569'
                }}
              >
                QUANTITY
              </th>
              <th
                style={{
                  width: '20%',
                  textAlign: 'right',
                  padding: '7px 10px'
                }}
              >
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #94a3b8',
                  verticalAlign: 'top',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                {/* Item Number */}
                <td
                  style={{
                    width: '8%',
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRight: '1.5px solid #475569',
                    color: '#334155',
                    fontWeight: 'bold'
                  }}
                >
                  {idx + 1}
                </td>

                {/* Description with clean text wrapping */}
                <td
                  style={{
                    width: '54%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRight: '1.5px solid #475569',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <p style={{ fontWeight: 'bold', color: '#0f172a', margin: '0' }}>
                    {item.name || 'Item'}
                  </p>
                  {item.description && (
                    <p
                      style={{
                        fontSize: '10px',
                        color: '#475569',
                        margin: '3px 0 0 0',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.35'
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </td>

                {/* Quantity */}
                <td
                  style={{
                    width: '18%',
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRight: '1.5px solid #475569',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}
                >
                  {item.qty} {item.unit || ''}
                </td>

                {/* Total */}
                <td
                  style={{
                    width: '20%',
                    textAlign: 'right',
                    padding: '8px 10px',
                    fontWeight: '500',
                    color: '#0f172a'
                  }}
                >
                  {currency} {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* 4. Financial Totals (Attached right under table, perfectly aligned with columns) */}
          <tfoot>
            {/* SUB TOTAL */}
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td
                colSpan={2}
                rowSpan={quote.totalDiscount > 0 ? 4 : 3}
                style={{
                  borderLeft: '1.5px solid #475569',
                  borderRight: '1.5px solid #475569',
                  borderTop: '1.5px solid #475569',
                  borderBottom: '1.5px solid #475569',
                  padding: '6px 10px',
                  verticalAlign: 'middle',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '9.5px', color: '#475569', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                  Amount in Words :
                </div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.35' }}>
                  {quote.totalInWords || numberToWords(quote.grandTotal, quote.currencyCode || 'INR')}
                </div>
              </td>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderTop: '1.5px solid #475569',
                  borderBottom: '1px solid #94a3b8',
                  padding: '4px 6px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#334155',
                  fontSize: '10px',
                  whiteSpace: 'nowrap'
                }}
              >
                SUB TOTAL
              </td>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderTop: '1.5px solid #475569',
                  borderBottom: '1px solid #94a3b8',
                  padding: '4px 8px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  fontSize: '10.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                {currency} {formatMoney(quote.subtotal)}
              </td>
            </tr>

            {/* DISCOUNT (if any) */}
            {quote.totalDiscount > 0 && (
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td
                  style={{
                    borderRight: '1.5px solid #475569',
                    borderBottom: '1px solid #94a3b8',
                    padding: '4px 6px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#16a34a',
                    fontSize: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  DISCOUNT
                </td>
                <td
                  style={{
                    borderRight: '1.5px solid #475569',
                    borderBottom: '1px solid #94a3b8',
                    padding: '4px 8px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#16a34a',
                    fontSize: '10.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  - {currency} {formatMoney(quote.totalDiscount)}
                </td>
              </tr>
            )}

            {/* GST (18%) */}
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderBottom: '1.5px solid #475569',
                  padding: '4px 6px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#334155',
                  fontSize: '10px',
                  whiteSpace: 'nowrap'
                }}
              >
                GST (18%)
              </td>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderBottom: '1.5px solid #475569',
                  padding: '4px 8px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  fontSize: '10.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                + {currency} {formatMoney(quote.totalTax || 0)}
              </td>
            </tr>

            {/* GRAND TOTAL */}
            <tr style={{ pageBreakInside: 'avoid', backgroundColor: '#ffffff' }}>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderBottom: '1.5px solid #475569',
                  padding: '5px 6px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontSize: '10.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                GRAND TOTAL
              </td>
              <td
                style={{
                  borderRight: '1.5px solid #475569',
                  borderBottom: '1.5px solid #475569',
                  padding: '5px 8px',
                  textAlign: 'right',
                  fontWeight: '900',
                  color: '#000000',
                  fontSize: '11px',
                  whiteSpace: 'nowrap'
                }}
              >
                {currency} {formatMoney(quote.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. INSTRUCTIONS: Section */}
      <div
        style={{
          marginBottom: '20px',
          fontSize: '10.5px',
          lineHeight: '1.45',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <p
          style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#0f172a',
            margin: '0 0 3px 0',
            letterSpacing: '0.04em'
          }}
        >
          INSTRUCTIONS:
        </p>
        <p style={{ color: '#475569', margin: '0 0 2px 0' }}>
          {quote.termsAndConditions ||
            '1. Please email or return a confirmation to process your order.\n2. Quotation is valid for 30 days from the date of issue.'}
        </p>
        {quote.notes && (
          <p style={{ color: '#475569', margin: '4px 0 0 0' }}>
            <strong>Note: </strong>
            {quote.notes}
          </p>
        )}
      </div>

      {/* 7. Footer: "THANK YOU FOR YOUR BUSINESS!" & Contact Info */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '6px',
          fontSize: '10px',
          color: '#475569',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <p
          style={{
            textAlign: 'right',
            fontWeight: 'bold',
            color: '#2554a5',
            fontSize: '12px',
            letterSpacing: '0.04em',
            margin: '0 0 6px 0',
            textTransform: 'uppercase'
          }}
        >
          THANK YOU FOR YOUR BUSINESS!
        </p>

        {/* Dividing line */}
        <div style={{ borderTop: '1px solid #94a3b8', marginBottom: '8px' }} />

        {/* Helpline enquiry line */}
        <p style={{ textAlign: 'center', margin: '0 0 6px 0', fontSize: '10px' }}>
          Should you have any enquiries concerning this quote, contact{' '}
          <strong>{owner.name || owner.companyName || 'our team'}</strong>
          {owner.companyPhone && ` on ${owner.companyPhone}`}
        </p>

        {/* Bottom Contact Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            color: '#475569'
          }}
        >
          {/* Left Contacts */}
          <div>
            {owner.companyPhone && (
              <p style={{ margin: '0' }}>Tel : {owner.companyPhone}</p>
            )}
            {owner.companyFax && (
              <p style={{ margin: '0' }}>Fax : {owner.companyFax}</p>
            )}
          </div>

          {/* Right Contacts */}
          <div style={{ textAlign: 'right' }}>
            {owner.companyEmail && (
              <p style={{ margin: '0' }}>E-mail : {owner.companyEmail}</p>
            )}
            {owner.companyWebsite && (
              <p style={{ margin: '0' }}>web : {owner.companyWebsite}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
