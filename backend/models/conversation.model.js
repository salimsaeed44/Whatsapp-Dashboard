/**
 * Conversation Model
 * Database model for conversations table
 */

const { query, transaction } = require('../config/database');

/**
 * Conversation Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - phone_number: String (Required)
 * - status: Enum ['open', 'closed', 'pending', 'assigned'] (Default: 'open')
 * - assigned_to: UUID (Foreign Key to users table, Optional)
 * - assigned_at: Timestamp (Optional)
 * - priority: Integer (0-10, Default: 0)
 * - last_message_at: Timestamp (Optional)
 * - last_message_id: UUID (Foreign Key to messages table, Optional)
 * - unread_count: Integer (Default: 0)
 * - is_archived: Boolean (Default: false)
 * - metadata: JSONB (Optional)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - closed_at: Timestamp (Optional)
 * - deleted_at: Timestamp (Optional)
 */

/**
 * Create a new conversation
 * @param {Object} conversationData - Conversation data object
 * @returns {Promise<Object>} Created conversation
 */
const createConversation = async (conversationData) => {
  try {
    const {
      phone_number,
      status = 'open',
      assigned_to = null,
      priority = 0,
      metadata = {}
    } = conversationData;

    // Validate required fields
    if (!phone_number) {
      throw new Error('Phone number is required');
    }

    // Validate status
    const validStatuses = ['open', 'closed', 'pending', 'assigned'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate priority
    if (priority < 0 || priority > 10) {
      throw new Error('Priority must be between 0 and 10');
    }

    // Insert conversation
    const result = await query(
      `INSERT INTO conversations (phone_number, status, assigned_to, priority, metadata, assigned_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        phone_number,
        status,
        assigned_to,
        priority,
        JSON.stringify(metadata),
        assigned_to ? new Date() : null
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create conversation');
    }

    // Parse JSONB fields
    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Find conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation object or null
 */
const findConversationById = async (conversationId) => {
  try {
    const result = await query(
      `SELECT * FROM conversations WHERE id = $1 AND deleted_at IS NULL`,
      [conversationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Find conversation by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object|null>} Conversation object or null
 */
const findConversationByPhoneNumber = async (phoneNumber) => {
  try {
    const result = await query(
      `SELECT * FROM conversations 
       WHERE phone_number = $1 AND deleted_at IS NULL 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Update conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated conversation
 */
const updateConversation = async (conversationId, updateData) => {
  try {
    const {
      status,
      assigned_to,
      priority,
      last_message_at,
      last_message_id,
      unread_count,
      is_archived,
      metadata,
      closed_at
    } = updateData;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['open', 'closed', 'pending', 'assigned'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);

      // Update closed_at if status is closed
      if (status === 'closed') {
        updates.push(`closed_at = CURRENT_TIMESTAMP`);
      } else if (status !== 'closed' && closed_at === null) {
        updates.push(`closed_at = NULL`);
      }
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
      if (assigned_to) {
        updates.push(`assigned_at = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`assigned_at = NULL`);
      }
    }

    if (priority !== undefined) {
      if (priority < 0 || priority > 10) {
        throw new Error('Priority must be between 0 and 10');
      }
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (last_message_at !== undefined) {
      updates.push(`last_message_at = $${paramIndex++}`);
      values.push(last_message_at);
    }

    if (last_message_id !== undefined) {
      updates.push(`last_message_id = $${paramIndex++}`);
      values.push(last_message_id);
    }

    if (unread_count !== undefined) {
      if (unread_count < 0) {
        throw new Error('Unread count cannot be negative');
      }
      updates.push(`unread_count = $${paramIndex++}`);
      values.push(unread_count);
    }

    if (is_archived !== undefined) {
      updates.push(`is_archived = $${paramIndex++}`);
      values.push(is_archived);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (closed_at !== undefined) {
      updates.push(`closed_at = $${paramIndex++}`);
      values.push(closed_at);
    }

    if (updates.length === 0) {
      // No updates to perform, return current conversation
      return await findConversationById(conversationId);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add conversationId to values
    values.push(conversationId);

    const result = await query(
      `UPDATE conversations
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Conversation not found or already deleted');
    }

    // Parse JSONB fields
    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all conversations with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with conversations array and total count
 */
const getAllConversations = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      assigned_to,
      is_archived,
      phone_number,
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

    if (assigned_to !== undefined) {
      if (assigned_to === null) {
        conditions.push(`assigned_to IS NULL`);
      } else {
        conditions.push(`assigned_to = $${paramIndex++}`);
        values.push(assigned_to);
      }
    }

    if (is_archived !== undefined) {
      conditions.push(`is_archived = $${paramIndex++}`);
      values.push(is_archived);
    }

    if (phone_number) {
      conditions.push(`phone_number = $${paramIndex++}`);
      values.push(phone_number);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM conversations ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get conversations
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM conversations
       ${whereClause}
       ORDER BY last_message_at DESC NULLS LAST, created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const conversations = result.rows.map(conv => {
      conv.metadata = typeof conv.metadata === 'string' ? JSON.parse(conv.metadata) : conv.metadata;
      return conv;
    });

    return {
      conversations,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete conversation (soft delete)
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} Success status
 */
const deleteConversation = async (conversationId) => {
  try {
    const result = await query(
      `UPDATE conversations
       SET deleted_at = CURRENT_TIMESTAMP, status = 'closed'
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [conversationId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Increment unread count for conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
const incrementUnreadCount = async (conversationId) => {
  try {
    const result = await query(
      `UPDATE conversations
       SET unread_count = unread_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [conversationId]
    );

    if (result.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset unread count for conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
const resetUnreadCount = async (conversationId) => {
  try {
    const result = await query(
      `UPDATE conversations
       SET unread_count = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [conversationId]
    );

    if (result.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    const conversation = result.rows[0];
    conversation.metadata = typeof conversation.metadata === 'string' ? JSON.parse(conversation.metadata) : conversation.metadata;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * Get or create conversation by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} Conversation object
 */
const getOrCreateConversation = async (phoneNumber) => {
  try {
    // Try to find existing conversation
    let conversation = await findConversationByPhoneNumber(phoneNumber);

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = await createConversation({
        phone_number: phoneNumber,
        status: 'open'
      });
    }

    return conversation;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createConversation,
  findConversationById,
  findConversationByPhoneNumber,
  updateConversation,
  getAllConversations,
  deleteConversation,
  incrementUnreadCount,
  resetUnreadCount,
  getOrCreateConversation
};

