/**
 * Statistics Routes
 * Handles statistics and reports endpoints
 */

const express = require('express');
const router = express.Router();

const statisticsController = require('../controllers/statistics.controller');
const { authenticate } = require('../middleware');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/statistics/dashboard
 * Get dashboard statistics
 * Requires: Authentication
 */
router.get('/dashboard', statisticsController.getDashboardStatistics);

/**
 * GET /api/statistics/conversations
 * Get conversations statistics
 * Requires: Authentication
 */
router.get('/conversations', statisticsController.getConversationsStatistics);

/**
 * GET /api/statistics/employee-performance
 * Get employee performance statistics
 * Requires: Authentication
 */
router.get('/employee-performance', statisticsController.getEmployeePerformance);

module.exports = router;

