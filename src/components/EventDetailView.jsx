import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Clock, MapPin, DollarSign, 
  Users, CheckSquare, Edit2, Trash2, Sparkles, 
  Share2, FileText, CheckCircle2 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getCategoryMeta } from '../utils/helpers';
import CategoryBadge from './CategoryBadge';
import BudgetPlanner from './BudgetPlanner';
import GuestManager from './GuestManager';
import ChecklistView from './ChecklistView';

export default function EventDetailView({ 
  event, 
  onBack, 
  onEditEvent, 
  onDeleteEvent,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddGuest,
  onUpdateGuest,
  onUpdateRsvp,
  onDeleteGuest,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, budget, guests, checklist

  const meta = getCategoryMeta(event.category);
  const stats = event.stats || {};

  // Calculate days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget Planner', icon: <DollarSign className="w-4 h-4" />, badge: event.expenses?.length || 0 },
    { id: 'guests', label: 'Guest List & RSVPs', icon: <Users className="w-4 h-4" />, badge: event.guests?.length || 0 },
    { id: 'checklist', label: 'Planning Checklist', icon: <CheckSquare className="w-4 h-4" />, badge: `${stats.completedTasks || 0}/${stats.totalTasks || 0}` }
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar with Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Celebrations</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditEvent(event)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Edit Event</span>
          </button>
          <button
            onClick={() => onDeleteEvent(event)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Event Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-zinc-950 border border-zinc-800 shadow-2xl">
        {/* Glow ambient background */}
        <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${meta.gradient} rounded-full blur-3xl opacity-30 pointer-events-none`} />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CategoryBadge category={event.category} size="md" />

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                event.status === 'confirmed'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : event.status === 'completed'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {event.status === 'planning' && '🗓️ Planning'}
                {event.status === 'confirmed' && '✨ Confirmed'}
                {event.status === 'completed' && '🏆 Completed'}
                {event.status === 'cancelled' && '❌ Cancelled'}
              </span>

              {diffDays >= 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-950/60 text-pink-300 border border-pink-500/40">
                  {diffDays === 0 ? 'Today is the day! 🎉' : `${diffDays} days away`}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400">
                  Past Celebration
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {event.title}
          </h1>

          {/* Date, Time, Venue Pills */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white">{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>{formatTime(event.time)}</span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-md truncate">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-black/30 text-white font-extrabold' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target vs Spent */}
            <div 
              onClick={() => setActiveTab('budget')}
              className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border border-zinc-800/80 hover:border-purple-500/40"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
                <span>Budget Status</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {formatCurrency(stats.totalSpent || 0)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Target: {formatCurrency(stats.targetBudget || 0)} ({stats.budgetUsedPercentage || 0}% spent)
              </div>
            </div>

            {/* Confirmed Guests */}
            <div 
              onClick={() => setActiveTab('guests')}
              className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border border-zinc-800/80 hover:border-pink-500/40"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
                <span>Guest Roster</span>
                <Users className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {stats.attendingCount || 0} Attending
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {stats.pendingGuests || 0} pending • {stats.totalGuests || 0} registered
              </div>
            </div>

            {/* Checklist Tasks */}
            <div 
              onClick={() => setActiveTab('checklist')}
              className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer border border-zinc-800/80 hover:border-purple-500/40"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
                <span>Planning Checklist</span>
                <CheckSquare className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-extrabold text-purple-300">
                {stats.taskProgress || 0}% Done
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {stats.completedTasks || 0} of {stats.totalTasks || 0} tasks finished
              </div>
            </div>
          </div>

          {/* Description & Special Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider border-b border-zinc-800 pb-3">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Celebration Concept & Theme</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description provided. Click "Edit Event" to specify theme notes, dress code, and details.'}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider border-b border-zinc-800 pb-3">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Special Instructions & Logistics</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {event.notes || 'No special instructions recorded. Add vendor contact details, setup times, or parking guidelines.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Planner Tab */}
      {activeTab === 'budget' && (
        <BudgetPlanner
          event={event}
          onAddExpense={onAddExpense}
          onUpdateExpense={onUpdateExpense}
          onDeleteExpense={onDeleteExpense}
        />
      )}

      {/* Guest Management Tab */}
      {activeTab === 'guests' && (
        <GuestManager
          event={event}
          onAddGuest={onAddGuest}
          onUpdateGuest={onUpdateGuest}
          onUpdateRsvp={onUpdateRsvp}
          onDeleteGuest={onDeleteGuest}
        />
      )}

      {/* Planning Checklist Tab */}
      {activeTab === 'checklist' && (
        <ChecklistView
          event={event}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
}
