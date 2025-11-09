/**
 * WhatsApp Controller
 * Handles WhatsApp Cloud API integration business logic
 */

const whatsappService = require('../services/whatsapp/whatsapp.service');
const Message = require('../models/message.model');

/**
 * Verify webhook from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyWebhook = (req, res) => {
  return whatsappService.verifyWebhook(req, res);
};

/**
 * Handle webhook events from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWebhook = async (req, res) => {
  return whatsappService.handleWebhook(req, res);
};

/**
 * Send message via WhatsApp Cloud API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNumber, message, messageType = 'text', imageUrl, documentUrl, filename, caption, latitude, longitude, locationName, locationAddress } = req.body;
    const currentUser = req.user; // From authenticate middleware

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number is required'
      });
    }

    // Validate message content based on type
    if (messageType === 'text' && !message) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message content is required for text messages'
      });
    }

    if (messageType === 'image' && !imageUrl) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Image URL is required for image messages'
      });
    }

    if (messageType === 'document' && !documentUrl) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Document URL is required for document messages'
      });
    }

    if (messageType === 'location' && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Latitude and longitude are required for location messages'
      });
    }

    let result;

    // Send message based on type
    switch (messageType) {
      case 'text':
        result = await whatsappService.sendTextMessage(phoneNumber, message, {
          user_id: currentUser?.id,
          conversation_id: req.body.conversation_id,
          metadata: req.body.metadata || {}
        });
        break;
      case 'image':
        result = await whatsappService.sendImageMessage(phoneNumber, imageUrl, caption || '', {
          user_id: currentUser?.id,
          conversation_id: req.body.conversation_id,
          metadata: req.body.metadata || {}
        });
        break;
      case 'document':
        result = await whatsappService.sendDocumentMessage(phoneNumber, documentUrl, filename, caption || '', {
          user_id: currentUser?.id,
          conversation_id: req.body.conversation_id,
          metadata: req.body.metadata || {}
        });
        break;
      case 'location':
        result = await whatsappService.sendLocationMessage(phoneNumber, latitude, longitude, locationName || '', locationAddress || '', {
          user_id: currentUser?.id,
          conversation_id: req.body.conversation_id,
          metadata: req.body.metadata || {}
        });
        break;
      default:
        return res.status(400).json({
          error: 'Validation error',
          message: `Unsupported message type: ${messageType}`
        });
    }

    if (result.success) {
      res.status(200).json({
        message: 'Message sent successfully',
        data: {
          message_id: result.message_id,
          whatsapp_message_id: result.message_id,
          status: 'sent',
          phone_number: phoneNumber
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message',
        message: result.error || 'Unknown error occurred',
        details: result.details
      });
    }
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
};

/**
 * Get message status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Validate message ID
    if (!messageId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message ID is required'
      });
    }

    // Get message status from database
    const status = await whatsappService.getMessageStatus(messageId);

    if (status.status === 'not_found') {
      return res.status(404).json({
        error: 'Message not found',
        message: status.message
      });
    }

    res.status(200).json({
      message: 'Message status retrieved successfully',
      data: status
    });
  } catch (error) {
    console.error('Get message status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve message status',
      message: error.message
    });
  }
};

/**
 * Get WhatsApp service configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConfig = async (req, res) => {
  try {
    const config = whatsappService.getConfig();

    res.status(200).json({
      message: 'Configuration retrieved successfully',
      data: config
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      error: 'Failed to retrieve configuration',
      message: error.message
    });
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook,
  sendWhatsAppMessage,
  getMessageStatus,
  getConfig
};
