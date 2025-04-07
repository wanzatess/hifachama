import axios from 'axios';
import { getAuthToken } from '../utils/auth'; // Correct path

// In axiosConfig.jsx
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = getAuthToken(); // Using the helper
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
