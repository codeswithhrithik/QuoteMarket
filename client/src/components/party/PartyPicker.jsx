/**
 * ============================================================================
 * Party Picker Component
 * ============================================================================
 * In-form party selection with instant auto-population of address, receiver name,
 * and quick-action button to create new parties on the fly.
 */

import React, { useState } from 'react';
import { Building, Plus, User, MapPin, Phone, Mail, Hash } from 'lucide-react';
import PartyModal from './PartyModal';

export default function PartyPicker({
  parties = [],
  selectedPartyId = null,
  partyData = {},
  onChange,
  onPartyCreated
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectParty = (e) => {
    const pId = e.target.value;
    if (pId === 'new') {
      setModalOpen(true);
      return;
    }

    if (!pId) {
      onChange({
        partyId: null,
        party: {
          name: '',
          receiverName: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          phone: '',
          email: '',
          taxId: ''
        }
      });
      return;
    }

    const found = parties.find((p) => p._id === pId);
    if (found) {
      onChange({
        partyId: found._id,
        party: {
          name: found.name,
          receiverName: found.receiverName || '',
          address: found.address || '',
          city: found.city || '',
          state: found.state || '',
          pincode: found.pincode || '',
          phone: found.phone || '',
          email: found.email || '',
          taxId: found.taxId || ''
        }
      });
    }
  };

  const handlePartyFieldChange = (field, value) => {
    onChange({
      partyId: selectedPartyId,
      party: {
        ...partyData,
        [field]: value
      }
    });
  };

  const handleNewPartySaved = (newParty) => {
    if (onPartyCreated) onPartyCreated(newParty);
    onChange({
      partyId: newParty._id,
      party: {
        name: newParty.name,
        receiverName: newParty.receiverName || '',
        address: newParty.address || '',
        city: newParty.city || '',
        state: newParty.state || '',
        pincode: newParty.pincode || '',
        phone: newParty.phone || '',
        email: newParty.email || '',
        taxId: newParty.taxId || ''
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header with Quick Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quotation For (Party / Client)</h3>
            <p className="text-xs text-slate-500">Select an existing party or enter new details</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Party
        </button>
      </div>

      {/* Select Existing Party Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Saved Client / Party
        </label>
        <select
          value={selectedPartyId || ''}
          onChange={handleSelectParty}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 outline-none"
        >
          <option value="">-- Choose Party or Type Below --</option>
          {parties.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} {p.receiverName ? `(Attn: ${p.receiverName})` : ''} - {p.city || p.phone || 'Client'}
            </option>
          ))}
          <option value="new">+ Register New Party...</option>
        </select>
      </div>

      {/* Editable Party Fields for this Quote */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Party / Organization Name */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Party / Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Apex Corporation"
            value={partyData?.name || ''}
            onChange={(e) => handlePartyFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>

        {/* Contact / Receiver Person */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Attn / Receiver Name
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="e.g. John Doe (Procurement Manager)"
              value={partyData?.receiverName || ''}
              onChange={(e) => handlePartyFieldChange('receiverName', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* GSTIN / Tax ID */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Client Tax ID / GSTIN
          </label>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={partyData?.taxId || ''}
              onChange={(e) => handlePartyFieldChange('taxId', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Billing / Delivery Address
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="Address line / Site Location"
              value={partyData?.address || ''}
              onChange={(e) => handlePartyFieldChange('address', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Phone / WhatsApp Number
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={partyData?.phone || ''}
              onChange={(e) => handlePartyFieldChange('phone', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            <input
              type="email"
              placeholder="client@company.com"
              value={partyData?.email || ''}
              onChange={(e) => handlePartyFieldChange('email', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Modal for creating a new party */}
      <PartyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleNewPartySaved}
      />
    </div>
  );
}
