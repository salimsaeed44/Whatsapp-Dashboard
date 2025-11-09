/**
 * Routes Index
 * Central route configuration file
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const messagesRoutes = require('./messages.routes');
const whatsappRoutes = require('./whatsapp.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/whatsapp', whatsappRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Dashboard API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      messages: '/api/messages',
      whatsapp: '/api/whatsapp'
    }
  });
});

module.exports = router;

