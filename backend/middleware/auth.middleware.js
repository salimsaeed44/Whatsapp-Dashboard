/**
 * Authentication Middleware
 * JWT token verification middleware for protected routes
 */

const { verifyToken } = require('../config/jwt.config');

/**
 * Verify JWT token from request headers
 * Extracts token from Authorization header (Bearer token)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided or invalid token format. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user data to request
      next();
    } catch (error) {
      // Handle JWT verification errors
      if (error.message === 'Token has expired') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired. Please login again.'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token. Please provide a valid token.'
        });
      } else {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token verification failed'
        });
      }
    }
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Token verification failed'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if token is missing
 * Useful for endpoints that work with or without authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // If token verification fails, continue without authentication
      req.user = null;
    }

    next();
  } catch (error) {
    // If any error occurs, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
