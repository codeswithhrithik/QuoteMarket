/**
 * ============================================================================
 * Client Utility: Live Number to Words Converter
 * ============================================================================
 * Provides instant, zero-latency conversion of numbers to words in the browser
 * as the user types quantities, unit rates, taxes, or discounts.
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

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

export function numberToWords(amount, currencyCode = 'INR') {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) {
    return 'Zero Only';
  }

  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  const isIndianSystem = ['INR', '₹', 'RS'].includes((currencyCode || '').toUpperCase());
  const wordsMain = isIndianSystem ? convertIndian(integerPart) : convertWestern(integerPart);

  let result = wordsMain;

  if (decimalPart > 0) {
    const decimalWords = convertBelowThousand(decimalPart);
    const fractionalUnit = isIndianSystem ? 'Paise' : 'Cents';
    result += ` and ${decimalWords} ${fractionalUnit}`;
  }

  return result ? `${result} Only` : 'Zero Only';
}
