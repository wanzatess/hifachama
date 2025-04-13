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
  const resolveFrontendPath = (redirectTo, chama) => {
    if (!redirectTo) return '/'; // Fallback to home

    // Handle API-style redirects (e.g., "/api/chamas/26")
    if (redirectTo.startsWith('/api/chamas/')) {
      const chamaId = redirectTo.split('/')[3];

      // Map chama.type to frontend dashboard routes
      switch (chama?.type) {
        case 'hybrid':
          return `/dashboard/hybrid/${chamaId}`;
        case 'investment':
          return `/dashboard/investment/${chamaId}`;
        case 'merry_go_round':
          return `/dashboard/merry_go_round/${chamaId}`;
        default:
          return `/chamas/${chamaId}`; // Generic fallback
      }
    }

    return redirectTo; // Use as-is if not an API path
  };

  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
  
    try {
      const response = await api.post('/api/login/', { email, password });
      const { token, chama, redirectTo, role, ...userData } = response.data;
  
      const user = {
        ...userData,
        token,
        chamaId: chama?.id || null,
        role
      };
  
      setAuthToken(token);
      setAuthState({ 
        user, 
        loading: false, 
        error: null 
      });
  
      const frontendRedirectTo = resolveFrontendPath(redirectTo, chama);
      navigate(frontendRedirectTo, { replace: true });
  
      return { 
        success: true, 
        role, 
        chama,
        redirectTo 
      };
  
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