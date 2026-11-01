import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, FileText } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, onSave, expenseToEdit = null, eventId }) {
  const isEditing = Boolean(expenseToEdit);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Venue',
    amount: '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        category: expenseToEdit.category || 'Venue',
        amount: expenseToEdit.amount || '',
        status: expenseToEdit.status || 'pending',
        date: expenseToEdit.date || new Date().toISOString().split('T')[0],
        notes: expenseToEdit.notes || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'Venue',
        amount: '',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setErrors({});
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title or vendor is required';
    }

    if (formData.amount === '' || formData.amount === null) {
      newErrors.amount = 'Amount is required';
    } else {
      const num = Number(formData.amount);
      if (isNaN(num) || num <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
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
        amount: Number(formData.amount)
      });
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'Venue',
    'Catering',
    'Cake',
    'Photography',
    'Entertainment',
    'Decor',
    'Attire',
    'Invitations',
    'Transportation',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-r from-purple-950/40 to-pink-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Expense Item' : 'Add Expense / Vendor Cost'}
              </h2>
              <p className="text-xs text-zinc-400">Track costs against your celebration budget</p>
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
              Expense / Vendor Name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Master Patisserie 3-Tier Cake"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.title ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Amount ($ USD) <span className="text-pink-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 850"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
              {errors.amount && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Payment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="pending" className="bg-zinc-900 text-amber-400">⏳ Pending Payment</option>
                <option value="paid" className="bg-zinc-900 text-emerald-400">✅ Paid in Full</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Date Incurred / Due
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Invoice or Vendor Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. 50% deposit paid; remaining balance due week of event"
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
              {submitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
