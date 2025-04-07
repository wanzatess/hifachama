// src/utils/auth.jsx
export const isLoggedIn = () => {
  return !!localStorage.getItem('authToken'); // Changed to match your token key
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const verifyToken = async () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const response = await api.get('/api/verify-token/');
    return response.data.valid;
  } catch (error) {
    clearAuthToken();
    return false;
  }
};
