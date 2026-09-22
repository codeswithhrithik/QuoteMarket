/**
 * ============================================================================
 * Catalog Item / Material Modal
 * ============================================================================
 * Form dialog to create or edit materials, products, and services in catalog.
 */

import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Percent, Layers } from 'lucide-react';
import { catalogAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CatalogModal({ isOpen, onClose, onSaved, initialData = null }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'pcs',
    defaultRate: '',
    taxRate: '0',
    category: 'General'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        unit: initialData.unit || 'pcs',
        defaultRate: initialData.defaultRate || '',
        taxRate: initialData.taxRate !== undefined ? initialData.taxRate : '0',
        category: initialData.category || 'General'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unit: 'pcs',
        defaultRate: '',
        taxRate: '0',
        category: 'General'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Item / Material name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (initialData?._id) {
        res = await catalogAPI.update(initialData._id, formData);
        addToast('Catalog item updated!');
      } else {
        res = await catalogAPI.create(formData);
        addToast('New material added to catalog!');
      }
      if (onSaved) onSaved(res.data.item);
      onClose();
    } catch (error) {
      console.error('Save catalog item error:', error);
      addToast(error.response?.data?.message || 'Failed to save material', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Material / Item' : 'Add Material to Catalog'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Material / Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Commercial Plywood 19mm / Wall Primer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Specifications
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Waterproof grade, calibrated surface finish"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Rate / Unit Price
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={formData.defaultRate}
                onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measurement
              </label>
              <input
                type="text"
                placeholder="pcs, sq ft, kg, hrs, set, etc."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Tax / GST %
              </label>
              <input
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="0"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Materials, Hardware, Labor"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Material' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
