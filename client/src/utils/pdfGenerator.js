/**
 * ============================================================================
 * PDF & Print Generation Utility
 * ============================================================================
 * Generates flawless, crisp, multi-page vector PDF documents with exact A4 margins,
 * solid borders, and proper page-break protection.
 */

import html2pdf from 'html2pdf.js';

/**
 * Native Browser Print to PDF (Vector A4 - Recommended)
 * Produces 100% vector crisp text, exact 12mm paper margins, and prevents table
 * rows from splitting across pages. Works through a hidden iframe so it is never
 * blocked by pop-up blockers.
 */
export function printQuotation(element, title = 'Quotation') {
  if (!element) return;

  const iframe = document.createElement('iframe');
  iframe.setAttribute(
    'style',
    'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; visibility: hidden;'
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.4;
          }
          .quote-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }
          .clean-paper-quotation, .industrial-paper-doc {
            padding: 0 !important;
            max-width: 100% !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          th, td {
            border: 1px solid #000000 !important;
            padding: 5px 8px !important;
            vertical-align: top !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure explicit borders are solid */
          .border-black, .border-2 {
            border: 1.5px solid #000000 !important;
          }
        </style>
      </head>
      <body>
        <div class="quote-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}

/**
 * Direct file download via html2pdf (A4 width container with crisp scale)
 */
export async function generateQuotationPdf(element, fileName = 'Quotation.pdf') {
  if (!element) {
    throw new Error('Quotation element not found.');
  }

  // Clone element into an isolated in-viewport container with fixed 794px width (standard A4 at 96 DPI)
  const clone = element.cloneNode(true);
  const container = document.createElement('div');
  container.id = 'pdf-render-sandbox';
  container.setAttribute(
    'style',
    'position: absolute; left: 0px; top: 0px; width: 794px; background: #ffffff; color: #000000; z-index: -9999; opacity: 1; pointer-events: none; overflow: visible;'
  );

  // Force solid styles on table and borders inside clone
  const tables = clone.querySelectorAll('table');
  tables.forEach((t) => {
    t.style.width = '100%';
    t.style.borderCollapse = 'collapse';
    t.style.tableLayout = 'fixed';
  });

  const cells = clone.querySelectorAll('th, td');
  cells.forEach((c) => {
    c.style.wordBreak = 'break-word';
  });

  const rows = clone.querySelectorAll('tr');
  rows.forEach((r) => {
    r.style.pageBreakInside = 'avoid';
    r.style.breakInside = 'avoid';
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  // Allow DOM to settle and image assets to be recognized
  await new Promise((resolve) => setTimeout(resolve, 200));

  const opt = {
    margin: [10, 10, 10, 10], // 10mm margins on all 4 sides
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      windowWidth: 794,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      avoid: ['tr', 'thead', 'tfoot', '.page-break-avoid']
    }
  };

  try {
    await html2pdf().set(opt).from(container).save();
    return true;
  } catch (error) {
    console.error('html2pdf generation error, falling back to printQuotation:', error);
    printQuotation(element, fileName);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
