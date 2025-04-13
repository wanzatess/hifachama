import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state - runs once on mount
// Replace initializeAuth function in AuthContext.jsx
const initializeAuth = useCallback(async () => {
  const token = getAuthToken();
  if (!token) {
    setAuthState(prev => ({ ...prev, loading: false }));
    return;
  }

  try {
    const response = await api.get('/api/verify-token/');
    if (response.data.valid) {
      setAuthState({
        user: response.data.user,
        loading: false,
        error: null
      });
    } else {
      clearAuthToken();
      setAuthState({ user: null, loading: false, error: null });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    clearAuthToken();
    setAuthState({ user: null, loading: false, error: 'Session expired' });
  }
}, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
  
    try {
      const response = await api.post('/api/login/', { email, password });
      const { token, chama, redirectTo, ...userData } = response.data;
  
      const user = {
        ...userData,
        token,
        chamaId: chama?.id || null
      };
  
      setAuthToken(token);
      setAuthState({ 
        user, 
        loading: false, 
        error: null 
      });
  
      navigate(redirectTo || '/', { replace: true });
  
      return { success: true };
  
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                           error.message || 
                           'Login failed';
  
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };


  const logout = useCallback(() => {
    clearAuthToken();
    setAuthState({ user: null, loading: false, error: null });
    navigate('/login', { replace: true });
    toast.info('You have been logged out');
  }, [navigate]);

  // Debugging - log auth state changes
  useEffect(() => {
    console.log('Auth state changed:', authState);
  }, [authState]);

  const value = {
    ...authState,
    login,
    logout,
    isAuthenticated: !!authState.user,
    updateUser: (updates) => setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }))
  };

  return (
    <AuthContext.Provider value={value}>
      {authState.loading ? <div className="loading-spinner" /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};