import React from 'react';
import { 
  Sparkles, Calendar, DollarSign, Users, CheckSquare, 
  Plus, ArrowRight, TrendingUp, AlertCircle, Clock 
} from 'lucide-react';
import { formatCurrency, EVENT_CATEGORIES } from '../utils/helpers';
import EventCard from './EventCard';

export default function DashboardOverview({ 
  stats, 
  events, 
  activeCategory, 
  onSelectCategory, 
  onSelectEvent, 
  onOpenNewEvent, 
  onEditEvent, 
  onDeleteEvent 
}) {
  const overview = stats?.overview || {
    totalEvents: events.length,
    upcomingCount: events.length,
    totalTargetBudget: 0,
    totalActualSpent: 0,
    totalGuests: 0,
    totalAttendingGuests: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletionRate: 0
  };

  const categoryCounts = stats?.categoryCounts || {
    birthday: events.filter(e => e.category === 'birthday').length,
    wedding: events.filter(e => e.category === 'wedding').length,
    anniversary: events.filter(e => e.category === 'anniversary').length,
    party: events.filter(e => e.category === 'party').length
  };

  const budgetUsage = overview.totalTargetBudget > 0
    ? Math.round((overview.totalActualSpent / overview.totalTargetBudget) * 100)
    : 0;

  // Filter events based on active category
  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-purple-950/70 via-zinc-950 to-pink-950/60 border border-purple-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Celebration Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Create Unforgettable <span className="text-gradient-purple-pink">Celebrations</span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Seamlessly orchestrate birthdays, weddings, anniversaries, and parties with real-time budget tracking, RSVP guest lists, and interactive checklists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenNewEvent}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Celebration</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Celebrations */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Celebrations</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {overview.totalEvents}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
            <span className="text-purple-300 font-medium">{overview.upcomingCount} Upcoming</span>
            <span>•</span>
            <span>{overview.pastCount || 0} Past</span>
          </div>
        </div>

        {/* Global Budget Overview */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Committed Budget</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {formatCurrency(overview.totalActualSpent)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-pink-300 font-medium">Target: {formatCurrency(overview.totalTargetBudget)}</span>
            <span className="text-zinc-500">({budgetUsage}%)</span>
          </div>
        </div>

        {/* Guest RSVP Overview */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Attending Guests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {overview.totalAttendingGuests}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
            <span className="text-zinc-300 font-medium">{overview.totalPendingGuests} pending RSVPs</span>
            <span>•</span>
            <span>{overview.totalGuests} registered</span>
          </div>
        </div>

        {/* Checklist Milestones Completion */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Checklist Progress</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-300">
            {overview.taskCompletionRate}%
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
            <span className="text-zinc-300 font-medium">{overview.completedTasks} of {overview.totalTasks} done</span>
            {overview.overdueTasks > 0 && (
              <span className="text-rose-400 font-semibold">({overview.overdueTasks} overdue)</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Celebrations by Category</span>
          </h2>
          <span className="text-xs text-zinc-400">Click a category to filter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* All Filter */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeCategory === 'all'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                : 'glass-panel hover:bg-zinc-850/60 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">✨</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {overview.totalEvents}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-200">All Events</div>
            <div className="text-[11px] text-zinc-400">Entire portfolio</div>
          </button>

          {/* Birthday */}
          <button
            onClick={() => onSelectCategory('birthday')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeCategory === 'birthday'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                : 'glass-panel hover:bg-zinc-850/60 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">🎂</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                {categoryCounts.birthday || 0}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Birthdays</div>
            <div className="text-[11px] text-zinc-400">Parties & galas</div>
          </button>

          {/* Wedding */}
          <button
            onClick={() => onSelectCategory('wedding')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeCategory === 'wedding'
                ? 'bg-pink-950/60 border-pink-500 text-white shadow-lg shadow-pink-950/40 ring-1 ring-pink-500/50'
                : 'glass-panel hover:bg-zinc-850/60 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">💍</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/30">
                {categoryCounts.wedding || 0}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Weddings</div>
            <div className="text-[11px] text-zinc-400">Ceremonies & feasts</div>
          </button>

          {/* Anniversary */}
          <button
            onClick={() => onSelectCategory('anniversary')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeCategory === 'anniversary'
                ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/40 ring-1 ring-fuchsia-500/50'
                : 'glass-panel hover:bg-zinc-850/60 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">🥂</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/30">
                {categoryCounts.anniversary || 0}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Anniversaries</div>
            <div className="text-[11px] text-zinc-400">Milestone renewals</div>
          </button>

          {/* Party */}
          <button
            onClick={() => onSelectCategory('party')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeCategory === 'party'
                ? 'bg-violet-950/60 border-violet-500 text-white shadow-lg shadow-violet-950/40 ring-1 ring-violet-500/50'
                : 'glass-panel hover:bg-zinc-850/60 text-zinc-400 hover:text-white border-zinc-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">🎉</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-500/30">
                {categoryCounts.party || 0}
              </span>
            </div>
            <div className="text-xs font-bold text-zinc-200">Parties & Soirees</div>
            <div className="text-[11px] text-zinc-400">Nightlife & mixers</div>
          </button>
        </div>
      </div>

      {/* Events Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {activeCategory === 'all' ? 'All Upcoming Celebrations' : `${EVENT_CATEGORIES[activeCategory]?.label || activeCategory} Celebrations`}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
              {filteredEvents.length}
            </span>
          </div>

          <button
            onClick={onOpenNewEvent}
            className="text-xs font-semibold text-purple-400 hover:text-pink-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-dashed border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No celebrations found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              There are no {activeCategory !== 'all' ? activeCategory : ''} celebrations currently scheduled. Click below to start planning!
            </p>
            <button
              onClick={onOpenNewEvent}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create Celebration</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onSelect={onSelectEvent}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
