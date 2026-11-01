import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, Sparkles, FileText } from 'lucide-react';
import { EVENT_CATEGORIES, triggerCelebrationConfetti } from '../utils/helpers';

export default function EventModal({ isOpen, onClose, onSave, eventToEdit = null }) {
  const isEditing = Boolean(eventToEdit);

  const [formData, setFormData] = useState({
    title: '',
    category: 'birthday',
    date: '',
    time: '18:00',
    venue: '',
    targetBudget: '',
    description: '',
    notes: '',
    status: 'planning',
    coverTheme: 'purple-pink'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        category: eventToEdit.category || 'birthday',
        date: eventToEdit.date || '',
        time: eventToEdit.time || '18:00',
        venue: eventToEdit.venue || '',
        targetBudget: eventToEdit.targetBudget || '',
        description: eventToEdit.description || '',
        notes: eventToEdit.notes || '',
        status: eventToEdit.status || 'planning',
        coverTheme: eventToEdit.coverTheme || 'purple-pink'
      });
    } else {
      // Default to 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      const defaultDateStr = defaultDate.toISOString().split('T')[0];

      setFormData({
        title: '',
        category: 'birthday',
        date: defaultDateStr,
        time: '18:00',
        venue: '',
        targetBudget: '',
        description: '',
        notes: '',
        status: 'planning',
        coverTheme: 'purple-pink'
      });
    }
    setErrors({});
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const d = new Date(formData.date);
      if (isNaN(d.getTime())) {
        newErrors.date = 'Please enter a valid date';
      }
    }

    if (formData.targetBudget !== '' && formData.targetBudget !== null) {
      const num = Number(formData.targetBudget);
      if (isNaN(num) || num < 0) {
        newErrors.targetBudget = 'Budget must be a non-negative number';
      }
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
        targetBudget: formData.targetBudget ? Number(formData.targetBudget) : 0
      });

      if (!isEditing) {
        triggerCelebrationConfetti();
      }
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-purple-950/30 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-pink-950/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Celebration Event' : 'Create New Celebration'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isEditing ? 'Update your event details and budget goals' : 'Plan an unforgettable milestone celebration'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Celebration Category <span className="text-pink-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(EVENT_CATEGORIES).map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${cat.border} ${cat.badgeBg} shadow-lg ring-1 ring-purple-500/40 scale-[1.02]`
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Celebration Title <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sophia's 25th Enchanted Birthday Gala"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.title ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.title}</p>}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Date <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.date ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                />
              </div>
              {errors.date && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Venue & Target Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Venue / Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Skyline Rooftop, Beverly Hills"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Budget ($ USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 5000"
                  value={formData.targetBudget}
                  onChange={(e) => setFormData({ ...formData, targetBudget: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.targetBudget ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                />
              </div>
              {errors.targetBudget && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.targetBudget}</p>}
            </div>
          </div>

          {/* Status & Theme Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Planning Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="planning" className="bg-zinc-900 text-white">🗓️ Planning in Progress</option>
                <option value="confirmed" className="bg-zinc-900 text-white">✨ Confirmed & Ready</option>
                <option value="completed" className="bg-zinc-900 text-white">🏆 Celebrated / Completed</option>
                <option value="cancelled" className="bg-zinc-900 text-white">❌ Postponed / Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Visual Glow Theme
              </label>
              <select
                value={formData.coverTheme}
                onChange={(e) => setFormData({ ...formData, coverTheme: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="purple-pink" className="bg-zinc-900 text-white">💜 Purple & Soft Pink Glow</option>
                <option value="purple" className="bg-zinc-900 text-white">🔮 Deep Velvet Obsidian Purple</option>
                <option value="soft-pink" className="bg-zinc-900 text-white">🌸 Blush & Rose Gold</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Celebration Theme / Description
            </label>
            <textarea
              rows="3"
              placeholder="Describe the aesthetic, dress code, schedule highlights, or special surprises..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Celebration' : 'Create Celebration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
