/**
 * Test Webhook Verification
 * Simple script to test webhook verification locally
 */

require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import webhook handler
const { verifyWebhook, handleWebhook } = require('./services/whatsapp/webhook.handler');

// Webhook endpoints
app.get('/api/whatsapp/webhook', verifyWebhook);
app.post('/api/whatsapp/webhook', handleWebhook);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WhatsApp Webhook Test Server',
    env: {
      META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN ? 'configured' : 'not configured',
      WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID ? 'configured' : 'not configured',
      META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? 'configured' : 'not configured'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`\n✅ Environment variables:`);
  console.log(`   META_VERIFY_TOKEN: ${process.env.META_VERIFY_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   WHATSAPP_PHONE_ID: ${process.env.WHATSAPP_PHONE_ID ? '✅ Set' : '❌ Not set'}`);
  console.log(`   META_ACCESS_TOKEN: ${process.env.META_ACCESS_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`\n📝 Test webhook verification:`);
  console.log(`   curl "http://localhost:${PORT}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST_CHALLENGE"`);
});






