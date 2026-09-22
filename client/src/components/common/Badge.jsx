/**
 * ============================================================================
 * Badge Component
 * ============================================================================
 * Renders colored status badges for quotation lifecycles.
 */

import React from 'react';

const STATUS_STYLES = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-300',
  Pending: 'bg-amber-50 text-amber-700 border-amber-300',
  'In Process': 'bg-blue-50 text-blue-700 border-blue-300',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-300',
  Expired: 'bg-purple-50 text-purple-700 border-purple-300'
};

const STATUS_DOTS = {
  Draft: 'bg-slate-400',
  Pending: 'bg-amber-500 animate-pulse',
  'In Process': 'bg-blue-500 animate-pulse',
  Approved: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
  Expired: 'bg-purple-400'
};

export default function Badge({ status = 'Draft', className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Draft;
  const dot = STATUS_DOTS[status] || STATUS_DOTS.Draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
