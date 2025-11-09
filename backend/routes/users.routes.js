/**
 * Users Routes
 * Handles user management endpoints (CRUD operations, profile management)
 */

const express = require('express');
const router = express.Router();

// TODO: Import users controller and middleware
const usersController = require('../controllers/users.controller');
const { authenticate, authorize, isAdmin, isOwnerOrAdmin } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * Get all users (admin only)
 * Requires: Authentication + Admin role
 */
router.get('/', isAdmin, usersController.getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 * Requires: Authentication
 * Access: User can view own profile, admin can view any
 */
router.get('/:id', isOwnerOrAdmin((req) => req.params.id), usersController.getUserById);

/**
 * PUT /api/users/:id
 * Update user
 * Requires: Authentication
 * Access: User can update own profile, admin can update any
 */
router.put('/:id', isOwnerOrAdmin((req) => req.params.id), usersController.updateUser);

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 * Requires: Authentication + Admin role
 */
router.delete('/:id', isAdmin, usersController.deleteUser);

/**
 * GET /api/users/:id/profile
 * Get user profile
 * Requires: Authentication
 * Access: User can view own profile, admin can view any
 */
router.get('/:id/profile', isOwnerOrAdmin((req) => req.params.id), usersController.getUserProfile);

module.exports = router;

