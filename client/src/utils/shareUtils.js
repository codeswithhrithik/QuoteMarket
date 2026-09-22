/**
 * ============================================================================
 * Share Utilities (WhatsApp, Email & Direct Link)
 * ============================================================================
 * Generates formatted direct communication links for WhatsApp and Email,
 * complete with quotation summary, grand totals, and online view link.
 */

/**
 * Format currency nicely
 */
function formatAmount(val = 0, symbol = '₹') {
  return `${symbol} ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate WhatsApp click-to-chat URL with structured message
 * @param {Object} quote - Quotation object
 * @param {Object} owner - Business owner details
 * @param {string} customPhone - Optional phone number override
 * @returns {string} - WhatsApp wa.me URL
 */
export function getWhatsAppShareUrl(quote, owner = {}, customPhone = '') {
  const recipientPhone = (customPhone || (quote.party && quote.party.phone) || '').replace(/[^0-9]/g, '');
  const publicUrl = `${window.location.origin}/view-quote/${quote.shareToken || quote._id}`;

  const message = `*QUOTATION: ${quote.quotationNumber}*
📅 *Date:* ${quote.quoteDate}
🏢 *From:* ${owner.companyName || 'Our Business'}
👤 *To:* ${quote.party?.name || 'Valued Customer'} ${quote.party?.receiverName ? `(Attn: ${quote.party.receiverName})` : ''}
📌 *Subject:* ${quote.subject || 'Supply and Services'}

*Summary of Items:*
${(quote.items || []).map((it, idx) => `• ${it.name} (${it.qty} ${it.unit}) - ${formatAmount(it.amount, quote.currency)}`).join('\n')}

💰 *Grand Total:* ${formatAmount(quote.grandTotal, quote.currency)}
📝 *In Words:* ${quote.totalInWords || ''}

📄 *View & Download PDF / Approve Online:*
${publicUrl}

Thank you for inquiring with us!`;

  const encoded = encodeURIComponent(message);
  return recipientPhone 
    ? `https://wa.me/${recipientPhone}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

/**
 * Generate mailto URL with prefilled subject and body
 * @param {Object} quote 
 * @param {Object} owner 
 * @returns {string} - mailto URL
 */
export function getEmailShareUrl(quote, owner = {}) {
  const recipientEmail = (quote.party && quote.party.email) || '';
  const publicUrl = `${window.location.origin}/view-quote/${quote.shareToken || quote._id}`;

  const subject = `Quotation ${quote.quotationNumber} from ${owner.companyName || 'Us'}: ${quote.subject || 'Estimate'}`;
  
  const body = `Dear ${quote.party?.receiverName || quote.party?.name || 'Sir/Madam'},

${quote.openingNote || 'Thank you for inquiring with us. We are pleased to submit our quotation.'}

QUOTATION DETAILS:
- Quotation Number: ${quote.quotationNumber}
- Date: ${quote.quoteDate}
- Valid Until: ${quote.validUntil || '30 Days from date'}
- Grand Total: ${formatAmount(quote.grandTotal, quote.currency)} (${quote.totalInWords})

You can view the full quotation, download the PDF, or submit your acceptance directly using the link below:
${publicUrl}

${quote.closingNote || 'Thank you for inquiring with us. We look forward to doing business with you.'}

Best regards,
${owner.name || ''}
${owner.companyName || ''}
${owner.companyPhone ? `Phone: ${owner.companyPhone}` : ''}`;

  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
