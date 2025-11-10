/**
 * Automations Routes
 * Handles automations endpoints
 */

const express = require('express');
const router = express.Router();

const automationsController = require('../controllers/automations.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/automations
 * Get all automations (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', automationsController.getAllAutomations);

/**
 * GET /api/automations/:id
 * Get automation by ID
 * Requires: Authentication
 */
router.get('/:id', automationsController.getAutomationById);

/**
 * POST /api/automations
 * Create automation
 * Requires: Authentication
 */
router.post('/', automationsController.createAutomation);

/**
 * PATCH /api/automations/:id
 * Update automation
 * Requires: Authentication
 */
router.patch('/:id', automationsController.updateAutomation);

/**
 * DELETE /api/automations/:id
 * Delete automation
 * Requires: Authentication
 */
router.delete('/:id', automationsController.deleteAutomation);

module.exports = router;

