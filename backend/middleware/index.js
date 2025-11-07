/**
 * Middleware Index
 * Central export file for all middleware
 */

const { authenticate, optionalAuthenticate } = require('./auth.middleware');
const { authorize, isAdmin, isAdminOrUser, isOwnerOrAdmin } = require('./role.middleware');

module.exports = {
  // Authentication middleware
  authenticate,
  optionalAuthenticate,
  
  // Authorization middleware
  authorize,
  isAdmin,
  isAdminOrUser,
  isOwnerOrAdmin
};
