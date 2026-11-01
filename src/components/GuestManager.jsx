import React, { useState } from 'react';
import { 
  Users, UserCheck, Clock, UserX, Plus, Search, 
  Mail, Phone, Utensils, Tag, Edit2, Trash2, Send, Check 
} from 'lucide-react';
import GuestModal from './GuestModal';
import ConfirmModal from './ConfirmModal';

export default function GuestManager({ event, onAddGuest, onUpdateGuest, onUpdateRsvp, onDeleteGuest }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState(null);
  const [deleteGuestId, setDeleteGuestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [filterTable, setFilterTable] = useState('all');

  const guests = event.guests || [];

  // Summary counts
  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const attendingTotalPeople = attendingGuests.reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0);
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const invitationsSentCount = guests.filter(g => g.invitationSent).length;

  // Tables / Seating Groups
  const uniqueTables = Array.from(new Set(guests.map(g => g.tableGroup).filter(Boolean)));

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    if (filterRsvp !== 'all' && g.rsvpStatus !== filterRsvp) return false;
    if (filterTable !== 'all' && g.tableGroup !== filterTable) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchEmail = g.email && g.email.toLowerCase().includes(q);
      const matchPhone = g.phone && g.phone.toLowerCase().includes(q);
      const matchNotes = g.notes && g.notes.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchNotes) return false;
    }
    return true;
  });

  const handleEdit = (guest) => {
    setGuestToEdit(guest);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setGuestToEdit(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (guestToEdit) {
      await onUpdateGuest(guestToEdit.id, data);
    } else {
      await onAddGuest(event.id, data);
    }
  };

  const confirmDelete = async () => {
    if (deleteGuestId) {
      await onDeleteGuest(deleteGuestId);
      setDeleteGuestId(null);
    }
  };

  const handleRsvpChange = async (guestId, newStatus) => {
    await onUpdateRsvp(guestId, newStatus);
  };

  const toggleInviteSent = async (guest) => {
    await onUpdateGuest(guest.id, {
      ...guest,
      invitationSent: !guest.invitationSent
    });
  };

  return (
    <div className="space-y-6">
      {/* RSVP Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attending Count */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Attending Confirmed</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {attendingTotalPeople} <span className="text-sm font-normal text-zinc-400">people</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {attendingGuests.length} guests + {attendingTotalPeople - attendingGuests.length} plus-ones
          </div>
        </div>

        {/* Pending Awaiting RSVP */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Awaiting RSVP</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {pendingCount}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Pending response
          </div>
        </div>

        {/* Declined */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Declined</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-300">
            {declinedCount}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Unable to attend
          </div>
        </div>

        {/* Invitations Dispatched */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Invitations Sent</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300">
            {invitationsSentCount} <span className="text-sm font-normal text-zinc-400">/ {guests.length}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {guests.length > 0 ? Math.round((invitationsSentCount / guests.length) * 100) : 0}% dispatched
          </div>
        </div>
      </div>

      {/* Main Guest Management Panel */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Guest List & RSVPs</h3>
            <p className="text-xs text-zinc-400">Manage attendees, seating groups, and food preferences</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Filter by RSVP */}
            <select
              value={filterRsvp}
              onChange={(e) => setFilterRsvp(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
            >
              <option value="all" className="bg-zinc-900 text-white">All RSVPs</option>
              <option value="attending" className="bg-zinc-900 text-emerald-400">Attending</option>
              <option value="pending" className="bg-zinc-900 text-amber-400">Pending</option>
              <option value="declined" className="bg-zinc-900 text-rose-400">Declined</option>
            </select>

            {/* Filter by Table */}
            {uniqueTables.length > 0 && (
              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
              >
                <option value="all" className="bg-zinc-900 text-white">All Tables/Groups</option>
                {uniqueTables.map(t => (
                  <option key={t} value={t} className="bg-zinc-900 text-white">{t}</option>
                ))}
              </select>
            )}

            {/* Add Guest Button */}
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Guest List Cards */}
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-zinc-300">No guests found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 mb-4">
              Add friends, family, and VIP attendees to start collecting RSVPs and dietary preferences.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-pink-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Guest
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredGuests.map((guest) => {
              const rsvpColors = {
                attending: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
                pending: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
                declined: 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              };

              return (
                <div
                  key={guest.id}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Guest Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-white">{guest.name}</span>

                      {/* RSVP Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${rsvpColors[guest.rsvpStatus] || rsvpColors.pending}`}>
                        {guest.rsvpStatus === 'attending' && '🟢 Attending'}
                        {guest.rsvpStatus === 'pending' && '🟡 Pending'}
                        {guest.rsvpStatus === 'declined' && '🔴 Declined'}
                      </span>

                      {/* Plus-ones pill */}
                      {Number(guest.plusOnes) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          +{guest.plusOnes} {guest.plusOnes === 1 ? 'Guest' : 'Guests'}
                        </span>
                      )}

                      {/* Table / Group */}
                      {guest.tableGroup && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          📍 {guest.tableGroup}
                        </span>
                      )}
                    </div>

                    {/* Contact & Dietary Row */}
                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      {guest.email && (
                        <div className="flex items-center gap-1 hover:text-zinc-200">
                          <Mail className="w-3 h-3 text-zinc-500" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-1 hover:text-zinc-200">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                      {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'None' && (
                        <div className="flex items-center gap-1 text-pink-300">
                          <Utensils className="w-3 h-3 text-pink-400" />
                          <span>Diet: {guest.dietaryRestrictions}</span>
                        </div>
                      )}
                    </div>

                    {guest.notes && (
                      <p className="text-xs text-zinc-400 italic">Note: {guest.notes}</p>
                    )}
                  </div>

                  {/* Right Actions & RSVP Selector */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Quick RSVP toggle dropdown */}
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => handleRsvpChange(guest.id, e.target.value)}
                      className="px-2 py-1 rounded-lg glass-input text-xs font-medium cursor-pointer"
                    >
                      <option value="attending" className="bg-zinc-900 text-emerald-400">Attending</option>
                      <option value="pending" className="bg-zinc-900 text-amber-400">Pending</option>
                      <option value="declined" className="bg-zinc-900 text-rose-400">Declined</option>
                    </select>

                    {/* Invitation Dispatched Toggle */}
                    <button
                      onClick={() => toggleInviteSent(guest)}
                      title={guest.invitationSent ? 'Invitation sent' : 'Mark invitation sent'}
                      className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                        guest.invitationSent
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span className="hidden sm:inline">{guest.invitationSent ? 'Sent' : 'Send'}</span>
                    </button>

                    {/* Edit & Delete */}
                    <button
                      onClick={() => handleEdit(guest)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit guest"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteGuestId(guest.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete guest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest Modal */}
      <GuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        guestToEdit={guestToEdit}
        eventId={event.id}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteGuestId)}
        title="Remove Guest"
        message="Are you sure you want to remove this guest from your invitation roster?"
        confirmText="Remove Guest"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteGuestId(null)}
        isDanger={true}
      />
    </div>
  );
}
