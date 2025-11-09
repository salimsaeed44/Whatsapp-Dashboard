/**
 * Authentication Middleware
 * JWT token verification middleware for protected routes
 */

const jwt = require('jsonwebtoken');

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
    // TODO: Implement JWT token verification
    // 1. Extract token from Authorization header
    //    Format: "Bearer <token>"
    // 2. Verify token using JWT_SECRET from environment variables
    // 3. Attach decoded user data to req.user
    // 4. Call next() if token is valid
    // 5. Return 401 Unauthorized if token is invalid or missing

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided or invalid token format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // TODO: Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded; // Attach user data to request
    // next();

    // Placeholder: For now, just check if token exists
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Placeholder response
    // TODO: Remove this when implementing actual JWT verification
    req.user = {
      id: 'placeholder-user-id',
      email: 'placeholder@example.com',
      role: 'user'
    };

    next();
  } catch (error) {
    // TODO: Handle different JWT errors (expired, invalid, etc.)
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
    // TODO: Implement optional authentication
    // 1. Try to extract and verify token
    // 2. If token exists and is valid, attach user to req.user
    // 3. If token is missing or invalid, continue without user (req.user = null)
    // 4. Always call next()

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // TODO: Verify token
    // if (token) {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   req.user = decoded;
    // } else {
    //   req.user = null;
    // }

    // Placeholder
    req.user = null;

    next();
  } catch (error) {
    // If token verification fails, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
