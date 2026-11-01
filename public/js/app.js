// Celebration Event Planner - Full-Stack Client Engine
const App = {
  state: {
    events: [],
    stats: null,
    currentView: 'dashboard', // dashboard, calendar, events, detail
    selectedEvent: null,
    detailSubTab: 'overview', // overview, budget, guests, checklist
    activeCategory: 'all',
    searchQuery: '',
    calendarDate: new Date(),
    selectedDay: null,
    loading: false
  },

  // Helpers
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  },

  formatDate(dateStr) {
    if (!dateStr) return 'Date TBD';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    if (!h) return timeStr;
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m || '00'} ${ampm}`;
  },

  getCategoryMeta(category) {
    const map = {
      birthday: { label: 'Birthday', icon: '🎂', badgeClass: 'badge-birthday', color: '#a855f7' },
      wedding: { label: 'Wedding', icon: '💍', badgeClass: 'badge-wedding', color: '#ec4899' },
      anniversary: { label: 'Anniversary', icon: '🥂', badgeClass: 'badge-anniversary', color: '#f472b6' },
      party: { label: 'Party', icon: '🎉', badgeClass: 'badge-party', color: '#8b5cf6' }
    };
    return map[(category || 'party').toLowerCase()] || map.party;
  },

  // Confetti celebrations
  triggerConfetti() {
    if (window.confetti) {
      try {
        window.confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#a855f7', '#ec4899', '#f472b6', '#ffffff']
        });
      } catch (e) {}
    }
  },

  // Toast Notifications
  toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `p-4 rounded-xl shadow-2xl border text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in ${
      type === 'error'
        ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
        : type === 'info'
        ? 'bg-purple-950/95 border-purple-500/50 text-purple-200'
        : 'bg-zinc-950/95 border-emerald-500/50 text-emerald-200'
    }`;
    el.innerHTML = `
      <span>${type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✨'} ${message}</span>
      <button class="text-zinc-400 hover:text-white ml-2 text-xs" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(el);
    setTimeout(() => {
      if (el.parentElement) el.remove();
    }, 4000);
  },

  // API Client
  async api(endpoint, options = {}) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Initial Load
  async init() {
    try {
      await this.loadAll();
      this.bindGlobalEvents();
      this.render();
    } catch (e) {
      this.toast('Error initializing Celebration Planner', 'error');
    }
  },

  async loadAll() {
    this.state.loading = true;
    try {
      const [eventsRes, statsRes] = await Promise.all([
        this.api(`/events?search=${encodeURIComponent(this.state.searchQuery)}`),
        this.api('/stats')
      ]);
      this.state.events = eventsRes.data || [];
      this.state.stats = statsRes.data || null;

      if (this.state.selectedEvent) {
        const single = await this.api(`/events/${this.state.selectedEvent.id}`);
        this.state.selectedEvent = single.data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.state.loading = false;
    }
  },

  bindGlobalEvents() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.loadAll().then(() => this.render());
      });
    }
  },

  navigate(view) {
    this.state.currentView = view;
    if (view !== 'detail') this.state.selectedEvent = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  },

  setCategory(cat) {
    this.state.activeCategory = cat;
    this.render();
  },

  // Render Dispatcher
  render() {
    const appEl = document.getElementById('app-content');
    if (!appEl) return;

    if (this.state.currentView === 'dashboard') {
      appEl.innerHTML = this.renderDashboard();
    } else if (this.state.currentView === 'calendar') {
      appEl.innerHTML = this.renderCalendar();
    } else if (this.state.currentView === 'events') {
      appEl.innerHTML = this.renderEventsList();
    } else if (this.state.currentView === 'detail' && this.state.selectedEvent) {
      appEl.innerHTML = this.renderEventDetail();
    }

    this.updateNavButtons();
  },

  updateNavButtons() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      const target = btn.getAttribute('data-nav');
      if (target === this.state.currentView) {
        btn.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20";
      } else {
        btn.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-zinc-400 hover:text-white hover:bg-zinc-800";
      }
    });
  },

  // ---------------- VIEW 1: DASHBOARD ----------------
  renderDashboard() {
    const ov = this.state.stats?.overview || {
      totalEvents: this.state.events.length,
      upcomingCount: this.state.events.length,
      totalTargetBudget: 0,
      totalActualSpent: 0,
      totalAttendingGuests: 0,
      totalPendingGuests: 0,
      totalTasks: 0,
      completedTasks: 0,
      taskCompletionRate: 0
    };

    const counts = this.state.stats?.categoryCounts || {
      birthday: this.state.events.filter(e => e.category === 'birthday').length,
      wedding: this.state.events.filter(e => e.category === 'wedding').length,
      anniversary: this.state.events.filter(e => e.category === 'anniversary').length,
      party: this.state.events.filter(e => e.category === 'party').length
    };

    const filtered = this.state.activeCategory === 'all'
      ? this.state.events
      : this.state.events.filter(e => e.category === this.state.activeCategory);

    return `
      <div class="space-y-8 animate-fade-in">
        <!-- Hero Header -->
        <div class="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-purple-950/70 via-zinc-950 to-pink-950/60 border border-purple-500/20 shadow-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span>✨ Celebration Command Center</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Plan Unforgettable <span class="text-gradient">Celebrations</span>
              </h1>
              <p class="text-sm text-zinc-300 leading-relaxed">
                Orchestrate birthdays, weddings, anniversaries, and parties with persistent budget tracking, RSVP guest rosters, and event checklists.
              </p>
            </div>
            <button onclick="App.openEventModal()" class="gradient-btn px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer w-fit">
              <span>+ Plan Celebration</span>
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Celebrations -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Total Celebrations</span>
              <span class="text-purple-400 text-base">🗓️</span>
            </div>
            <div class="text-3xl font-extrabold text-white">${ov.totalEvents}</div>
            <div class="text-xs text-zinc-400 mt-2 font-medium">
              <span class="text-purple-300">${ov.upcomingCount} Upcoming</span> • ${ov.pastCount || 0} Past
            </div>
          </div>

          <!-- Total Budget -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Committed Budget</span>
              <span class="text-pink-400 text-base">💵</span>
            </div>
            <div class="text-3xl font-extrabold text-white">${this.formatCurrency(ov.totalActualSpent)}</div>
            <div class="text-xs text-zinc-400 mt-2">
              Target Cap: <span class="text-pink-300 font-semibold">${this.formatCurrency(ov.totalTargetBudget)}</span>
            </div>
          </div>

          <!-- Guests Attending -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Attending Guests</span>
              <span class="text-emerald-400 text-base">👥</span>
            </div>
            <div class="text-3xl font-extrabold text-emerald-400">${ov.totalAttendingGuests}</div>
            <div class="text-xs text-zinc-400 mt-2">
              ${ov.totalPendingGuests} pending • ${ov.totalGuests} registered
            </div>
          </div>

          <!-- Checklist Milestones -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Checklist Progress</span>
              <span class="text-purple-400 text-base">✅</span>
            </div>
            <div class="text-3xl font-extrabold text-purple-300">${ov.taskCompletionRate}%</div>
            <div class="text-xs text-zinc-400 mt-2">
              ${ov.completedTasks} of ${ov.totalTasks} tasks complete
            </div>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white">Event Categories</h2>
            <span class="text-xs text-zinc-400">Click to filter celebration cards</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button onclick="App.setCategory('all')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              this.state.activeCategory === 'all'
                ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500/50 text-white shadow-lg'
                : 'glass-panel hover:bg-zinc-850 text-zinc-400 hover:text-white'
            }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xl">✨</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">${this.state.events.length}</span>
              </div>
              <div class="text-xs font-bold text-zinc-200">All Celebrations</div>
              <div class="text-[11px] text-zinc-400">Complete catalogue</div>
            </button>

            <button onclick="App.setCategory('birthday')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              this.state.activeCategory === 'birthday'
                ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500/50 text-white shadow-lg'
                : 'glass-panel hover:bg-zinc-850 text-zinc-400 hover:text-white'
            }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xl">🎂</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">${counts.birthday || 0}</span>
              </div>
              <div class="text-xs font-bold text-zinc-200">Birthdays</div>
              <div class="text-[11px] text-zinc-400">Parties & galas</div>
            </button>

            <button onclick="App.setCategory('wedding')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              this.state.activeCategory === 'wedding'
                ? 'bg-pink-950/60 border-pink-500 ring-1 ring-pink-500/50 text-white shadow-lg'
                : 'glass-panel hover:bg-zinc-850 text-zinc-400 hover:text-white'
            }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xl">💍</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/30">${counts.wedding || 0}</span>
              </div>
              <div class="text-xs font-bold text-zinc-200">Weddings</div>
              <div class="text-[11px] text-zinc-400">Ceremonies & dinners</div>
            </button>

            <button onclick="App.setCategory('anniversary')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              this.state.activeCategory === 'anniversary'
                ? 'bg-fuchsia-950/60 border-fuchsia-500 ring-1 ring-fuchsia-500/50 text-white shadow-lg'
                : 'glass-panel hover:bg-zinc-850 text-zinc-400 hover:text-white'
            }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xl">🥂</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/30">${counts.anniversary || 0}</span>
              </div>
              <div class="text-xs font-bold text-zinc-200">Anniversaries</div>
              <div class="text-[11px] text-zinc-400">Milestone renewals</div>
            </button>

            <button onclick="App.setCategory('party')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
              this.state.activeCategory === 'party'
                ? 'bg-violet-950/60 border-violet-500 ring-1 ring-violet-500/50 text-white shadow-lg'
                : 'glass-panel hover:bg-zinc-850 text-zinc-400 hover:text-white'
            }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xl">🎉</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-500/30">${counts.party || 0}</span>
              </div>
              <div class="text-xs font-bold text-zinc-200">Parties & Soirees</div>
              <div class="text-[11px] text-zinc-400">Nightlife & mixers</div>
            </button>
          </div>
        </div>

        <!-- Celebrations Showcase Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>${this.state.activeCategory === 'all' ? 'All Upcoming Celebrations' : `${this.getCategoryMeta(this.state.activeCategory).label} Celebrations`}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">${filtered.length}</span>
            </h2>
            <button onclick="App.openEventModal()" class="text-xs font-semibold text-purple-400 hover:text-pink-300 cursor-pointer">
              + Add Event
            </button>
          </div>

          ${filtered.length === 0 ? `
            <div class="glass-panel p-12 text-center space-y-3 border-dashed">
              <span class="text-4xl block">✨</span>
              <h3 class="text-base font-bold text-white">No celebrations in this category</h3>
              <p class="text-xs text-zinc-400 max-w-sm mx-auto">Create a new milestone celebration to start budgeting and managing guests.</p>
              <button onclick="App.openEventModal()" class="gradient-btn px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer">
                + Plan Celebration
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              ${filtered.map(ev => this.renderEventCard(ev)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  renderEventCard(ev) {
    const meta = this.getCategoryMeta(ev.category);
    const stats = ev.stats || {};
    const totalSpent = stats.totalSpent || 0;
    const target = Number(ev.targetBudget) || 0;
    const pct = target > 0 ? Math.min(100, Math.round((totalSpent / target) * 100)) : 0;
    const isOver = target > 0 && totalSpent > target;

    return `
      <div onclick="App.openEventDetail('${ev.id}')" class="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}">
            ${meta.icon} <span class="capitalize">${meta.label}</span>
          </span>

          <div class="flex items-center gap-1" onclick="event.stopPropagation()">
            <button onclick="App.openEventModal('${ev.id}')" class="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" title="Edit">
              ✏️
            </button>
            <button onclick="App.confirmDeleteEvent('${ev.id}', '${ev.title.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
              🗑️
            </button>
          </div>
        </div>

        <div class="space-y-1.5 mb-4">
          <h3 class="text-base font-bold text-white leading-snug line-clamp-2">${ev.title}</h3>
          ${ev.description ? `<p class="text-xs text-zinc-400 line-clamp-2">${ev.description}</p>` : ''}
        </div>

        <div class="space-y-1.5 py-2.5 border-y border-zinc-800/60 text-xs text-zinc-300 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-purple-400">📅</span>
            <span class="font-semibold text-white">${this.formatDate(ev.date)}</span>
            <span class="text-zinc-500">•</span>
            <span class="text-pink-400">⏰</span>
            <span>${this.formatTime(ev.time)}</span>
          </div>
          ${ev.venue ? `
            <div class="flex items-center gap-1.5 text-zinc-400 truncate">
              <span>📍</span>
              <span class="truncate">${ev.venue}</span>
            </div>
          ` : ''}
        </div>

        <div class="space-y-2">
          <div>
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-zinc-400">Spent: ${this.formatCurrency(totalSpent)}</span>
              <span class="${isOver ? 'text-rose-400 font-bold' : 'text-zinc-400'}">Cap: ${this.formatCurrency(target)}</span>
            </div>
            <div class="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 text-xs text-zinc-400">
            <div class="flex items-center gap-3">
              <span>👥 ${stats.attendingCount || 0} Confirmed</span>
              <span>✅ ${stats.completedTasks || 0}/${stats.totalTasks || 0} Tasks</span>
            </div>
            <span class="text-purple-400 font-semibold text-xs">Manage →</span>
          </div>
        </div>
      </div>
    `;
  },

  // ---------------- VIEW 2: CALENDAR ----------------
  renderCalendar() {
    const cur = this.state.calendarDate;
    const year = cur.getFullYear();
    const month = cur.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        num: prevDays - i,
        current: false,
        date: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevDays - i).padStart(2, '0')}`
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        num: i,
        current: true,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) {
      const nextM = month + 2 > 12 ? 1 : month + 2;
      const nextY = month + 2 > 12 ? year + 1 : year;
      days.push({
        num: i,
        current: false,
        date: `${nextY}-${String(nextM).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const selDate = this.state.selectedDay || todayStr;
    const dayEvents = this.state.events.filter(e => e.date === selDate);

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Calendar Header Controls -->
        <div class="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <div>
              <h2 class="text-xl font-bold text-white">${monthNames[month]} ${year}</h2>
              <p class="text-xs text-zinc-400">Interactive monthly celebration schedule</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="App.calendarToday()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 cursor-pointer">
              Today
            </button>
            <div class="flex items-center rounded-xl bg-zinc-900 border border-zinc-700/60 p-0.5">
              <button onclick="App.calendarPrev()" class="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer">◀</button>
              <button onclick="App.calendarNext()" class="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer">▶</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Calendar Matrix -->
          <div class="glass-panel p-4 sm:p-6 lg:col-span-3">
            <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold uppercase text-zinc-500">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div class="grid grid-cols-7 gap-1 sm:gap-2">
              ${days.map(d => {
                const evs = this.state.events.filter(e => e.date === d.date);
                const isToday = d.date === todayStr;
                const isSelected = d.date === selDate;

                return `
                  <div onclick="App.selectCalendarDay('${d.date}')" class="min-h-[75px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    !d.current
                      ? 'bg-zinc-950/20 border-zinc-900/60 text-zinc-600'
                      : isSelected
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg'
                      : isToday
                      ? 'bg-purple-950/20 border-pink-500/50 text-white'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold ${isToday ? 'w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-[11px]' : ''}">
                        ${d.num}
                      </span>
                      ${evs.length > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>` : ''}
                    </div>

                    <div class="space-y-1 mt-1 overflow-hidden">
                      ${evs.slice(0, 2).map(ev => {
                        const m = this.getCategoryMeta(ev.category);
                        return `
                          <div onclick="event.stopPropagation(); App.openEventDetail('${ev.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${m.badgeClass}">
                            <span>${m.icon}</span>
                            <span class="truncate">${ev.title}</span>
                          </div>
                        `;
                      }).join('')}
                      ${evs.length > 2 ? `<span class="text-[9px] font-bold text-purple-300 block text-right">+${evs.length - 2} more</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Day Agenda Drawer -->
          <div class="glass-panel p-5 lg:col-span-1 space-y-4">
            <div class="border-b border-zinc-800/80 pb-3">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">${this.formatDate(selDate)}</h3>
              <p class="text-xs text-zinc-400">${dayEvents.length} celebration(s) scheduled</p>
            </div>

            <div class="space-y-3">
              ${dayEvents.length === 0 ? `
                <div class="text-center py-8">
                  <p class="text-xs text-zinc-500 mb-3">No celebrations on this day.</p>
                  <button onclick="App.openEventModal(null, '${selDate}')" class="gradient-btn px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                    + Plan Event on this Date
                  </button>
                </div>
              ` : `
                ${dayEvents.map(ev => {
                  const m = this.getCategoryMeta(ev.category);
                  return `
                    <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${m.badgeClass}">${m.icon} ${m.label}</span>
                        <span class="text-xs text-zinc-400">⏰ ${this.formatTime(ev.time)}</span>
                      </div>
                      <h4 class="text-sm font-bold text-white leading-snug">${ev.title}</h4>
                      ${ev.venue ? `<p class="text-xs text-zinc-400 truncate">📍 ${ev.venue}</p>` : ''}
                      <button onclick="App.openEventDetail('${ev.id}')" class="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-purple-300 cursor-pointer">
                        View Event Hub →
                      </button>
                    </div>
                  `;
                }).join('')}
                <button onclick="App.openEventModal(null, '${selDate}')" class="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer">
                  + Add Another on Date
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  calendarPrev() {
    const c = this.state.calendarDate;
    this.state.calendarDate = new Date(c.getFullYear(), c.getMonth() - 1, 1);
    this.render();
  },

  calendarNext() {
    const c = this.state.calendarDate;
    this.state.calendarDate = new Date(c.getFullYear(), c.getMonth() + 1, 1);
    this.render();
  },

  calendarToday() {
    this.state.calendarDate = new Date();
    this.state.selectedDay = new Date().toISOString().split('T')[0];
    this.render();
  },

  selectCalendarDay(dateStr) {
    this.state.selectedDay = dateStr;
    this.render();
  },

  // ---------------- VIEW 3: ALL EVENTS ----------------
  renderEventsList() {
    return `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 class="text-2xl font-extrabold text-white">All Celebrations</h1>
            <p class="text-xs text-zinc-400">Browse and manage your full celebration portfolio (${this.state.events.length} total)</p>
          </div>
          <button onclick="App.openEventModal()" class="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer w-fit">
            + Create Celebration
          </button>
        </div>

        ${this.state.events.length === 0 ? `
          <div class="glass-panel p-12 text-center space-y-3">
            <span class="text-4xl block">📅</span>
            <h3 class="text-base font-bold text-white">No celebrations found</h3>
            <p class="text-xs text-zinc-400">Click below to plan your first celebration.</p>
            <button onclick="App.openEventModal()" class="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
              + Plan Celebration
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${this.state.events.map(ev => this.renderEventCard(ev)).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ---------------- VIEW 4: DETAILED EVENT HUB ----------------
  renderEventDetail() {
    const ev = this.state.selectedEvent;
    if (!ev) return '';

    const meta = this.getCategoryMeta(ev.category);
    const stats = ev.stats || {};
    const tab = this.state.detailSubTab;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Top Back Bar & Quick Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onclick="App.navigate('dashboard')" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 cursor-pointer w-fit">
            ← Back to Celebrations
          </button>
          <div class="flex items-center gap-2">
            <button onclick="App.openEventModal('${ev.id}')" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 cursor-pointer">
              ✏️ Edit Event
            </button>
            <button onclick="App.confirmDeleteEvent('${ev.id}', '${ev.title.replace(/'/g, "\\'")}')" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-zinc-800 cursor-pointer">
              🗑️ Delete
            </button>
          </div>
        </div>

        <!-- Hero Event Banner -->
        <div class="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}">
              ${meta.icon} <span class="capitalize">${meta.label}</span>
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              ✨ Status: ${ev.status || 'Planning'}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">${ev.title}</h1>

          <div class="flex items-center gap-4 text-xs sm:text-sm text-zinc-300 flex-wrap">
            <div class="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span>📅</span> <span class="font-semibold text-white">${this.formatDate(ev.date)}</span>
            </div>
            <div class="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span>⏰</span> <span>${this.formatTime(ev.time)}</span>
            </div>
            ${ev.venue ? `
              <div class="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <span>📍</span> <span>${ev.venue}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Sub Tabs -->
        <div class="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button onclick="App.setDetailSubTab('overview')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            tab === 'overview' ? 'gradient-btn' : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
          }">
            ✨ Overview
          </button>
          <button onclick="App.setDetailSubTab('budget')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            tab === 'budget' ? 'gradient-btn' : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
          }">
            💵 Budget Planner (${ev.expenses?.length || 0})
          </button>
          <button onclick="App.setDetailSubTab('guests')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            tab === 'guests' ? 'gradient-btn' : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
          }">
            👥 Guest Roster (${ev.guests?.length || 0})
          </button>
          <button onclick="App.setDetailSubTab('checklist')" class="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            tab === 'checklist' ? 'gradient-btn' : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
          }">
            ✅ Planning Checklist (${stats.completedTasks || 0}/${stats.totalTasks || 0})
          </button>
        </div>

        <!-- Sub Tab Content -->
        ${tab === 'overview' ? this.renderDetailOverview() : ''}
        ${tab === 'budget' ? this.renderBudgetManager() : ''}
        ${tab === 'guests' ? this.renderGuestManager() : ''}
        ${tab === 'checklist' ? this.renderChecklistManager() : ''}
      </div>
    `;
  },

  setDetailSubTab(tab) {
    this.state.detailSubTab = tab;
    this.render();
  },

  renderDetailOverview() {
    const ev = this.state.selectedEvent;
    const stats = ev.stats || {};
    return `
      <div class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onclick="App.setDetailSubTab('budget')" class="glass-panel glass-panel-hover p-5 cursor-pointer">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Budget Status</span>
              <span>💵</span>
            </div>
            <div class="text-2xl font-extrabold text-white">${this.formatCurrency(stats.totalSpent || 0)}</div>
            <div class="text-xs text-zinc-400 mt-1">Cap: ${this.formatCurrency(stats.targetBudget || 0)} (${stats.budgetUsedPercentage || 0}% used)</div>
          </div>

          <div onclick="App.setDetailSubTab('guests')" class="glass-panel glass-panel-hover p-5 cursor-pointer">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Attending Guests</span>
              <span>👥</span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-400">${stats.attendingCount || 0} Attending</div>
            <div class="text-xs text-zinc-400 mt-1">${stats.pendingGuests || 0} pending • ${stats.totalGuests || 0} registered</div>
          </div>

          <div onclick="App.setDetailSubTab('checklist')" class="glass-panel glass-panel-hover p-5 cursor-pointer">
            <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase mb-2">
              <span>Planning Checklist</span>
              <span>✅</span>
            </div>
            <div class="text-2xl font-extrabold text-purple-300">${stats.taskProgress || 0}% Completed</div>
            <div class="text-xs text-zinc-400 mt-1">${stats.completedTasks || 0} of ${stats.totalTasks || 0} tasks finished</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-panel p-6 space-y-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Description & Aesthetic</h3>
            <p class="text-sm text-zinc-300 leading-relaxed">${ev.description || 'No description provided.'}</p>
          </div>
          <div class="glass-panel p-6 space-y-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Logistics & Special Instructions</h3>
            <p class="text-sm text-zinc-300 leading-relaxed">${ev.notes || 'No special instructions recorded.'}</p>
          </div>
        </div>
      </div>
    `;
  },

  // ---------------- BUDGET PLANNER TAB ----------------
  renderBudgetManager() {
    const ev = this.state.selectedEvent;
    const expenses = ev.expenses || [];
    const target = Number(ev.targetBudget) || 0;
    const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const paidSpent = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const pendingSpent = totalSpent - paidSpent;
    const isOver = target > 0 && totalSpent > target;
    const pct = target > 0 ? Math.round((totalSpent / target) * 100) : 0;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Budget Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Target Budget</div>
            <div class="text-2xl font-extrabold text-white">${this.formatCurrency(target)}</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Total Committed</div>
            <div class="text-2xl font-extrabold ${isOver ? 'text-rose-400' : 'text-white'}">${this.formatCurrency(totalSpent)}</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Paid in Full</div>
            <div class="text-2xl font-extrabold text-emerald-400">${this.formatCurrency(paidSpent)}</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">${isOver ? 'Over Budget By' : 'Remaining Balance'}</div>
            <div class="text-2xl font-extrabold ${isOver ? 'text-rose-400' : 'text-purple-300'}">${this.formatCurrency(Math.abs(target - totalSpent))}</div>
          </div>
        </div>

        <!-- Visual Progress Bar -->
        <div class="glass-panel p-5 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white">Budget Consumption (${pct}%)</span>
            <span class="${isOver ? 'text-rose-400 font-bold' : 'text-zinc-400'}">${isOver ? '⚠️ Limit Exceeded' : `${this.formatCurrency(pendingSpent)} pending invoice`}</span>
          </div>
          <div class="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div class="h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}" style="width: ${Math.min(100, pct)}%"></div>
          </div>
        </div>

        <!-- Expenses List & Add Button -->
        <div class="glass-panel p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 class="text-base font-bold text-white">Expense Records</h3>
              <p class="text-xs text-zinc-400">${expenses.length} vendor item(s)</p>
            </div>
            <button onclick="App.openExpenseModal()" class="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
              + Add Expense
            </button>
          </div>

          ${expenses.length === 0 ? `
            <div class="text-center py-8 text-zinc-500 text-xs">No expenses recorded yet. Track venue, catering, and decor costs.</div>
          ` : `
            <div class="space-y-2.5">
              ${expenses.map(exp => `
                <div class="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-bold text-white">${exp.title}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-zinc-800 text-zinc-300">${exp.category}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        exp.status === 'paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }">
                        ${exp.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    ${exp.notes ? `<p class="text-xs text-zinc-400 italic">${exp.notes}</p>` : ''}
                    <span class="text-[11px] text-zinc-500">Due: ${this.formatDate(exp.date)}</span>
                  </div>

                  <div class="flex items-center gap-3 self-end sm:self-center">
                    <span class="text-base font-extrabold text-white">${this.formatCurrency(exp.amount)}</span>
                    <button onclick="App.openExpenseModal('${exp.id}')" class="p-1.5 text-zinc-400 hover:text-white cursor-pointer" title="Edit">✏️</button>
                    <button onclick="App.confirmDeleteExpense('${exp.id}')" class="p-1.5 text-zinc-400 hover:text-rose-400 cursor-pointer" title="Delete">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ---------------- GUEST MANAGER TAB ----------------
  renderGuestManager() {
    const ev = this.state.selectedEvent;
    const guests = ev.guests || [];
    const attending = guests.filter(g => g.rsvpStatus === 'attending');
    const totalAttending = attending.reduce((s, g) => s + 1 + (Number(g.plusOnes) || 0), 0);
    const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
    const declined = guests.filter(g => g.rsvpStatus === 'declined').length;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Guest RSVP Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Attending Total</div>
            <div class="text-2xl font-extrabold text-emerald-400">${totalAttending} people</div>
            <div class="text-xs text-zinc-400 mt-1">${attending.length} guests + ${totalAttending - attending.length} plus-ones</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Awaiting RSVP</div>
            <div class="text-2xl font-extrabold text-amber-400">${pending}</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Declined</div>
            <div class="text-2xl font-extrabold text-zinc-400">${declined}</div>
          </div>
          <div class="glass-panel p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase mb-1">Total Invites</div>
            <div class="text-2xl font-extrabold text-purple-300">${guests.length}</div>
          </div>
        </div>

        <!-- Guest List Panel -->
        <div class="glass-panel p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 class="text-base font-bold text-white">Guest Roster & Seating</h3>
              <p class="text-xs text-zinc-400">Manage dietary preferences and invitation statuses</p>
            </div>
            <button onclick="App.openGuestModal()" class="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
              + Add Guest
            </button>
          </div>

          ${guests.length === 0 ? `
            <div class="text-center py-8 text-zinc-500 text-xs">No guests registered yet. Click "+ Add Guest" to start building your roster.</div>
          ` : `
            <div class="space-y-2.5">
              ${guests.map(g => `
                <div class="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-bold text-white">${g.name}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        g.rsvpStatus === 'attending'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : g.rsvpStatus === 'declined'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }">
                        ${g.rsvpStatus === 'attending' ? '🟢 Attending' : g.rsvpStatus === 'declined' ? '🔴 Declined' : '🟡 Pending'}
                      </span>
                      ${g.plusOnes > 0 ? `<span class="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300">+${g.plusOnes} Plus-One</span>` : ''}
                      ${g.tableGroup ? `<span class="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">📍 ${g.tableGroup}</span>` : ''}
                    </div>

                    <div class="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      ${g.email ? `<span>✉️ ${g.email}</span>` : ''}
                      ${g.phone ? `<span>📞 ${g.phone}</span>` : ''}
                      ${g.dietaryRestrictions && g.dietaryRestrictions !== 'None' ? `<span class="text-pink-300 font-medium">🥗 ${g.dietaryRestrictions}</span>` : ''}
                    </div>
                    ${g.notes ? `<p class="text-xs text-zinc-400 italic">Note: ${g.notes}</p>` : ''}
                  </div>

                  <div class="flex items-center gap-3 self-end md:self-center">
                    <select onchange="App.changeRsvp('${g.id}', this.value)" class="glass-input text-xs py-1 px-2 cursor-pointer">
                      <option value="attending" ${g.rsvpStatus === 'attending' ? 'selected' : ''}>Attending</option>
                      <option value="pending" ${g.rsvpStatus === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="declined" ${g.rsvpStatus === 'declined' ? 'selected' : ''}>Declined</option>
                    </select>
                    <button onclick="App.openGuestModal('${g.id}')" class="p-1.5 text-zinc-400 hover:text-white cursor-pointer" title="Edit">✏️</button>
                    <button onclick="App.confirmDeleteGuest('${g.id}')" class="p-1.5 text-zinc-400 hover:text-rose-400 cursor-pointer" title="Delete">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ---------------- CHECKLIST TAB ----------------
  renderChecklistManager() {
    const ev = this.state.selectedEvent;
    const tasks = ev.tasks || [];
    const done = tasks.filter(t => t.completed).length;
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Progress Bar -->
        <div class="glass-panel p-5 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white text-sm">Event Milestones (${done} of ${tasks.length} Done)</span>
            <span class="text-purple-300 font-mono font-bold">${pct}%</span>
          </div>
          <div class="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>

        <!-- Tasks Panel -->
        <div class="glass-panel p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 class="text-base font-bold text-white">Milestone Checklist</h3>
              <p class="text-xs text-zinc-400">Keep preparations on track with deadlines and priorities</p>
            </div>
            <button onclick="App.openTaskModal()" class="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
              + Add Task
            </button>
          </div>

          ${tasks.length === 0 ? `
            <div class="text-center py-8 text-zinc-500 text-xs">No tasks on this checklist. Add catering, decor, or invitation milestones.</div>
          ` : `
            <div class="space-y-2.5">
              ${tasks.map(t => `
                <div class="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  t.completed ? 'bg-zinc-950/40 border-zinc-850 opacity-70' : 'bg-zinc-900/50 border-zinc-800'
                }">
                  <div class="flex items-start gap-3">
                    <button onclick="App.toggleTask('${t.id}')" class="mt-0.5 text-lg cursor-pointer">
                      ${t.completed ? '✅' : '⬜'}
                    </button>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-semibold ${t.completed ? 'line-through text-zinc-500' : 'text-white'}">${t.title}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.priority === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : t.priority === 'medium' ? 'bg-amber-950 text-amber-300' : 'bg-zinc-800 text-zinc-300'
                        }">
                          ${t.priority}
                        </span>
                        ${t.category ? `<span class="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">${t.category}</span>` : ''}
                      </div>
                      <div class="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        ${t.dueDate ? `<span>📅 Due: ${this.formatDate(t.dueDate)}</span>` : ''}
                        ${t.assignedTo ? `<span class="text-purple-300">👤 ${t.assignedTo}</span>` : ''}
                      </div>
                      ${t.notes ? `<p class="text-xs text-zinc-400 italic">${t.notes}</p>` : ''}
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end sm:self-center">
                    <button onclick="App.openTaskModal('${t.id}')" class="p-1.5 text-zinc-400 hover:text-white cursor-pointer" title="Edit">✏️</button>
                    <button onclick="App.confirmDeleteTask('${t.id}')" class="p-1.5 text-zinc-400 hover:text-rose-400 cursor-pointer" title="Delete">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ---------------- EVENT MODAL (CREATE / EDIT) ----------------
  openEventModal(eventId = null, presetDate = null) {
    const isEdit = Boolean(eventId);
    const ev = isEdit ? this.state.events.find(e => e.id === eventId) : null;

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const defaultDate = presetDate || (isEdit ? ev.date : (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    })());

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in" onclick="App.closeModal(event)">
        <div class="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8" onclick="event.stopPropagation()">
          <div class="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 to-pink-950/30">
            <div>
              <h2 class="text-lg font-bold text-white">${isEdit ? 'Edit Celebration' : 'Create New Celebration'}</h2>
              <p class="text-xs text-zinc-400">Specify event details, category, and budget target</p>
            </div>
            <button onclick="App.closeModal()" class="text-zinc-400 hover:text-white text-lg cursor-pointer">✕</button>
          </div>

          <form onsubmit="App.saveEvent(event, '${eventId || ''}')" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Category *</label>
              <select id="event-cat" class="glass-input text-sm">
                <option value="birthday" ${ev?.category === 'birthday' ? 'selected' : ''}>🎂 Birthday</option>
                <option value="wedding" ${ev?.category === 'wedding' ? 'selected' : ''}>💍 Wedding</option>
                <option value="anniversary" ${ev?.category === 'anniversary' ? 'selected' : ''}>🥂 Anniversary</option>
                <option value="party" ${ev?.category === 'party' ? 'selected' : ''}>🎉 Party & Soiree</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Celebration Title *</label>
              <input type="text" id="event-title" required value="${ev?.title || ''}" placeholder="e.g. Sophia's 25th Enchanted Birthday Gala" class="glass-input text-sm">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Date *</label>
                <input type="date" id="event-date" required value="${defaultDate}" class="glass-input text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Time</label>
                <input type="time" id="event-time" value="${ev?.time || '18:00'}" class="glass-input text-sm">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Venue / Location</label>
                <input type="text" id="event-venue" value="${ev?.venue || ''}" placeholder="e.g. Skyline Conservatory" class="glass-input text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Target Budget ($ USD)</label>
                <input type="number" id="event-budget" min="0" step="50" value="${ev?.targetBudget || ''}" placeholder="5000" class="glass-input text-sm">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Theme / Concept Description</label>
              <textarea id="event-desc" rows="3" placeholder="Aesthetic details, dress codes, or schedule highlights..." class="glass-input text-sm">${ev?.description || ''}</textarea>
            </div>

            <div class="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300 hover:bg-zinc-800 cursor-pointer">Cancel</button>
              <button type="submit" class="gradient-btn px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer">${isEdit ? 'Update Event' : 'Create Event'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveEvent(e, id) {
    e.preventDefault();
    const payload = {
      category: document.getElementById('event-cat').value,
      title: document.getElementById('event-title').value.trim(),
      date: document.getElementById('event-date').value,
      time: document.getElementById('event-time').value,
      venue: document.getElementById('event-venue').value.trim(),
      targetBudget: Number(document.getElementById('event-budget').value) || 0,
      description: document.getElementById('event-desc').value.trim()
    };

    if (!payload.title) {
      this.toast('Title is required', 'error');
      return;
    }
    if (!payload.date) {
      this.toast('Date is required', 'error');
      return;
    }

    try {
      if (id) {
        await this.api(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        this.toast('Celebration updated successfully!');
      } else {
        await this.api('/events', { method: 'POST', body: JSON.stringify(payload) });
        this.triggerConfetti();
        this.toast('New celebration created!');
      }
      this.closeModal();
      await this.loadAll();
      this.render();
    } catch (err) {
      this.toast(err.message || 'Error saving event', 'error');
    }
  },

  // ---------------- EXPENSE MODAL ----------------
  openExpenseModal(expId = null) {
    const isEdit = Boolean(expId);
    const exp = isEdit ? this.state.selectedEvent.expenses.find(e => e.id === expId) : null;
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onclick="App.closeModal(event)">
        <div class="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6" onclick="event.stopPropagation()">
          <h2 class="text-base font-bold text-white mb-4">${isEdit ? 'Edit Expense Item' : 'Add Expense Item'}</h2>
          <form onsubmit="App.saveExpense(event, '${expId || ''}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Expense / Vendor *</label>
              <input type="text" id="exp-title" required value="${exp?.title || ''}" placeholder="e.g. Master Patisserie Cake" class="glass-input text-sm">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Category</label>
                <select id="exp-cat" class="glass-input text-sm">
                  ${['Venue', 'Catering', 'Cake', 'Photography', 'Entertainment', 'Decor', 'Attire', 'Other'].map(c => `
                    <option value="${c}" ${exp?.category === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Amount ($ USD) *</label>
                <input type="number" id="exp-amount" min="1" step="1" required value="${exp?.amount || ''}" placeholder="500" class="glass-input text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Status</label>
                <select id="exp-status" class="glass-input text-sm">
                  <option value="pending" ${exp?.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                  <option value="paid" ${exp?.status === 'paid' ? 'selected' : ''}>✅ Paid</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Due / Incurred Date</label>
                <input type="date" id="exp-date" value="${exp?.date || new Date().toISOString().split('T')[0]}" class="glass-input text-sm">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Notes</label>
              <input type="text" id="exp-notes" value="${exp?.notes || ''}" placeholder="e.g. 50% deposit paid" class="glass-input text-sm">
            </div>
            <div class="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300">Cancel</button>
              <button type="submit" class="gradient-btn px-5 py-2 rounded-xl text-xs font-semibold">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveExpense(e, id) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('exp-title').value.trim(),
      category: document.getElementById('exp-cat').value,
      amount: Number(document.getElementById('exp-amount').value),
      status: document.getElementById('exp-status').value,
      date: document.getElementById('exp-date').value,
      notes: document.getElementById('exp-notes').value.trim()
    };

    if (!payload.title || isNaN(payload.amount) || payload.amount <= 0) {
      this.toast('Valid title and amount required', 'error');
      return;
    }

    try {
      if (id) {
        await this.api(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        this.toast('Expense updated!');
      } else {
        await this.api('/expenses', {
          method: 'POST',
          body: JSON.stringify({ ...payload, eventId: this.state.selectedEvent.id })
        });
        this.toast('Expense added!');
      }
      this.closeModal();
      await this.loadAll();
      this.render();
    } catch (err) {
      this.toast(err.message || 'Error saving expense', 'error');
    }
  },

  // ---------------- GUEST MODAL ----------------
  openGuestModal(guestId = null) {
    const isEdit = Boolean(guestId);
    const guest = isEdit ? this.state.selectedEvent.guests.find(g => g.id === guestId) : null;
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onclick="App.closeModal(event)">
        <div class="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6" onclick="event.stopPropagation()">
          <h2 class="text-base font-bold text-white mb-4">${isEdit ? 'Edit Guest Details' : 'Add New Guest'}</h2>
          <form onsubmit="App.saveGuest(event, '${guestId || ''}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Guest Full Name *</label>
              <input type="text" id="gst-name" required value="${guest?.name || ''}" placeholder="e.g. Dr. Julian Vance" class="glass-input text-sm">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Email</label>
                <input type="email" id="gst-email" value="${guest?.email || ''}" placeholder="julian@example.com" class="glass-input text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Phone</label>
                <input type="text" id="gst-phone" value="${guest?.phone || ''}" placeholder="+1 (555) 012-3456" class="glass-input text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">RSVP Status</label>
                <select id="gst-rsvp" class="glass-input text-sm">
                  <option value="pending" ${guest?.rsvpStatus === 'pending' ? 'selected' : ''}>🟡 Pending</option>
                  <option value="attending" ${guest?.rsvpStatus === 'attending' ? 'selected' : ''}>🟢 Attending</option>
                  <option value="declined" ${guest?.rsvpStatus === 'declined' ? 'selected' : ''}>🔴 Declined</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Plus-Ones</label>
                <input type="number" id="gst-plus" min="0" max="10" value="${guest?.plusOnes !== undefined ? guest.plusOnes : 0}" class="glass-input text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Dietary Needs</label>
                <input type="text" id="gst-diet" value="${guest?.dietaryRestrictions || 'None'}" placeholder="e.g. Vegan" class="glass-input text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Table / Group</label>
                <input type="text" id="gst-table" value="${guest?.tableGroup || 'General'}" placeholder="e.g. Table 1" class="glass-input text-sm">
              </div>
            </div>
            <div class="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300">Cancel</button>
              <button type="submit" class="gradient-btn px-5 py-2 rounded-xl text-xs font-semibold">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveGuest(e, id) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('gst-name').value.trim(),
      email: document.getElementById('gst-email').value.trim(),
      phone: document.getElementById('gst-phone').value.trim(),
      rsvpStatus: document.getElementById('gst-rsvp').value,
      plusOnes: Number(document.getElementById('gst-plus').value) || 0,
      dietaryRestrictions: document.getElementById('gst-diet').value.trim() || 'None',
      tableGroup: document.getElementById('gst-table').value.trim() || 'General'
    };

    if (!payload.name) {
      this.toast('Guest name is required', 'error');
      return;
    }

    try {
      if (id) {
        await this.api(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        this.toast('Guest details updated!');
      } else {
        await this.api('/guests', {
          method: 'POST',
          body: JSON.stringify({ ...payload, eventId: this.state.selectedEvent.id })
        });
        this.toast('Guest added to roster!');
      }
      this.closeModal();
      await this.loadAll();
      this.render();
    } catch (err) {
      this.toast(err.message || 'Error saving guest', 'error');
    }
  },

  async changeRsvp(guestId, status) {
    try {
      await this.api(`/guests/${guestId}/rsvp`, {
        method: 'PATCH',
        body: JSON.stringify({ rsvpStatus: status })
      });
      this.toast(`RSVP updated to ${status}`);
      await this.loadAll();
      this.render();
    } catch (e) {
      this.toast('Failed to update RSVP', 'error');
    }
  },

  // ---------------- TASK MODAL ----------------
  openTaskModal(taskId = null) {
    const isEdit = Boolean(taskId);
    const task = isEdit ? this.state.selectedEvent.tasks.find(t => t.id === taskId) : null;
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onclick="App.closeModal(event)">
        <div class="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6" onclick="event.stopPropagation()">
          <h2 class="text-base font-bold text-white mb-4">${isEdit ? 'Edit Checklist Task' : 'Add Milestone Task'}</h2>
          <form onsubmit="App.saveTask(event, '${taskId || ''}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Task Title *</label>
              <input type="text" id="tsk-title" required value="${task?.title || ''}" placeholder="e.g. Finalize floral arch installation" class="glass-input text-sm">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Category</label>
                <select id="tsk-cat" class="glass-input text-sm">
                  ${['Venue', 'Food & Drink', 'Decor', 'Invitations', 'Entertainment', 'Attire', 'General'].map(c => `
                    <option value="${c}" ${task?.category === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Priority</label>
                <select id="tsk-priority" class="glass-input text-sm">
                  <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>🔴 High</option>
                  <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
                  <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>⚪ Low</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Due Date</label>
                <input type="date" id="tsk-due" value="${task?.dueDate || ''}" class="glass-input text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Assigned Person</label>
                <input type="text" id="tsk-assign" value="${task?.assignedTo || ''}" placeholder="e.g. Elena" class="glass-input text-sm">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-zinc-400 mb-1">Notes</label>
              <input type="text" id="tsk-notes" value="${task?.notes || ''}" placeholder="Details or supplier instructions" class="glass-input text-sm">
            </div>
            <div class="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300">Cancel</button>
              <button type="submit" class="gradient-btn px-5 py-2 rounded-xl text-xs font-semibold">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async saveTask(e, id) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('tsk-title').value.trim(),
      category: document.getElementById('tsk-cat').value,
      priority: document.getElementById('tsk-priority').value,
      dueDate: document.getElementById('tsk-due').value,
      assignedTo: document.getElementById('tsk-assign').value.trim(),
      notes: document.getElementById('tsk-notes').value.trim()
    };

    if (!payload.title) {
      this.toast('Task description is required', 'error');
      return;
    }

    try {
      if (id) {
        await this.api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        this.toast('Task updated!');
      } else {
        await this.api('/tasks', {
          method: 'POST',
          body: JSON.stringify({ ...payload, eventId: this.state.selectedEvent.id })
        });
        this.toast('Checklist task created!');
      }
      this.closeModal();
      await this.loadAll();
      this.render();
    } catch (err) {
      this.toast(err.message || 'Error saving task', 'error');
    }
  },

  async toggleTask(id) {
    try {
      const res = await this.api(`/tasks/${id}/toggle`, { method: 'PATCH' });
      if (res.data?.completed) {
        this.triggerConfetti();
      }
      this.toast(res.message);
      await this.loadAll();
      this.render();
    } catch (e) {
      this.toast('Error toggling task', 'error');
    }
  },

  // ---------------- DELETE CONFIRMATIONS ----------------
  confirmDeleteEvent(id, title) {
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onclick="App.closeModal(event)">
        <div class="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6" onclick="event.stopPropagation()">
          <h3 class="text-base font-bold text-white mb-2">Delete Celebration?</h3>
          <p class="text-xs text-zinc-400 mb-5">Are you sure you want to delete "${title}"? All associated budget items, guests, and checklist tasks will also be removed.</p>
          <div class="flex justify-end gap-3">
            <button onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-300">Cancel</button>
            <button onclick="App.executeDeleteEvent('${id}')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer">Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  async executeDeleteEvent(id) {
    try {
      await this.api(`/events/${id}`, { method: 'DELETE' });
      this.toast('Celebration deleted');
      this.closeModal();
      if (this.state.selectedEvent?.id === id) {
        this.state.selectedEvent = null;
        this.state.currentView = 'dashboard';
      }
      await this.loadAll();
      this.render();
    } catch (e) {
      this.toast('Failed to delete celebration', 'error');
    }
  },

  confirmDeleteExpense(id) {
    if (confirm('Delete this expense record?')) {
      this.api(`/expenses/${id}`, { method: 'DELETE' })
        .then(() => {
          this.toast('Expense deleted');
          return this.loadAll();
        })
        .then(() => this.render());
    }
  },

  confirmDeleteGuest(id) {
    if (confirm('Remove this guest from the invitation roster?')) {
      this.api(`/guests/${id}`, { method: 'DELETE' })
        .then(() => {
          this.toast('Guest removed');
          return this.loadAll();
        })
        .then(() => this.render());
    }
  },

  confirmDeleteTask(id) {
    if (confirm('Delete this checklist task?')) {
      this.api(`/tasks/${id}`, { method: 'DELETE' })
        .then(() => {
          this.toast('Task deleted');
          return this.loadAll();
        })
        .then(() => this.render());
    }
  },

  closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('modal-container');
    if (modal) modal.innerHTML = '';
  },

  openEventDetail(id) {
    const ev = this.state.events.find(e => e.id === id);
    if (!ev) return;
    this.state.selectedEvent = ev;
    this.state.detailSubTab = 'overview';
    this.navigate('detail');
  },

  async resetSeed() {
    if (confirm('Load / reset realistic sample celebrations? (Sophia Birthday, Luxe Wedding, Golden Anniversary, Masquerade Party)')) {
      try {
        await this.api('/stats/seed', { method: 'POST' });
        this.toast('Demo celebrations loaded!');
        await this.loadAll();
        this.navigate('dashboard');
      } catch (e) {
        this.toast('Failed to load demo data', 'error');
      }
    }
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
