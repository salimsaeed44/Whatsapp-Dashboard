/**
 * WhatsApp API Routes
 * Handles WhatsApp Cloud API webhooks and integration endpoints
 */

const express = require('express');
const router = express.Router();

// Import WhatsApp service and controller
const whatsappService = require('../services/whatsapp/whatsapp.service');
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate, optionalAuthenticate } = require('../middleware');

// Webhook verification (GET request from Meta)
// This endpoint is used by Meta to verify the webhook during setup
router.get('/webhook', (req, res) => {
  whatsappService.verifyWebhook(req, res);
});

// Webhook receiver (POST request from Meta)
// This endpoint receives all incoming webhook events from WhatsApp
router.post('/webhook', (req, res) => {
  whatsappService.handleWebhook(req, res);
});

// Send message endpoint (Protected - requires authentication)
router.post('/send', authenticate, async (req, res) => {
  try {
    const { phoneNumber, message, type, options } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'phoneNumber and message are required'
      });
    }

    let result;
    switch (type) {
      case 'text':
        result = await whatsappService.sendTextMessage(phoneNumber, message, options);
        break;
      case 'image':
        if (!options?.imageUrl) {
          return res.status(400).json({ error: 'imageUrl is required for image messages' });
        }
        result = await whatsappService.sendImageMessage(phoneNumber, options.imageUrl, message, options);
        break;
      case 'document':
        if (!options?.documentUrl || !options?.filename) {
          return res.status(400).json({ error: 'documentUrl and filename are required for document messages' });
        }
        result = await whatsappService.sendDocumentMessage(phoneNumber, options.documentUrl, options.filename, message, options);
        break;
      case 'location':
        if (!options?.latitude || !options?.longitude) {
          return res.status(400).json({ error: 'latitude and longitude are required for location messages' });
        }
        result = await whatsappService.sendLocationMessage(phoneNumber, options.latitude, options.longitude, options.name, options.address);
        break;
      default:
        // Default to text message
        result = await whatsappService.sendTextMessage(phoneNumber, message, options);
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// Get message status (Protected - requires authentication)
router.get('/status/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const status = await whatsappService.getMessageStatus(messageId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting message status:', error);
    res.status(500).json({
      error: 'Failed to get message status',
      message: error.message
    });
  }
});

// Get WhatsApp service configuration (Protected - admin only)
router.get('/config', authenticate, (req, res) => {
  // TODO: Add admin check
  // For now, return config for authenticated users
  const config = whatsappService.getConfig();
  res.status(200).json({
    configured: whatsappService.isConfigured(),
    config: config
  });
});

module.exports = router;

