/**
 * Template Model
 * Database model for templates table
 */

const { query } = require('../config/database');

/**
 * Template Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - name: String (Required)
 * - content: Text (Required)
 * - category: String (Optional)
 * - language: String (Default: 'ar')
 * - status: Enum ['active', 'inactive', 'pending_approval'] (Default: 'active')
 * - whatsapp_template_id: String (Unique, Optional)
 * - variables: JSONB (Array of variable names)
 * - created_by: UUID (Foreign Key to users table, Optional)
 * - approved_by: UUID (Foreign Key to users table, Optional)
 * - approved_at: Timestamp (Optional)
 * - metadata: JSONB (Optional)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - deleted_at: Timestamp (Optional)
 */

/**
 * Create a new template
 * @param {Object} templateData - Template data object
 * @returns {Promise<Object>} Created template
 */
const createTemplate = async (templateData) => {
  try {
    const {
      name,
      content,
      category = null,
      language = 'ar',
      status = 'pending_approval',
      whatsapp_template_id = null,
      variables = [],
      created_by = null,
      metadata = {}
    } = templateData;

    // Validate required fields
    if (!name || !content) {
      throw new Error('Name and content are required');
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending_approval'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Insert template
    const result = await query(
      `INSERT INTO templates (name, content, category, language, status, whatsapp_template_id, variables, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        content,
        category,
        language,
        status,
        whatsapp_template_id,
        JSON.stringify(variables),
        created_by,
        JSON.stringify(metadata)
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create template');
    }

    // Parse JSONB fields
    const template = result.rows[0];
    template.variables = typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables;
    template.metadata = typeof template.metadata === 'string' ? JSON.parse(template.metadata) : template.metadata;

    return template;
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'templates_whatsapp_template_id_key') {
        throw new Error('WhatsApp template ID already exists');
      }
    }
    throw error;
  }
};

/**
 * Find template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object|null>} Template object or null
 */
const findTemplateById = async (templateId) => {
  try {
    const result = await query(
      `SELECT * FROM templates WHERE id = $1 AND deleted_at IS NULL`,
      [templateId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const template = result.rows[0];
    template.variables = typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables;
    template.metadata = typeof template.metadata === 'string' ? JSON.parse(template.metadata) : template.metadata;

    return template;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all templates with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with templates array and total count
 */
const getAllTemplates = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      category,
      language,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (language) {
      conditions.push(`language = $${paramIndex++}`);
      values.push(language);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM templates ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get templates
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM templates
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const templates = result.rows.map(tpl => {
      tpl.variables = typeof tpl.variables === 'string' ? JSON.parse(tpl.variables) : tpl.variables;
      tpl.metadata = typeof tpl.metadata === 'string' ? JSON.parse(tpl.metadata) : tpl.metadata;
      return tpl;
    });

    return {
      templates,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update template
 * @param {string} templateId - Template ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated template
 */
const updateTemplate = async (templateId, updateData) => {
  try {
    const {
      name,
      content,
      category,
      language,
      status,
      whatsapp_template_id,
      variables,
      approved_by,
      metadata
    } = updateData;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex++}`);
      values.push(language);
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'inactive', 'pending_approval'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);

      // Update approved_at if status is active and approved_by is provided
      if (status === 'active' && approved_by) {
        updates.push(`approved_by = $${paramIndex++}`);
        values.push(approved_by);
        updates.push(`approved_at = CURRENT_TIMESTAMP`);
      }
    }

    if (whatsapp_template_id !== undefined) {
      updates.push(`whatsapp_template_id = $${paramIndex++}`);
      values.push(whatsapp_template_id);
    }

    if (variables !== undefined) {
      updates.push(`variables = $${paramIndex++}`);
      values.push(JSON.stringify(variables));
    }

    if (approved_by !== undefined && status === 'active') {
      updates.push(`approved_by = $${paramIndex++}`);
      values.push(approved_by);
      updates.push(`approved_at = CURRENT_TIMESTAMP`);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return await findTemplateById(templateId);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add templateId to values
    values.push(templateId);

    const result = await query(
      `UPDATE templates
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Template not found or already deleted');
    }

    // Parse JSONB fields
    const template = result.rows[0];
    template.variables = typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables;
    template.metadata = typeof template.metadata === 'string' ? JSON.parse(template.metadata) : template.metadata;

    return template;
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'templates_whatsapp_template_id_key') {
        throw new Error('WhatsApp template ID already exists');
      }
    }
    throw error;
  }
};

/**
 * Delete template (soft delete)
 * @param {string} templateId - Template ID
 * @returns {Promise<boolean>} Success status
 */
const deleteTemplate = async (templateId) => {
  try {
    const result = await query(
      `UPDATE templates
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [templateId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTemplate,
  findTemplateById,
  getAllTemplates,
  updateTemplate,
  deleteTemplate
};

