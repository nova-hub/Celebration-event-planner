const express = require('express');
const router = express.Router();
const db = require('../database');
const { getSampleData } = require('../seedData');

// GET dashboard statistics
router.get('/', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve stats', error: err.message });
  }
});

// POST seed or reset demo celebrations
router.post('/seed', (req, res) => {
  try {
    const sample = getSampleData();
    db.seedData(sample);
    res.json({ success: true, message: 'Demo celebrations loaded successfully!', data: db.getDashboardStats() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to seed sample data', error: err.message });
  }
});

// GET export all data as JSON
router.get('/export', (req, res) => {
  try {
    const data = db.readDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="celebration-planner-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export database', error: err.message });
  }
});

module.exports = router;
