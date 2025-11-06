/**
 * Models Index
 * Central export file for all models
 */

// Export all models
const User = require('./user.model');
const Message = require('./message.model');

module.exports = {
  User,
  Message
};

