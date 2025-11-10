/**
 * Contacts Routes
 * Handles contacts endpoints
 */

const express = require('express');
const router = express.Router();

const contactsController = require('../controllers/contacts.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/contacts
 * Get all contacts (with pagination and filters)
 * Requires: Authentication
 */
router.get('/', contactsController.getAllContacts);

/**
 * GET /api/contacts/:id
 * Get contact by ID
 * Requires: Authentication
 */
router.get('/:id', contactsController.getContactById);

/**
 * POST /api/contacts
 * Create contact
 * Requires: Authentication
 */
router.post('/', contactsController.createContact);

/**
 * POST /api/contacts/bulk
 * Bulk create contacts
 * Requires: Authentication
 */
router.post('/bulk', contactsController.bulkCreateContacts);

/**
 * PATCH /api/contacts/:id
 * Update contact
 * Requires: Authentication
 */
router.patch('/:id', contactsController.updateContact);

/**
 * DELETE /api/contacts/:id
 * Delete contact
 * Requires: Authentication
 */
router.delete('/:id', contactsController.deleteContact);

module.exports = router;

