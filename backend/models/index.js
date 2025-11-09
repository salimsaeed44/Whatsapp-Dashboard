/**
 * Models Index
 * Central export file for all models
 */

// Export all models
const User = require('./user.model');
const Message = require('./message.model');
const Conversation = require('./conversation.model');
const Template = require('./template.model');
const Broadcast = require('./broadcast.model');
const Notification = require('./notification.model');

module.exports = {
  User,
  Message,
  Conversation,
  Template,
  Broadcast,
  Notification
};





