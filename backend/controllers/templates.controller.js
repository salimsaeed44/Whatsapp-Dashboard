/**
 * Templates Controller
 * Handles message templates business logic
 */

const Template = require('../models/template.model');
const templatesService = require('../services/whatsapp/templates.service');

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
 * Create template and submit to Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      content,
      category = 'UTILITY',
      language = 'ar',
      components, // Meta API format components
      submitToMeta = true // Whether to submit to Meta
    } = req.body;

    const currentUser = req.user;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template name is required'
      });
    }

    let metaResponse = null;
    let whatsapp_template_id = null;
    let status = 'draft';

    // Submit to Meta if requested
    if (submitToMeta) {
      try {
        // Build components from content if not provided
        let templateComponents = components;
        
        if (!templateComponents && content) {
          // Simple text template
          templateComponents = {
            body: {
              text: content
            }
          };

          // Add example for body if there are variables
          const bodyVariables = content.match(/\{\{(\d+)\}\}/g) || [];
          if (bodyVariables.length > 0) {
            const exampleValues = bodyVariables.map((_, index) => `Sample${index + 1}`);
            templateComponents.body.example = {
              body_text: [exampleValues]
            };
          }
        }

        metaResponse = await templatesService.createTemplate({
          name: name.toLowerCase().replace(/\s+/g, '_'), // Meta requires lowercase with underscores
          category,
          language,
          components: templateComponents
        });

        whatsapp_template_id = metaResponse.template_id;
        status = metaResponse.status === 'APPROVED' ? 'approved' : 'pending_approval';
      } catch (metaError) {
        console.error('Meta API error:', metaError);
        return res.status(400).json({
          error: 'Meta API error',
          message: metaError.message || 'Failed to submit template to Meta'
        });
      }
    }

    // Save to local database
    const template = await Template.createTemplate({
      name,
      content,
      category,
      language,
      status,
      whatsapp_template_id,
      variables: [],
      created_by: currentUser?.id || null,
      metadata: {
        meta_response: metaResponse?.data,
        submitted_to_meta: submitToMeta
      }
    });

    res.status(201).json({
      message: submitToMeta ? 'Template created and submitted to Meta successfully' : 'Template created successfully',
      data: template,
      meta_response: metaResponse
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

/**
 * Convert Meta template status to local database status
 * @param {string} metaStatus - Status from Meta API
 * @returns {string} Local database status
 */
const convertMetaStatusToLocalStatus = (metaStatus) => {
  if (!metaStatus) {
    return 'pending_approval';
  }

  const statusMap = {
    'APPROVED': 'active',
    'PENDING': 'pending_approval',
    'REJECTED': 'inactive',
    'PAUSED': 'inactive',
    'DISABLED': 'inactive',
    'approved': 'active',
    'pending': 'pending_approval',
    'rejected': 'inactive',
    'paused': 'inactive',
    'disabled': 'inactive'
  };

  return statusMap[metaStatus] || 'pending_approval';
};

/**
 * Sync templates from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const syncTemplatesFromMeta = async (req, res) => {
  try {
    const { limit = 100, after } = req.query;

    // Get templates from Meta
    const metaTemplates = await templatesService.getTemplates({
      limit: parseInt(limit),
      after
    });

    // Sync with local database
    const syncedTemplates = [];
    for (const metaTemplate of metaTemplates.templates) {
      // Check if template exists locally
      let localTemplate = await Template.findTemplateByWhatsAppId(metaTemplate.id);
      
      // Convert Meta status to local status
      const localStatus = convertMetaStatusToLocalStatus(metaTemplate.status);
      
      // Extract body content from components
      const bodyComponent = metaTemplate.components?.find(c => c.type === 'BODY');
      const content = bodyComponent?.text || '';
      
      // Extract category (Meta uses uppercase: MARKETING, UTILITY, AUTHENTICATION)
      const category = metaTemplate.category?.toUpperCase() || 'UTILITY';
      
      if (!localTemplate) {
        // Create new template in local database
        localTemplate = await Template.createTemplate({
          name: metaTemplate.name,
          content: content,
          category: category,
          language: metaTemplate.language || 'ar',
          status: localStatus,
          whatsapp_template_id: metaTemplate.id,
          variables: [],
          metadata: {
            meta_template: metaTemplate,
            synced_from_meta: true
          }
        });
      } else {
        // Update existing template
        localTemplate = await Template.updateTemplate(localTemplate.id, {
          status: localStatus,
          content: content,
          category: category,
          metadata: {
            ...localTemplate.metadata,
            meta_template: metaTemplate,
            last_synced: new Date()
          }
        });
      }

      syncedTemplates.push(localTemplate);
    }

    res.status(200).json({
      message: 'Templates synced from Meta successfully',
      data: syncedTemplates,
      meta_paging: metaTemplates.paging
    });
  } catch (error) {
    console.error('Sync templates from Meta error:', error);
    res.status(500).json({
      error: 'Failed to sync templates from Meta',
      message: error.message
    });
  }
};

/**
 * Delete template from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTemplateFromMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Check permissions (admin only)
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete templates from Meta'
      });
    }

    // Get template from local database
    const template = await Template.findTemplateById(id);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: 'Template with the specified ID does not exist'
      });
    }

    if (!template.whatsapp_template_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template is not linked to Meta'
      });
    }

    // Delete from Meta
    await templatesService.deleteTemplate(template.whatsapp_template_id);

    // Delete from local database (soft delete)
    await Template.deleteTemplate(id);

    res.status(200).json({
      message: 'Template deleted from Meta and local database successfully'
    });
  } catch (error) {
    console.error('Delete template from Meta error:', error);
    res.status(500).json({
      error: 'Failed to delete template from Meta',
      message: error.message
    });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  syncTemplatesFromMeta,
  deleteTemplateFromMeta
};

