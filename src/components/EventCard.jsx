import React from 'react';
import { 
  Calendar, Clock, MapPin, DollarSign, Users, 
  CheckSquare, ArrowRight, Edit2, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getCategoryMeta } from '../utils/helpers';
import CategoryBadge from './CategoryBadge';

export default function EventCard({ event, onSelect, onEdit, onDelete }) {
  const meta = getCategoryMeta(event.category);
  const stats = event.stats || {
    totalSpent: 0,
    attendingCount: 0,
    totalGuests: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskProgress: 0
  };

  const targetBudget = Number(event.targetBudget) || 0;
  const totalSpent = stats.totalSpent || 0;
  const budgetPct = targetBudget > 0 ? Math.min(100, Math.round((totalSpent / targetBudget) * 100)) : 0;
  const isOverBudget = targetBudget > 0 && totalSpent > targetBudget;

  return (
    <div
      onClick={() => onSelect(event)}
      className="group glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer border border-zinc-800/80 hover:border-purple-500/40"
    >
      {/* Top Banner Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient}`} />

      {/* Header with Category Badge and Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <CategoryBadge category={event.category} size="xs" />

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(event)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Edit event"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Event Title & Description */}
      <div className="space-y-1.5 mb-4">
        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      {/* Date, Time, Venue */}
      <div className="space-y-1.5 py-3 border-y border-zinc-800/60 text-xs text-zinc-300 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-semibold text-white">{formatDate(event.date)}</span>
          <span className="text-zinc-500">•</span>
          <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>{formatTime(event.time)}</span>
        </div>

        {event.venue && (
          <div className="flex items-center gap-2 text-zinc-400 truncate">
            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        )}
      </div>

      {/* Key Stats Bar: Budget, Guests, Tasks */}
      <div className="space-y-3">
        {/* Budget overview bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-purple-400" />
              Budget: {formatCurrency(totalSpent)}
            </span>
            <span className={isOverBudget ? 'text-rose-400 font-semibold' : 'text-zinc-400'}>
              Cap: {formatCurrency(targetBudget)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isOverBudget
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(100, budgetPct)}%` }}
            />
          </div>
        </div>

        {/* Footer Guest & Task Counters */}
        <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-zinc-200">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>{stats.attendingCount} Confirmed</span>
            </span>
            <span className="flex items-center gap-1 hover:text-zinc-200">
              <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>{stats.completedTasks}/{stats.totalTasks} Tasks</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-purple-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
