const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'events.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  events: [],
  expenses: [],
  guests: [],
  tasks: []
};

// Thread-safe / process-safe atomic file writing
function readDatabase() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeDatabase(defaultData);
      return JSON.parse(JSON.stringify(defaultData));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, returning default data:', err);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeDatabase(data) {
  try {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error writing to database:', err);
    throw err;
  }
}

// Generate unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ----------------- EVENTS -----------------
function getAllEvents({ category, search, sortBy = 'date', sortOrder = 'asc' } = {}) {
  const db = readDatabase();
  let list = db.events.map(ev => {
    // Enrich with summary counts for fast dashboard rendering
    const expenses = db.expenses.filter(e => e.eventId === ev.id);
    const guests = db.guests.filter(g => g.eventId === ev.id);
    const tasks = db.tasks.filter(t => t.eventId === ev.id);

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const paidSpent = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const attendingCount = guests.filter(g => g.rsvpStatus === 'attending').reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0);
    const completedTasks = tasks.filter(t => t.completed).length;

    return {
      ...ev,
      stats: {
        totalSpent,
        paidSpent,
        totalExpenses: expenses.length,
        totalGuests: guests.length,
        attendingCount,
        totalTasks: tasks.length,
        completedTasks,
        taskProgress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
      }
    };
  });

  if (category && category !== 'all') {
    list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) || 
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.venue && e.venue.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'date') {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }

    if (typeof valA === 'string') {
      return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    return sortOrder === 'desc' ? (valB - valA) : (valA - valB);
  });

  return list;
}

function getEventById(id) {
  const db = readDatabase();
  const event = db.events.find(e => e.id === id);
  if (!event) return null;

  const expenses = db.expenses.filter(e => e.eventId === id);
  const guests = db.guests.filter(g => g.eventId === id);
  const tasks = db.tasks.filter(t => t.eventId === id);

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const paidSpent = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const attendingCount = attendingGuests.reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0);
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return {
    ...event,
    expenses,
    guests,
    tasks,
    stats: {
      targetBudget: Number(event.targetBudget) || 0,
      totalSpent,
      paidSpent,
      remainingBudget: (Number(event.targetBudget) || 0) - totalSpent,
      budgetUsedPercentage: (Number(event.targetBudget) || 0) > 0 ? Math.min(100, Math.round((totalSpent / Number(event.targetBudget)) * 100)) : 0,
      totalGuests: guests.length,
      attendingCount,
      pendingGuests,
      declinedGuests,
      totalTasks: tasks.length,
      completedTasks,
      taskProgress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
    }
  };
}

