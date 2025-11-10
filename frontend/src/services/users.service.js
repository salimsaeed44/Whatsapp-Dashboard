import api from './api';

export const usersService = {
  // Get all users
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  update: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get employees
  getEmployees: async () => {
    const response = await api.get('/users?role=employee');
    return response.data;
  },

  // Get supervisors
  getSupervisors: async () => {
    const response = await api.get('/users?role=supervisor');
    return response.data;
  },
};

