/**
 * Broadcasts Routes
 * Handles broadcast campaigns endpoints
 */

const express = require('express');
const router = express.Router();

const broadcastsController = require('../controllers/broadcasts.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/broadcasts
 * Get all broadcasts (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', broadcastsController.getAllBroadcasts);

/**
 * GET /api/broadcasts/:id
 * Get broadcast by ID
 * Requires: Authentication
 */
router.get('/:id', broadcastsController.getBroadcastById);

/**
 * POST /api/broadcasts
 * Create broadcast
 * Requires: Authentication
 */
router.post('/', broadcastsController.createBroadcast);

/**
 * PATCH /api/broadcasts/:id
 * Update broadcast
 * Requires: Authentication
 */
router.patch('/:id', broadcastsController.updateBroadcast);

/**
 * DELETE /api/broadcasts/:id
 * Delete broadcast
 * Requires: Authentication
 */
router.delete('/:id', broadcastsController.deleteBroadcast);

module.exports = router;

