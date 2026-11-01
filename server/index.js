const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { loadInitialSeed } = require('./seedData');

// Ensure seed data exists on first boot
loadInitialSeed(false);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Celebration & Event Planner API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files from dist or public
const distPath = path.join(__dirname, '..', 'dist');
const publicPath = path.join(__dirname, '..', 'public');
const staticDir = (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html')))
  ? distPath 
  : publicPath;

app.use(express.static(staticDir));

// SPA catch-all fallback for non-API routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Celebration Planner API</title></head>
    <body style="background:#09090b;color:#f3e8ff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;padding:2rem;background:#18181b;border:1px solid #7c3aed;border-radius:12px;">
        <h1 style="color:#d946ef;">Celebration Event Planner Server</h1>
        <p style="color:#a1a1aa;">Backend API is running on port ${PORT}.</p>
        <p>API status: <a href="/api/health" style="color:#c084fc;">/api/health</a></p>
      </div>
    </body>
    </html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Celebration Event Planner server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
