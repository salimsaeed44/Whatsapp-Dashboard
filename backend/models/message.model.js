/**
 * Message Model
 * Database model for messages table
 */

const { query, transaction } = require('../config/database');

/**
 * Message Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - whatsapp_message_id: String (Unique, from WhatsApp API)
 * - phone_number: String (Required)
 * - message_type: Enum ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'] (Default: 'text')
 * - content: Text (Required)
 * - direction: Enum ['incoming', 'outgoing'] (Required)
 * - status: Enum ['sent', 'delivered', 'read', 'failed'] (Default: 'sent')
 * - source: Enum ['meta', 'botpress', 'system'] (Default: 'meta')
 * - session_id: String (Optional)
 * - user_id: UUID (Foreign Key to users table, Optional)
 * - conversation_id: UUID (Foreign Key to conversations table, Optional)
 * - metadata: JSONB (Optional - stores additional message data)
 * - raw_payload: JSONB (Optional - stores raw WhatsApp payload)
 * - whatsapp_timestamp: Timestamp (Optional)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - delivered_at: Timestamp (Optional)
 * - read_at: Timestamp (Optional)
 * - deleted_at: Timestamp (Optional)
 */

/**
 * Create a new message
 * @param {Object} messageData - Message data object
 * @param {string} messageData.phone_number - Phone number
 * @param {string} messageData.content - Message content
 * @param {string} messageData.direction - Message direction ('incoming' or 'outgoing')
 * @param {string} [messageData.whatsapp_message_id] - WhatsApp message ID
 * @param {string} [messageData.message_type] - Message type (default: 'text')
 * @param {string} [messageData.status] - Message status (default: 'sent')
 * @param {string} [messageData.source] - Message source (default: 'meta')
 * @param {string} [messageData.session_id] - Session ID
 * @param {string} [messageData.user_id] - User ID who sent/received the message
 * @param {string} [messageData.conversation_id] - Conversation ID
 * @param {Object} [messageData.metadata] - Additional metadata
 * @param {Object} [messageData.raw_payload] - Raw WhatsApp payload
 * @param {Date} [messageData.whatsapp_timestamp] - WhatsApp timestamp
 * @returns {Promise<Object>} Created message
 */
