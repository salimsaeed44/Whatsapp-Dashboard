import api from './api';

export const templatesService = {
  // Get all templates
  getAll: async (params = {}) => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  // Get template by ID
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Create template and submit to Meta
  create: async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response.data;
  },

  // Update template
  update: async (id, templateData) => {
    const response = await api.patch(`/templates/${id}`, templateData);
    return response.data;
  },

  // Delete template
  delete: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  // Sync templates from Meta
  syncFromMeta: async (params = {}) => {
    const response = await api.get('/templates/sync/meta', { params });
    return response.data;
  },

  // Delete template from Meta
  deleteFromMeta: async (id) => {
    const response = await api.delete(`/templates/${id}/meta`);
    return response.data;
  },
};

