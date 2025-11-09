/**
 * Notifications Routes
 * Handles notifications endpoints
 */

const express = require('express');
const router = express.Router();

const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get user notifications
 * Requires: Authentication
 */
router.get('/', notificationsController.getUserNotifications);

/**
 * GET /api/notifications/unread-count
 * Get unread notifications count
 * Requires: Authentication
 */
router.get('/unread-count', notificationsController.getUnreadCount);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 * Requires: Authentication
 */
router.patch('/:id/read', notificationsController.markAsRead);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 * Requires: Authentication
 */
router.patch('/read-all', notificationsController.markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 * Requires: Authentication
 */
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;

