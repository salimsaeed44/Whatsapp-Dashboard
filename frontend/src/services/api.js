import axios from 'axios';
import { socketService } from './socket.service';

// API Base URL - Use environment variable or default to Render backend URL
// Production: https://whatsapp-dashboard-encw.onrender.com/api
// This is always production since we're deploying on Render
const API_URL = import.meta.env.VITE_API_URL || 'https://whatsapp-dashboard-encw.onrender.com/api';

console.log('🔗 API URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📦 Production:', import.meta.env.PROD);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout (reduced from 30s for faster error feedback)
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (no response from server)
    if (!error.response) {
      console.error('🚫 Network Error:', error.message);
      console.error('🔗 API URL:', API_URL);
      console.error('🌐 Error Code:', error.code);
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.message = 'Connection timeout. Please check your internet connection and try again.';
        error.userMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        error.message = `Cannot connect to server at ${API_URL}. Please check if the backend is running.`;
        error.userMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.code === 'ERR_CONNECTION_REFUSED') {
        error.message = `Connection refused. The backend server may be down. Please try again later.`;
        error.userMessage = 'Connection timeout. Please check your internet connection.';
      } else {
        error.message = `Network error: ${error.message}. Please check your connection.`;
        error.userMessage = 'Connection timeout. Please check your internet connection.';
      }
      
      return Promise.reject(error);
    }

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          socketService.refreshAuth();

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        socketService.disconnect();
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Log other errors for debugging
    if (error.response?.status >= 500) {
      console.error('❌ Server Error:', error.response.status, error.response.data);
    } else if (error.response?.status >= 400) {
      console.error('⚠️ Client Error:', error.response.status, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;

