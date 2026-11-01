import React, { useState } from 'react';
import { 
  Sparkles, Calendar, LayoutDashboard, ListFilter, 
  Plus, Download, RefreshCw, Search, Menu, X 
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onViewChange, 
  onOpenNewEvent, 
  onResetSeed, 
  searchQuery, 
  onSearchChange 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar View', icon: <Calendar className="w-4 h-4" /> },
    { id: 'events', label: 'All Celebrations', icon: <ListFilter className="w-4 h-4" /> }
  ];

  const handleExport = () => {
    window.open('/api/stats/export', '_blank');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <div 
            onClick={() => onViewChange('dashboard')} 
            className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
          >
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-purple-400 text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-base sm:text-lg tracking-tight text-white">
                <span>CELEBRATION</span>
                <span className="text-gradient-purple-pink">HUB</span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                Event & Budget Planner
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Input */}
          <div className="hidden lg:block relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search celebrations, venues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Export Backup JSON */}
            <button
              onClick={handleExport}
              title="Export database as JSON backup"
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset / Seed Demo Data */}
            <button
              onClick={onResetSeed}
              title="Load / Reset realistic celebration sample data"
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
            </button>

            {/* New Event Button */}
            <button
              onClick={onOpenNewEvent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenNewEvent}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 space-y-3">
            <div className="relative w-full mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search celebrations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800"
              >
                <Download className="w-3.5 h-3.5" />
                Export Data
              </button>
              <button
                onClick={() => {
                  onResetSeed();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-purple-300 border border-zinc-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
