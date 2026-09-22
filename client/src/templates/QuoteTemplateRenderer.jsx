/**
 * ============================================================================
 * Quote Template Renderer
 * ============================================================================
 * Switches and renders the exact template chosen by user or customer.
 * Uses forwardRef to enable direct PDF conversion and high-res capture.
 */

import React, { forwardRef } from 'react';
import TemplateCleanPaper from './TemplateCleanPaper';
import TemplateIndustrialPaper from './TemplateIndustrialPaper';
import TemplateClassic from './TemplateClassic';
import TemplateModern from './TemplateModern';
import TemplateSlate from './TemplateSlate';
import TemplateIndigo from './TemplateIndigo';

const QuoteTemplateRenderer = forwardRef(({ quote, owner = {} }, ref) => {
  if (!quote) return null;

  const templateId = quote.templateId || 'clean-paper';

  const renderTemplate = () => {
    switch (templateId) {
      case 'clean-paper':
        return <TemplateCleanPaper quote={quote} owner={owner} />;
      case 'industrial-paper':
        return <TemplateIndustrialPaper quote={quote} owner={owner} />;
      case 'classic-corporate':
        return <TemplateClassic quote={quote} owner={owner} />;
      case 'executive-slate':
        return <TemplateSlate quote={quote} owner={owner} />;
      case 'clean-indigo':
        return <TemplateIndigo quote={quote} owner={owner} />;
      case 'modern-minimal':
        return <TemplateModern quote={quote} owner={owner} />;
      default:
        return <TemplateCleanPaper quote={quote} owner={owner} />;
    }
  };

  return (
    <div ref={ref} className="quote-print-container w-full bg-white print:m-0 print:p-0">
      {renderTemplate()}
    </div>
  );
});

QuoteTemplateRenderer.displayName = 'QuoteTemplateRenderer';

export default QuoteTemplateRenderer;