const createMessage = async (messageData) => {
  try {
    const {
      whatsapp_message_id = null,
      phone_number,
      message_type = 'text',
      content,
      direction,
      status = 'sent',
      source = 'meta',
      session_id = null,
      user_id = null,
      conversation_id = null,
      metadata = {},
      raw_payload = {},
      whatsapp_timestamp = null
    } = messageData;

    // Validate required fields
    if (!phone_number || !content || !direction) {
      throw new Error('Phone number, content, and direction are required');
    }

    // Validate direction
    const validDirections = ['incoming', 'outgoing'];
    if (!validDirections.includes(direction)) {
      throw new Error(`Invalid direction. Must be one of: ${validDirections.join(', ')}`);
    }

    // Validate message type
    const validMessageTypes = ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'];
    if (!validMessageTypes.includes(message_type)) {
      throw new Error(`Invalid message type. Must be one of: ${validMessageTypes.join(', ')}`);
    }

    // Validate status
    const validStatuses = ['sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate source
    const validSources = ['meta', 'botpress', 'system'];
    if (!validSources.includes(source)) {
      throw new Error(`Invalid source. Must be one of: ${validSources.join(', ')}`);
    }

    // Insert message
    const result = await query(
      `INSERT INTO messages (
        whatsapp_message_id, phone_number, message_type, content, direction, 
        status, source, session_id, user_id, conversation_id, 
        metadata, raw_payload, whatsapp_timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        whatsapp_message_id, phone_number, message_type, content, direction,
        status, source, session_id, user_id, conversation_id,
        JSON.stringify(metadata), JSON.stringify(raw_payload), whatsapp_timestamp
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create message');
    }

    // Parse JSONB fields
    const message = result.rows[0];
    message.metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata;
    message.raw_payload = typeof message.raw_payload === 'string' ? JSON.parse(message.raw_payload) : message.raw_payload;

    return message;
  } catch (error) {
    // Handle duplicate whatsapp_message_id
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'messages_whatsapp_message_id_key') {
        throw new Error('WhatsApp message ID already exists');
      }
    }
    throw error;
  }
};

/**
 * Find message by ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object|null>} Message object or null
 */
const findMessageById = async (messageId) => {
  try {
    const result = await query(
      `SELECT * FROM messages WHERE id = $1 AND deleted_at IS NULL`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const message = result.rows[0];
    message.metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata;
    message.raw_payload = typeof message.raw_payload === 'string' ? JSON.parse(message.raw_payload) : message.raw_payload;

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Find message by WhatsApp message ID
 * @param {string} whatsappMessageId - WhatsApp message ID
 * @returns {Promise<Object|null>} Message object or null
 */
const findMessageByWhatsAppId = async (whatsappMessageId) => {
  try {
    const result = await query(
      `SELECT * FROM messages WHERE whatsapp_message_id = $1 AND deleted_at IS NULL`,
      [whatsappMessageId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const message = result.rows[0];
    message.metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata;
    message.raw_payload = typeof message.raw_payload === 'string' ? JSON.parse(message.raw_payload) : message.raw_payload;

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Get messages by phone number
 * @param {string} phoneNumber - Phone number
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Number of messages to return (default: 50)
 * @param {number} [options.offset] - Number of messages to skip (default: 0)
 * @param {string} [options.direction] - Filter by direction
 * @param {string} [options.status] - Filter by status
 * @param {boolean} [options.includeDeleted] - Include deleted messages (default: false)
 * @returns {Promise<Object>} Object with messages array and total count
 */
const getMessagesByPhoneNumber = async (phoneNumber, options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      direction,
      status,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = ['phone_number = $1'];
    const values = [phoneNumber];
    let paramIndex = 2;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (direction) {
      conditions.push(`direction = $${paramIndex++}`);
      values.push(direction);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM messages ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get messages
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM messages
       ${whereClause}
       ORDER BY created_at ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const messages = result.rows.map(msg => {
      msg.metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
      msg.raw_payload = typeof msg.raw_payload === 'string' ? JSON.parse(msg.raw_payload) : msg.raw_payload;
      return msg;
    });

    return {
      messages,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update message status
 * @param {string} messageId - Message ID
 * @param {string} status - New status
 * @param {Date} [timestamp] - Timestamp for status update (optional)
 * @returns {Promise<Object>} Updated message
 */
const updateMessageStatus = async (messageId, status, timestamp = null) => {
  try {
    // Validate status
    const validStatuses = ['sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Build update query
    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    let paramIndex = 2;

    // Update timestamp based on status
    if (status === 'delivered' && timestamp) {
      updates.push(`delivered_at = $${paramIndex++}`);
      values.push(timestamp);
    } else if (status === 'read' && timestamp) {
      updates.push(`read_at = $${paramIndex++}`);
      values.push(timestamp);
    } else if (status === 'delivered') {
      updates.push(`delivered_at = CURRENT_TIMESTAMP`);
    } else if (status === 'read') {
      updates.push(`read_at = CURRENT_TIMESTAMP`);
    }

    values.push(messageId);

    const result = await query(
      `UPDATE messages
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Message not found or already deleted');
    }

    // Parse JSONB fields
    const message = result.rows[0];
    message.metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata;
    message.raw_payload = typeof message.raw_payload === 'string' ? JSON.parse(message.raw_payload) : message.raw_payload;

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all messages with pagination and filters
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Number of messages to return (default: 50)
 * @param {number} [options.offset] - Number of messages to skip (default: 0)
 * @param {string} [options.phone_number] - Filter by phone number
 * @param {string} [options.direction] - Filter by direction
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.message_type] - Filter by message type
 * @param {string} [options.user_id] - Filter by user ID
 * @param {string} [options.conversation_id] - Filter by conversation ID
 * @param {boolean} [options.includeDeleted] - Include deleted messages (default: false)
 * @returns {Promise<Object>} Object with messages array and total count
 */
const getAllMessages = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      phone_number,
      direction,
      status,
      message_type,
      user_id,
      conversation_id,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (phone_number) {
      conditions.push(`phone_number = $${paramIndex++}`);
      values.push(phone_number);
    }

    if (direction) {
      conditions.push(`direction = $${paramIndex++}`);
      values.push(direction);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (message_type) {
      conditions.push(`message_type = $${paramIndex++}`);
      values.push(message_type);
    }

    if (user_id) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(user_id);
    }

    if (conversation_id) {
      conditions.push(`conversation_id = $${paramIndex++}`);
      values.push(conversation_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM messages ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get messages
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM messages
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const messages = result.rows.map(msg => {
      msg.metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
      msg.raw_payload = typeof msg.raw_payload === 'string' ? JSON.parse(msg.raw_payload) : msg.raw_payload;
      return msg;
    });

    return {
      messages,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete message (soft delete)
 * @param {string} messageId - Message ID
 * @returns {Promise<boolean>} Success status
 */
const deleteMessage = async (messageId) => {
  try {
    const result = await query(
      `UPDATE messages
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [messageId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Update message by WhatsApp message ID
 * @param {string} whatsappMessageId - WhatsApp message ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated message
 */
const updateMessageByWhatsAppId = async (whatsappMessageId, updateData) => {
  try {
    const {
      status,
      metadata,
      raw_payload,
      delivered_at,
      read_at
    } = updateData;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      const validStatuses = ['sent', 'delivered', 'read', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (raw_payload !== undefined) {
      updates.push(`raw_payload = $${paramIndex++}`);
      values.push(JSON.stringify(raw_payload));
    }

    if (delivered_at !== undefined) {
      updates.push(`delivered_at = $${paramIndex++}`);
      values.push(delivered_at);
    }

    if (read_at !== undefined) {
      updates.push(`read_at = $${paramIndex++}`);
      values.push(read_at);
    }

    if (updates.length === 0) {
      // No updates to perform, return current message
      return await findMessageByWhatsAppId(whatsappMessageId);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add whatsapp_message_id to values
    values.push(whatsappMessageId);

    const result = await query(
      `UPDATE messages
       SET ${updates.join(', ')}
       WHERE whatsapp_message_id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Message not found or already deleted');
    }

    // Parse JSONB fields
    const message = result.rows[0];
    message.metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata;
    message.raw_payload = typeof message.raw_payload === 'string' ? JSON.parse(message.raw_payload) : message.raw_payload;

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * Get failed messages for retry
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of messages
 * @param {number} options.maxRetries - Maximum retry count
 * @returns {Promise<Array>} Array of failed messages
 */
const getFailedMessages = async (options = {}) => {
  try {
    const { limit = 100, maxRetries = 3 } = options;

    const result = await query(
      `SELECT * FROM messages
       WHERE status = 'failed'
       AND direction = 'outgoing'
       AND deleted_at IS NULL
       AND (metadata->>'retry_count' IS NULL OR (metadata->>'retry_count')::int < $1)
       ORDER BY created_at ASC
       LIMIT $2`,
      [maxRetries, limit]
    );

    // Parse JSONB fields
    const messages = result.rows.map(msg => {
      msg.metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
      msg.raw_payload = typeof msg.raw_payload === 'string' ? JSON.parse(msg.raw_payload) : msg.raw_payload;
      return msg;
    });

    return messages;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createMessage,
  findMessageById,
  findMessageByWhatsAppId,
  getMessagesByPhoneNumber,
  updateMessageStatus,
  getAllMessages,
  deleteMessage,
  updateMessageByWhatsAppId,
  getFailedMessages
};
