/**
 * ============================================================================
 * Utility: Number to Words Converter
 * ============================================================================
 * Converts numeric currency amounts into standard spoken words.
 * Examples:
 *   12500 -> "Twelve Thousand Five Hundred Only"
 *   125450.50 -> "One Lakh Twenty-Five Thousand Four Hundred Fifty and Fifty Cents Only"
 * Supports currency names (USD, INR, EUR, GBP) and decimals (Cents/Paise).
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

/**
 * Converts numbers below 1000 into words
 * @param {number} n
 * @returns {string}
 */
function convertBelowThousand(n) {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ONES[n % 10] : '') + ' ';
  } else if (n > 0) {
    str += ONES[n] + ' ';
  }
  return str.trim();
}

/**
 * Convert number into words using Western numbering system (Billion, Million, Thousand)
 * @param {number} num 
 * @returns {string}
 */
function convertWestern(num) {
  if (num === 0) return 'Zero';

  const BILLION = 1000000000;
  const MILLION = 1000000;
  const THOUSAND = 1000;

  let words = '';

  if (Math.floor(num / BILLION) > 0) {
    words += convertWestern(Math.floor(num / BILLION)) + ' Billion ';
    num %= BILLION;
  }

  if (Math.floor(num / MILLION) > 0) {
    words += convertWestern(Math.floor(num / MILLION)) + ' Million ';
    num %= MILLION;
  }

  if (Math.floor(num / THOUSAND) > 0) {
    words += convertWestern(Math.floor(num / THOUSAND)) + ' Thousand ';
    num %= THOUSAND;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.trim();
}

/**
 * Convert number into words using Indian numbering system (Crore, Lakh, Thousand)
 * @param {number} num 
 * @returns {string}
 */
function convertIndian(num) {
  if (num === 0) return 'Zero';

  const CRORE = 10000000;
  const LAKH = 100000;
  const THOUSAND = 1000;

  let words = '';

  if (Math.floor(num / CRORE) > 0) {
    words += convertIndian(Math.floor(num / CRORE)) + ' Crore ';
    num %= CRORE;
  }

  if (Math.floor(num / LAKH) > 0) {
    words += convertIndian(Math.floor(num / LAKH)) + ' Lakh ';
    num %= LAKH;
  }

  if (Math.floor(num / THOUSAND) > 0) {
    words += convertIndian(Math.floor(num / THOUSAND)) + ' Thousand ';
    num %= THOUSAND;
  }

  if (num > 0) {
    words += convertBelowThousand(num);
  }

  return words.trim();
}

/**
 * Main exported function to convert total amount to words
 * @param {number} amount - Numeric value e.g. 15420.75
 * @param {string} currencyCode - USD, INR, EUR, GBP, etc.
 * @returns {string} - Full spoken words sentence ending in "Only"
 */
function numberToWords(amount, currencyCode = 'USD') {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '';
  }

  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  // Decide system based on currency code
  const isIndianSystem = ['INR', '₹', 'RS'].includes((currencyCode || '').toUpperCase());
  const wordsMain = isIndianSystem ? convertIndian(integerPart) : convertWestern(integerPart);

  let result = wordsMain;

  // Add decimal part if present
  if (decimalPart > 0) {
    const decimalWords = convertBelowThousand(decimalPart);
    const fractionalUnit = isIndianSystem ? 'Paise' : 'Cents';
    result += ` and ${decimalWords} ${fractionalUnit}`;
  }

  return result ? `${result} Only` : 'Zero Only';
}

module.exports = {
  numberToWords
};
