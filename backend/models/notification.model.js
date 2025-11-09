/**
 * Notification Model
 * Database model for notifications table
 */

const { query } = require('../config/database');

/**
 * Notification Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - user_id: UUID (Foreign Key to users table, Required)
 * - type: Enum ['message', 'assignment', 'transfer', 'broadcast', 'system', 'alert', 'reminder'] (Required)
 * - title: String (Required)
 * - message: Text (Required)
 * - related_id: UUID (Optional)
 * - related_type: String (Optional)
 * - is_read: Boolean (Default: false)
 * - read_at: Timestamp (Optional)
 * - priority: Enum ['low', 'normal', 'high', 'urgent'] (Default: 'normal')
 * - action_url: String (Optional)
 * - metadata: JSONB (Optional)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - expires_at: Timestamp (Optional)
 */

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data object
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const {
      user_id,
      type,
      title,
      message,
      related_id = null,
      related_type = null,
      priority = 'normal',
      action_url = null,
      metadata = {},
      expires_at = null
    } = notificationData;

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      throw new Error('user_id, type, title, and message are required');
    }

    // Validate type
    const validTypes = ['message', 'assignment', 'transfer', 'broadcast', 'system', 'alert', 'reminder'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    // Insert notification
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, priority, action_url, metadata, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user_id,
        type,
        title,
        message,
        related_id,
        related_type,
        priority,
        action_url,
        JSON.stringify(metadata),
        expires_at
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create notification');
    }

    // Parse JSONB fields
    const notification = result.rows[0];
    notification.metadata = typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata;

    return notification;
  } catch (error) {
    throw error;
  }
};

/**
 * Find notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object|null>} Notification object or null
 */
const findNotificationById = async (notificationId) => {
  try {
    const result = await query(
      `SELECT * FROM notifications WHERE id = $1`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const notification = result.rows[0];
    notification.metadata = typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata;

    return notification;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with notifications array and total count
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      is_read,
      type,
      priority,
      includeExpired = false
    } = options;

    // Build WHERE clause
    const conditions = ['user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (is_read !== undefined) {
      conditions.push(`is_read = $${paramIndex++}`);
      values.push(is_read);
    }

    if (type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(type);
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (!includeExpired) {
      conditions.push(`(expires_at IS NULL OR expires_at > NOW())`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get notifications
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM notifications
       ${whereClause}
       ORDER BY 
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'normal' THEN 3
           WHEN 'low' THEN 4
         END,
         created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const notifications = result.rows.map(notif => {
      notif.metadata = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata;
      return notif;
    });

    return {
      notifications,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId) => {
  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      throw new Error('Notification not found');
    }

    // Parse JSONB fields
    const notification = result.rows[0];
    notification.metadata = typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata;

    return notification;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );

    return result.rows.length;
  } catch (error) {
    throw error;
  }
};

/**
 * Get unread notifications count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread notifications count
 */
const getUnreadCount = async (userId) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = $1 
       AND is_read = false 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
const deleteNotification = async (notificationId) => {
  try {
    const result = await query(
      `DELETE FROM notifications WHERE id = $1 RETURNING id`,
      [notificationId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNotification,
  findNotificationById,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};

