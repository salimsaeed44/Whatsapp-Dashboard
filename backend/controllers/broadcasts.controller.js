/**
 * Broadcasts Controller
 * Handles broadcast campaigns business logic
 */

const Broadcast = require('../models/broadcast.model');

/**
 * Get all broadcasts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBroadcasts = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      created_by,
      assigned_to,
      includeDeleted = false
    } = req.query;

    const currentUser = req.user;

    // Parse limit and offset
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

    // Filter by created_by if user is employee
    let createdByFilter = created_by;
    if (currentUser.role === 'employee') {
      createdByFilter = currentUser.id;
    }

    // Get broadcasts
    const result = await Broadcast.getAllBroadcasts({
      limit: limitInt,
      offset: offsetInt,
      status,
      created_by: createdByFilter,
      assigned_to,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
    });

    res.status(200).json({
      message: 'Broadcasts retrieved successfully',
      data: result.broadcasts,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.broadcasts.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all broadcasts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve broadcasts',
      message: error.message
    });
  }
};

/**
 * Get broadcast by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBroadcastById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate broadcast ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Broadcast ID is required'
      });
    }

    // Get broadcast
    const broadcast = await Broadcast.findBroadcastById(id);

    if (!broadcast) {
      return res.status(404).json({
        error: 'Broadcast not found',
        message: 'Broadcast with the specified ID does not exist'
      });
    }

    // Check permissions
    // Employees can only view their own broadcasts
    if (currentUser.role === 'employee' && broadcast.created_by !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this broadcast'
      });
    }

    res.status(200).json({
      message: 'Broadcast retrieved successfully',
      data: broadcast
    });
  } catch (error) {
    console.error('Get broadcast by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve broadcast',
      message: error.message
    });
  }
};

/**
 * Create broadcast
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBroadcast = async (req, res) => {
  try {
    const {
      name,
      content,
      template_id,
      status = 'draft',
      scheduled_at,
      filter_criteria = {},
      assigned_to,
      metadata = {}
    } = req.body;

    const currentUser = req.user;

    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and content are required'
      });
    }

    // Create broadcast
    const broadcast = await Broadcast.createBroadcast({
      name,
      content,
      template_id,
      status,
      scheduled_at,
      filter_criteria,
      assigned_to,
      created_by: currentUser?.id || null,
      metadata
    });

    res.status(201).json({
      message: 'Broadcast created successfully',
      data: broadcast
    });
  } catch (error) {
    console.error('Create broadcast error:', error);
    res.status(500).json({
      error: 'Failed to create broadcast',
      message: error.message
    });
  }
};

/**
 * Update broadcast
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    // Validate broadcast ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Broadcast ID is required'
      });
    }

    // Check if broadcast exists
    const existingBroadcast = await Broadcast.findBroadcastById(id);
    if (!existingBroadcast) {
      return res.status(404).json({
        error: 'Broadcast not found',
        message: 'Broadcast with the specified ID does not exist'
      });
    }

    // Check permissions
    // Employees can only update their own broadcasts
    if (currentUser.role === 'employee' && existingBroadcast.created_by !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own broadcasts'
      });
    }

    // Update broadcast
    const updatedBroadcast = await Broadcast.updateBroadcast(id, updateData);

    res.status(200).json({
      message: 'Broadcast updated successfully',
      data: updatedBroadcast
    });
  } catch (error) {
    console.error('Update broadcast error:', error);
    res.status(500).json({
      error: 'Failed to update broadcast',
      message: error.message
    });
  }
};

/**
 * Delete broadcast
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate broadcast ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Broadcast ID is required'
      });
    }

    // Check if broadcast exists
    const existingBroadcast = await Broadcast.findBroadcastById(id);
    if (!existingBroadcast) {
      return res.status(404).json({
        error: 'Broadcast not found',
        message: 'Broadcast with the specified ID does not exist'
      });
    }

    // Check permissions
    // Employees can only delete their own drafts
    // Admins and supervisors can delete any broadcast
    if (currentUser.role === 'employee') {
      if (existingBroadcast.created_by !== currentUser.id || existingBroadcast.status !== 'draft') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own draft broadcasts'
        });
      }
    }

    // Delete broadcast (soft delete)
    const deleted = await Broadcast.deleteBroadcast(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Broadcast not found',
        message: 'Broadcast could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Broadcast deleted successfully',
      note: 'Broadcast has been soft deleted'
    });
  } catch (error) {
    console.error('Delete broadcast error:', error);
    res.status(500).json({
      error: 'Failed to delete broadcast',
      message: error.message
    });
  }
};

module.exports = {
  getAllBroadcasts,
  getBroadcastById,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast
};

