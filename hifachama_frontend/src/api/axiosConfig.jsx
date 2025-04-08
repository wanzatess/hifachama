import axios from 'axios';
import { getAuthToken } from '../utils/auth'; // Correct path

// In axiosConfig.jsx
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hifachama-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = getAuthToken(); // Using the helper
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
