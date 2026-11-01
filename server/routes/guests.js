const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateGuest } = require('../middleware/validation');

// POST create guest
router.post('/', validateGuest, (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required to register a guest' });
    }
    const guest = db.createGuest(eventId, req.body);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Event not found for this guest' });
    }
    res.status(201).json({ success: true, message: 'Guest added successfully', data: guest });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create guest', error: err.message });
  }
});

// PUT update guest
router.put('/:id', validateGuest, (req, res) => {
  try {
    const updated = db.updateGuest(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, message: 'Guest updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update guest', error: err.message });
  }
});

// PATCH quick RSVP status update
router.patch('/:id/rsvp', (req, res) => {
  try {
    const { rsvpStatus } = req.body;
    if (!['attending', 'pending', 'declined'].includes(rsvpStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid RSVP status' });
    }
    const updated = db.updateGuest(req.params.id, { rsvpStatus });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, message: 'RSVP updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update RSVP', error: err.message });
  }
});

// DELETE guest
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteGuest(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.json({ success: true, message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete guest', error: err.message });
  }
});

module.exports = router;
