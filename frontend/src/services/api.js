import axios from 'axios';

// API Base URL - Use environment variable or default to Render backend URL
// For local development: http://localhost:3000/api
// For production: https://whatsapp-dashboard-encw.onrender.com/api
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://whatsapp-dashboard-encw.onrender.com/api' 
    : 'http://localhost:3000/api');

console.log('🔗 API URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📦 Production:', import.meta.env.PROD);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
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
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        error.message = `Cannot connect to server. Please check if the backend is running at ${API_URL}`;
      } else {
        error.message = `Network error: ${error.message}. Please check your connection and backend URL.`;
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

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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

