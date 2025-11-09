/**
 * Statistics Controller
 * Handles statistics and reports business logic
 */

const { query } = require('../config/database');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardStatistics = async (req, res) => {
  try {
    const currentUser = req.user;
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = '';
    const dateValues = [];
    if (startDate && endDate) {
      dateFilter = `AND created_at BETWEEN $1 AND $2`;
      dateValues.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = `AND created_at >= $1`;
      dateValues.push(startDate);
    } else if (endDate) {
      dateFilter = `AND created_at <= $1`;
      dateValues.push(endDate);
    }

    // Get total conversations
    const conversationsResult = await query(
      `SELECT COUNT(*) as total FROM conversations WHERE deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const totalConversations = parseInt(conversationsResult.rows[0].total, 10);

    // Get open conversations
    const openConversationsResult = await query(
      `SELECT COUNT(*) as total FROM conversations WHERE status IN ('open', 'assigned', 'pending') AND deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const openConversations = parseInt(openConversationsResult.rows[0].total, 10);

    // Get closed conversations
    const closedConversationsResult = await query(
      `SELECT COUNT(*) as total FROM conversations WHERE status = 'closed' AND deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const closedConversations = parseInt(closedConversationsResult.rows[0].total, 10);

    // Get total messages
    const messagesResult = await query(
      `SELECT COUNT(*) as total FROM messages WHERE deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const totalMessages = parseInt(messagesResult.rows[0].total, 10);

    // Get incoming messages
    const incomingMessagesResult = await query(
      `SELECT COUNT(*) as total FROM messages WHERE direction = 'incoming' AND deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const incomingMessages = parseInt(incomingMessagesResult.rows[0].total, 10);

    // Get outgoing messages
    const outgoingMessagesResult = await query(
      `SELECT COUNT(*) as total FROM messages WHERE direction = 'outgoing' AND deleted_at IS NULL ${dateFilter}`,
      dateValues
    );
    const outgoingMessages = parseInt(outgoingMessagesResult.rows[0].total, 10);

    // Get messages by status
    const messagesByStatusResult = await query(
      `SELECT status, COUNT(*) as count 
       FROM messages 
       WHERE deleted_at IS NULL ${dateFilter}
       GROUP BY status`,
      dateValues
    );
    const messagesByStatus = messagesByStatusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Filter by user if employee
    let userFilter = '';
    const userValues = [...dateValues];
    if (currentUser.role === 'employee') {
      userFilter = `AND assigned_to = $${userValues.length + 1}`;
      userValues.push(currentUser.id);
    }

    // Get user-specific statistics if employee
    let userStats = null;
    if (currentUser.role === 'employee') {
      const userConversationsResult = await query(
        `SELECT COUNT(*) as total FROM conversations WHERE assigned_to = $${userValues.length} AND deleted_at IS NULL ${dateFilter}`,
        userValues
      );
      const userConversations = parseInt(userConversationsResult.rows[0].total, 10);

      userStats = {
        assigned_conversations: userConversations
      };
    }

    res.status(200).json({
      message: 'Dashboard statistics retrieved successfully',
      data: {
        conversations: {
          total: totalConversations,
          open: openConversations,
          closed: closedConversations
        },
        messages: {
          total: totalMessages,
          incoming: incomingMessages,
          outgoing: outgoingMessages,
          by_status: messagesByStatus
        },
        user: userStats
      }
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard statistics',
      message: error.message
    });
  }
};

/**
 * Get conversations statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationsStatistics = async (req, res) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;
    const currentUser = req.user;

    // Build date filter based on period
    let dateFilter = '';
    const dateValues = [];
    
    if (period === 'day') {
      dateFilter = `AND created_at >= CURRENT_DATE`;
    } else if (period === 'week') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    } else if (period === 'year') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '365 days'`;
    } else if (startDate && endDate) {
      dateFilter = `AND created_at BETWEEN $1 AND $2`;
      dateValues.push(startDate, endDate);
    }

    // Filter by user if employee
    let userFilter = '';
    const userValues = [...dateValues];
    if (currentUser.role === 'employee') {
      userFilter = `AND assigned_to = $${userValues.length + 1}`;
      userValues.push(currentUser.id);
    }

    // Get conversations by status
    const conversationsByStatusResult = await query(
      `SELECT status, COUNT(*) as count 
       FROM conversations 
       WHERE deleted_at IS NULL ${dateFilter} ${userFilter}
       GROUP BY status`,
      userValues
    );
    const conversationsByStatus = conversationsByStatusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Get responded conversations count
    const respondedResult = await query(
      `SELECT COUNT(DISTINCT conversation_id) as total 
       FROM messages 
       WHERE direction = 'outgoing' 
       AND deleted_at IS NULL 
       AND conversation_id IS NOT NULL
       ${dateFilter.replace('created_at', 'created_at')}`,
      dateValues
    );
    const respondedConversations = parseInt(respondedResult.rows[0].total, 10);

    res.status(200).json({
      message: 'Conversations statistics retrieved successfully',
      data: {
        period: period,
        by_status: conversationsByStatus,
        responded: respondedConversations
      }
    });
  } catch (error) {
    console.error('Get conversations statistics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversations statistics',
      message: error.message
    });
  }
};

/**
 * Get employee performance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId, period = 'month', startDate, endDate } = req.query;
    const currentUser = req.user;

    // Check permissions
    if (currentUser.role === 'employee' && currentUser.id !== employeeId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own performance statistics'
      });
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'supervisor' && currentUser.role !== 'employee') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view employee performance statistics'
      });
    }

    const targetEmployeeId = employeeId || currentUser.id;

    // Build date filter
    let dateFilter = '';
    const dateValues = [targetEmployeeId];
    
    if (period === 'day') {
      dateFilter = `AND created_at >= CURRENT_DATE`;
    } else if (period === 'week') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'month') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    } else if (period === 'year') {
      dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '365 days'`;
    } else if (startDate && endDate) {
      dateFilter = `AND created_at BETWEEN $2 AND $3`;
      dateValues.push(startDate, endDate);
    }

    // Get assigned conversations count
    const assignedConversationsResult = await query(
      `SELECT COUNT(*) as total 
       FROM conversations 
       WHERE assigned_to = $1 
       AND deleted_at IS NULL 
       ${dateFilter}`,
      dateValues
    );
    const assignedConversations = parseInt(assignedConversationsResult.rows[0].total, 10);

    // Get closed conversations count
    const closedConversationsResult = await query(
      `SELECT COUNT(*) as total 
       FROM conversations 
       WHERE assigned_to = $1 
       AND status = 'closed' 
       AND deleted_at IS NULL 
       ${dateFilter}`,
      dateValues
    );
    const closedConversations = parseInt(closedConversationsResult.rows[0].total, 10);

    // Get messages sent by employee
    const messagesSentResult = await query(
      `SELECT COUNT(*) as total 
       FROM messages 
       WHERE user_id = $1 
       AND direction = 'outgoing' 
       AND deleted_at IS NULL 
       ${dateFilter}`,
      dateValues
    );
    const messagesSent = parseInt(messagesSentResult.rows[0].total, 10);

    // Get average response time (in hours)
    const responseTimeResult = await query(
      `SELECT AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) / 3600) as avg_hours
       FROM messages m1
       INNER JOIN messages m2 ON m1.conversation_id = m2.conversation_id
       WHERE m1.direction = 'incoming'
       AND m2.direction = 'outgoing'
       AND m2.user_id = $1
       AND m2.created_at > m1.created_at
       AND m1.deleted_at IS NULL
       AND m2.deleted_at IS NULL
       ${dateFilter.replace('created_at', 'm2.created_at')}`,
      dateValues
    );
    const avgResponseTime = responseTimeResult.rows[0].avg_hours ? parseFloat(responseTimeResult.rows[0].avg_hours) : 0;

    res.status(200).json({
      message: 'Employee performance statistics retrieved successfully',
      data: {
        employee_id: targetEmployeeId,
        period: period,
        assigned_conversations: assignedConversations,
        closed_conversations: closedConversations,
        messages_sent: messagesSent,
        average_response_time_hours: avgResponseTime,
        response_rate: assignedConversations > 0 ? ((closedConversations / assignedConversations) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json({
      error: 'Failed to retrieve employee performance statistics',
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStatistics,
  getConversationsStatistics,
  getEmployeePerformance
};

