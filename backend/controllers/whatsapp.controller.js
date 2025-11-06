/**
 * WhatsApp Controller
 * Handles WhatsApp Cloud API integration business logic
 */

// TODO: Import required modules
// const axios = require('axios');
// const Message = require('../models/message.model');

/**
 * Verify webhook from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyWebhook = (req, res) => {
  try {
    // TODO: Implement webhook verification
    // 1. Get verification parameters from query
    // 2. Verify token matches WHATSAPP_WEBHOOK_SECRET
    // 3. Return challenge if verified
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_SECRET) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle webhook events from Meta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWebhook = async (req, res) => {
  try {
    // TODO: Implement webhook handler
    // 1. Verify webhook signature (if using signature verification)
    // 2. Process incoming message events
    // 3. Save messages to database
    // 4. Trigger bot responses if needed
    // 5. Return 200 OK to Meta
    
    const body = req.body;
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    
    // Process webhook events
    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry) => {
        entry.changes?.forEach((change) => {
          if (change.field === 'messages') {
            // TODO: Process message events
            console.log('Message event received:', change.value);
          }
        });
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send message via WhatsApp Cloud API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendWhatsAppMessage = async (req, res) => {
  try {
    // TODO: Implement send WhatsApp message
    // 1. Validate input data (phone number, message content)
    // 2. Format message according to WhatsApp Cloud API format
    // 3. Send POST request to WhatsApp Cloud API
    // 4. Save message to database
    // 5. Return message ID and status
    
    const { phoneNumber, message } = req.body;
    
    // Placeholder for WhatsApp Cloud API call
    // const response = await axios.post(
    //   `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    //   {
    //     messaging_product: 'whatsapp',
    //     to: phoneNumber,
    //     text: { body: message }
    //   },
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    
    res.status(501).json({ 
      message: 'Send WhatsApp message function - Not implemented yet',
      data: { phoneNumber, message }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get message status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessageStatus = async (req, res) => {
  try {
    // TODO: Implement get message status
    // 1. Get message ID from request
    // 2. Query database for message status
    // 3. Optionally query WhatsApp Cloud API for latest status
    // 4. Return message status
    
    const { messageId } = req.params;
    res.status(501).json({ message: `Get message status function (${messageId}) - Not implemented yet` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook,
  sendWhatsAppMessage,
  getMessageStatus
};

