/**
 * ============================================================================
 * API Service Layer
 * ============================================================================
 * Centralized Axios client configured with JWT interceptors, base URL,
 * and typed methods for Authentication, Parties, Catalog, and Quotations.
 */

import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quotecraft_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking public routes
      if (!window.location.pathname.startsWith('/view-quote/')) {
        localStorage.removeItem('quotecraft_token');
        localStorage.removeItem('quotecraft_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  sendRegistrationOTP: (data) => api.post('/auth/send-registration-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const partyAPI = {
  getAll: () => api.get('/parties'),
  create: (data) => api.post('/parties', data),
  update: (id, data) => api.put(`/parties/${id}`, data),
  delete: (id) => api.delete(`/parties/${id}`)
};

export const catalogAPI = {
  getAll: () => api.get('/catalog'),
  create: (data) => api.post('/catalog', data),
  update: (id, data) => api.put(`/catalog/${id}`, data),
  delete: (id) => api.delete(`/catalog/${id}`)
};

export const quoteAPI = {
  getAll: (params) => api.get('/quotes', { params }),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  updateStatus: (id, data) => api.patch(`/quotes/${id}/status`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
  getPublic: (token) => api.get(`/quotes/public/${token}`),
  clientRespond: (token, data) => api.post(`/quotes/public/${token}/respond`, data)
};

export const paymentAPI = {
  getConfig: () => api.get('/payment/config'),
  verify: (data) => api.post('/payment/verify', data),
  consumeCredit: () => api.post('/payment/consume')
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getAllUsers: () => api.get('/admin/users'),
  addCredits: (data) => api.post('/admin/users/credits', data),
  addDays: (data) => api.post('/admin/users/days', data),
  toggleSuspend: (userId, data = {}) => api.put(`/admin/users/${userId}/suspend`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getTransactions: () => api.get('/admin/transactions')
};

export default api;
