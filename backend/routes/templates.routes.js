/**
 * Templates Routes
 * Handles message templates endpoints
 */

const express = require('express');
const router = express.Router();

const templatesController = require('../controllers/templates.controller');
const { authenticate, isAdmin } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/templates
 * Get all templates (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', templatesController.getAllTemplates);

/**
 * GET /api/templates/:id
 * Get template by ID
 * Requires: Authentication
 */
router.get('/:id', templatesController.getTemplateById);

/**
 * POST /api/templates
 * Create template
 * Requires: Authentication
 */
router.post('/', templatesController.createTemplate);

/**
 * PATCH /api/templates/:id
 * Update template
 * Requires: Authentication
 */
router.patch('/:id', templatesController.updateTemplate);

/**
 * DELETE /api/templates/:id
 * Delete template (admin only)
 * Requires: Authentication (admin)
 */
router.delete('/:id', isAdmin, templatesController.deleteTemplate);

module.exports = router;

