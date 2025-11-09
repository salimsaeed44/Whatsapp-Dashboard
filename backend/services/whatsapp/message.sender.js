/**
 * WhatsApp Message Sender
 * Handles sending messages via WhatsApp Business Cloud API
 */

const axios = require('axios');

// TODO: Import required modules
// const Message = require('../../models/message.model');
// const whatsappService = require('./whatsapp.service');

/**
 * WhatsApp Cloud API Base URL
 */
const API_BASE_URL = 'https://graph.facebook.com/v18.0';

/**
 * Send text message
 * 
 * @param {string} to - Recipient phone number (with country code, no +)
 * @param {string} text - Message text
 * @param {Object} options - Additional options (context, preview_url, etc.)
 * @returns {Promise<Object>} API response
 */
const sendTextMessage = async (to, text, options = {}) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp Phone ID or Access Token is not configured');
    }

    const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: options.preview_url || false,
        body: text
      }
    };

    // Add context if provided (for replying to a message)
    if (options.context && options.context.message_id) {
      payload.context = {
        message_id: options.context.message_id
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Text message sent:', {
      to: to,
      message_id: response.data.messages[0].id
    });

    // TODO: Save sent message to database
    // await Message.createMessage({
    //   whatsapp_message_id: response.data.messages[0].id,
    //   phone_number: to,
    //   message_type: 'text',
    //   content: text,
    //   direction: 'outgoing',
    //   status: 'sent',
    //   metadata: { context: options.context }
    // });

    return {
      success: true,
      message_id: response.data.messages[0].id,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error sending text message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error || error.response?.data,
      code: error.response?.status || 500
    };
  }
};

/**
 * Send image message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} imageUrl - Image URL or media ID
 * @param {string} caption - Optional caption
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
const sendImageMessage = async (to, imageUrl, caption = '', options = {}) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        link: imageUrl.startsWith('http') ? imageUrl : undefined,
        id: imageUrl.startsWith('http') ? undefined : imageUrl,
        caption: caption || undefined
      }
    };

    if (options.context && options.context.message_id) {
      payload.context = {
        message_id: options.context.message_id
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Image message sent:', {
      to: to,
      message_id: response.data.messages[0].id
    });

    return {
      success: true,
      message_id: response.data.messages[0].id,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error sending image message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error || error.response?.data,
      code: error.response?.status || 500
    };
  }
};

/**
 * Send document message
 * 
 * @param {string} to - Recipient phone number
 * @param {string} documentUrl - Document URL or media ID
 * @param {string} filename - Document filename
 * @param {string} caption - Optional caption
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
const sendDocumentMessage = async (to, documentUrl, filename, caption = '', options = {}) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'document',
      document: {
        link: documentUrl.startsWith('http') ? documentUrl : undefined,
        id: documentUrl.startsWith('http') ? undefined : documentUrl,
        caption: caption || undefined,
        filename: filename
      }
    };

    if (options.context && options.context.message_id) {
      payload.context = {
        message_id: options.context.message_id
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Document message sent:', {
      to: to,
      message_id: response.data.messages[0].id
    });

    return {
      success: true,
      message_id: response.data.messages[0].id,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error sending document message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error || error.response?.data,
      code: error.response?.status || 500
    };
  }
};

/**
 * Send location message
 * 
 * @param {string} to - Recipient phone number
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} name - Location name (optional)
 * @param {string} address - Location address (optional)
 * @returns {Promise<Object>} API response
 */
const sendLocationMessage = async (to, latitude, longitude, name = '', address = '') => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'location',
      location: {
        latitude: latitude,
        longitude: longitude,
        name: name || undefined,
        address: address || undefined
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Location message sent:', {
      to: to,
      message_id: response.data.messages[0].id
    });

    return {
      success: true,
      message_id: response.data.messages[0].id,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error sending location message:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error || error.response?.data,
      code: error.response?.status || 500
    };
  }
};

/**
 * Mark message as read
 * 
 * @param {string} messageId - WhatsApp message ID
 * @returns {Promise<Object>} API response
 */
const markAsRead = async (messageId) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    const url = `${API_BASE_URL}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message marked as read:', messageId);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Error marking message as read:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error || error.response?.data,
      code: error.response?.status || 500
    };
  }
};

module.exports = {
  sendTextMessage,
  sendImageMessage,
  sendDocumentMessage,
  sendLocationMessage,
  markAsRead
};





