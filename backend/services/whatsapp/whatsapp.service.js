/**
 * WhatsApp Service
 * Main service for WhatsApp Business Cloud API integration
 * Provides unified interface for webhook handling and message sending
 */

const webhookHandler = require('./webhook.handler');
const messageSender = require('./message.sender');

// TODO: Import required modules
// const Message = require('../../models/message.model');
// const User = require('../../models/user.model');

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
    return await messageSender.sendTextMessage(to, text, options);
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
    return await messageSender.sendImageMessage(to, imageUrl, caption, options);
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
    return await messageSender.sendDocumentMessage(to, documentUrl, filename, caption, options);
  }

  /**
   * Send location message
   * 
   * @param {string} to - Recipient phone number
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} name - Location name
   * @param {string} address - Location address
   * @returns {Promise<Object>} Result
   */
  async sendLocationMessage(to, latitude, longitude, name = '', address = '') {
    return await messageSender.sendLocationMessage(to, latitude, longitude, name, address);
  }

  /**
   * Mark message as read
   * 
   * @param {string} messageId - WhatsApp message ID
   * @returns {Promise<Object>} Result
   */
  async markAsRead(messageId) {
    return await messageSender.markAsRead(messageId);
  }

  /**
   * Get message status
   * 
   * @param {string} messageId - WhatsApp message ID
   * @returns {Promise<Object>} Message status
   */
  async getMessageStatus(messageId) {
    try {
      // TODO: Query database for message status
      // const message = await Message.findMessageByWhatsAppId(messageId);
      // return {
      //   id: message.id,
      //   whatsapp_message_id: message.whatsapp_message_id,
      //   status: message.status,
      //   phone_number: message.phone_number,
      //   created_at: message.created_at,
      //   updated_at: message.updated_at
      // };

      // Placeholder
      return {
        message_id: messageId,
        status: 'unknown',
        note: 'Not implemented yet - query database for actual status'
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
      base_url: this.baseUrl
    };
  }
}

// Export singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;

