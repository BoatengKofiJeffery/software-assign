const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session Management
app.use(
  session({
    name: 'oqems.sid',
    secret: process.env.SESSION_SECRET || 'oqems_super_secure_session_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    }
  })
);

// Server-side Role-Based Protection for HTML Dashboard Routes
const roleRedirectMap = {
  admin: '/admin.html',
  lecturer: '/lecturer.html',
  student: '/student.html'
};

app.get('/admin.html', (req, res, next) => {
  if (!req.session?.user) return res.redirect('/index.html');
  if (req.session.user.role !== 'admin') return res.redirect(roleRedirectMap[req.session.user.role] || '/index.html');
  next();
});

app.get('/lecturer.html', (req, res, next) => {
  if (!req.session?.user) return res.redirect('/index.html');
  if (req.session.user.role !== 'lecturer') return res.redirect(roleRedirectMap[req.session.user.role] || '/index.html');
  next();
});

app.get('/student.html', (req, res, next) => {
  if (!req.session?.user) return res.redirect('/index.html');
  if (req.session.user.role !== 'student') return res.redirect(roleRedirectMap[req.session.user.role] || '/index.html');
  next();
});

app.get('/exam.html', (req, res, next) => {
  if (!req.session?.user) return res.redirect('/index.html');
  if (req.session.user.role !== 'student') return res.redirect(roleRedirectMap[req.session.user.role] || '/index.html');
  next();
});

// Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Initialize Database & Start Server
async function startServer() {
  try {
    await initializeDatabase({ forceReset: false, seedSample: true });
    console.log('[Database] Connected and verified MySQL schema successfully.');
  } catch (dbErr) {
    console.warn(
      `[Database Warning] Could not auto-initialize MySQL (${dbErr.message}).\n` +
        `Please verify DB_USER and DB_PASSWORD in your .env file and run: npm run db:setup`
    );
  }

  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` Online Quiz & Examination Management System (OQEMS)`);
    console.log(` Server running at: http://localhost:${PORT}`);
    console.log(`================================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;

