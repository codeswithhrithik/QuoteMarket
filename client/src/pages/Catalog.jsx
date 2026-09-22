/**
 * ============================================================================
 * Catalog & Materials Management Page
 * ============================================================================
 * Item and services master directory allowing rapid quotation composition.
 */

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Tag, 
  Percent, 
  Edit, 
  Trash2, 
  Layers 
} from 'lucide-react';
import { catalogAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CatalogModal from '../components/catalog/CatalogModal';

export default function Catalog() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await catalogAPI.getAll();
      setItems(res.data.items || []);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      addToast('Failed to fetch catalog items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await catalogAPI.delete(id);
      addToast('Item removed from catalog');
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete item', 'error');
    }
  };

  const categories = ['All', ...new Set(items.map((i) => i.category || 'General'))];

  const filteredItems = items.filter((it) => {
    const matchCat = categoryFilter === 'All' || it.category === categoryFilter;
    const matchSearch =
      !search ||
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.description && it.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const currency = user?.currency || '₹';

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Material & Item Catalog</h1>
          <p className="text-xs text-slate-500">Maintain reusable items, materials, and services with standard rates</p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Material
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search material or specifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading catalog items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No materials found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save materials here to quickly insert them into quotations with one click.
            </p>
            <button
              onClick={() => {
                setSelectedItem(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Material
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Material / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-right">Standard Rate</th>
                  <th className="py-3 px-4 text-center">Tax / GST</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((it) => (
                  <tr key={it._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{it.name}</p>
                      {it.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">{it.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {it.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {it.unit || 'pcs'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {currency} {formatMoney(it.defaultRate)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                      {it.taxRate ? `${it.taxRate}%` : '0%'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(it)}
                          title="Edit Item"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(it._id, it.name)}
                          title="Delete Item"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CatalogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={selectedItem}
        onSaved={() => fetchCatalog()}
      />
    </div>
  );
}
