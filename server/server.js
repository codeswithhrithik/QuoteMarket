/**
 * ============================================================================
 * QuoteCraft - Server Entry Point
 * ============================================================================
 * Express Application configured with MongoDB, CORS, JWT Auth, and REST APIs.
 * Automatically serves the compiled React client in production.
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // Fallback for root .env
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const partyRoutes = require('./routes/partyRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const seedSuperAdmin = require('./config/seedAdmin');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and seed Super Admin
connectDB().then(() => {
  seedSuperAdmin();
});

// Middlewares
app.use(cors({
  origin: '*', // Allows local dev and hosted client origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Generous payload limit to accommodate custom logos & signature data URLs
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request Logger (Development friendly)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'QuoteCraft Quotation Manager API'
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Serve client build if available (production ready)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  
  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 QuoteCraft Server running on port: http://localhost:${PORT}`);
  console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
  if (fs.existsSync(clientDistPath)) {
    console.log(`🌐 Full-Stack Web App: http://localhost:${PORT}`);
  }
  console.log(`====================================================`);
});
