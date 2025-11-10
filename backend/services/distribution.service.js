/**
 * Distribution Service
 * Handles intelligent conversation distribution to employees
 */

const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const { query } = require('../config/database');
const notificationService = require('./notification.service');

/**
 * Distribution Service Class
 * Handles conversation assignment using different algorithms
 */
class DistributionService {
  /**
   * Round Robin Distribution
   * Distributes conversations evenly among available employees
   * 
   * @param {string} conversationId - Conversation ID to assign
   * @returns {Promise<Object>} Assignment result
   */
  async roundRobin(conversationId) {
    try {
      // Get all active employees
      const employeesResult = await User.getAllUsers({
        role: 'employee',
        is_active: true,
        limit: 1000,
        offset: 0
      });

      const employees = employeesResult.users;
      
      if (employees.length === 0) {
        console.warn('⚠️ No active employees available for round robin assignment. Conversation will remain unassigned.');
        return {
          success: false,
          reason: 'no_active_employees',
          message: 'No active employees available for assignment'
        };
      }

      // Get current assignments count for each employee
      const assignmentsCount = await Promise.all(
        employees.map(async (employee) => {
          const result = await query(
            `SELECT COUNT(*) as count 
             FROM conversations 
             WHERE assigned_to = $1 
             AND status IN ('open', 'assigned', 'pending') 
             AND deleted_at IS NULL`,
            [employee.id]
          );
          return {
            employee_id: employee.id,
            count: parseInt(result.rows[0].count, 10)
          };
        })
      );

      // Sort employees by assignment count (ascending)
      assignmentsCount.sort((a, b) => a.count - b.count);

      // Get employee with least assignments
      const assignedEmployeeId = assignmentsCount[0].employee_id;

      // Assign conversation
      const conversation = await Conversation.updateConversation(conversationId, {
        assigned_to: assignedEmployeeId,
        status: 'assigned',
        assigned_at: new Date()
      });

      // Send notification to assigned user
      try {
        await notificationService.notifyAssignment(conversationId, assignedEmployeeId, null);
      } catch (error) {
        console.error('Error sending assignment notification:', error);
        // Don't fail assignment if notification fails
      }

      return {
        success: true,
        conversation: conversation,
        assigned_to: assignedEmployeeId,
        method: 'round_robin'
      };
    } catch (error) {
      console.error('Round Robin distribution error:', error.message);
      return {
        success: false,
        reason: 'assignment_failed',
        message: error.message
      };
    }
  }

  /**
   * Load Balancing Distribution
   * Distributes conversations based on employee workload and availability
   * 
   * @param {string} conversationId - Conversation ID to assign
   * @returns {Promise<Object>} Assignment result
   */
  async loadBalancing(conversationId) {
    try {
      // Get all active employees
      const employeesResult = await User.getAllUsers({
        role: 'employee',
        is_active: true,
        limit: 1000,
        offset: 0
      });

      const employees = employeesResult.users;
      
      if (employees.length === 0) {
        console.warn('⚠️ No active employees available for load balancing assignment. Conversation will remain unassigned.');
        return {
          success: false,
          reason: 'no_active_employees',
          message: 'No active employees available for assignment'
        };
      }

      // Get workload for each employee (active conversations + unread messages)
      const workload = await Promise.all(
        employees.map(async (employee) => {
          // Get active conversations count
          const conversationsResult = await query(
            `SELECT COUNT(*) as count 
             FROM conversations 
             WHERE assigned_to = $1 
             AND status IN ('open', 'assigned', 'pending') 
             AND deleted_at IS NULL`,
            [employee.id]
          );

          // Get unread messages count
          const unreadResult = await query(
            `SELECT SUM(unread_count) as total 
             FROM conversations 
             WHERE assigned_to = $1 
             AND status IN ('open', 'assigned', 'pending') 
             AND deleted_at IS NULL`,
            [employee.id]
          );

          const activeConversations = parseInt(conversationsResult.rows[0].count, 10);
          const unreadMessages = parseInt(unreadResult.rows[0].total || 0, 10);

          // Calculate workload score (conversations * 2 + unread messages)
          const workloadScore = (activeConversations * 2) + unreadMessages;

          return {
            employee_id: employee.id,
            active_conversations: activeConversations,
            unread_messages: unreadMessages,
            workload_score: workloadScore
          };
        })
      );

      // Sort by workload score (ascending - least loaded first)
      workload.sort((a, b) => a.workload_score - b.workload_score);

      // Get employee with least workload
      const assignedEmployeeId = workload[0].employee_id;

      // Assign conversation
      const conversation = await Conversation.updateConversation(conversationId, {
        assigned_to: assignedEmployeeId,
        status: 'assigned',
        assigned_at: new Date()
      });

      // Send notification to assigned user
      try {
        await notificationService.notifyAssignment(conversationId, assignedEmployeeId, null);
      } catch (error) {
        console.error('Error sending assignment notification:', error);
        // Don't fail assignment if notification fails
      }

      return {
        success: true,
        conversation: conversation,
        assigned_to: assignedEmployeeId,
        method: 'load_balancing',
        workload_info: workload[0]
      };
    } catch (error) {
      console.error('Load Balancing distribution error:', error.message);
      return {
        success: false,
        reason: 'assignment_failed',
        message: error.message
      };
    }
  }

