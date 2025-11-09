/**
 * Templates Controller
 * Handles message templates business logic
 */

const Template = require('../models/template.model');

/**
 * Get all templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTemplates = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      category,
      language,
      includeDeleted = false
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

    // Get templates
    const result = await Template.getAllTemplates({
      limit: limitInt,
      offset: offsetInt,
      status,
      category,
      language,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
    });

    res.status(200).json({
      message: 'Templates retrieved successfully',
      data: result.templates,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.templates.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all templates error:', error);
    res.status(500).json({
      error: 'Failed to retrieve templates',
      message: error.message
    });
  }
};

/**
 * Get template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate template ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template ID is required'
      });
    }

    // Get template
    const template = await Template.findTemplateById(id);

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: 'Template with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Template retrieved successfully',
      data: template
    });
  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve template',
      message: error.message
    });
  }
};

/**
 * Create template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      content,
      category,
      language = 'ar',
      status = 'pending_approval',
      whatsapp_template_id,
      variables = [],
      metadata = {}
    } = req.body;

    const currentUser = req.user;

    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and content are required'
      });
    }

    // Create template
    const template = await Template.createTemplate({
      name,
      content,
      category,
      language,
      status,
      whatsapp_template_id,
      variables,
      created_by: currentUser?.id || null,
      metadata
    });

    res.status(201).json({
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    
    // Handle specific errors
    if (error.message === 'WhatsApp template ID already exists') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create template',
      message: error.message
    });
  }
};

/**
 * Update template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    // Validate template ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template ID is required'
      });
    }

    // Check if template exists
    const existingTemplate = await Template.findTemplateById(id);
    if (!existingTemplate) {
      return res.status(404).json({
        error: 'Template not found',
        message: 'Template with the specified ID does not exist'
      });
    }

    // Check permissions
    // Only admins and supervisors can approve templates
    if (updateData.status === 'active' && currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators and supervisors can approve templates'
      });
    }

    // Add approved_by if status is being changed to active
    if (updateData.status === 'active' && currentUser.role !== 'employee') {
      updateData.approved_by = currentUser.id;
    }

    // Update template
    const updatedTemplate = await Template.updateTemplate(id, updateData);

    res.status(200).json({
      message: 'Template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Update template error:', error);
    
    // Handle specific errors
    if (error.message === 'WhatsApp template ID already exists') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update template',
      message: error.message
    });
  }
};

/**
 * Delete template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate template ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template ID is required'
      });
    }

    // Check permissions (admin only)
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete templates'
      });
    }

    // Delete template (soft delete)
    const deleted = await Template.deleteTemplate(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Template not found',
        message: 'Template could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Template deleted successfully',
      note: 'Template has been soft deleted'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message
    });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};

