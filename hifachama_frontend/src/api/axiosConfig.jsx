import axios from 'axios';
import { getAuthToken, getRefreshToken, clearAuthTokens, setAuthTokens } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hifachama-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const { data } = await axios.post(`${originalRequest.baseURL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          setAuthTokens({
            access: data.access,
            refresh: data.refresh || refreshToken
          });
          
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      clearAuthTokens();
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    
    return Promise.reject(error);
  }
);

export default api;