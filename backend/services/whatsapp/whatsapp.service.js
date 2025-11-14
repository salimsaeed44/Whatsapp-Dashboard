/**
 * WhatsApp Service
 * Main service for WhatsApp Business Cloud API integration
 * Provides unified interface for webhook handling and message sending
 */

const webhookHandler = require('./webhook.handler');
const messageSender = require('./message.sender');
const Message = require('../../models/message.model');
const Conversation = require('../../models/conversation.model');
const {
  emitMessageCreated,
  emitMessageStatusUpdated
} = require('../socket.service');

/**
 * WhatsApp Service Class
 * Centralized service for all WhatsApp operations
 */
class WhatsAppService {
  /**
   * Initialize WhatsApp service
   */
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    this.verifyToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_SECRET;
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Verify webhook from Meta
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  verifyWebhook(req, res) {
    return webhookHandler.verifyWebhook(req, res);
  }

  /**
   * Handle incoming webhook
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  handleWebhook(req, res) {
    return webhookHandler.handleWebhook(req, res);
  }

  /**
   * Send text message
   * 
   * @param {string} to - Recipient phone number
   * @param {string} text - Message text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Result
   */
  async sendTextMessage(to, text, options = {}) {
    const result = await messageSender.sendTextMessage(to, text, options);
    
    // Save message to database if successful
    if (result.success && result.message_id) {
      try {
        await persistOutgoingMessage(to, {
          whatsapp_message_id: result.message_id,
          message_type: 'text',
          content: text,
          direction: 'outgoing',
          status: 'sent',
          source: 'meta',
          raw_payload: result
        }, options);
      } catch (error) {
        console.error('Error saving message to database:', error);
        // Don't throw error, message was sent successfully
      }
    }
    
    return result;
  }

  /**
   * Send image message
   * 
   * @param {string} to - Recipient phone number
   * @param {string} imageUrl - Image URL or media ID
   * @param {string} caption - Optional caption
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Result
   */
  async sendImageMessage(to, imageUrl, caption = '', options = {}) {
    const result = await messageSender.sendImageMessage(to, imageUrl, caption, options);
    
    // Save message to database if successful
    if (result.success && result.message_id) {
      try {
        await persistOutgoingMessage(to, {
          whatsapp_message_id: result.message_id,
          message_type: 'image',
          content: caption || '[Image]',
          direction: 'outgoing',
          status: 'sent',
          source: 'meta',
          metadata: {
            image_url: imageUrl
          },
          raw_payload: result
        }, options);
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
    
    return result;
  }

  /**
   * Send document message
   * 
   * @param {string} to - Recipient phone number
   * @param {string} documentUrl - Document URL or media ID
   * @param {string} filename - Document filename
   * @param {string} caption - Optional caption
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Result
   */
  async sendDocumentMessage(to, documentUrl, filename, caption = '', options = {}) {
    const result = await messageSender.sendDocumentMessage(to, documentUrl, filename, caption, options);
    
    // Save message to database if successful
    if (result.success && result.message_id) {
      try {
        await persistOutgoingMessage(to, {
          whatsapp_message_id: result.message_id,
          message_type: 'document',
          content: caption || filename || '[Document]',
          direction: 'outgoing',
          status: 'sent',
          source: 'meta',
          metadata: {
            document_url: documentUrl,
            filename
          },
          raw_payload: result
        }, options);
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
    
    return result;
  }

  /**
   * Send location message
   * 
   * @param {string} to - Recipient phone number
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} name - Location name
   * @param {string} address - Location address
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Result
   */
  async sendLocationMessage(to, latitude, longitude, name = '', address = '', options = {}) {
    const result = await messageSender.sendLocationMessage(to, latitude, longitude, name, address);
    
    // Save message to database if successful
    if (result.success && result.message_id) {
      try {
        await persistOutgoingMessage(to, {
          whatsapp_message_id: result.message_id,
          message_type: 'location',
          content: `Lat: ${latitude}, Long: ${longitude}`,
          direction: 'outgoing',
          status: 'sent',
          source: 'meta',
          metadata: {
            latitude,
            longitude,
            name,
            address
          },
          raw_payload: result
        }, options);
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
    
    return result;
  }

  /**
   * Mark message as read
   * 
   * @param {string} messageId - WhatsApp message ID
   * @returns {Promise<Object>} Result
   */
  async markAsRead(messageId) {
    const result = await messageSender.markAsRead(messageId);
    
    // Update message status in database
    if (result.success) {
      try {
        const message = await Message.findMessageByWhatsAppId(messageId);
        if (message) {
          const updatedMessage = await Message.updateMessageStatus(message.id, 'read', new Date());
          emitMessageStatusUpdated(updatedMessage);
        }
      } catch (error) {
        console.error('Error updating message status in database:', error);
      }
    }
    
    return result;
  }

  /**
   * Get message status
   * 
   * @param {string} messageId - WhatsApp message ID
   * @returns {Promise<Object>} Message status
   */
  async getMessageStatus(messageId) {
    try {
      // Query database for message status
      const message = await Message.findMessageByWhatsAppId(messageId);
      if (!message) {
        return {
          message_id: messageId,
          status: 'not_found',
          message: 'Message not found in database'
        };
      }

      return {
        id: message.id,
        whatsapp_message_id: message.whatsapp_message_id,
        status: message.status,
        phone_number: message.phone_number,
        direction: message.direction,
        message_type: message.message_type,
        created_at: message.created_at,
        updated_at: message.updated_at,
        delivered_at: message.delivered_at,
        read_at: message.read_at
      };
    } catch (error) {
      console.error('Error getting message status:', error);
      throw error;
    }
  }

  /**
   * Check if service is configured
   * 
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!(this.phoneNumberId && this.accessToken);
  }

  /**
   * Get service configuration (without sensitive data)
   * 
   * @returns {Object} Configuration info
   */
  getConfig() {
    return {
      phone_number_id: this.phoneNumberId ? 'configured' : 'not configured',
      access_token: this.accessToken ? 'configured' : 'not configured',
      verify_token: this.verifyToken ? 'configured' : 'not configured',
      api_version: this.apiVersion,
      base_url: this.baseUrl,
      is_configured: this.isConfigured()
    };
  }
}

/**
 * Persist outgoing message to database and emit realtime updates
 * @param {string} phoneNumber
 * @param {Object} payload
 * @param {Object} options
 */
const persistOutgoingMessage = async (phoneNumber, payload, options = {}) => {
  let conversationId = options.conversation_id;
  let conversation = null;

  if (conversationId) {
    conversation = await Conversation.findConversationById(conversationId);
  }

  if (!conversation) {
    conversation = await Conversation.getOrCreateConversation(phoneNumber);
    conversationId = conversation.id;
  }

  const messageData = {
    ...payload,
    phone_number: phoneNumber,
    conversation_id: conversationId,
    user_id: options.user_id || null,
    metadata: {
      ...(options.metadata || {}),
      ...(payload.metadata || {})
    }
  };

  const savedMessage = await Message.createMessage(messageData);

  const updatedConversation = await Conversation.updateConversation(conversationId, {
    last_message_at: new Date(),
    last_message_id: savedMessage.id
  });

  emitMessageCreated(savedMessage, updatedConversation);

  return {
    savedMessage,
    conversation: updatedConversation
  };
};

// Export singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
