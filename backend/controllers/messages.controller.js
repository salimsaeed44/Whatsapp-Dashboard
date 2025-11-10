/**
 * Messages Controller
 * Handles messages business logic
 */

const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const messageRetryService = require('../services/message-retry.service');

/**
 * Get all messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMessages = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      phone_number,
      direction,
      status,
      conversation_id
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

    // Get messages
    const result = await Message.getAllMessages({
      limit: limitInt,
      offset: offsetInt,
      phone_number,
      direction,
      status,
      conversation_id
    });

    res.status(200).json({
      message: 'Messages retrieved successfully',
      data: result.messages,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.messages.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({
      error: 'Failed to retrieve messages',
      message: error.message
    });
  }
};

/**
 * Get message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    const message = await Message.findMessageById(id);

    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'Message with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Message retrieved successfully',
      data: message
    });
  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve message',
      message: error.message
    });
  }
};

/**
 * Send message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendMessage = async (req, res) => {
  try {
    const {
      phone_number,
      content,
      message_type = 'text',
      conversation_id
    } = req.body;

    const currentUser = req.user;

    // Validate required fields
    if (!phone_number || !content) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number and content are required'
      });
    }

    // Get or create conversation
    let conversation = null;
    if (conversation_id) {
      conversation = await Conversation.findConversationById(conversation_id);
    } else {
      conversation = await Conversation.getOrCreateConversation(phone_number);
    }

    // Send message via WhatsApp
    const result = await whatsappService.sendTextMessage(phone_number, content, {
      user_id: currentUser?.id,
      conversation_id: conversation.id
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        message_id: result.message_id,
        status: 'sent',
        phone_number,
        conversation_id: conversation.id
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
};

/**
 * Get conversation by phone number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversation = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number is required'
      });
    }

    // Get messages for this phone number
    const result = await Message.getMessagesByPhoneNumber(phoneNumber, {
      limit: 100,
      offset: 0
    });

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      data: result.messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation',
      message: error.message
    });
  }
};

/**
 * Update message status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timestamp } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID and status are required'
      });
    }

    const message = await Message.findMessageById(id);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'Message with the specified ID does not exist'
      });
    }

    const statusTimestamp = timestamp ? new Date(timestamp) : null;
    await Message.updateMessageStatus(id, status, statusTimestamp);

    res.status(200).json({
      message: 'Message status updated successfully'
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      error: 'Failed to update message status',
      message: error.message
    });
  }
};

/**
 * Delete message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    const deleted = await Message.deleteMessage(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'Message could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Message deleted successfully',
      note: 'Message has been soft deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'Failed to delete message',
      message: error.message
    });
  }
};

/**
 * Retry failed messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const retryFailedMessages = async (req, res) => {
  try {
    const { limit = 100, maxRetries = 3 } = req.body;

    const results = await messageRetryService.retryFailedMessages({
      limit: parseInt(limit, 10),
      maxRetries: parseInt(maxRetries, 10)
    });

    res.status(200).json({
      message: 'Failed messages retry completed',
      data: results
    });
  } catch (error) {
    console.error('Retry failed messages error:', error);
    res.status(500).json({
      error: 'Failed to retry messages',
      message: error.message
    });
  }
};

module.exports = {
  getAllMessages,
  getMessageById,
  sendMessage,
  getConversation,
  updateMessageStatus,
  deleteMessage,
  retryFailedMessages
};
