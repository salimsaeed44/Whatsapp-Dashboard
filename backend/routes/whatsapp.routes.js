/**
 * WhatsApp API Routes
 * Handles WhatsApp Cloud API webhooks and integration endpoints
 */

const express = require('express');
const router = express.Router();

// TODO: Import WhatsApp controller and middleware
// const whatsappController = require('../controllers/whatsapp.controller');
// const { verifyWebhook } = require('../middleware/whatsapp.middleware');

// Webhook verification (GET request from Meta)
router.get('/webhook', (req, res) => {
  // TODO: Implement webhook verification
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // TODO: Verify token
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_SECRET) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook receiver (POST request from Meta)
router.post('/webhook', (req, res) => {
  // TODO: Implement webhook handler
  // Process incoming messages from WhatsApp
  res.status(200).json({ message: 'Webhook received - Not implemented yet' });
});

// Send message endpoint
router.post('/send', (req, res) => {
  // TODO: Implement send message via WhatsApp Cloud API
  res.status(501).json({ message: 'Send WhatsApp message endpoint - Not implemented yet' });
});

// Get message status
router.get('/status/:messageId', (req, res) => {
  // TODO: Get message delivery status
  res.status(501).json({ message: 'Get message status endpoint - Not implemented yet' });
});

module.exports = router;

