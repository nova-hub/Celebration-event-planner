import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, Flag, User, FileText } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit = null, eventId }) {
  const isEditing = Boolean(taskToEdit);

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    notes: '',
    completed: false
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        category: taskToEdit.category || 'General',
        dueDate: taskToEdit.dueDate || '',
        priority: taskToEdit.priority || 'medium',
        assignedTo: taskToEdit.assignedTo || '',
        notes: taskToEdit.notes || '',
        completed: Boolean(taskToEdit.completed)
      });
    } else {
      setFormData({
        title: '',
        category: 'General',
        dueDate: '',
        priority: 'medium',
        assignedTo: '',
        notes: '',
        completed: false
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const taskCategories = [
    'Venue',
    'Food & Drink',
    'Decor & Styling',
    'Invitations & RSVP',
    'Entertainment & DJ',
    'Photography & Video',
    'Attire & Glam',
    'Logistics & Schedule',
    'General'
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
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Checklist Task' : 'Add Planning Task'}
              </h2>
              <p className="text-xs text-zinc-400">Keep milestones on track with deadlines and priority</p>
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
              Task Description <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Schedule cake tasting and finalize flavor selection"
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
                {taskCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="high" className="bg-zinc-900 text-rose-400">🔴 High Priority (Urgent)</option>
                <option value="medium" className="bg-zinc-900 text-amber-400">🟡 Medium Priority</option>
                <option value="low" className="bg-zinc-900 text-zinc-400">⚪ Low Priority (Flexible)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Assigned Person
              </label>
              <input
                type="text"
                placeholder="e.g. Elena, Marcus, Coordinator"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Task Notes / Instructions
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Need gluten-free option for two guests; phone number: 555-0192"
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
              {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
