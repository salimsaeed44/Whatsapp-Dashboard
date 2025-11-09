/**
 * Messages Controller
 * Handles WhatsApp messages business logic
 */

const Message = require('../models/message.model');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const Conversation = require('../models/conversation.model');

/**
 * Get all messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMessages = async (req, res) => {
  try {
    // Extract query parameters
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
    } = req.query;

    // Parse limit and offset to integers
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

    // Get messages from database
    const result = await Message.getAllMessages({
      limit: limitInt,
      offset: offsetInt,
      phone_number,
      direction,
      status,
      message_type,
      user_id,
      conversation_id,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
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

    // Validate message ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    // Get message from database
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
 * Send new message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Note: This endpoint saves the message to database.
 * Actual sending via WhatsApp API should be handled by WhatsApp service.
 */
const sendMessage = async (req, res) => {
  try {
    const {
      phone_number,
      content,
      message_type = 'text',
      conversation_id,
      metadata = {},
      raw_payload = {}
    } = req.body;

    const currentUser = req.user; // From authenticate middleware

    // Validate required fields
    if (!phone_number || !content) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number and content are required'
      });
    }

    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      const conversation = await Conversation.getOrCreateConversation(phone_number);
      conversationId = conversation.id;
    }

    // Send message via WhatsApp service
    let whatsappResult;
    try {
      switch (message_type) {
        case 'text':
          whatsappResult = await whatsappService.sendTextMessage(phone_number, content, {
            user_id: currentUser?.id || null,
            conversation_id: conversationId,
            metadata
          });
          break;
        default:
          // For other message types, use text message for now
          whatsappResult = await whatsappService.sendTextMessage(phone_number, content, {
            user_id: currentUser?.id || null,
            conversation_id: conversationId,
            metadata
          });
      }

      if (whatsappResult.success) {
        // Message was sent and saved to database by WhatsApp service
        // Get the saved message
        const savedMessage = await Message.findMessageByWhatsAppId(whatsappResult.message_id);
        
        res.status(201).json({
          message: 'Message sent successfully',
          data: savedMessage
        });
      } else {
        // WhatsApp API failed, but we still want to save the message as failed
        const failedMessage = await Message.createMessage({
          phone_number,
          content,
          message_type,
          direction: 'outgoing',
          status: 'failed',
          source: 'meta',
          user_id: currentUser?.id || null,
          conversation_id: conversationId,
          metadata: {
            ...metadata,
            error: whatsappResult.error,
            error_details: whatsappResult.details
          },
          raw_payload: whatsappResult
        });

        res.status(500).json({
          error: 'Failed to send message',
          message: whatsappResult.error || 'Unknown error occurred',
          details: whatsappResult.details,
          data: failedMessage
        });
      }
    } catch (error) {
      console.error('Error sending message via WhatsApp:', error);
      
      // Save message as failed
      const failedMessage = await Message.createMessage({
        phone_number,
        content,
        message_type,
        direction: 'outgoing',
        status: 'failed',
        source: 'meta',
        user_id: currentUser?.id || null,
        conversation_id: conversationId,
        metadata: {
          ...metadata,
          error: error.message
        },
        raw_payload: {}
      });

      res.status(500).json({
        error: 'Failed to send message',
        message: error.message,
        data: failedMessage
      });
    }
  } catch (error) {
    console.error('Send message error:', error);
    
    // Handle specific errors
    if (error.message === 'WhatsApp message ID already exists') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to send message',
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

    // Validate message ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    // Validate status
    if (!status) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status is required'
      });
    }

    // Update message status
    const updatedMessage = await Message.updateMessageStatus(id, status, timestamp ? new Date(timestamp) : null);

    res.status(200).json({
      message: 'Message status updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Update message status error:', error);
    
    // Handle specific errors
    if (error.message === 'Message not found or already deleted') {
      return res.status(404).json({
        error: 'Message not found',
        message: error.message
      });
    }

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

    // Validate message ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    // Delete message (soft delete)
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
 * Get conversation by phone number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversation = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const {
      limit = 50,
      offset = 0,
      direction,
      status,
      includeDeleted = false
    } = req.query;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number is required'
      });
    }

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

    // Get messages by phone number
    const result = await Message.getMessagesByPhoneNumber(phoneNumber, {
      limit: limitInt,
      offset: offsetInt,
      direction,
      status,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
    });

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      phone_number: phoneNumber,
      data: result.messages,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.messages.length < result.total
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation',
      message: error.message
    });
  }
};

module.exports = {
  getAllMessages,
  getMessageById,
  sendMessage,
  updateMessageStatus,
  deleteMessage,
  getConversation
};
