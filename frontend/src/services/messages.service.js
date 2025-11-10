import api from './api';

export const messagesService = {
  // Get all messages
  getAll: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  // Get message by ID
  getById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  // Get conversation by phone number
  getConversation: async (phoneNumber, params = {}) => {
    const response = await api.get(`/messages/conversation/${phoneNumber}`, { params });
    return response.data;
  },

  // Send message
  send: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  // Update message status
  updateStatus: async (id, status, timestamp = null) => {
    const response = await api.patch(`/messages/${id}/status`, { status, timestamp });
    return response.data;
  },

  // Delete message
  delete: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  // Get messages by conversation ID
  getByConversation: async (conversationId, params = {}) => {
    const response = await api.get(`/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  // Retry failed messages
  retryFailed: async (options = {}) => {
    const response = await api.post('/messages/retry', options);
    return response.data;
  },
};

