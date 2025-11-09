/**
 * Role-Based Access Control (RBAC) Middleware
 * Authorization middleware for role-based access control
 */

/**
 * Middleware factory to check if user has required role(s)
 * Must be used after authenticate middleware
 * 
 * @param {string|Array<string>} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Convert single role to array for consistent checking
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user role is in allowed roles
      const userRole = req.user.role || 'user';
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization Error',
        message: error.message
      });
    }
  };
};

/**
 * Check if user is admin
 * Shortcut middleware for admin-only routes
 */
const isAdmin = authorize('admin');

/**
 * Check if user is admin or supervisor
 * Allows access for both admin and supervisor
 */
const isAdminOrSupervisor = authorize(['admin', 'supervisor']);

/**
 * Check if user is admin, supervisor, or employee
 * Allows access for admin, supervisor, and employee
 */
const isAdminOrSupervisorOrEmployee = authorize(['admin', 'supervisor', 'employee']);

/**
 * Check if user is admin or user (legacy support)
 * Allows access for both admin and regular users
 */
const isAdminOrUser = authorize(['admin', 'user', 'supervisor', 'employee']);

/**
 * Check if user owns the resource or is admin/supervisor
 * Useful for resources that users can only access if they own them
 * 
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware function
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Admin and supervisor can access everything
      if (req.user.role === 'admin' || req.user.role === 'supervisor') {
        return next();
      }

      // Get resource owner ID
      const resourceOwnerId = getResourceOwnerId ? getResourceOwnerId(req) : null;

      // User can access their own resources
      if (req.user.id === resourceOwnerId) {
        return next();
      }

      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization Error',
        message: error.message
      });
    }
  };
};

/**
 * Check if user can manage employees
 * Only admin and supervisor can manage employees
 */
const canManageEmployees = authorize(['admin', 'supervisor']);

/**
 * Check if user can view all conversations
 * Admin and supervisor can view all conversations
 * Employees can only view their assigned conversations
 */
const canViewAllConversations = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Admin and supervisor can view all conversations
    if (req.user.role === 'admin' || req.user.role === 'supervisor') {
      return next();
    }

    // Employees can only view their assigned conversations
    // This is handled in the controller, so we just allow access here
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authorization Error',
      message: error.message
    });
  }
};

module.exports = {
  authorize,
  isAdmin,
  isAdminOrSupervisor,
  isAdminOrSupervisorOrEmployee,
  isAdminOrUser,
  isOwnerOrAdmin,
  canManageEmployees,
  canViewAllConversations
};
