// JWT Token Management Utilities
export const ACCESS_TOKEN_KEY = 'jwt_access';
export const REFRESH_TOKEN_KEY = 'jwt_refresh';

// Check if user is logged in (has valid access token)
export const isLoggedIn = () => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get current access token
export const getAuthToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get current refresh token
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Store both tokens
export const setAuthTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

// Clear all authentication tokens
export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Clean up any legacy tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
};

// Verify token validity with backend
export const verifyToken = async () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const response = await axios.get('/api/auth/verify/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.valid;
  } catch (error) {
    if (error.response?.status === 401) {
      clearAuthTokens();
    }
    return false;
  }
};

// Automated token refresh
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await axios.post('/api/auth/refresh/', {
      refresh: refreshToken
    });
    
    setAuthTokens({
      access: response.data.access,
      refresh: response.data.refresh || refreshToken
    });
    
    return true;
  } catch (error) {
    clearAuthTokens();
    return false;
  }
};