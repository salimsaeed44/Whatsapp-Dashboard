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
      // TODO: Implement role-based authorization
      // 1. Check if user is authenticated (req.user should exist from authenticate middleware)
      // 2. Check if user has required role
      // 3. Call next() if authorized
      // 4. Return 403 Forbidden if not authorized

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Convert single role to array for consistent checking
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // TODO: Check if user role is in allowed roles
      // if (!roles.includes(req.user.role)) {
      //   return res.status(403).json({
      //     error: 'Forbidden',
      //     message: 'Insufficient permissions'
      //   });
      // }

      // Placeholder: Check user role
      const userRole = req.user.role || 'user';
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Required role(s): ${roles.join(', ')}`
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
 * Check if user is admin or user
 * Allows access for both admin and regular users
 */
const isAdminOrUser = authorize(['admin', 'user']);

/**
 * Check if user owns the resource or is admin
 * Useful for resources that users can only access if they own them
 * 
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware function
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      // TODO: Implement owner or admin check
      // 1. Check if user is authenticated
      // 2. Check if user is admin (if yes, allow access)
      // 3. Get resource owner ID using getResourceOwnerId function
      // 4. Compare resource owner ID with user ID
      // 5. Allow access if user owns resource, deny otherwise

      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // TODO: Get resource owner ID
      // const resourceOwnerId = getResourceOwnerId(req);
      // if (req.user.id === resourceOwnerId) {
      //   return next();
      // }

      // Placeholder
      const resourceOwnerId = getResourceOwnerId ? getResourceOwnerId(req) : null;

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

module.exports = {
  authorize,
  isAdmin,
  isAdminOrUser,
  isOwnerOrAdmin
};
