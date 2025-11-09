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
const conversationsRoutes = require('./conversations.routes');
const templatesRoutes = require('./templates.routes');
const broadcastsRoutes = require('./broadcasts.routes');
const statisticsRoutes = require('./statistics.routes');
const notificationsRoutes = require('./notifications.routes');
const whatsappRoutes = require('./whatsapp.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/templates', templatesRoutes);
router.use('/broadcasts', broadcastsRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/notifications', notificationsRoutes);
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
      conversations: '/api/conversations',
      templates: '/api/templates',
      broadcasts: '/api/broadcasts',
      statistics: '/api/statistics',
      notifications: '/api/notifications',
      whatsapp: '/api/whatsapp'
    }
  });
});

module.exports = router;





