/**
 * Message Retry Service
 * Handles automatic retry of failed messages
 */

const Message = require('../models/message.model');
const whatsappService = require('./whatsapp/message.sender');

/**
 * Retry failed messages
 * @param {Object} options - Retry options
 * @param {number} options.limit - Maximum number of messages to retry
 * @param {number} options.maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Retry results
 */
const retryFailedMessages = async (options = {}) => {
  try {
    const { limit = 100, maxRetries = 3 } = options;

    // Get failed messages that haven't exceeded max retries
    const failedMessages = await Message.getFailedMessages({
      limit,
      maxRetries
    });

    const results = {
      total: failedMessages.length,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    for (const message of failedMessages) {
      try {
        // Check retry count
        const retryCount = (message.metadata?.retry_count || 0);
        if (retryCount >= maxRetries) {
          results.skipped++;
          continue;
        }

        // Retry sending message
        const retryResult = await whatsappService.sendTextMessage(
          message.phone_number,
          message.content
        );

        // Update message with new WhatsApp message ID and reset status
        await Message.updateMessageByWhatsAppId(message.whatsapp_message_id, {
          whatsapp_message_id: retryResult.message_id,
          status: 'sent',
          metadata: JSON.stringify({
            ...message.metadata,
            retry_count: retryCount + 1,
            last_retry_at: new Date().toISOString(),
            previous_message_id: message.whatsapp_message_id
          })
        });

        results.successful++;
      } catch (error) {
        console.error(`Error retrying message ${message.id}:`, error);
        
        // Increment retry count
        const retryCount = (message.metadata?.retry_count || 0) + 1;
        await Message.updateMessageByWhatsAppId(message.whatsapp_message_id, {
          metadata: JSON.stringify({
            ...message.metadata,
            retry_count: retryCount,
            last_retry_error: error.message,
            last_retry_at: new Date().toISOString()
          })
        });

        results.failed++;
      }
    }

    return results;
  } catch (error) {
    console.error('Retry failed messages error:', error);
    throw error;
  }
};

/**
 * Schedule automatic retry for failed messages
 * This should be called periodically (e.g., every 5 minutes)
 */
const scheduleAutoRetry = async () => {
  try {
    const results = await retryFailedMessages({
      limit: 50,
      maxRetries: 3
    });

    console.log('🔄 Auto-retry completed:', results);
    return results;
  } catch (error) {
    console.error('Auto-retry error:', error);
  }
};

module.exports = {
  retryFailedMessages,
  scheduleAutoRetry
};

