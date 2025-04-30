import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getAuthToken, getRefreshToken, setAuthTokens, clearAuthTokens } from '../utils/auth';
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

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Verify token and get user data
      const { data: user } = await api.get('/api/users/me/');
      setAuthState({
        user,
        loading: false,
        error: null
      });
      localStorage.setItem("user", JSON.stringify(user));

    } catch (error) {
      console.error('Authentication check failed:', error);
      clearAuthTokens();
      setAuthState({
        user: null,
        loading: false,
        error: error.response?.data?.detail || 'Session expired'
      });
      
      // Redirect to login if not already there
      if (!location.pathname.startsWith('/login')) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const resolveFrontendPath = (redirectTo, chama) => {
    if (!redirectTo) return '/';

    // Handle API-style redirects
    if (redirectTo.startsWith('/api/chamas/')) {
      const chamaId = redirectTo.split('/')[3];
      switch (chama?.type) {
        case 'hybrid': return `/dashboard/hybrid/${chamaId}`;
        case 'investment': return `/dashboard/investment/${chamaId}`;
        case 'merry_go_round': return `/dashboard/merry_go_round/${chamaId}`;
        default: return `/chamas/${chamaId}`;
      }
    }
    return redirectTo;
  };

  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
  
    try {
      const { data } = await api.post('/api/login/', { email, password });
      
      // Store JWT tokens
      setAuthTokens({
        access: data.access,
        refresh: data.refresh
      });

      const user = {
        ...data.user,
        chamaId: data.chama?.id || null
      };
      localStorage.setItem("user", JSON.stringify(user));

      setAuthState({ 
        user,
        loading: false,
        error: null
      });

      const frontendRedirectTo = resolveFrontendPath(data.redirectTo, data.chama);
      navigate(frontendRedirectTo, { replace: true });

      return { 
        success: true,
        user,
        redirectTo: frontendRedirectTo
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Login failed';
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = useCallback(() => {
    // Optional: Call backend logout endpoint if needed
    // await api.post('/api/auth/logout/');
    
    clearAuthTokens();
    setAuthState({ 
      user: null, 
      loading: false, 
      error: null 
    });
    
    navigate('/login', { replace: true });
    toast.info('You have been logged out');
  }, [navigate]);

  // Auto-logout on 401 errors (handled in axios interceptor)
  useEffect(() => {
    if (authState.error?.includes('Session expired')) {
      logout();
    }
  }, [authState.error, logout]);

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
      {authState.loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      ) : children}
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