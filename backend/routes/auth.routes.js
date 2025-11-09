/**
 * Authentication Routes
 * Handles user authentication endpoints (login, register, logout, etc.)
 */

const express = require('express');
const router = express.Router();

// TODO: Import auth controller and middleware
const authController = require('../controllers/auth.controller');
const { authenticate, optionalAuthenticate } = require('../middleware');

// Public routes (no authentication required)

/**
 * POST /api/auth/register
 * Register a new user
 * Public endpoint
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user and get JWT tokens
 * Public endpoint
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 * Public endpoint (but requires valid refresh token)
 */
router.post('/refresh-token', authController.refreshToken);

// Protected routes (authentication required)

/**
 * POST /api/auth/logout
 * Logout user (invalidate tokens)
 * Requires authentication
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires authentication
 */
router.get('/me', authenticate, (req, res) => {
  // TODO: Implement get current user
  // This should return the authenticated user's profile
  // req.user is available from authenticate middleware
  res.status(501).json({
    message: 'Get current user endpoint - Not implemented yet',
    user: req.user // Placeholder: returns user from token
  });
});

/**
 * POST /api/auth/verify-token
 * Verify if current token is valid
 * Optional authentication (works with or without token)
 */
router.post('/verify-token', optionalAuthenticate, (req, res) => {
  // TODO: Implement token verification
  if (req.user) {
    res.json({
      valid: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      valid: false,
      message: 'No valid token provided'
    });
  }
});

module.exports = router;

