/**
 * WhatsApp Templates Service
 * Handles template creation, retrieval, update, and deletion via Meta API
 */

const axios = require('axios');

const API_BASE_URL = 'https://graph.facebook.com/v18.0';

/**
 * Get WhatsApp Business Account ID
 */
const getBusinessAccountId = () => {
  return process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_BUSINESS_ACCOUNT_ID;
};

/**
 * Get Access Token
 */
const getAccessToken = () => {
  return process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
};

/**
 * Create a message template and submit to Meta for approval
 * 
 * @param {Object} templateData - Template data
 * @param {string} templateData.name - Template name (must be unique, lowercase, no spaces)
 * @param {string} templateData.category - Template category (MARKETING, UTILITY, AUTHENTICATION)
 * @param {string} templateData.language - Language code (e.g., 'ar', 'en')
 * @param {Object} templateData.components - Template components (header, body, footer, buttons)
 * @returns {Promise<Object>} Meta API response
 */
const createTemplate = async (templateData) => {
  try {
    const businessAccountId = getBusinessAccountId();
    const accessToken = getAccessToken();

    if (!businessAccountId || !accessToken) {
      throw new Error('WhatsApp Business Account ID or Access Token is not configured');
    }

    // Validate required fields
    if (!templateData.name || !templateData.category || !templateData.language) {
      throw new Error('Name, category, and language are required');
    }

    // Validate template name (Meta requirements)
    if (!/^[a-z0-9_]+$/.test(templateData.name)) {
      throw new Error('Template name must contain only lowercase letters, numbers, and underscores');
    }

    if (templateData.name.length > 512) {
      throw new Error('Template name must be 512 characters or less');
    }

    // Validate category
    const validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
    if (!validCategories.includes(templateData.category)) {
      throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
    }

    // Build components array according to Meta API format
    const components = [];

    // Header component
    if (templateData.components?.header) {
      const headerComponent = {
        type: 'HEADER',
        format: templateData.components.header.format || 'TEXT'
      };

      // Add text for TEXT format
      if (headerComponent.format === 'TEXT' && templateData.components.header.text) {
        headerComponent.text = templateData.components.header.text;
        // Meta requires example.header_text for TEXT headers
        headerComponent.example = {
          header_text: [templateData.components.header.text]
        };
      }

      // Add example for media formats (IMAGE, VIDEO, DOCUMENT)
      if (templateData.components.header.example) {
        headerComponent.example = templateData.components.header.example;
      }

      components.push(headerComponent);
    }

    // Body component
    if (templateData.components?.body) {
      const bodyComponent = {
        type: 'BODY',
        text: templateData.components.body.text
      };

      // Add example if provided or create default
      if (templateData.components.body.example) {
        bodyComponent.example = templateData.components.body.example;
      } else if (templateData.components.body.text) {
        // Extract variables from text ({{1}}, {{2}}, etc.)
        const variables = templateData.components.body.text.match(/\{\{(\d+)\}\}/g) || [];
        if (variables.length > 0) {
          // Create example with sample values
          const exampleValues = variables.map((_, index) => `Sample${index + 1}`);
          bodyComponent.example = {
            body_text: [exampleValues]
          };
        }
      }

      components.push(bodyComponent);
    }

    // Footer component
    if (templateData.components?.footer) {
      components.push({
        type: 'FOOTER',
        text: templateData.components.footer.text
      });
    }

    // Buttons component
    if (templateData.components?.buttons) {
      const buttons = templateData.components.buttons.map(button => {
        if (button.type === 'QUICK_REPLY') {
          return {
            type: 'QUICK_REPLY',
            text: button.text
          };
        } else if (button.type === 'URL' || button.type === 'PHONE_NUMBER') {
          return {
            type: button.type,
            text: button.text,
            url: button.url,
            phone_number: button.phone_number,
            example: button.example
          };
        }
        return button;
      });

      components.push({
        type: 'BUTTONS',
        buttons: buttons
      });
    }

    const url = `${API_BASE_URL}/${businessAccountId}/message_templates`;

    const payload = {
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      components: components
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      template_id: response.data.id,
      status: response.data.status || 'PENDING',
      data: response.data
    };
  } catch (error) {
    console.error('Create template error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      throw new Error(error.response.data.error?.message || 'Failed to create template');
    }
    
    throw error;
  }
};

/**
 * Get all message templates from Meta
 * 
 * @param {Object} options - Query options
 * @param {string} options.limit - Number of templates to retrieve
 * @param {string} options.after - Cursor for pagination
 * @returns {Promise<Object>} Templates list
 */
const getTemplates = async (options = {}) => {
  try {
    const businessAccountId = getBusinessAccountId();
    const accessToken = getAccessToken();

    if (!businessAccountId || !accessToken) {
      throw new Error('WhatsApp Business Account ID or Access Token is not configured');
    }

    const url = `${API_BASE_URL}/${businessAccountId}/message_templates`;
    
    const params = {
      limit: options.limit || 100,
      ...(options.after && { after: options.after })
    };

    const response = await axios.get(url, {
      params,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      templates: response.data.data || [],
      paging: response.data.paging || null
    };
  } catch (error) {
    console.error('Get templates error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      throw new Error(error.response.data.error?.message || 'Failed to retrieve templates');
    }
    
    throw error;
  }
};

/**
 * Get template by ID from Meta
 * 
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Template data
 */
const getTemplateById = async (templateId) => {
  try {
    const businessAccountId = getBusinessAccountId();
    const accessToken = getAccessToken();

    if (!businessAccountId || !accessToken) {
      throw new Error('WhatsApp Business Account ID or Access Token is not configured');
    }

    const url = `${API_BASE_URL}/${templateId}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      template: response.data
    };
  } catch (error) {
    console.error('Get template by ID error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      throw new Error(error.response.data.error?.message || 'Failed to retrieve template');
    }
    
    throw error;
  }
};

/**
 * Delete a message template from Meta
 * 
 * @param {string} templateId - Template ID or name
 * @returns {Promise<Object>} Deletion result
 */
const deleteTemplate = async (templateId) => {
  try {
    const businessAccountId = getBusinessAccountId();
    const accessToken = getAccessToken();

    if (!businessAccountId || !accessToken) {
      throw new Error('WhatsApp Business Account ID or Access Token is not configured');
    }

    // Meta API requires name parameter for deletion
    const url = `${API_BASE_URL}/${businessAccountId}/message_templates`;

    const response = await axios.delete(url, {
      params: {
        name: templateId
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Delete template error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      throw new Error(error.response.data.error?.message || 'Failed to delete template');
    }
    
    throw error;
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate
};

