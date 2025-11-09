/**
 * Broadcast Model
 * Database model for broadcasts table
 */

const { query, transaction } = require('../config/database');

/**
 * Broadcast Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - name: String (Required)
 * - content: Text (Required)
 * - template_id: UUID (Foreign Key to templates table, Optional)
 * - status: Enum ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'] (Default: 'draft')
 * - scheduled_at: Timestamp (Optional)
 * - started_at: Timestamp (Optional)
 * - completed_at: Timestamp (Optional)
 * - total_recipients: Integer (Default: 0)
 * - sent_count: Integer (Default: 0)
 * - delivered_count: Integer (Default: 0)
 * - read_count: Integer (Default: 0)
 * - failed_count: Integer (Default: 0)
 * - filter_criteria: JSONB (Optional)
 * - assigned_to: UUID (Foreign Key to users table, Optional)
 * - created_by: UUID (Foreign Key to users table, Optional)
 * - metadata: JSONB (Optional)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - deleted_at: Timestamp (Optional)
 */

/**
 * Create a new broadcast
 * @param {Object} broadcastData - Broadcast data object
 * @returns {Promise<Object>} Created broadcast
 */
const createBroadcast = async (broadcastData) => {
  try {
    const {
      name,
      content,
      template_id = null,
      status = 'draft',
      scheduled_at = null,
      filter_criteria = {},
      assigned_to = null,
      created_by = null,
      metadata = {}
    } = broadcastData;

    // Validate required fields
    if (!name || !content) {
      throw new Error('Name and content are required');
    }

    // Validate status
    const validStatuses = ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Insert broadcast
    const result = await query(
      `INSERT INTO broadcasts (name, content, template_id, status, scheduled_at, filter_criteria, assigned_to, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        content,
        template_id,
        status,
        scheduled_at,
        JSON.stringify(filter_criteria),
        assigned_to,
        created_by,
        JSON.stringify(metadata)
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create broadcast');
    }

    // Parse JSONB fields
    const broadcast = result.rows[0];
    broadcast.filter_criteria = typeof broadcast.filter_criteria === 'string' ? JSON.parse(broadcast.filter_criteria) : broadcast.filter_criteria;
    broadcast.metadata = typeof broadcast.metadata === 'string' ? JSON.parse(broadcast.metadata) : broadcast.metadata;

    return broadcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Find broadcast by ID
 * @param {string} broadcastId - Broadcast ID
 * @returns {Promise<Object|null>} Broadcast object or null
 */
const findBroadcastById = async (broadcastId) => {
  try {
    const result = await query(
      `SELECT * FROM broadcasts WHERE id = $1 AND deleted_at IS NULL`,
      [broadcastId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const broadcast = result.rows[0];
    broadcast.filter_criteria = typeof broadcast.filter_criteria === 'string' ? JSON.parse(broadcast.filter_criteria) : broadcast.filter_criteria;
    broadcast.metadata = typeof broadcast.metadata === 'string' ? JSON.parse(broadcast.metadata) : broadcast.metadata;

    return broadcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all broadcasts with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with broadcasts array and total count
 */
const getAllBroadcasts = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      created_by,
      assigned_to,
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

    if (created_by) {
      conditions.push(`created_by = $${paramIndex++}`);
      values.push(created_by);
    }

    if (assigned_to) {
      conditions.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM broadcasts ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get broadcasts
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM broadcasts
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const broadcasts = result.rows.map(bc => {
      bc.filter_criteria = typeof bc.filter_criteria === 'string' ? JSON.parse(bc.filter_criteria) : bc.filter_criteria;
      bc.metadata = typeof bc.metadata === 'string' ? JSON.parse(bc.metadata) : bc.metadata;
      return bc;
    });

    return {
      broadcasts,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update broadcast
 * @param {string} broadcastId - Broadcast ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated broadcast
 */
const updateBroadcast = async (broadcastId, updateData) => {
  try {
    const {
      name,
      content,
      status,
      scheduled_at,
      started_at,
      completed_at,
      total_recipients,
      sent_count,
      delivered_count,
      read_count,
      failed_count,
      filter_criteria,
      assigned_to,
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

    if (status !== undefined) {
      const validStatuses = ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);

      // Update timestamps based on status
      if (status === 'sending' && !started_at) {
        updates.push(`started_at = CURRENT_TIMESTAMP`);
      } else if (status === 'completed' && !completed_at) {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (scheduled_at !== undefined) {
      updates.push(`scheduled_at = $${paramIndex++}`);
      values.push(scheduled_at);
    }

    if (started_at !== undefined) {
      updates.push(`started_at = $${paramIndex++}`);
      values.push(started_at);
    }

    if (completed_at !== undefined) {
      updates.push(`completed_at = $${paramIndex++}`);
      values.push(completed_at);
    }

    if (total_recipients !== undefined) {
      updates.push(`total_recipients = $${paramIndex++}`);
      values.push(total_recipients);
    }

    if (sent_count !== undefined) {
      updates.push(`sent_count = $${paramIndex++}`);
      values.push(sent_count);
    }

    if (delivered_count !== undefined) {
      updates.push(`delivered_count = $${paramIndex++}`);
      values.push(delivered_count);
    }

    if (read_count !== undefined) {
      updates.push(`read_count = $${paramIndex++}`);
      values.push(read_count);
    }

    if (failed_count !== undefined) {
      updates.push(`failed_count = $${paramIndex++}`);
      values.push(failed_count);
    }

    if (filter_criteria !== undefined) {
      updates.push(`filter_criteria = $${paramIndex++}`);
      values.push(JSON.stringify(filter_criteria));
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return await findBroadcastById(broadcastId);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add broadcastId to values
    values.push(broadcastId);

    const result = await query(
      `UPDATE broadcasts
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Broadcast not found or already deleted');
    }

    // Parse JSONB fields
    const broadcast = result.rows[0];
    broadcast.filter_criteria = typeof broadcast.filter_criteria === 'string' ? JSON.parse(broadcast.filter_criteria) : broadcast.filter_criteria;
    broadcast.metadata = typeof broadcast.metadata === 'string' ? JSON.parse(broadcast.metadata) : broadcast.metadata;

    return broadcast;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete broadcast (soft delete)
 * @param {string} broadcastId - Broadcast ID
 * @returns {Promise<boolean>} Success status
 */
const deleteBroadcast = async (broadcastId) => {
  try {
    const result = await query(
      `UPDATE broadcasts
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [broadcastId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBroadcast,
  findBroadcastById,
  getAllBroadcasts,
  updateBroadcast,
  deleteBroadcast
};

