/**
 * Contacts Controller
 * Handles contacts business logic
 */

const Contact = require('../models/contact.model');

/**
 * Get all contacts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllContacts = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      search,
      is_active
    } = req.query;

    // Parse limit and offset
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

    // Validate limit and offset
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Offset must be a non-negative number'
      });
    }

    // Get contacts
    const result = await Contact.getAllContacts({
      limit: limitInt,
      offset: offsetInt,
      search,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined
    });

    res.status(200).json({
      message: 'Contacts retrieved successfully',
      data: result.contacts,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.contacts.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve contacts',
      message: error.message
    });
  }
};

/**
 * Get contact by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Contact ID is required'
      });
    }

    const contact = await Contact.findContactById(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'Contact with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Contact retrieved successfully',
      data: contact
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve contact',
      message: error.message
    });
  }
};

/**
 * Create contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createContact = async (req, res) => {
  try {
    const {
      phone_number,
      name,
      email,
      custom_fields = {},
      metadata = {},
      is_active = true
    } = req.body;

    // Validate required fields
    if (!phone_number) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number is required'
      });
    }

    // Create contact
    const contact = await Contact.createContact({
      phone_number,
      name,
      email,
      custom_fields,
      metadata,
      is_active
    });

    res.status(201).json({
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    
    if (error.message === 'Phone number already exists') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create contact',
      message: error.message
    });
  }
};

/**
 * Update contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Contact ID is required'
      });
    }

    // Check if contact exists
    const existingContact = await Contact.findContactById(id);
    if (!existingContact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'Contact with the specified ID does not exist'
      });
    }

    // Update contact
    const updatedContact = await Contact.updateContact(id, updateData);

    res.status(200).json({
      message: 'Contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: error.message
    });
  }
};

/**
 * Delete contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Contact ID is required'
      });
    }

    const deleted = await Contact.deleteContact(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'Contact could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Contact deleted successfully',
      note: 'Contact has been soft deleted'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error.message
    });
  }
};

/**
 * Bulk create contacts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreateContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Contacts array is required'
      });
    }

    if (contacts.length > 1000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Maximum 1000 contacts can be created at once'
      });
    }

    const createdContacts = await Contact.bulkCreateContacts(contacts);

    res.status(201).json({
      message: `Successfully created ${createdContacts.length} contacts`,
      data: createdContacts,
      total: contacts.length,
      created: createdContacts.length,
      failed: contacts.length - createdContacts.length
    });
  } catch (error) {
    console.error('Bulk create contacts error:', error);
    res.status(500).json({
      error: 'Failed to create contacts',
      message: error.message
    });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkCreateContacts
};

