/**
 * Conversations Controller
 * Handles conversations business logic
 */

const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const distributionService = require('../services/distribution.service');
const whatsappService = require('../services/whatsapp/whatsapp.service');
const notificationService = require('../services/notification.service');
const { emitConversationUpdated } = require('../services/socket.service');

/**
 * Get all conversations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllConversations = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      assigned_to,
      is_archived,
      phone_number,
      includeDeleted = false
    } = req.query;

    const currentUser = req.user; // From authenticate middleware

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

    // Filter by assigned_to if user is not admin
    // Employees and supervisors can only see their assigned conversations
    let assignedToFilter = assigned_to;
    if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      // Employees can only see their own conversations
      assignedToFilter = currentUser.id;
    }

    // Get conversations
    const result = await Conversation.getAllConversations({
      limit: limitInt,
      offset: offsetInt,
      status,
      assigned_to: assignedToFilter,
      is_archived: is_archived === 'true' || is_archived === true,
      phone_number,
      includeDeleted: includeDeleted === 'true' || includeDeleted === true
    });

    res.status(200).json({
      message: 'Conversations retrieved successfully',
      data: result.conversations,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.conversations.length < result.total
      }
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversations',
      message: error.message
    });
  }
};

/**
 * Get conversation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Get conversation
    const conversation = await Conversation.findConversationById(id);

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Check permissions
    // Employees can only view their assigned conversations
    // Supervisors and admins can view all conversations
    if (currentUser.role === 'employee' && conversation.assigned_to !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this conversation'
      });
    }

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation',
      message: error.message
    });
  }
};

/**
 * Get conversation by phone number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const currentUser = req.user;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Phone number is required'
      });
    }

    // Get or create conversation
    const conversation = await Conversation.getOrCreateConversation(phoneNumber);

    // Check permissions
    if (currentUser.role === 'employee' && conversation.assigned_to !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this conversation'
      });
    }

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation by phone number error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation',
      message: error.message
    });
  }
};

/**
 * Update conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findConversationById(id);
    if (!existingConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Check permissions
    // Only admins and supervisors can update conversations
    // Employees can only update their own assigned conversations (limited fields)
    if (currentUser.role === 'employee') {
      if (existingConversation.assigned_to !== currentUser.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to update this conversation'
        });
      }
      // Employees can only update limited fields (e.g., is_archived)
      const allowedFields = ['is_archived'];
      const updateKeys = Object.keys(updateData);
      const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
      if (invalidFields.length > 0) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You cannot update the following fields: ${invalidFields.join(', ')}`
        });
      }
    }

    // Update conversation
    const updatedConversation = await Conversation.updateConversation(id, updateData);
    emitConversationUpdated(updatedConversation);

    res.status(200).json({
      message: 'Conversation updated successfully',
      data: updatedConversation
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      error: 'Failed to update conversation',
      message: error.message
    });
  }
};

/**
 * Assign conversation to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Validate assigned_to
    if (!assigned_to) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'assigned_to is required'
      });
    }

    // Check permissions
    // Only admins and supervisors can assign conversations
    if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators and supervisors can assign conversations'
      });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findConversationById(id);
    if (!existingConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Update conversation assignment
    const updatedConversation = await Conversation.updateConversation(id, {
      assigned_to,
      status: 'assigned'
    });
    emitConversationUpdated(updatedConversation);

    // Send notification to assigned user
    try {
      await notificationService.notifyAssignment(id, assigned_to, currentUser.id);
    } catch (error) {
      console.error('Error sending assignment notification:', error);
      // Don't fail assignment if notification fails
    }

    res.status(200).json({
      message: 'Conversation assigned successfully',
      data: updatedConversation
    });
  } catch (error) {
    console.error('Assign conversation error:', error);
    res.status(500).json({
      error: 'Failed to assign conversation',
      message: error.message
    });
  }
};

/**
 * Close conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const closeConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findConversationById(id);
    if (!existingConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Check permissions
    // Employees can only close their own assigned conversations
    // Admins and supervisors can close any conversation
    if (currentUser.role === 'employee' && existingConversation.assigned_to !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to close this conversation'
      });
    }

    // Update conversation status
    const updatedConversation = await Conversation.updateConversation(id, {
      status: 'closed',
      closed_at: new Date()
    });
    emitConversationUpdated(updatedConversation);

    res.status(200).json({
      message: 'Conversation closed successfully',
      data: updatedConversation
    });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({
      error: 'Failed to close conversation',
      message: error.message
    });
  }
};

/**
 * Get conversation messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      limit = 50,
      offset = 0
    } = req.query;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Get conversation
    const conversation = await Conversation.findConversationById(id);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Check permissions
    if (currentUser.role === 'employee' && conversation.assigned_to !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this conversation'
      });
    }

    // Get messages for this conversation
    const result = await Message.getAllMessages({
      conversation_id: id,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    res.status(200).json({
      message: 'Conversation messages retrieved successfully',
      conversation: conversation,
      data: result.messages,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.messages.length < result.total
      }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation messages',
      message: error.message
    });
  }
};

/**
 * Delete conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Check permissions (admin only)
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete conversations'
      });
    }

    // Delete conversation (soft delete)
    const deleted = await Conversation.deleteConversation(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation could not be deleted'
      });
    }

    res.status(200).json({
      message: 'Conversation deleted successfully',
      note: 'Conversation has been soft deleted'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      error: 'Failed to delete conversation',
      message: error.message
    });
  }
};

/**
 * Auto-assign conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const autoAssignConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { method = 'round_robin', priority } = req.body;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Check permissions
    // Only admins and supervisors can auto-assign conversations
    if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators and supervisors can auto-assign conversations'
      });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findConversationById(id);
    if (!existingConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Auto-assign conversation
    const result = await distributionService.autoAssign(id, method, { priority });

    // Send notification to assigned user
    if (result.assigned_to) {
      try {
        await notificationService.notifyAssignment(id, result.assigned_to, currentUser.id);
      } catch (error) {
        console.error('Error sending assignment notification:', error);
        // Don't fail assignment if notification fails
      }
    }

    res.status(200).json({
      message: 'Conversation assigned successfully',
      data: result
    });
  } catch (error) {
    console.error('Auto-assign conversation error:', error);
    res.status(500).json({
      error: 'Failed to auto-assign conversation',
      message: error.message
    });
  }
};

/**
 * Transfer conversation to another user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const transferConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, notify_customer = false } = req.body;
    const currentUser = req.user;

    // Validate conversation ID
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Conversation ID is required'
      });
    }

    // Validate assigned_to
    if (!assigned_to) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'assigned_to is required'
      });
    }

    // Check permissions
    // Only admins and supervisors can transfer conversations
    // Employees can transfer their own conversations
    if (currentUser.role === 'employee') {
      const existingConversation = await Conversation.findConversationById(id);
      if (!existingConversation || existingConversation.assigned_to !== currentUser.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only transfer your own conversations'
        });
      }
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators and supervisors can transfer conversations'
      });
    }

    // Check if conversation exists
    const existingConversation = await Conversation.findConversationById(id);
    if (!existingConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'Conversation with the specified ID does not exist'
      });
    }

    // Get new assignee user
    const User = require('../models/user.model');
    const newAssignee = await User.findUserById(assigned_to);
    if (!newAssignee || !newAssignee.is_active) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Assigned user does not exist or is not active'
      });
    }

    // Update conversation assignment
    const updatedConversation = await Conversation.updateConversation(id, {
      assigned_to,
      status: 'assigned',
      assigned_at: new Date()
    });

    // Reset unread count for new assignee
    const conversationAfterReset = await Conversation.resetUnreadCount(id);
    emitConversationUpdated(conversationAfterReset);

    // Send notification for transfer
    try {
      await notificationService.notifyTransfer(
        id,
        assigned_to,
        existingConversation.assigned_to,
        currentUser.id
      );
    } catch (error) {
      console.error('Error sending transfer notification:', error);
      // Don't fail the transfer if notification fails
    }

    // Notify customer if requested
    if (notify_customer) {
      try {
        // Send notification message to customer
        const notificationMessage = `تم تحويل محادثتك إلى ${newAssignee.full_name || newAssignee.username || 'موظف جديد'}`;
        await whatsappService.sendTextMessage(existingConversation.phone_number, notificationMessage, {
          conversation_id: id,
          user_id: currentUser.id
        });
      } catch (error) {
        console.error('Error sending transfer notification to customer:', error);
        // Don't fail the transfer if notification fails
      }
    }

    res.status(200).json({
      message: 'Conversation transferred successfully',
      data: updatedConversation,
      transferred_from: existingConversation.assigned_to,
      transferred_to: assigned_to
    });
  } catch (error) {
    console.error('Transfer conversation error:', error);
    res.status(500).json({
      error: 'Failed to transfer conversation',
      message: error.message
    });
  }
};

/**
 * Get conversations that need response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationsNeedingResponse = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      maxWaitMinutes = 60
    } = req.query;

    const currentUser = req.user;

    // Parse limit and offset
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);
    const maxWaitMinutesInt = parseInt(maxWaitMinutes, 10);

    // Build query for conversations needing response
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Conversations that are assigned and have unread messages
    conditions.push(`status IN ('open', 'assigned', 'pending')`);
    conditions.push(`deleted_at IS NULL`);
    conditions.push(`unread_count > 0`);

    // Filter by assigned_to if user is employee
    if (currentUser.role === 'employee') {
      conditions.push(`assigned_to = $${paramIndex++}`);
      values.push(currentUser.id);
    } else if (currentUser.role === 'supervisor') {
      // Supervisors can see all conversations
    } else if (currentUser.role === 'admin') {
      // Admins can see all conversations
    }

    // Filter by wait time (conversations that haven't been responded to for X minutes)
    if (maxWaitMinutesInt > 0) {
      conditions.push(`last_message_at < NOW() - INTERVAL '${maxWaitMinutesInt} minutes'`);
    } else {
      // If no maxWaitMinutes specified, show all conversations with unread messages
      conditions.push(`last_message_at IS NOT NULL`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const { query } = require('../config/database');
    const countResult = await query(
      `SELECT COUNT(*) as total FROM conversations ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get conversations
    values.push(limitInt, offsetInt);
    const result = await query(
      `SELECT * FROM conversations
       ${whereClause}
       ORDER BY 
         CASE WHEN last_message_at IS NULL THEN 0 ELSE 1 END,
         last_message_at ASC,
         unread_count DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    // Parse JSONB fields
    const conversations = result.rows.map(conv => {
      conv.metadata = typeof conv.metadata === 'string' ? JSON.parse(conv.metadata) : conv.metadata;
      return conv;
    });

    res.status(200).json({
      message: 'Conversations needing response retrieved successfully',
      data: conversations,
      pagination: {
        total,
        limit: limitInt,
        offset: offsetInt,
        hasMore: offsetInt + conversations.length < total
      }
    });
  } catch (error) {
    console.error('Get conversations needing response error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversations needing response',
      message: error.message
    });
  }
};

/**
 * Get employee workload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeeWorkload = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentUser = req.user;

    // Check permissions
    // Employees can only view their own workload
    // Admins and supervisors can view any employee's workload
    if (currentUser.role === 'employee' && currentUser.id !== employeeId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own workload'
      });
    }

    const workload = await distributionService.getEmployeeWorkload(employeeId);

    res.status(200).json({
      message: 'Employee workload retrieved successfully',
      data: workload
    });
  } catch (error) {
    console.error('Get employee workload error:', error);
    res.status(500).json({
      error: 'Failed to retrieve employee workload',
      message: error.message
    });
  }
};

/**
 * Get all employees workload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEmployeesWorkload = async (req, res) => {
  try {
    const currentUser = req.user;

    // Check permissions
    // Only admins and supervisors can view all employees workload
    if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators and supervisors can view all employees workload'
      });
    }

    const workload = await distributionService.getAllEmployeesWorkload();

    res.status(200).json({
      message: 'All employees workload retrieved successfully',
      data: workload
    });
  } catch (error) {
    console.error('Get all employees workload error:', error);
    res.status(500).json({
      error: 'Failed to retrieve employees workload',
      message: error.message
    });
  }
};

module.exports = {
  getAllConversations,
  getConversationById,
  getConversationByPhoneNumber,
  updateConversation,
  assignConversation,
  autoAssignConversation,
  transferConversation,
  closeConversation,
  getConversationMessages,
  getConversationsNeedingResponse,
  getEmployeeWorkload,
  getAllEmployeesWorkload,
  deleteConversation
};

