/**
 * Messages Routes
 * Handles WhatsApp messages management endpoints
 */

const express = require('express');
const router = express.Router();

// TODO: Import messages controller and middleware
const messagesController = require('../controllers/messages.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/messages
 * Get all messages (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', messagesController.getAllMessages);

/**
 * GET /api/messages/:id
 * Get message by ID
 * Requires: Authentication
 */
router.get('/:id', messagesController.getMessageById);

/**
 * POST /api/messages
 * Send new message
 * Requires: Authentication
 */
router.post('/', messagesController.sendMessage);

/**
 * PUT /api/messages/:id
 * Update message status
 * Requires: Authentication
 */
router.put('/:id', messagesController.updateMessageStatus);

/**
 * DELETE /api/messages/:id
 * Delete message
 * Requires: Authentication
 */
router.delete('/:id', messagesController.deleteMessage);

/**
 * GET /api/messages/conversation/:phoneNumber
 * Get conversation by phone number
 * Requires: Authentication
 */
router.get('/conversation/:phoneNumber', messagesController.getConversation);

module.exports = router;

