const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateEvent } = require('../middleware/validation');

// GET all events with optional filter & sort
router.get('/', (req, res) => {
  try {
    const { category, search, sortBy, sortOrder } = req.query;
    const events = db.getAllEvents({ category, search, sortBy, sortOrder });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve events', error: err.message });
  }
});

// GET single event by id (with expenses, guests, tasks and calculated stats)
router.get('/:id', (req, res) => {
  try {
    const event = db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve event', error: err.message });
  }
});

// POST create new event
router.post('/', validateEvent, (req, res) => {
  try {
    const newEvent = db.createEvent(req.body);
    res.status(201).json({ success: true, message: 'Celebration event created successfully', data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create event', error: err.message });
  }
});

// PUT update event
router.put('/:id', validateEvent, (req, res) => {
  try {
    const updated = db.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Celebration event updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update event', error: err.message });
  }
});

// DELETE event (cascade deletes expenses, guests, checklist)
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteEvent(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Celebration event and all associated records deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: err.message });
  }
});

// Sub-resource helpers:
// GET /api/events/:id/expenses
router.get('/:id/expenses', (req, res) => {
  try {
    const expenses = db.getExpensesByEvent(req.params.id);
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve expenses', error: err.message });
  }
});

// GET /api/events/:id/guests
router.get('/:id/guests', (req, res) => {
  try {
    const guests = db.getGuestsByEvent(req.params.id);
    res.json({ success: true, count: guests.length, data: guests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve guests', error: err.message });
  }
});

// GET /api/events/:id/tasks
router.get('/:id/tasks', (req, res) => {
  try {
    const tasks = db.getTasksByEvent(req.params.id);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks', error: err.message });
  }
});

module.exports = router;
