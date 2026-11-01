const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateTask } = require('../middleware/validation');

// POST create task
router.post('/', validateTask, (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required to create a task' });
    }
    const task = db.createTask(eventId, req.body);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Event not found for this task' });
    }
    res.status(201).json({ success: true, message: 'Checklist task created successfully', data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: err.message });
  }
});

// PUT update task
router.put('/:id', validateTask, (req, res) => {
  try {
    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Checklist task updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: err.message });
  }
});

// PATCH toggle completion
router.patch('/:id/toggle', (req, res) => {
  try {
    const updated = db.toggleTask(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: `Task marked as ${updated.completed ? 'completed' : 'pending'}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle task', error: err.message });
  }
});

// DELETE task
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Checklist task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
