/**
 * Automation Model
 * Database model for automations table
 */

const { query } = require('../config/database');

/**
 * Create a new automation
 * @param {Object} automationData - Automation data object
 * @returns {Promise<Object>} Created automation
 */
const createAutomation = async (automationData) => {
  try {
    const {
      name,
      description = null,
      trigger_type,
      trigger_conditions = {},
      actions = [],
      is_active = true,
      priority = 0,
      created_by = null
    } = automationData;

    // Validate required fields
    if (!name || !trigger_type) {
      throw new Error('Name and trigger_type are required');
    }

    // Insert automation
    const result = await query(
      `INSERT INTO automations (name, description, trigger_type, trigger_conditions, actions, is_active, priority, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description,
        trigger_type,
        JSON.stringify(trigger_conditions),
        JSON.stringify(actions),
        is_active,
        priority,
        created_by
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create automation');
    }

    // Parse JSONB fields
    const automation = result.rows[0];
    automation.trigger_conditions = typeof automation.trigger_conditions === 'string' ? JSON.parse(automation.trigger_conditions) : automation.trigger_conditions;
    automation.actions = typeof automation.actions === 'string' ? JSON.parse(automation.actions) : automation.actions;

    return automation;
  } catch (error) {
    throw error;
  }
};

/**
 * Find automation by ID
 * @param {string} automationId - Automation ID
 * @returns {Promise<Object|null>} Automation object or null
 */
const findAutomationById = async (automationId) => {
  try {
    const result = await query(
      `SELECT * FROM automations WHERE id = $1 AND deleted_at IS NULL`,
      [automationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const automation = result.rows[0];
    automation.trigger_conditions = typeof automation.trigger_conditions === 'string' ? JSON.parse(automation.trigger_conditions) : automation.trigger_conditions;
    automation.actions = typeof automation.actions === 'string' ? JSON.parse(automation.actions) : automation.actions;

    return automation;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all automations with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with automations array and total count
 */
const getAllAutomations = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      trigger_type,
      is_active,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (trigger_type) {
      conditions.push(`trigger_type = $${paramIndex}`);
      values.push(trigger_type);
      paramIndex++;
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM automations ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get automations (ordered by priority)
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM automations 
       ${whereClause}
       ORDER BY priority DESC, created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    // Parse JSONB fields
    const automations = result.rows.map(row => {
      row.trigger_conditions = typeof row.trigger_conditions === 'string' ? JSON.parse(row.trigger_conditions) : row.trigger_conditions;
      row.actions = typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions;
      return row;
    });

    return {
      automations,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get active automations for a trigger type
 * @param {string} triggerType - Trigger type
 * @returns {Promise<Array>} Array of active automations
 */
const getActiveAutomationsByTrigger = async (triggerType) => {
  try {
    const result = await query(
      `SELECT * FROM automations 
       WHERE trigger_type = $1 AND is_active = true AND deleted_at IS NULL
       ORDER BY priority DESC, created_at DESC`,
      [triggerType]
    );

    // Parse JSONB fields
    const automations = result.rows.map(row => {
      row.trigger_conditions = typeof row.trigger_conditions === 'string' ? JSON.parse(row.trigger_conditions) : row.trigger_conditions;
      row.actions = typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions;
      return row;
    });

    return automations;
  } catch (error) {
    throw error;
  }
};

/**
 * Update automation
 * @param {string} automationId - Automation ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated automation
 */
const updateAutomation = async (automationId, updateData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updateData.name);
      paramIndex++;
    }

    if (updateData.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updateData.description);
      paramIndex++;
    }

    if (updateData.trigger_type !== undefined) {
      fields.push(`trigger_type = $${paramIndex}`);
      values.push(updateData.trigger_type);
      paramIndex++;
    }

    if (updateData.trigger_conditions !== undefined) {
      fields.push(`trigger_conditions = $${paramIndex}`);
      values.push(JSON.stringify(updateData.trigger_conditions));
      paramIndex++;
    }

    if (updateData.actions !== undefined) {
      fields.push(`actions = $${paramIndex}`);
      values.push(JSON.stringify(updateData.actions));
      paramIndex++;
    }

    if (updateData.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updateData.is_active);
      paramIndex++;
    }

    if (updateData.priority !== undefined) {
      fields.push(`priority = $${paramIndex}`);
      values.push(updateData.priority);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(automationId);

    const result = await query(
      `UPDATE automations 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Automation not found');
    }

    // Parse JSONB fields
    const automation = result.rows[0];
    automation.trigger_conditions = typeof automation.trigger_conditions === 'string' ? JSON.parse(automation.trigger_conditions) : automation.trigger_conditions;
    automation.actions = typeof automation.actions === 'string' ? JSON.parse(automation.actions) : automation.actions;

    return automation;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete automation (soft delete)
 * @param {string} automationId - Automation ID
 * @returns {Promise<boolean>} Success status
 */
const deleteAutomation = async (automationId) => {
  try {
    const result = await query(
      `UPDATE automations
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [automationId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAutomation,
  findAutomationById,
  getAllAutomations,
  getActiveAutomationsByTrigger,
  updateAutomation,
  deleteAutomation
};