  /**
   * Priority-based Distribution
   * Distributes conversations based on priority and employee availability
   * 
   * @param {string} conversationId - Conversation ID to assign
   * @param {number} priority - Conversation priority (0-10)
   * @returns {Promise<Object>} Assignment result
   */
  async priorityBased(conversationId, priority = 0) {
    try {
      // For high priority conversations, use load balancing
      // For normal priority, use round robin
      let result;
      if (priority >= 7) {
        result = await this.loadBalancing(conversationId);
      } else {
        result = await this.roundRobin(conversationId);
      }
      
      // If assignment failed, return the result
      if (!result.success) {
        return result;
      }
      
      return result;
    } catch (error) {
      // Only log error, don't throw
      console.error('Priority-based distribution error:', error.message);
      return {
        success: false,
        reason: 'assignment_failed',
        message: error.message
      };
    }
  }

  /**
   * Auto-assign conversation
   * Automatically assigns a conversation using the configured distribution method
   * 
   * @param {string} conversationId - Conversation ID to assign
   * @param {string} method - Distribution method ('round_robin', 'load_balancing', 'priority')
   * @param {Object} options - Additional options (priority, etc.)
   * @returns {Promise<Object>} Assignment result
   */
  async autoAssign(conversationId, method = 'round_robin', options = {}) {
    try {
      let result;
      switch (method) {
        case 'round_robin':
          result = await this.roundRobin(conversationId);
          break;
        case 'load_balancing':
          result = await this.loadBalancing(conversationId);
          break;
        case 'priority':
          result = await this.priorityBased(conversationId, options.priority || 0);
          break;
        default:
          throw new Error(`Unknown distribution method: ${method}`);
      }
      
      // If assignment failed (e.g., no employees), return the result without throwing
      if (!result.success) {
        return result;
      }
      
      return result;
    } catch (error) {
      // Only log error, don't throw - allow conversation to remain unassigned
      console.error('Auto-assign error:', error.message);
      return {
        success: false,
        reason: 'assignment_failed',
        message: error.message
      };
    }
  }

  /**
   * Get employee workload
   * Get workload information for a specific employee
   * 
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Workload information
   */
  async getEmployeeWorkload(employeeId) {
    try {
      // Get active conversations count
      const conversationsResult = await query(
        `SELECT COUNT(*) as count 
         FROM conversations 
         WHERE assigned_to = $1 
         AND status IN ('open', 'assigned', 'pending') 
         AND deleted_at IS NULL`,
        [employeeId]
      );

      // Get unread messages count
      const unreadResult = await query(
        `SELECT SUM(unread_count) as total 
         FROM conversations 
         WHERE assigned_to = $1 
         AND status IN ('open', 'assigned', 'pending') 
         AND deleted_at IS NULL`,
        [employeeId]
      );

      // Get pending conversations (not responded to)
      const pendingResult = await query(
        `SELECT COUNT(*) as count 
         FROM conversations 
         WHERE assigned_to = $1 
         AND status = 'pending' 
         AND deleted_at IS NULL`,
        [employeeId]
      );

      const activeConversations = parseInt(conversationsResult.rows[0].count, 10);
      const unreadMessages = parseInt(unreadResult.rows[0].total || 0, 10);
      const pendingConversations = parseInt(pendingResult.rows[0].count, 10);

      return {
        employee_id: employeeId,
        active_conversations: activeConversations,
        unread_messages: unreadMessages,
        pending_conversations: pendingConversations,
        workload_score: (activeConversations * 2) + unreadMessages
      };
    } catch (error) {
      console.error('Get employee workload error:', error);
      throw error;
    }
  }

  /**
   * Get all employees workload
   * Get workload information for all employees
   * 
   * @returns {Promise<Array>} Array of workload information
   */
  async getAllEmployeesWorkload() {
    try {
      // Get all active employees
      const employeesResult = await User.getAllUsers({
        role: 'employee',
        is_active: true,
        limit: 1000,
        offset: 0
      });

      const employees = employeesResult.users;

      // Get workload for each employee
      const workload = await Promise.all(
        employees.map(employee => this.getEmployeeWorkload(employee.id))
      );

      return workload;
    } catch (error) {
      console.error('Get all employees workload error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const distributionService = new DistributionService();

module.exports = distributionService;

