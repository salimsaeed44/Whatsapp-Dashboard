/**
 * Routes Index
 * Central route configuration file
 */

const express = require('express');
const router = express.Router();

// Health check endpoint (MUST be first to avoid route conflicts)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WhatsApp Dashboard Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      messages: '/api/messages',
      conversations: '/api/conversations',
      templates: '/api/templates',
      broadcasts: '/api/broadcasts',
      statistics: '/api/statistics',
      notifications: '/api/notifications',
      whatsapp: '/api/whatsapp',
      contacts: '/api/contacts',
      automations: '/api/automations'
    }
  });
});

// Import route modules
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const messagesRoutes = require('./messages.routes');
const conversationsRoutes = require('./conversations.routes');
const templatesRoutes = require('./templates.routes');
const broadcastsRoutes = require('./broadcasts.routes');
const statisticsRoutes = require('./statistics.routes');
const notificationsRoutes = require('./notifications.routes');
const whatsappRoutes = require('./whatsapp.routes');
const contactsRoutes = require('./contacts.routes');
const automationsRoutes = require('./automations.routes');

// Mount routes (after health and info endpoints)
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/templates', templatesRoutes);
router.use('/broadcasts', broadcastsRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/contacts', contactsRoutes);
router.use('/automations', automationsRoutes);

module.exports = router;





