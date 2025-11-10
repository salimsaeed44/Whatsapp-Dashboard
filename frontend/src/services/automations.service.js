import api from './api';

export const automationsService = {
  // Get all automations
  getAll: async (params = {}) => {
    const response = await api.get('/automations', { params });
    return response.data;
  },

  // Get automation by ID
  getById: async (id) => {
    const response = await api.get(`/automations/${id}`);
    return response.data;
  },

  // Create automation
  create: async (automationData) => {
    const response = await api.post('/automations', automationData);
    return response.data;
  },

  // Update automation
  update: async (id, automationData) => {
    const response = await api.patch(`/automations/${id}`, automationData);
    return response.data;
  },

  // Delete automation
  delete: async (id) => {
    const response = await api.delete(`/automations/${id}`);
    return response.data;
  },
};

