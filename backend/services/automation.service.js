/**
 * Automation Service
 * Handles automation execution logic
 */

const Automation = require('../models/automation.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const whatsappService = require('./whatsapp/message.sender');

/**
 * Process incoming message and execute matching automations
 * @param {Object} messageData - Incoming message data
 * @returns {Promise<Array>} Array of executed automation results
 */
const processMessageAutomations = async (messageData) => {
  try {
    const { phone_number, content, message_id } = messageData;

    // Get active automations for message_received trigger
    const automations = await Automation.getActiveAutomationsByTrigger('message_received');

    const results = [];

    for (const automation of automations) {
      // Check if automation conditions match
      if (checkAutomationConditions(automation, messageData)) {
        // Execute automation actions
        const actionResults = await executeAutomationActions(automation, messageData);
        results.push({
          automation_id: automation.id,
          automation_name: automation.name,
          executed: true,
          actions: actionResults
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Process message automations error:', error);
    throw error;
  }
};

/**
 * Check if automation conditions match message data
 * @param {Object} automation - Automation object
 * @param {Object} messageData - Message data
 * @returns {boolean} True if conditions match
 */
const checkAutomationConditions = (automation, messageData) => {
  const conditions = automation.trigger_conditions || {};

  // Check keyword conditions
  if (conditions.keywords && Array.isArray(conditions.keywords)) {
    const messageContent = (messageData.content || '').toLowerCase();
    const hasKeyword = conditions.keywords.some(keyword => 
      messageContent.includes(keyword.toLowerCase())
    );
    if (!hasKeyword) {
      return false;
    }
  }

  // Check phone number conditions
  if (conditions.phone_numbers && Array.isArray(conditions.phone_numbers)) {
    if (!conditions.phone_numbers.includes(messageData.phone_number)) {
      return false;
    }
  }

  // Check time-based conditions
  if (conditions.time_range) {
    const now = new Date();
    const hour = now.getHours();
    if (conditions.time_range.start && hour < conditions.time_range.start) {
      return false;
    }
    if (conditions.time_range.end && hour > conditions.time_range.end) {
      return false;
    }
  }

  return true;
};

/**
 * Execute automation actions
 * @param {Object} automation - Automation object
 * @param {Object} messageData - Message data
 * @returns {Promise<Array>} Array of action results
 */
const executeAutomationActions = async (automation, messageData) => {
  const actions = automation.actions || [];
  const results = [];

  for (const action of actions) {
    try {
      let result = null;

      switch (action.type) {
        case 'assign_to_user':
          // Assign conversation to a user
          result = await assignConversationToUser(messageData.phone_number, action.user_id);
          break;

        case 'send_message':
          // Send automatic reply
          result = await sendAutomatedMessage(messageData.phone_number, action.message);
          break;

        case 'add_tag':
          // Add tag to contact (if tags system exists)
          // result = await addTagToContact(messageData.phone_number, action.tag);
          break;

        case 'update_custom_field':
          // Update contact custom field
          // result = await updateContactField(messageData.phone_number, action.field, action.value);
          break;

        default:
          console.warn(`Unknown action type: ${action.type}`);
      }

      results.push({
        type: action.type,
        success: result !== null,
        result
      });
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      results.push({
        type: action.type,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Assign conversation to user
 * @param {string} phoneNumber - Phone number
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Assignment result
 */
const assignConversationToUser = async (phoneNumber, userId) => {
  try {
    // Find or create conversation
    let conversation = await Conversation.findByPhoneNumber(phoneNumber);
    
    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.createConversation({
        phone_number: phoneNumber,
        assigned_to: userId,
        status: 'open'
      });
    } else {
      // Update assignment
      await Conversation.updateConversation(conversation.id, {
        assigned_to: userId
      });
    }

    return {
      conversation_id: conversation.id,
      assigned_to: userId
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Send automated message
 * @param {string} phoneNumber - Phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} Message result
 */
const sendAutomatedMessage = async (phoneNumber, message) => {
  try {
    // Send message via WhatsApp service
    const result = await whatsappService.sendTextMessage(phoneNumber, message);
    
    return {
      phone_number: phoneNumber,
      message_sent: true,
      message_id: result.message_id
    };
  } catch (error) {
    console.error('Error sending automated message:', error);
    throw error;
  }
};

module.exports = {
  processMessageAutomations,
  checkAutomationConditions,
  executeAutomationActions
};

