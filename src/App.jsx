import React, { useState, useEffect, useCallback } from 'react';
import { api } from './utils/api';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import EventDetailView from './components/EventDetailView';
import CalendarView from './components/CalendarView';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { Sparkles, Calendar, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, calendar, events, event-detail
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [deleteEventTarget, setDeleteEventTarget] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all events & stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        api.getEvents({ search: searchQuery }),
        api.getStats()
      ]);
      setEvents(eventsRes.data || []);
      setStats(statsRes.data || null);

      // If viewing an event in detail, refresh its payload as well
      if (selectedEvent) {
        try {
          const single = await api.getEventById(selectedEvent.id);
          if (single.data) {
            setSelectedEvent(single.data);
          }
        } catch (e) {
          // Event might have been deleted
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      addToast('Could not connect to database. Make sure server is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedEvent?.id]);

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  // Handle Event Creation & Update
  const handleSaveEvent = async (eventPayload) => {
    try {
      if (eventToEdit) {
        const res = await api.updateEvent(eventToEdit.id, eventPayload);
        addToast(`"${eventPayload.title}" updated successfully!`, 'success');
        if (selectedEvent && selectedEvent.id === eventToEdit.id) {
          setSelectedEvent(res.data);
        }
      } else {
        const res = await api.createEvent(eventPayload);
        addToast(`New celebration "${eventPayload.title}" planned!`, 'success');
      }
      setIsEventModalOpen(false);
      setEventToEdit(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to save event', 'error');
    }
  };

  // Handle Event Deletion
  const confirmDeleteEvent = async () => {
    if (!deleteEventTarget) return;
    try {
      await api.deleteEvent(deleteEventTarget.id);
      addToast(`"${deleteEventTarget.title}" deleted`, 'info');
      setDeleteEventTarget(null);
      if (selectedEvent && selectedEvent.id === deleteEventTarget.id) {
        setSelectedEvent(null);
        setCurrentView('dashboard');
      }
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
    }
  };

  // Open Event Details
  const handleSelectEvent = async (ev) => {
    try {
      const full = await api.getEventById(ev.id);
      setSelectedEvent(full.data);
      setCurrentView('event-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      addToast('Failed to load event details', 'error');
    }
  };

  // Quick Open Modal with predefined date (from calendar view)
  const handleOpenNewEventWithDate = (dateStr) => {
    setEventToEdit({
      date: dateStr,
      category: 'birthday',
      time: '18:00',
      status: 'planning'
    });
    setIsEventModalOpen(true);
  };

  // ---------------- Expense Operations ----------------
  const handleAddExpense = async (eventId, data) => {
    try {
      await api.createExpense(eventId, data);
      addToast('Expense added successfully!', 'success');
      // Refresh event details
      const refreshed = await api.getEventById(eventId);
      setSelectedEvent(refreshed.data);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to add expense', 'error');
    }
  };

  const handleUpdateExpense = async (id, data) => {
    try {
      await api.updateExpense(id, data);
      addToast('Expense updated!', 'success');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update expense', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      addToast('Expense deleted', 'info');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // ---------------- Guest Operations ----------------
  const handleAddGuest = async (eventId, data) => {
    try {
      await api.createGuest(eventId, data);
      addToast(`Guest "${data.name}" added to roster!`, 'success');
      const refreshed = await api.getEventById(eventId);
      setSelectedEvent(refreshed.data);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to add guest', 'error');
    }
  };

  const handleUpdateGuest = async (id, data) => {
    try {
      await api.updateGuest(id, data);
      addToast('Guest details updated', 'success');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update guest', 'error');
    }
  };

  const handleUpdateRsvp = async (id, rsvpStatus) => {
    try {
      await api.updateGuestRsvp(id, rsvpStatus);
      addToast(`RSVP status changed to ${rsvpStatus}`, 'success');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update RSVP', 'error');
    }
  };

  const handleDeleteGuest = async (id) => {
    try {
      await api.deleteGuest(id);
      addToast('Guest removed from roster', 'info');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete guest', 'error');
    }
  };

  // ---------------- Task Operations ----------------
  const handleAddTask = async (eventId, data) => {
    try {
      await api.createTask(eventId, data);
      addToast('Checklist task created!', 'success');
      const refreshed = await api.getEventById(eventId);
      setSelectedEvent(refreshed.data);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      await api.updateTask(id, data);
      addToast('Task updated', 'success');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const res = await api.toggleTask(id);
      addToast(res.message, 'success');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to toggle task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      addToast('Task deleted from checklist', 'info');
      if (selectedEvent) {
        const refreshed = await api.getEventById(selectedEvent.id);
        setSelectedEvent(refreshed.data);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Reset / Seed Demo Data
  const handleResetSeed = async () => {
    try {
      await api.seedDemoData();
      addToast('Sample celebrations loaded successfully!', 'success');
      if (selectedEvent) setSelectedEvent(null);
      setCurrentView('dashboard');
      await loadData();
    } catch (err) {
      addToast('Failed to reset demo celebrations', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#08070b] text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-pink-300">
      {/* Top Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== 'event-detail') setSelectedEvent(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewEvent={() => {
          setEventToEdit(null);
          setIsEventModalOpen(true);
        }}
        onResetSeed={handleResetSeed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">Loading your celebration portfolio...</p>
          </div>
        ) : (
          <>
            {/* View 1: Dashboard Overview */}
            {currentView === 'dashboard' && (
              <DashboardOverview
                stats={stats}
                events={events}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                onSelectEvent={handleSelectEvent}
                onOpenNewEvent={() => {
                  setEventToEdit(null);
                  setIsEventModalOpen(true);
                }}
                onEditEvent={(ev) => {
                  setEventToEdit(ev);
                  setIsEventModalOpen(true);
                }}
                onDeleteEvent={(ev) => setDeleteEventTarget(ev)}
              />
            )}

            {/* View 2: Calendar View */}
            {currentView === 'calendar' && (
              <CalendarView
                events={events}
                onSelectEvent={handleSelectEvent}
                onOpenNewEventWithDate={handleOpenNewEventWithDate}
              />
            )}

            {/* View 3: All Events List */}
            {currentView === 'events' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-white">All Celebrations</h1>
                    <p className="text-xs text-zinc-400">Browse and manage your full celebration catalogue</p>
                  </div>
                  <button
                    onClick={() => {
                      setEventToEdit(null);
                      setIsEventModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-transform hover:scale-105 w-fit"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Celebration</span>
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border border-dashed border-zinc-800">
                    <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No celebrations matching criteria</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Clear your search filter or plan a new event to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {events.map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        onSelect={handleSelectEvent}
                        onEdit={(e) => {
                          setEventToEdit(e);
                          setIsEventModalOpen(true);
                        }}
                        onDelete={(e) => setDeleteEventTarget(e)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 4: Detailed Individual Event Hub */}
            {currentView === 'event-detail' && selectedEvent && (
              <EventDetailView
                event={selectedEvent}
                onBack={() => {
                  setSelectedEvent(null);
                  setCurrentView('dashboard');
                }}
                onEditEvent={(ev) => {
                  setEventToEdit(ev);
                  setIsEventModalOpen(true);
                }}
                onDeleteEvent={(ev) => setDeleteEventTarget(ev)}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onAddGuest={handleAddGuest}
                onUpdateGuest={handleUpdateGuest}
                onUpdateRsvp={handleUpdateRsvp}
                onDeleteGuest={handleDeleteGuest}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">Celebration Event Planner</span>
            <span>•</span>
            <span className="text-purple-400">Birthdays • Weddings • Anniversaries • Parties</span>
          </div>
          <div>
            Data saved persistently to local JSON database • Fast, responsive, full-stack
          </div>
        </div>
      </footer>

      {/* Global Event Modal (Create / Edit) */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />

      {/* Global Confirm Event Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteEventTarget)}
        title="Delete Celebration"
        message={`Are you sure you want to permanently delete "${deleteEventTarget?.title}"? All associated expenses, guest RSVPs, and checklist tasks will also be deleted.`}
        confirmText="Delete Celebration"
        onConfirm={confirmDeleteEvent}
        onCancel={() => setDeleteEventTarget(null)}
        isDanger={true}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