function createEvent(payload) {
  const db = readDatabase();
  const newEvent = {
    id: generateId(),
    title: payload.title.trim(),
    category: payload.category || 'party', // birthday, wedding, anniversary, party
    date: payload.date, // YYYY-MM-DD
    time: payload.time || '18:00',
    venue: payload.venue ? payload.venue.trim() : 'TBD',
    description: payload.description ? payload.description.trim() : '',
    targetBudget: Number(payload.targetBudget) || 0,
    coverTheme: payload.coverTheme || 'purple-pink', // gradient/theme preset
    status: payload.status || 'planning', // planning, confirmed, completed, cancelled
    themeColor: payload.themeColor || '#a855f7',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.events.unshift(newEvent);
  writeDatabase(db);
  return getEventById(newEvent.id);
}

function updateEvent(id, payload) {
  const db = readDatabase();
  const index = db.events.findIndex(e => e.id === id);
  if (index === -1) return null;

  db.events[index] = {
    ...db.events[index],
    title: payload.title !== undefined ? payload.title.trim() : db.events[index].title,
    category: payload.category !== undefined ? payload.category : db.events[index].category,
    date: payload.date !== undefined ? payload.date : db.events[index].date,
    time: payload.time !== undefined ? payload.time : db.events[index].time,
    venue: payload.venue !== undefined ? payload.venue.trim() : db.events[index].venue,
    description: payload.description !== undefined ? payload.description.trim() : db.events[index].description,
    targetBudget: payload.targetBudget !== undefined ? Number(payload.targetBudget) : db.events[index].targetBudget,
    coverTheme: payload.coverTheme !== undefined ? payload.coverTheme : db.events[index].coverTheme,
    status: payload.status !== undefined ? payload.status : db.events[index].status,
    themeColor: payload.themeColor !== undefined ? payload.themeColor : db.events[index].themeColor,
    notes: payload.notes !== undefined ? payload.notes : db.events[index].notes,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return getEventById(id);
}

function deleteEvent(id) {
  const db = readDatabase();
  const exists = db.events.some(e => e.id === id);
  if (!exists) return false;

  db.events = db.events.filter(e => e.id !== id);
  // Cascade delete
  db.expenses = db.expenses.filter(e => e.eventId !== id);
  db.guests = db.guests.filter(g => g.eventId !== id);
  db.tasks = db.tasks.filter(t => t.eventId !== id);

  writeDatabase(db);
  return true;
}

// ----------------- EXPENSES -----------------
function getExpensesByEvent(eventId) {
  const db = readDatabase();
  return db.expenses.filter(e => e.eventId === eventId);
}

function createExpense(eventId, payload) {
  const db = readDatabase();
  const event = db.events.find(e => e.id === eventId);
  if (!event) return null;

  const newExpense = {
    id: generateId(),
    eventId,
    title: payload.title.trim(),
    category: payload.category || 'General', // Venue, Catering, Photography, Music, Decor, Cake, Attire, Other
    amount: Number(payload.amount) || 0,
    status: payload.status || 'pending', // 'paid' or 'pending'
    date: payload.date || new Date().toISOString().split('T')[0],
    notes: payload.notes ? payload.notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.expenses.push(newExpense);
  writeDatabase(db);
  return newExpense;
}

function updateExpense(id, payload) {
  const db = readDatabase();
  const index = db.expenses.findIndex(e => e.id === id);
  if (index === -1) return null;

  db.expenses[index] = {
    ...db.expenses[index],
    title: payload.title !== undefined ? payload.title.trim() : db.expenses[index].title,
    category: payload.category !== undefined ? payload.category : db.expenses[index].category,
    amount: payload.amount !== undefined ? Number(payload.amount) : db.expenses[index].amount,
    status: payload.status !== undefined ? payload.status : db.expenses[index].status,
    date: payload.date !== undefined ? payload.date : db.expenses[index].date,
    notes: payload.notes !== undefined ? payload.notes.trim() : db.expenses[index].notes,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.expenses[index];
}

function deleteExpense(id) {
  const db = readDatabase();
  const initialLength = db.expenses.length;
  db.expenses = db.expenses.filter(e => e.id !== id);
  if (db.expenses.length === initialLength) return false;
  writeDatabase(db);
  return true;
}

// ----------------- GUESTS -----------------
function getGuestsByEvent(eventId) {
  const db = readDatabase();
  return db.guests.filter(g => g.eventId === eventId);
}

function createGuest(eventId, payload) {
  const db = readDatabase();
  const event = db.events.find(e => e.id === eventId);
  if (!event) return null;

  const newGuest = {
    id: generateId(),
    eventId,
    name: payload.name.trim(),
    email: payload.email ? payload.email.trim() : '',
    phone: payload.phone ? payload.phone.trim() : '',
    rsvpStatus: payload.rsvpStatus || 'pending', // attending, pending, declined
    plusOnes: Number(payload.plusOnes) || 0,
    dietaryRestrictions: payload.dietaryRestrictions ? payload.dietaryRestrictions.trim() : 'None',
    tableGroup: payload.tableGroup ? payload.tableGroup.trim() : 'General',
    invitationSent: Boolean(payload.invitationSent),
    notes: payload.notes ? payload.notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.guests.push(newGuest);
  writeDatabase(db);
  return newGuest;
}

function updateGuest(id, payload) {
  const db = readDatabase();
  const index = db.guests.findIndex(g => g.id === id);
  if (index === -1) return null;

  db.guests[index] = {
    ...db.guests[index],
    name: payload.name !== undefined ? payload.name.trim() : db.guests[index].name,
    email: payload.email !== undefined ? payload.email.trim() : db.guests[index].email,
    phone: payload.phone !== undefined ? payload.phone.trim() : db.guests[index].phone,
    rsvpStatus: payload.rsvpStatus !== undefined ? payload.rsvpStatus : db.guests[index].rsvpStatus,
    plusOnes: payload.plusOnes !== undefined ? Number(payload.plusOnes) : db.guests[index].plusOnes,
    dietaryRestrictions: payload.dietaryRestrictions !== undefined ? payload.dietaryRestrictions.trim() : db.guests[index].dietaryRestrictions,
    tableGroup: payload.tableGroup !== undefined ? payload.tableGroup.trim() : db.guests[index].tableGroup,
    invitationSent: payload.invitationSent !== undefined ? Boolean(payload.invitationSent) : db.guests[index].invitationSent,
    notes: payload.notes !== undefined ? payload.notes.trim() : db.guests[index].notes,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.guests[index];
}

function deleteGuest(id) {
  const db = readDatabase();
  const initialLength = db.guests.length;
  db.guests = db.guests.filter(g => g.id !== id);
  if (db.guests.length === initialLength) return false;
  writeDatabase(db);
  return true;
}

// ----------------- CHECKLIST TASKS -----------------
function getTasksByEvent(eventId) {
  const db = readDatabase();
  return db.tasks.filter(t => t.eventId === eventId);
}

function createTask(eventId, payload) {
  const db = readDatabase();
  const event = db.events.find(e => e.id === eventId);
  if (!event) return null;

  const newTask = {
    id: generateId(),
    eventId,
    title: payload.title.trim(),
    category: payload.category || 'General', // Venue, Food & Drink, Decor, Invitations, Entertainment, Photography, Other
    dueDate: payload.dueDate || '',
    priority: payload.priority || 'medium', // high, medium, low
    completed: Boolean(payload.completed),
    assignedTo: payload.assignedTo ? payload.assignedTo.trim() : '',
    notes: payload.notes ? payload.notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  writeDatabase(db);
  return newTask;
}

function updateTask(id, payload) {
  const db = readDatabase();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  db.tasks[index] = {
    ...db.tasks[index],
    title: payload.title !== undefined ? payload.title.trim() : db.tasks[index].title,
    category: payload.category !== undefined ? payload.category : db.tasks[index].category,
    dueDate: payload.dueDate !== undefined ? payload.dueDate : db.tasks[index].dueDate,
    priority: payload.priority !== undefined ? payload.priority : db.tasks[index].priority,
    completed: payload.completed !== undefined ? Boolean(payload.completed) : db.tasks[index].completed,
    assignedTo: payload.assignedTo !== undefined ? payload.assignedTo.trim() : db.tasks[index].assignedTo,
    notes: payload.notes !== undefined ? payload.notes.trim() : db.tasks[index].notes,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  return db.tasks[index];
}

function toggleTask(id) {
  const db = readDatabase();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  db.tasks[index].completed = !db.tasks[index].completed;
  db.tasks[index].updatedAt = new Date().toISOString();
  writeDatabase(db);
  return db.tasks[index];
}

function deleteTask(id) {
  const db = readDatabase();
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== id);
  if (db.tasks.length === initialLength) return false;
  writeDatabase(db);
  return true;
}

// ----------------- DASHBOARD STATS -----------------
function getDashboardStats() {
  const db = readDatabase();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const totalEvents = db.events.length;
  const upcomingEvents = db.events.filter(e => e.date >= todayStr);
  const pastEvents = db.events.filter(e => e.date < todayStr);

  const totalTargetBudget = db.events.reduce((sum, e) => sum + (Number(e.targetBudget) || 0), 0);
  const totalActualSpent = db.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPaidExpenses = db.expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPendingExpenses = db.expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalGuests = db.guests.length;
  const totalAttendingGuests = db.guests
    .filter(g => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0);
  const totalPendingGuests = db.guests.filter(g => g.rsvpStatus === 'pending').length;
  const totalDeclinedGuests = db.guests.filter(g => g.rsvpStatus === 'declined').length;

  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.completed).length;
  const pendingTasks = db.tasks.filter(t => !t.completed).length;
  const overdueTasks = db.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  // Category counts
  const categoryCounts = {
    birthday: db.events.filter(e => e.category === 'birthday').length,
    wedding: db.events.filter(e => e.category === 'wedding').length,
    anniversary: db.events.filter(e => e.category === 'anniversary').length,
    party: db.events.filter(e => e.category === 'party').length
  };

  // Next 5 upcoming celebrations
  const nextUpcoming = [...upcomingEvents]
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
    .slice(0, 5)
    .map(ev => {
      const evExpenses = db.expenses.filter(e => e.eventId === ev.id);
      const evGuests = db.guests.filter(g => g.eventId === ev.id);
      const evTasks = db.tasks.filter(t => t.eventId === ev.id);
      const spent = evExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const attending = evGuests.filter(g => g.rsvpStatus === 'attending').reduce((s, g) => s + 1 + (Number(g.plusOnes) || 0), 0);
      const doneTasks = evTasks.filter(t => t.completed).length;

      return {
        ...ev,
        stats: {
          totalSpent: spent,
          attendingCount: attending,
          totalGuests: evGuests.length,
          totalTasks: evTasks.length,
          completedTasks: doneTasks
        }
      };
    });

  return {
    overview: {
      totalEvents,
      upcomingCount: upcomingEvents.length,
      pastCount: pastEvents.length,
      totalTargetBudget,
      totalActualSpent,
      totalPaidExpenses,
      totalPendingExpenses,
      totalGuests,
      totalAttendingGuests,
      totalPendingGuests,
      totalDeclinedGuests,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    },
    categoryCounts,
    nextUpcoming
  };
}

// Seed helper
function seedData(data) {
  writeDatabase(data);
  return true;
}

module.exports = {
  readDatabase,
  writeDatabase,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getExpensesByEvent,
  createExpense,
  updateExpense,
  deleteExpense,
  getGuestsByEvent,
  createGuest,
  updateGuest,
  deleteGuest,
  getTasksByEvent,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getDashboardStats,
  seedData
};
