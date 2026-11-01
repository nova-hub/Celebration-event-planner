const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateExpense } = require('../middleware/validation');

// POST new expense for an event: /api/expenses?eventId=... or /api/expenses
router.post('/', validateExpense, (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required to create an expense' });
    }
    const expense = db.createExpense(eventId, req.body);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Event not found for this expense' });
    }
    res.status(201).json({ success: true, message: 'Expense added successfully', data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create expense', error: err.message });
  }
});

// PUT update expense: /api/expenses/:id
router.put('/:id', validateExpense, (req, res) => {
  try {
    const updated = db.updateExpense(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update expense', error: err.message });
  }
});

// DELETE expense: /api/expenses/:id
router.delete('/:id', (req, res) => {
  try {
    const success = db.deleteExpense(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete expense', error: err.message });
  }
});

module.exports = router;
