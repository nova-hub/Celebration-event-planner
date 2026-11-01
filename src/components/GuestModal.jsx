import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Phone, Users, CheckSquare, Utensils } from 'lucide-react';

export default function GuestModal({ isOpen, onClose, onSave, guestToEdit = null, eventId }) {
  const isEditing = Boolean(guestToEdit);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    plusOnes: 0,
    dietaryRestrictions: 'None',
    tableGroup: 'General',
    invitationSent: false,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (guestToEdit) {
      setFormData({
        name: guestToEdit.name || '',
        email: guestToEdit.email || '',
        phone: guestToEdit.phone || '',
        rsvpStatus: guestToEdit.rsvpStatus || 'pending',
        plusOnes: guestToEdit.plusOnes !== undefined ? guestToEdit.plusOnes : 0,
        dietaryRestrictions: guestToEdit.dietaryRestrictions || 'None',
        tableGroup: guestToEdit.tableGroup || 'General',
        invitationSent: Boolean(guestToEdit.invitationSent),
        notes: guestToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        rsvpStatus: 'pending',
        plusOnes: 0,
        dietaryRestrictions: 'None',
        tableGroup: 'General',
        invitationSent: false,
        notes: ''
      });
    }
    setErrors({});
  }, [guestToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Guest name is required';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    const plus = Number(formData.plusOnes);
    if (isNaN(plus) || plus < 0) {
      newErrors.plusOnes = 'Plus ones must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        plusOnes: Number(formData.plusOnes) || 0
      });
      onClose();
    } catch (err) {
      console.error('Error saving guest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-r from-purple-950/40 to-pink-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Guest Details' : 'Add New Guest'}
              </h2>
              <p className="text-xs text-zinc-400">Manage RSVPs, plus-ones, and dietary needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Guest Full Name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Julian Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="julian@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.email ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                RSVP Status
              </label>
              <select
                value={formData.rsvpStatus}
                onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="attending" className="bg-zinc-900 text-emerald-400">🟢 Attending (Confirmed)</option>
                <option value="pending" className="bg-zinc-900 text-amber-400">🟡 Awaiting RSVP</option>
                <option value="declined" className="bg-zinc-900 text-rose-400">🔴 Respectfully Declined</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Additional Plus-Ones
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.plusOnes}
                onChange={(e) => setFormData({ ...formData, plusOnes: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.plusOnes ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
              {errors.plusOnes && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.plusOnes}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Dietary Preferences
              </label>
              <input
                type="text"
                placeholder="e.g. Vegetarian, Gluten-Free, Halal"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Table / Seating Group
              </label>
              <input
                type="text"
                placeholder="e.g. Table 2, VIP Lounge, Family"
                value={formData.tableGroup}
                onChange={(e) => setFormData({ ...formData, tableGroup: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Invitation Sent Toggle */}
          <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <input
              type="checkbox"
              id="invitationSent"
              checked={formData.invitationSent}
              onChange={(e) => setFormData({ ...formData, invitationSent: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-zinc-800 border-zinc-700"
            />
            <label htmlFor="invitationSent" className="text-sm font-medium text-zinc-300 cursor-pointer select-none">
              Invitation / Save-the-Date has been sent
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Special Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Needs ramp access; childhood friend from London"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Guest' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
