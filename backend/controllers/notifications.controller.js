/**
 * Notifications Controller
 * Handles notifications business logic
 */

const Notification = require('../models/notification.model');

/**
 * Get user notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserNotifications = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      is_read,
      type,
      priority,
      includeExpired = false
    } = req.query;

    const currentUser = req.user;

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

    // Get notifications
    const result = await Notification.getUserNotifications(currentUser.id, {
      limit: limitInt,
      offset: offsetInt,
      is_read: is_read === 'true' || is_read === true,
      type,
      priority,
      includeExpired: includeExpired === 'true' || includeExpired === true
    });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.notifications.length < result.total
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      message: error.message
    });
  }
};

/**
 * Get unread notifications count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadCount = async (req, res) => {
  try {
    const currentUser = req.user;

    const count = await Notification.getUnreadCount(currentUser.id);

    res.status(200).json({
      message: 'Unread notifications count retrieved successfully',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to retrieve unread count',
      message: error.message
    });
  }
};

/**
 * Mark notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate notification ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Notification ID is required'
      });
    }

    // Check if notification exists and belongs to user
    const notification = await Notification.findNotificationById(id);
    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification with the specified ID does not exist'
      });
    }

    if (notification.user_id !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only mark your own notifications as read'
      });
    }

    // Mark as read
    const updatedNotification = await Notification.markAsRead(id);

    res.status(200).json({
      message: 'Notification marked as read successfully',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAllAsRead = async (req, res) => {
  try {
    const currentUser = req.user;

    const count = await Notification.markAllAsRead(currentUser.id);

    res.status(200).json({
      message: 'All notifications marked as read successfully',
      data: {
        marked_count: count
      }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
};

/**
 * Delete notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate notification ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Notification ID is required'
      });
    }

    // Check if notification exists and belongs to user
    const notification = await Notification.findNotificationById(id);
    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification with the specified ID does not exist'
      });
    }

    if (notification.user_id !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own notifications'
      });
    }

    // Delete notification
    const deleted = await Notification.deleteNotification(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

