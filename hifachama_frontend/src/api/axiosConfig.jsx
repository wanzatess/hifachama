import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hifachama-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  } else {
    console.warn('No auth token found for request to:', config.url);
  }
  return config}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // Redirect to login with redirect back to current page
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  }
);

export default api;