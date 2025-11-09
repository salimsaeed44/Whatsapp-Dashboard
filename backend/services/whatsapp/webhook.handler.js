/**
 * WhatsApp Webhook Handler
 * Handles incoming webhook events from Meta WhatsApp Business API
 */

// TODO: Import required modules
// const Message = require('../../models/message.model');
// const whatsappService = require('./whatsapp.service');

/**
 * Verify webhook from Meta
 * GET /api/whatsapp/webhook
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyWebhook = (req, res) => {
  try {
    // Webhook verification from Meta
    // Meta sends a GET request with query parameters for verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_SECRET;

    // Verify the token matches
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('❌ Webhook verification failed');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Webhook verification error:', error);
    res.status(500).json({ error: 'Webhook verification failed', message: error.message });
  }
};

/**
 * Handle incoming webhook events
 * POST /api/whatsapp/webhook
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    // Respond immediately to Meta (within 20 seconds)
    res.status(200).send('OK');

    // Check if this is a WhatsApp Business Account event
    if (body.object !== 'whatsapp_business_account') {
      console.log('⚠️ Received webhook for non-WhatsApp object:', body.object);
      return;
    }

    // Process each entry
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        await processEntry(entry);
      }
    }
  } catch (error) {
    console.error('❌ Webhook handling error:', error);
    // Don't send error response here as we already sent 200 OK
  }
};

/**
 * Process a webhook entry
 * 
 * @param {Object} entry - Webhook entry object
 */
const processEntry = async (entry) => {
  try {
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field === 'messages') {
        await processMessageChange(change.value);
      } else if (change.field === 'message_status') {
        await processStatusChange(change.value);
      }
    }
  } catch (error) {
    console.error('Error processing entry:', error);
  }
};

/**
 * Process message change event
 * Handles incoming messages, message status updates, etc.
 * 
 * @param {Object} value - Change value object
 */
const processMessageChange = async (value) => {
  try {
    // Handle incoming messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        await handleIncomingMessage(message, value);
      }
    }

    // Handle message status updates
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await handleMessageStatus(status);
      }
    }
  } catch (error) {
    console.error('Error processing message change:', error);
  }
};

/**
 * Handle incoming message
 * 
 * @param {Object} message - Message object from WhatsApp API
 * @param {Object} value - Full value object containing metadata
 */
const handleIncomingMessage = async (message, value) => {
  try {
    console.log('📨 Incoming message received:', {
      id: message.id,
      from: message.from,
      type: message.type,
      timestamp: message.timestamp
    });

    // Extract message data
    const messageData = {
      whatsapp_message_id: message.id,
      phone_number: message.from,
      message_type: message.type || 'text',
      direction: 'incoming',
      status: 'received',
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      metadata: {
        message_id: message.id,
        conversation_id: message.context?.id,
        referred_product_id: message.context?.referred_product?.product_retailer_id
      }
    };

    // Extract content based on message type
    switch (message.type) {
      case 'text':
        messageData.content = message.text?.body || '';
        break;
      case 'image':
        messageData.content = message.image?.caption || '';
        messageData.metadata.image_id = message.image?.id;
        messageData.metadata.mime_type = message.image?.mime_type;
        break;
      case 'video':
        messageData.content = message.video?.caption || '';
        messageData.metadata.video_id = message.video?.id;
        break;
      case 'audio':
        messageData.content = '[Audio Message]';
        messageData.metadata.audio_id = message.audio?.id;
        break;
      case 'document':
        messageData.content = message.document?.caption || message.document?.filename || '';
        messageData.metadata.document_id = message.document?.id;
        messageData.metadata.filename = message.document?.filename;
        break;
      case 'location':
        messageData.content = `Lat: ${message.location?.latitude}, Long: ${message.location?.longitude}`;
        messageData.metadata.latitude = message.location?.latitude;
        messageData.metadata.longitude = message.location?.longitude;
        break;
      case 'contacts':
        messageData.content = JSON.stringify(message.contacts);
        break;
      default:
        messageData.content = JSON.stringify(message);
    }

    // TODO: Save message to database
    // const savedMessage = await Message.createMessage(messageData);
    // console.log('✅ Message saved to database:', savedMessage.id);

    // TODO: Trigger bot response or notify users
    // await triggerBotResponse(messageData);

    console.log('✅ Incoming message processed:', messageData.whatsapp_message_id);
  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
};

/**
 * Handle message status update
 * 
 * @param {Object} status - Status object from WhatsApp API
 */
const handleMessageStatus = async (status) => {
  try {
    console.log('📊 Message status update:', {
      id: status.id,
      status: status.status,
      timestamp: status.timestamp
    });

    // Map WhatsApp status to our status
    const statusMap = {
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed'
    };

    const mappedStatus = statusMap[status.status] || status.status;

    // TODO: Update message status in database
    // await Message.updateMessageStatus(status.id, mappedStatus, {
    //   timestamp: new Date(parseInt(status.timestamp) * 1000),
    //   recipient_id: status.recipient_id,
    //   error: status.errors ? JSON.stringify(status.errors) : null
    // });

    console.log('✅ Message status updated:', status.id, '->', mappedStatus);
  } catch (error) {
    console.error('❌ Error handling message status:', error);
  }
};

/**
 * Process status change event
 * 
 * @param {Object} value - Status change value object
 */
const processStatusChange = async (value) => {
  try {
    // Handle account status changes, phone number status, etc.
    console.log('📊 Status change received:', value);
    
    // TODO: Handle account status changes
    // if (value.event === 'account_review_update') {
    //   // Handle account review status
    // }
  } catch (error) {
    console.error('Error processing status change:', error);
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook
};

