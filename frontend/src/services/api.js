import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mini-anveshana-2025-26.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Sensor Data APIs
export const getSensorData = (params) => 
  api.get('/sensor-data/history', { params });

export const getLatestData = () => 
  api.get('/sensor-data/latest');

export const getDeviceData = (deviceId) => 
  api.get(`/sensor-data/device/${deviceId}`);

export const getStatistics = (params) => 
  api.get('/sensor-data/stats', { params });

// Alert APIs
export const getAlerts = (params) => 
  api.get('/alerts', { params });

export const getActiveAlerts = () => 
  api.get('/alerts/active');

export const acknowledgeAlert = (alertId) => 
  api.put(`/alerts/${alertId}/acknowledge`);

export const getAlertConfig = () => 
  api.get('/alerts/config');

export const updateAlertConfig = (config) => 
  api.post('/alerts/config', config);

// Auth APIs
export const login = (credentials) => 
  api.post('/auth/login', credentials);

export const register = (userData) => 
  api.post('/auth/register', userData);

export const logout = () => 
  api.post('/auth/logout');

export default api;
