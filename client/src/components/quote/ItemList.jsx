/**
 * ============================================================================
 * Item List & Material Calculator Component
 * ============================================================================
 * Handles line-item manipulation (add, remove, update), quick catalog picking,
 * 18% GST quick presets, live subtotal/tax/discount calculations,
 * and real-time Amount in Words.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Package, Sparkles, FileText, Zap } from 'lucide-react';
import { numberToWords } from '../../utils/numberToWords';

export default function ItemList({
  items = [],
  catalog = [],
  currency = '₹',
  currencyCode = 'INR',
  onChange
}) {
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate line item taxable total (Rate x Qty - Discount). GST is calculated in the final summary box.
  const computeLineTotal = (qty, rate, discountPercent = 0) => {
    const q = Math.max(0, Number(qty) || 0);
    const r = Math.max(0, Number(rate) || 0);
    const disc = Math.min(100, Math.max(0, Number(discountPercent) || 0));

    const base = q * r;
    const discAmt = (base * disc) / 100;
    const afterDisc = base - discAmt;
    return Number(afterDisc.toFixed(2));
  };

  // Update a specific field of an item row
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    item.amount = computeLineTotal(item.qty, item.rate, item.discountPercent);
    updated[index] = item;
    onChange(updated);
  };

  // Add a blank custom item row (defaults to 18% GST)
  const handleAddBlankRow = () => {
    const newItem = {
      itemId: null,
      name: '',
      description: '',
      qty: 1,
      unit: 'pcs',
      rate: 0,
      discountPercent: 0,
      taxPercent: 18,
      amount: 0
    };
    onChange([...items, newItem]);
  };

  // Apply 18% GST across all items
  const handleApply18GstToAll = () => {
    const updated = items.map((it) => ({
      ...it,
      taxPercent: 18,
      amount: computeLineTotal(it.qty, it.rate, it.discountPercent)
    }));
    onChange(updated);
  };

  // Add item picked from catalog
  const handleAddFromCatalog = (catalogId) => {
    if (!catalogId) return;
    const catItem = catalog.find((c) => c._id === catalogId);
    if (!catItem) return;

    const tax = catItem.taxRate !== undefined && catItem.taxRate !== null ? Number(catItem.taxRate) : 18;
    const newItem = {
      itemId: catItem._id,
      name: catItem.name,
      description: catItem.description || '',
      qty: 1,
      unit: catItem.unit || 'pcs',
      rate: Number(catItem.defaultRate) || 0,
      discountPercent: 0,
      taxPercent: tax,
      amount: computeLineTotal(1, catItem.defaultRate, 0)
    };

    onChange([...items, newItem]);
    setSelectedCatalogId('');
  };

  // Remove row
  const handleRemoveRow = (index) => {
    if (items.length <= 1) {
      // Keep at least one empty row with 18% tax
      onChange([{
        itemId: null,
        name: '',
        description: '',
        qty: 1,
        unit: 'pcs',
        rate: 0,
        discountPercent: 0,
        taxPercent: 18,
        amount: 0
      }]);
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Compute overall summary totals
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  items.forEach((it) => {
    const q = Math.max(0, Number(it.qty) || 0);
    const r = Math.max(0, Number(it.rate) || 0);
    const disc = Math.min(100, Math.max(0, Number(it.discountPercent) || 0));
    const tax = Math.max(0, Number(it.taxPercent !== undefined ? it.taxPercent : 18));

    const base = q * r;
    const discAmt = (base * disc) / 100;
    const afterDisc = base - discAmt;
    const taxAmt = (afterDisc * tax) / 100;

    subtotal += base;
    totalDiscount += discAmt;
    totalTax += taxAmt;
  });

  const grandTotal = Number((subtotal - totalDiscount + totalTax).toFixed(2));
  const wordsAmount = numberToWords(grandTotal, currencyCode);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header & Catalog Quick Add & 18% GST Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Materials & Line Items</h3>
            <p className="text-xs text-slate-500">Configure item names, quantities, unit rates and discounts</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Add From Catalog dropdown */}
          <select
            value={selectedCatalogId}
            onChange={(e) => handleAddFromCatalog(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-indigo-200 bg-indigo-50/50 text-indigo-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          >
            <option value="">+ From Catalog...</option>
            {catalog.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({currency} {cat.defaultRate}/{cat.unit})
              </option>
            ))}
          </select>

          {/* Add custom item */}
          <button
            type="button"
            onClick={handleAddBlankRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Items List: Clean, Spacious, Highly Structured UI */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white hover:bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5 transition-all"
          >
            {/* Top Row: Item Index Badge, Full-Width Name, Line Total, Trash Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Item / Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Ton Electric Overhead Traveling Crane Single Girder"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Line Total & Remove Action */}
              <div className="flex items-center justify-end gap-3 shrink-0 sm:pt-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Line Total
                  </span>
                  <span className="text-sm font-black text-blue-900">
                    {currency} {formatMoney(item.amount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle Row: Clean, Spacious, Perfectly Proportioned Control Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50/90 p-4 rounded-xl border border-slate-200">
              {/* 1. Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
                />
              </div>

              {/* 2. Unit */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="pcs / set / kg"
                  value={item.unit || 'pcs'}
                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
                />
              </div>

              {/* 3. Rate */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Rate ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={item.rate}
                  onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-right"
                />
              </div>

              {/* 4. GST Tax % with quick 18% badge */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    GST %
                  </label>
                  <button
                    type="button"
                    onClick={() => handleItemChange(idx, 'taxPercent', 18)}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                      Number(item.taxPercent) === 18
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                    title="Set to standard 18% GST"
                  >
                    18%
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="18"
                  value={item.taxPercent !== undefined ? item.taxPercent : 18}
                  onChange={(e) => handleItemChange(idx, 'taxPercent', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
                />
              </div>

              {/* 5. Discount % */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="0"
                  value={item.discountPercent || ''}
                  onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-emerald-700 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
                />
              </div>
            </div>

            {/* Description Row: Wide, Comfortable Multi-Line Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Item Description & Technical Specifications</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Readable multi-line text editor (wraps cleanly in quotation)
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Enter technical specifications, dimensions, scope of work, warranty details, site work notes, etc..."
                value={item.description || ''}
                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none font-sans leading-relaxed resize-y shadow-inner transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button below items container */}
      <div className="pt-1 flex items-center justify-start">
        <button
          type="button"
          onClick={handleAddBlankRow}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          + Add Item
        </button>
      </div>

      {/* Bottom Calculations & Dynamic Amount in Words */}
      <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-start justify-between gap-6">
        {/* Total in Words Display Box */}
        <div className="flex-1 w-full bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Amount in Words (Calculated Automatically)
          </div>
          <p className="text-sm font-semibold text-slate-800 italic">
            "{wordsAmount}"
          </p>
        </div>

        {/* Compact, Refined Financial Summary Box */}
        <div className="w-full md:w-64 bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800">
              {currency} {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 text-[11px]">
              <span>Discount:</span>
              <span className="font-semibold">
                - {currency} {totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 text-[11px]">
            <span>GST (18%):</span>
            <span className="font-semibold text-slate-800">
              + {currency} {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-xs font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="text-sm font-black text-blue-600">
              {currency} {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
