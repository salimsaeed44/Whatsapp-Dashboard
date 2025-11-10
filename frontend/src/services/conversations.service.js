import api from './api';

export const conversationsService = {
  // Get all conversations
  getAll: async (params = {}) => {
    const response = await api.get('/conversations', { params });
    return response.data;
  },

  // Get conversation by ID
  getById: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  // Get conversation by phone number
  getByPhoneNumber: async (phoneNumber) => {
    const response = await api.get(`/conversations/phone/${phoneNumber}`);
    return response.data;
  },

  // Get conversations needing response
  getNeedingResponse: async (params = {}) => {
    const response = await api.get('/conversations/needing-response', { params });
    return response.data;
  },

  // Get conversation messages
  getMessages: async (id, params = {}) => {
    const response = await api.get(`/conversations/${id}/messages`, { params });
    return response.data;
  },

  // Update conversation
  update: async (id, data) => {
    const response = await api.patch(`/conversations/${id}`, data);
    return response.data;
  },

  // Assign conversation
  assign: async (id, assignedTo) => {
    const response = await api.post(`/conversations/${id}/assign`, { assigned_to: assignedTo });
    return response.data;
  },

  // Auto-assign conversation
  autoAssign: async (id, method = 'round_robin', priority = 0) => {
    const response = await api.post(`/conversations/${id}/auto-assign`, { method, priority });
    return response.data;
  },

  // Transfer conversation
  transfer: async (id, assignedTo, notifyCustomer = false) => {
    const response = await api.post(`/conversations/${id}/transfer`, {
      assigned_to: assignedTo,
      notify_customer: notifyCustomer,
    });
    return response.data;
  },

  // Close conversation
  close: async (id) => {
    const response = await api.post(`/conversations/${id}/close`);
    return response.data;
  },

  // Get employee workload
  getEmployeeWorkload: async (employeeId) => {
    const response = await api.get(`/conversations/workload/${employeeId}`);
    return response.data;
  },

  // Get all employees workload
  getAllEmployeesWorkload: async () => {
    const response = await api.get('/conversations/workload/employees');
    return response.data;
  },

  // Get my conversations (for employees)
  getMyConversations: async (params = {}) => {
    const response = await api.get('/conversations/my', { params });
    return response.data;
  },
};

