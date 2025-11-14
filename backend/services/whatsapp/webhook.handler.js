/**
 * WhatsApp Webhook Handler
 * Handles incoming webhook events from Meta WhatsApp Business API
 */

const Message = require('../../models/message.model');
const Conversation = require('../../models/conversation.model');
const automationService = require('../automation.service');
const distributionService = require('../distribution.service');
const notificationService = require('../notification.service');
const {
  emitMessageCreated,
  emitMessageStatusUpdated
} = require('../socket.service');

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

    // Handle message status updates (from message_status webhook field)
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await handleMessageStatus(status);
      }
    }
    
    // Also handle status updates from messages field (some webhooks send status in messages)
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        // Check if this is a status update (has status field but no content)
        if (message.status && !message.text && !message.image && !message.video && !message.audio && !message.document) {
          await handleMessageStatus({
            id: message.id || message.message_id,
            status: message.status,
            timestamp: message.timestamp
          });
        }
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

    // Check if message already exists
    const existingMessage = await Message.findMessageByWhatsAppId(message.id);
    if (existingMessage) {
      console.log('⚠️ Message already exists in database:', message.id);
      return;
    }

    // Extract message data
    const whatsappTimestamp = message.timestamp ? new Date(parseInt(message.timestamp) * 1000) : null;
    
    let content = '';
    const metadata = {
      message_id: message.id,
      conversation_id: message.context?.id,
      referred_product_id: message.context?.referred_product?.product_retailer_id,
      raw_message: message
    };

    // Extract content based on message type
    switch (message.type) {
      case 'text':
        content = message.text?.body || '';
        break;
      case 'image':
        content = message.image?.caption || '[Image]';
        metadata.image_id = message.image?.id;
        metadata.mime_type = message.image?.mime_type;
        metadata.image_url = message.image?.link;
        break;
      case 'video':
        content = message.video?.caption || '[Video]';
        metadata.video_id = message.video?.id;
        metadata.mime_type = message.video?.mime_type;
        break;
      case 'audio':
        content = '[Audio Message]';
        metadata.audio_id = message.audio?.id;
        metadata.mime_type = message.audio?.mime_type;
        break;
      case 'document':
        content = message.document?.caption || message.document?.filename || '[Document]';
        metadata.document_id = message.document?.id;
        metadata.filename = message.document?.filename;
        metadata.mime_type = message.document?.mime_type;
        break;
      case 'location':
        content = `Lat: ${message.location?.latitude}, Long: ${message.location?.longitude}`;
        metadata.latitude = message.location?.latitude;
        metadata.longitude = message.location?.longitude;
        metadata.name = message.location?.name;
        metadata.address = message.location?.address;
        break;
      case 'contacts':
        content = JSON.stringify(message.contacts);
        metadata.contacts = message.contacts;
        break;
      case 'sticker':
        content = '[Sticker]';
        metadata.sticker_id = message.sticker?.id;
        metadata.mime_type = message.sticker?.mime_type;
        break;
      default:
        content = JSON.stringify(message);
    }

    // Map message type
    const messageTypeMap = {
      'text': 'text',
      'image': 'image',
      'video': 'video',
      'audio': 'audio',
      'document': 'document',
      'location': 'location',
      'contacts': 'contact',
      'sticker': 'sticker'
    };

    const messageType = messageTypeMap[message.type] || 'text';

    // Get or create conversation for this phone number
    const conversation = await Conversation.getOrCreateConversation(message.from);
    const reopenedStatus = conversation.status === 'closed' ? 'open' : conversation.status;

    // Save message to database
    const savedMessage = await Message.createMessage({
      whatsapp_message_id: message.id,
      phone_number: message.from,
      message_type: messageType,
      content: content,
      direction: 'incoming',
      status: 'delivered', // Incoming messages are considered delivered
      source: 'meta',
      conversation_id: conversation.id,
      whatsapp_timestamp: whatsappTimestamp,
      metadata: metadata,
      raw_payload: value
    });

    const baseConversation = await Conversation.updateConversation(conversation.id, {
      status: reopenedStatus,
      last_message_at: whatsappTimestamp || new Date(),
      last_message_id: savedMessage.id
    });

    let realtimeConversation = baseConversation;

    // Increment unread count if conversation is assigned
    if (baseConversation.assigned_to) {
      realtimeConversation = await Conversation.incrementUnreadCount(conversation.id);
    }

    // Auto-assign conversation if not assigned
    if (!baseConversation.assigned_to && baseConversation.status === 'open') {
      try {
        // Use round robin distribution by default
        const assignmentResult = await distributionService.autoAssign(conversation.id, 'round_robin');
        
        if (assignmentResult.success) {
          console.log('✅ Conversation auto-assigned:', conversation.id, 'to employee:', assignmentResult.assigned_to);
        } else {
          // No employees available or assignment failed - conversation remains unassigned
          console.warn('⚠️ Conversation could not be auto-assigned:', assignmentResult.reason || 'unknown reason');
          console.warn('   Conversation will remain unassigned until an employee is available or manually assigned.');
        }
      } catch (error) {
        // Fallback error handling (should not reach here with new implementation)
        console.error('⚠️ Unexpected error during auto-assignment:', error.message);
        // Don't fail message processing if auto-assignment fails
      }
    }

    console.log('✅ Message saved to database:', savedMessage.id);
    console.log('✅ Conversation updated:', conversation.id);

    // Send notification for new message if conversation is assigned
    if (baseConversation.assigned_to) {
      try {
        await notificationService.notifyNewMessage(conversation.id, savedMessage.id);
      } catch (error) {
        console.error('Error sending new message notification:', error);
        // Don't fail message processing if notification fails
      }
    }

    // Process automations for incoming message
    if (messageType === 'text' && content) {
      try {
        const automationResults = await automationService.processMessageAutomations({
          phone_number: message.from,
          content: content,
          message_id: savedMessage.id,
          conversation_id: conversation.id
        });
        
        if (automationResults.length > 0) {
          console.log('✅ Automations executed:', automationResults.length);
        }
      } catch (error) {
        console.error('Error processing automations:', error);
        // Don't fail message processing if automation fails
      }
    }

    emitMessageCreated(savedMessage, realtimeConversation);

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
    // Don't throw error to prevent webhook from failing
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

    // Find message by WhatsApp message ID
    const message = await Message.findMessageByWhatsAppId(status.id);
    if (!message) {
      console.log('⚠️ Message not found for status update:', status.id);
      return;
    }

    // Update message status
    const timestamp = status.timestamp ? new Date(parseInt(status.timestamp) * 1000) : null;
    const updatedMessage = await Message.updateMessageStatus(message.id, mappedStatus, timestamp);
    emitMessageStatusUpdated(updatedMessage);

    // Update metadata with status information
    if (status.errors) {
      await Message.updateMessageByWhatsAppId(status.id, {
        metadata: {
          ...message.metadata,
          status_errors: status.errors
        }
      });
    }

    console.log('✅ Message status updated:', status.id, '->', mappedStatus);
  } catch (error) {
    console.error('❌ Error handling message status:', error);
    // Don't throw error to prevent webhook from failing
  }
};

/**
 * Process status change event
 * Handles message status updates from message_status webhook field
 * 
 * @param {Object} value - Status change value object
 */
const processStatusChange = async (value) => {
  try {
    console.log('📊 Status change received:', value);
    
    // Handle message status updates (from message_status webhook field)
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await handleMessageStatus(status);
      }
    }
    
    // Also check if status is directly in value (some webhook formats)
    if (value.id && value.status) {
      await handleMessageStatus({
        id: value.id,
        status: value.status,
        timestamp: value.timestamp
      });
    }
    
    // TODO: Handle account status changes
    // if (value.event === 'account_review_update') {
    //   // Handle account review status
    // }
  } catch (error) {
    console.error('Error processing status change:', error);
    // Don't throw error to prevent webhook from failing
  }
};

module.exports = {
  verifyWebhook,
  handleWebhook
};
