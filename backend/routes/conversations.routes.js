/**
 * Conversations Routes
 * Handles conversations management endpoints
 */

const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversations.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/conversations
 * Get all conversations (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', conversationsController.getAllConversations);

/**
 * GET /api/conversations/phone/:phoneNumber
 * Get conversation by phone number
 * Requires: Authentication
 * Note: This route must be before /:id to avoid route conflicts
 */
router.get('/phone/:phoneNumber', conversationsController.getConversationByPhoneNumber);

/**
 * GET /api/conversations/:id
 * Get conversation by ID
 * Requires: Authentication
 */
router.get('/:id', conversationsController.getConversationById);

/**
 * GET /api/conversations/:id/messages
 * Get conversation messages
 * Requires: Authentication
 */
router.get('/:id/messages', conversationsController.getConversationMessages);

/**
 * PATCH /api/conversations/:id
 * Update conversation
 * Requires: Authentication
 */
router.patch('/:id', conversationsController.updateConversation);

/**
 * GET /api/conversations/needing-response
 * Get conversations that need response
 * Requires: Authentication
 * Note: This route must be before /:id to avoid route conflicts
 */
router.get('/needing-response', conversationsController.getConversationsNeedingResponse);

/**
 * GET /api/conversations/workload/employees
 * Get all employees workload
 * Requires: Authentication (admin or supervisor)
 * Note: This route must be before /:id to avoid route conflicts
 */
router.get('/workload/employees', conversationsController.getAllEmployeesWorkload);

/**
 * GET /api/conversations/workload/:employeeId
 * Get employee workload
 * Requires: Authentication
 * Note: This route must be before /:id to avoid route conflicts
 */
router.get('/workload/:employeeId', conversationsController.getEmployeeWorkload);

/**
 * POST /api/conversations/:id/assign
 * Assign conversation to user
 * Requires: Authentication (admin or supervisor)
 */
router.post('/:id/assign', conversationsController.assignConversation);

/**
 * POST /api/conversations/:id/auto-assign
 * Auto-assign conversation using distribution algorithm
 * Requires: Authentication (admin or supervisor)
 */
router.post('/:id/auto-assign', conversationsController.autoAssignConversation);

/**
 * POST /api/conversations/:id/transfer
 * Transfer conversation to another user
 * Requires: Authentication
 */
router.post('/:id/transfer', conversationsController.transferConversation);

/**
 * POST /api/conversations/:id/close
 * Close conversation
 * Requires: Authentication
 */
router.post('/:id/close', conversationsController.closeConversation);

/**
 * DELETE /api/conversations/:id
 * Delete conversation (admin only)
 * Requires: Authentication (admin)
 */
router.delete('/:id', conversationsController.deleteConversation);

module.exports = router;

