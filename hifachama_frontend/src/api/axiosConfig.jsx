import axios from 'axios';
import { getAuthToken, getRefreshToken, clearAuthTokens, setAuthTokens } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT token to every request
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - handles token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // Attempt to refresh tokens
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/refresh/`, 
            { refresh: refreshToken }
          );
          
          // Update stored tokens
          setAuthTokens({
            access: data.access,
            refresh: data.refresh || refreshToken // Fallback to existing refresh token
          });
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear tokens and redirect to login
        clearAuthTokens();
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return Promise.reject(refreshError);
      }
      
      // No refresh token available
      clearAuthTokens();
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    
    return Promise.reject(error);
  }
);

export default api;