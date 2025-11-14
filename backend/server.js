/**
 * WhatsApp Dashboard Backend Server
 * Main entry point for the backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./config/database');
const { initSocket } = require('./services/socket.service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS Configuration - Support multiple origins for production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

// Always add production frontend URL
const productionFrontendUrl = 'https://whatsapp-dashboard-frontend.onrender.com';
if (!allowedOrigins.includes(productionFrontendUrl)) {
  allowedOrigins.push(productionFrontendUrl);
}

// Add development localhost only if not in production
if (process.env.NODE_ENV !== 'production') {
  if (!allowedOrigins.includes('http://localhost:5173')) {
    allowedOrigins.push('http://localhost:5173');
  }
}

const shouldServeFrontend = (process.env.SERVE_FRONTEND || '').toLowerCase() === 'true';
const frontendBuildPath = process.env.FRONTEND_BUILD_PATH || path.join(__dirname, '..', 'frontend', 'dist');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log CORS configuration
console.log('🌐 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'All origins');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   SPA Fallback:', shouldServeFrontend ? `enabled (${frontendBuildPath})` : 'disabled');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WhatsApp Dashboard Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Root endpoint (only when frontend is not being served from this server)
if (!shouldServeFrontend) {
  app.get('/', (req, res) => {
    res.json({
      message: 'WhatsApp Dashboard Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        apiHealth: '/api/health',
        api: '/api'
      }
    });
  });
}

const configureSpaFallback = () => {
  if (!shouldServeFrontend) {
    return;
  }

  if (!fs.existsSync(frontendBuildPath)) {
    console.warn('⚠️ SERVE_FRONTEND=true but build directory not found:', frontendBuildPath);
    console.warn('   Run `npm run build` inside frontend/ or set FRONTEND_BUILD_PATH to a valid directory.');
    return;
  }

  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }

    if (req.method !== 'GET') {
      return next();
    }

    // Let asset requests fall through to static middleware/404
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      return next();
    }

    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  console.log('🧱 SPA fallback is enabled. Serving frontend from:', frontendBuildPath);
};

configureSpaFallback();

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  // Test database connection
  if (process.env.NODE_ENV !== 'test') {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will continue but database operations may fail.');
    }
  }

  initSocket(server, { allowedOrigins });

  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = {
  app,
  server
};


