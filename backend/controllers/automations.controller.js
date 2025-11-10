/**
 * Automations Controller
 * Handles automations business logic
 */

const Automation = require('../models/automation.model');

/**
 * Get all automations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAutomations = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      trigger_type,
      is_active
    } = req.query;

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

    // Get automations
    const result = await Automation.getAllAutomations({
      limit: limitInt,
      offset: offsetInt,
      trigger_type,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined
    });

    res.status(200).json({
      message: 'Automations retrieved successfully',
      data: result.automations,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.automations.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all automations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve automations',
      message: error.message
    });
  }
};

/**
 * Get automation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAutomationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Automation ID is required'
      });
    }

    const automation = await Automation.findAutomationById(id);

    if (!automation) {
      return res.status(404).json({
        error: 'Automation not found',
        message: 'Automation with the specified ID does not exist'
      });
    }

    res.status(200).json({
      message: 'Automation retrieved successfully',
      data: automation
    });
  } catch (error) {
    console.error('Get automation by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve automation',
      message: error.message
    });
  }
};

/**
 * Create automation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAutomation = async (req, res) => {
  try {
    const {
      name,
      description,
      trigger_type,
      trigger_conditions = {},
      actions = [],
      is_active = true,
      priority = 0
    } = req.body;

    const currentUser = req.user;

    // Validate required fields
    if (!name || !trigger_type) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and trigger_type are required'
      });
    }

    // Validate actions
    if (!Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one action is required'
      });
    }

    // Create automation
    const automation = await Automation.createAutomation({
      name,
      description,
      trigger_type,
      trigger_conditions,
      actions,
      is_active,
      priority,
      created_by: currentUser?.id || null
    });

    res.status(201).json({
      message: 'Automation created successfully',
      data: automation
    });
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({
      error: 'Failed to create automation',
      message: error.message
    });
  }
};

/**
 * Update automation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Automation ID is required'
      });
    }

    // Check if automation exists
    const existingAutomation = await Automation.findAutomationById(id);
    if (!existingAutomation) {
      return res.status(404).json({
        error: 'Automation not found',
        message: 'Automation with the specified ID does not exist'
      });
    }

    // Update automation
    const updatedAutomation = await Automation.updateAutomation(id, updateData);

    res.status(200).json({
      message: 'Automation updated successfully',
      data: updatedAutomation
    });
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({
      error: 'Failed to update automation',
      message: error.message
    });
  }
};

/**
 * Delete automation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAutomation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Automation ID is required'
      });
    }

    const deleted = await Automation.deleteAutomation(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Automation not found',
        message: 'Automation could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Automation deleted successfully',
      note: 'Automation has been soft deleted'
    });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({
      error: 'Failed to delete automation',
      message: error.message
    });
  }
};

module.exports = {
  getAllAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation
};

