import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Plus, Sparkles, Eye 
} from 'lucide-react';
import { getCategoryMeta, formatDate, formatTime } from '../utils/helpers';
import CategoryBadge from './CategoryBadge';

export default function CalendarView({ events, onSelectEvent, onOpenNewEventWithDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayEvents(null);
  };

  // Build calendar matrix
  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      dateString: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dayStr = String(i).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      dateString: `${year}-${monthStr}-${dayStr}`
    });
  }

  // Next month leading days to complete grid (up to 35 or 42 cells)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const dayStr = String(i).padStart(2, '0');
    const monthStr = String(month + 2 > 12 ? 1 : month + 2).padStart(2, '0');
    const yearVal = month + 2 > 12 ? year + 1 : year;
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateString: `${yearVal}-${monthStr}-${dayStr}`
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventsForDay = (dateStr) => {
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (dayObj) => {
    const dayEvents = getEventsForDay(dayObj.dateString);
    setSelectedDayEvents({
      date: dayObj.dateString,
      events: dayEvents
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-zinc-400">Monthly schedule of all celebrations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-700/60 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Side Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* The 7-Day Grid */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl lg:col-span-3 overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-bold uppercase tracking-wider text-zinc-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day.dateString);
              const isToday = day.dateString === todayStr;
              const isSelected = selectedDayEvents && selectedDayEvents.date === day.dateString;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[75px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    !day.isCurrentMonth
                      ? 'bg-zinc-950/20 border-zinc-900/60 text-zinc-600'
                      : isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/40 text-white'
                      : isToday
                      ? 'bg-purple-950/20 border-pink-500/50 text-white'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850/60 text-zinc-300'
                  }`}
                >
                  {/* Top Day Number & Dot */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-[11px]'
                          : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                    )}
                  </div>

                  {/* Events list in the cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const meta = getCategoryMeta(ev.category);
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 hover:brightness-125 transition-all ${meta.badgeBg}`}
                          title={`${ev.title} (${formatTime(ev.time)})`}
                        >
                          <span>{meta.icon}</span>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-semibold text-purple-300 block text-right">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-1 space-y-4">
          <div className="border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedDayEvents ? formatDate(selectedDayEvents.date) : 'Day Details'}
            </h3>
            <p className="text-xs text-zinc-400">
              {selectedDayEvents
                ? `${selectedDayEvents.events.length} celebrations scheduled`
                : 'Click any calendar date to view or add celebrations'}
            </p>
          </div>

          {selectedDayEvents && (
            <div className="space-y-3">
              {selectedDayEvents.events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-500 mb-3">No celebrations on this day yet.</p>
                  <button
                    onClick={() => onOpenNewEventWithDate(selectedDayEvents.date)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Plan Event Here
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <CategoryBadge category={ev.category} size="xs" />
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {formatTime(ev.time)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{ev.title}</h4>

                      {ev.venue && (
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </p>
                      )}

                      <button
                        onClick={() => onSelectEvent(ev)}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Full Event Hub
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => onOpenNewEventWithDate(selectedDayEvents.date)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Event on This Date
                  </button>
                </div>
              )}
            </div>
          )}

          {!selectedDayEvents && (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Select any date on the calendar grid to inspect events, check schedules, or plan a celebration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
