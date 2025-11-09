/**
 * Notification Service
 * Handles intelligent notifications system
 */

const Notification = require('../models/notification.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

/**
 * Notification Service Class
 * Handles automatic notifications for various events
 */
class NotificationService {
  /**
   * Send notification for new message
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async notifyNewMessage(conversationId, messageId) {
    try {
      const conversation = await Conversation.findConversationById(conversationId);
      if (!conversation || !conversation.assigned_to) {
        return; // No one assigned, no notification needed
      }

      const message = await Message.findMessageById(messageId);
      if (!message || message.direction !== 'incoming') {
        return; // Only notify for incoming messages
      }

      // Create notification for assigned user
      await Notification.createNotification({
        user_id: conversation.assigned_to,
        type: 'message',
        title: 'رسالة جديدة',
        message: `رسالة جديدة من ${conversation.phone_number}`,
        related_id: conversationId,
        related_type: 'conversation',
        priority: conversation.unread_count > 5 ? 'high' : 'normal',
        action_url: `/conversations/${conversationId}`,
        metadata: {
          conversation_id: conversationId,
          message_id: messageId,
          phone_number: conversation.phone_number
        }
      });
    } catch (error) {
      console.error('Error sending new message notification:', error);
    }
  }

  /**
   * Send notification for conversation assignment
   * @param {string} conversationId - Conversation ID
   * @param {string} assignedTo - User ID assigned to
   * @param {string} assignedBy - User ID who assigned (optional)
   * @returns {Promise<void>}
   */
  async notifyAssignment(conversationId, assignedTo, assignedBy = null) {
    try {
      const conversation = await Conversation.findConversationById(conversationId);
      if (!conversation) {
        return;
      }

      // Create notification for assigned user
      await Notification.createNotification({
        user_id: assignedTo,
        type: 'assignment',
        title: 'محادثة جديدة مكلف بها',
        message: `تم توزيع محادثة جديدة من ${conversation.phone_number} عليك`,
        related_id: conversationId,
        related_type: 'conversation',
        priority: 'normal',
        action_url: `/conversations/${conversationId}`,
        metadata: {
          conversation_id: conversationId,
          phone_number: conversation.phone_number,
          assigned_by: assignedBy
        }
      });
    } catch (error) {
      console.error('Error sending assignment notification:', error);
    }
  }

  /**
   * Send notification for conversation transfer
   * @param {string} conversationId - Conversation ID
   * @param {string} transferredTo - User ID transferred to
   * @param {string} transferredFrom - User ID transferred from
   * @param {string} transferredBy - User ID who transferred (optional)
   * @returns {Promise<void>}
   */
  async notifyTransfer(conversationId, transferredTo, transferredFrom, transferredBy = null) {
    try {
      const conversation = await Conversation.findConversationById(conversationId);
      if (!conversation) {
        return;
      }

      // Notify new assignee
      await Notification.createNotification({
        user_id: transferredTo,
        type: 'transfer',
        title: 'محادثة محولة إليك',
        message: `تم تحويل محادثة من ${conversation.phone_number} إليك`,
        related_id: conversationId,
        related_type: 'conversation',
        priority: 'normal',
        action_url: `/conversations/${conversationId}`,
        metadata: {
          conversation_id: conversationId,
          phone_number: conversation.phone_number,
          transferred_from: transferredFrom,
          transferred_by: transferredBy
        }
      });

      // Notify previous assignee if different
      if (transferredFrom && transferredFrom !== transferredTo) {
        await Notification.createNotification({
          user_id: transferredFrom,
          type: 'transfer',
          title: 'محادثة محولة',
          message: `تم تحويل محادثة من ${conversation.phone_number} منك`,
          related_id: conversationId,
          related_type: 'conversation',
          priority: 'low',
          action_url: `/conversations/${conversationId}`,
          metadata: {
            conversation_id: conversationId,
            phone_number: conversation.phone_number,
            transferred_to: transferredTo,
            transferred_by: transferredBy
          }
        });
      }
    } catch (error) {
      console.error('Error sending transfer notification:', error);
    }
  }

  /**
   * Send notification for overdue conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} waitMinutes - Minutes waited
   * @returns {Promise<void>}
   */
  async notifyOverdue(conversationId, waitMinutes) {
    try {
      const conversation = await Conversation.findConversationById(conversationId);
      if (!conversation || !conversation.assigned_to) {
        return;
      }

      // Notify assigned user
      await Notification.createNotification({
        user_id: conversation.assigned_to,
        type: 'alert',
        title: 'محادثة متأخرة',
        message: `المحادثة من ${conversation.phone_number} تنتظر الرد منذ ${waitMinutes} دقيقة`,
        related_id: conversationId,
        related_type: 'conversation',
        priority: waitMinutes > 120 ? 'urgent' : 'high',
        action_url: `/conversations/${conversationId}`,
        metadata: {
          conversation_id: conversationId,
          phone_number: conversation.phone_number,
          wait_minutes: waitMinutes
        }
      });

      // Notify supervisor if wait time is very long
      if (waitMinutes > 60) {
        // Get supervisors
        const User = require('../models/user.model');
        const supervisorsResult = await User.getAllUsers({
          role: 'supervisor',
          is_active: true,
          limit: 100
        });

        for (const supervisor of supervisorsResult.users) {
          await Notification.createNotification({
            user_id: supervisor.id,
            type: 'alert',
            title: 'محادثة متأخرة تحتاج متابعة',
            message: `المحادثة من ${conversation.phone_number} تنتظر الرد منذ ${waitMinutes} دقيقة`,
            related_id: conversationId,
            related_type: 'conversation',
            priority: 'high',
            action_url: `/conversations/${conversationId}`,
            metadata: {
              conversation_id: conversationId,
              phone_number: conversation.phone_number,
              wait_minutes: waitMinutes,
              assigned_to: conversation.assigned_to
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending overdue notification:', error);
    }
  }

  /**
   * Check and send notifications for overdue conversations
   * @param {number} thresholdMinutes - Threshold in minutes (default: 60)
   * @returns {Promise<void>}
   */
  async checkOverdueConversations(thresholdMinutes = 60) {
    try {
      const { query } = require('../config/database');
      
      // Get conversations that haven't been responded to for thresholdMinutes
      const result = await query(
        `SELECT id, phone_number, assigned_to, last_message_at, unread_count
         FROM conversations
         WHERE status IN ('open', 'assigned', 'pending')
         AND assigned_to IS NOT NULL
         AND unread_count > 0
         AND last_message_at < NOW() - INTERVAL '${thresholdMinutes} minutes'
         AND deleted_at IS NULL`
      );

      for (const conversation of result.rows) {
        const waitMinutes = Math.floor(
          (new Date() - new Date(conversation.last_message_at)) / (1000 * 60)
        );
        await this.notifyOverdue(conversation.id, waitMinutes);
      }
    } catch (error) {
      console.error('Error checking overdue conversations:', error);
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;

