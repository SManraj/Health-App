import axios from 'axios';
import { auth } from './firebase';

// Configure base API URL
// For development, use your local IP address or localhost
// For production, use your production API URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);

      if (error.response.status === 401) {
        // Handle unauthorized - maybe redirect to login
        console.log('Unauthorized - redirecting to login');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getGoals: () => api.get('/users/goals'),
  setGoals: (data) => api.post('/users/goals', data),
  updateGoals: (goalId, data) => api.put(`/users/goals/${goalId}`, data),
  deleteAccount: () => api.delete('/users/account'),
};

// Meal API
export const mealAPI = {
  getAllMeals: (params) => api.get('/meals', { params }),
  getMealById: (mealId) => api.get(`/meals/${mealId}`),
  createMeal: (data) => api.post('/meals', data),
  updateMeal: (mealId, data) => api.put(`/meals/${mealId}`, data),
  deleteMeal: (mealId) => api.delete(`/meals/${mealId}`),
  getMealsByDateRange: (startDate, endDate) =>
    api.get(`/meals/date-range/${startDate}/${endDate}`),
  getDailySummary: (date) => api.get(`/meals/summary/daily/${date}`),
  getWeeklySummary: (startDate) => api.get(`/meals/summary/weekly/${startDate}`),
};

// Health API
export const healthAPI = {
  syncHealthData: (data) => api.post('/health/sync', data),
  getHealthMetrics: (params) => api.get('/health/metrics', { params }),
  getMetricByType: (metricType, params) =>
    api.get(`/health/metrics/${metricType}`, { params }),
  getMetricsByDateRange: (metricType, startDate, endDate) =>
    api.get(`/health/metrics/${metricType}/${startDate}/${endDate}`),
  addHealthMetric: (data) => api.post('/health/metrics', data),
  updateHealthMetric: (metricId, data) => api.put(`/health/metrics/${metricId}`, data),
  deleteHealthMetric: (metricId) => api.delete(`/health/metrics/${metricId}`),
};

// Notification API
export const notificationAPI = {
  registerDevice: (data) => api.post('/notifications/register-device', data),
  unregisterDevice: (data) => api.delete('/notifications/unregister-device', { data }),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  sendTestNotification: () => api.post('/notifications/test'),
  getHistory: (params) => api.get('/notifications/history', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
};

export default api;
