import api from './api';

export const contactsService = {
  // Get all contacts
  getAll: async (params = {}) => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  // Get contact by ID
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Create contact
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Bulk create contacts
  bulkCreate: async (contacts) => {
    const response = await api.post('/contacts/bulk', { contacts });
    return response.data;
  },

  // Update contact
  update: async (id, contactData) => {
    const response = await api.patch(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Delete contact
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

