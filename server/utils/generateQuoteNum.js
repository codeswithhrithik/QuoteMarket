/**
 * ============================================================================
 * Utility: Quotation Number Generator
 * ============================================================================
 * Generates sequential, professional quotation reference numbers.
 * Example format: QT-2026-0001
 */

/**
 * Generate next quotation number based on total existing count
 * @param {number} count - Total existing quotations count for user
 * @param {string} prefix - Optional prefix, defaults to 'QT'
 * @returns {string} - Formatted quotation code e.g. QT-2026-0001
 */
function generateQuoteNum(count = 0, prefix = 'QT') {
  const currentYear = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${currentYear}-${sequence}`;
}

module.exports = {
  generateQuoteNum
};
