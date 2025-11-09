import api from './api';

export const statisticsService = {
  // Get dashboard statistics
  getDashboard: async (params = {}) => {
    const response = await api.get('/statistics/dashboard', { params });
    return response.data;
  },

  // Get conversations statistics
  getConversations: async (params = {}) => {
    const response = await api.get('/statistics/conversations', { params });
    return response.data;
  },

  // Get employee performance
  getEmployeePerformance: async (params = {}) => {
    const response = await api.get('/statistics/employee-performance', { params });
    return response.data;
  },
};

