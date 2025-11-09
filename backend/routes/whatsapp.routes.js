/**
 * WhatsApp API Routes
 * Handles WhatsApp Cloud API webhooks and integration endpoints
 */

const express = require('express');
const router = express.Router();

// Import WhatsApp controller and middleware
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate, optionalAuthenticate } = require('../middleware');

// Webhook verification (GET request from Meta)
// This endpoint is used by Meta to verify the webhook during setup
// Public endpoint (no authentication required)
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook receiver (POST request from Meta)
// This endpoint receives all incoming webhook events from WhatsApp
// Public endpoint (no authentication required, but should verify signature in production)
router.post('/webhook', optionalAuthenticate, whatsappController.handleWebhook);

// Send message endpoint (Protected - requires authentication)
router.post('/send', authenticate, whatsappController.sendWhatsAppMessage);

// Get message status (Protected - requires authentication)
router.get('/status/:messageId', authenticate, whatsappController.getMessageStatus);

// Get WhatsApp service configuration (Protected - requires authentication)
router.get('/config', authenticate, whatsappController.getConfig);

module.exports = router;
