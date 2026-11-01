const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'An error occurred during the request');
      err.data = data;
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },

  getEventById: (id) => request(`/events/${id}`),

  createEvent: (data) => request('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateEvent: (id, data) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteEvent: (id) => request(`/events/${id}`, {
    method: 'DELETE'
  }),

  // Expenses
  createExpense: (eventId, data) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify({ ...data, eventId })
  }),

  updateExpense: (id, data) => request(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteExpense: (id) => request(`/expenses/${id}`, {
    method: 'DELETE'
  }),

  // Guests
  createGuest: (eventId, data) => request('/guests', {
    method: 'POST',
    body: JSON.stringify({ ...data, eventId })
  }),

  updateGuest: (id, data) => request(`/guests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  updateGuestRsvp: (id, rsvpStatus) => request(`/guests/${id}/rsvp`, {
    method: 'PATCH',
    body: JSON.stringify({ rsvpStatus })
  }),

  deleteGuest: (id) => request(`/guests/${id}`, {
    method: 'DELETE'
  }),

  // Tasks
  createTask: (eventId, data) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ ...data, eventId })
  }),

  updateTask: (id, data) => request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  toggleTask: (id) => request(`/tasks/${id}/toggle`, {
    method: 'PATCH'
  }),

  deleteTask: (id) => request(`/tasks/${id}`, {
    method: 'DELETE'
  }),

  // Dashboard Stats
  getStats: () => request('/stats'),

  seedDemoData: () => request('/stats/seed', {
    method: 'POST'
  })
};
