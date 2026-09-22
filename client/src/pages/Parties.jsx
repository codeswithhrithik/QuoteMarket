/**
 * ============================================================================
 * Parties (Clients / Customers) Management Page
 * ============================================================================
 * Directory of clients with search, creation, modification, and direct quotation links.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit, 
  FileText 
} from 'lucide-react';
import { partyAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import PartyModal from '../components/party/PartyModal';

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const { addToast } = useToast();

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await partyAPI.getAll();
      setParties(res.data.parties || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
      addToast('Failed to fetch parties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleEdit = (party) => {
    setSelectedParty(party);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await partyAPI.delete(id);
      addToast('Party deleted successfully');
      setParties((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete party', 'error');
    }
  };

  const filteredParties = parties.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.receiverName && p.receiverName.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Parties & Clients</h1>
          <p className="text-xs text-slate-500">Manage client contact information and billing addresses</p>
        </div>
        <button
          onClick={() => {
            setSelectedParty(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Party
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search party by name, receiver, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold shrink-0">
          Total: {filteredParties.length}
        </span>
      </div>

      {/* Parties Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading parties...</div>
      ) : filteredParties.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No parties registered yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add parties to quickly auto-populate recipient details in your quotations.
          </p>
          <button
            onClick={() => {
              setSelectedParty(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Party
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredParties.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h3>
                      {p.receiverName && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          Attn: {p.receiverName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-[11px] text-slate-500">
                        {p.address}
                        {p.city && `, ${p.city}`}
                        {p.state && `, ${p.state}`}
                      </span>
                    </div>
                  )}
                  {p.taxId && (
                    <p className="text-[11px] font-medium text-slate-400 pt-1">
                      GSTIN/Tax: <span className="text-slate-700">{p.taxId}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to="/quotes/new"
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  New Quote
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(p)}
                    title="Edit Party"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    title="Delete Party"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PartyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={selectedParty}
        onSaved={() => fetchParties()}
      />
    </div>
  );
}
