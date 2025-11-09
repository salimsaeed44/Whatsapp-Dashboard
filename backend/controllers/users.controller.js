/**
 * Users Controller
 * Handles user management business logic
 */

const User = require('../models/user.model');

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    // Extract query parameters
    const {
      limit = 50,
      offset = 0,
      role,
      is_active,
      includeDeleted = false
    } = req.query;

    // Parse limit and offset to integers
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

    // Validate limit and offset
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Limit must be a number between 1 and 100'
      });
    }

    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Offset must be a non-negative number'
      });
    }

    // Parse is_active to boolean if provided
    let isActiveBool = undefined;
    if (is_active !== undefined) {
      isActiveBool = is_active === 'true' || is_active === true;
    }

    // Get users from database
    const result = await User.getAllUsers({
      limit: limitInt,
      offset: offsetInt,
      role,
      is_active: isActiveBool,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
    });

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.users.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User ID is required'
      });
    }

    // Get user from database
    const user = await User.findUserById(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone_number: user.phone_number,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: error.message
    });
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user; // From authenticate middleware

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const existingUser = await User.findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    }

    // Check permissions
    // Users can only update their own profile (except role and is_active)
    // Admins can update any user
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = currentUser.id === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this user'
      });
    }

    // Non-admin users cannot update role or is_active
    if (!isAdmin && (updateData.role !== undefined || updateData.is_active !== undefined)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update role or active status'
      });
    }

    // Update user
    const updatedUser = await User.updateUser(id, updateData);

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        full_name: updatedUser.full_name,
        phone_number: updatedUser.phone_number,
        is_active: updatedUser.is_active,
        last_login: updatedUser.last_login,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle specific errors
    if (error.message === 'Email already exists' || error.message === 'Username already exists') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user; // From authenticate middleware

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User ID is required'
      });
    }

    // Check permissions (admin only)
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete users'
      });
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const existingUser = await User.findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    }

    // Delete user (soft delete)
    const deleted = await User.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User could not be deleted'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      note: 'User has been soft deleted (deactivated)'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user; // From authenticate middleware

    // If no ID provided, return current user's profile
    const userId = id || currentUser.id;

    // Check permissions
    // Users can only view their own profile
    // Admins can view any user's profile
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = currentUser.id === userId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this user profile'
      });
    }

    // Get user from database
    const user = await User.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone_number: user.phone_number,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile
};
