import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://erion-assignment.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://erion-assignment.vercel.app',
    'Access-Control-Allow-Credentials': 'true'
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Don't redirect for auth check failures - this is normal when not logged in
      if (!error.config.url.includes('/auth/me')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Leads API
export const leadsAPI = {
  getLeads: (params = {}) => api.get('/leads', { params }),
  getLead: (id) => api.get(`/leads/${id}`),
  createLead: (leadData) => api.post('/leads', leadData),
  updateLead: (id, leadData) => api.put(`/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/leads/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
