import api from '../api/axiosConfig';

// Unified token management
export const TOKEN_KEY = 'accessToken'; // Standardizing to 'accessToken'
export const REFRESH_KEY = 'refreshToken';

export const isLoggedIn = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_KEY);
};

export const setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
};

export const clearAuthTokens = () => {
  [TOKEN_KEY, REFRESH_KEY, 'authToken'].forEach(key => {
    localStorage.removeItem(key);
  });
};

export const verifyToken = async () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Use your existing api instance that includes interceptors
    const response = await api.get('/auth/verify-token/');
    return response.data.valid;
  } catch (error) {
    if (error.response?.status === 401) {
      clearAuthTokens();
    }
    return false;
  }
};

// Optional: Token auto-refresh utility
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await api.post('/auth/refresh/', {
      refresh: refreshToken
    });
    setAuthTokens({
      access: response.data.access,
      refresh: response.data.refresh || refreshToken // Fallback to existing refresh token
    });
    return true;
  } catch (error) {
    clearAuthTokens();
    return false;
  }
};