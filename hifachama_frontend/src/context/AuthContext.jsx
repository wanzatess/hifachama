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
  const initializeAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Verify token and get user data in parallel
      const [isValid, userResponse] = await Promise.all([
        api.get('/api/verify-token/', {
          headers: { Authorization: `Token ${token}` }
        }).then(res => res.data.valid),
        api.get('/api/user/', {
          headers: { Authorization: `Token ${token}` }
        }).catch(() => null)
      ]);

      if (isValid) {
        setAuthState({
          user: userResponse?.data || { authenticated: true },
          loading: false,
          error: null
        });
      } else {
        clearAuthToken();
        setAuthState({ user: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Auth init error:', error);
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
      const { token, ...userData } = response.data;
  
      // Transform backend response to frontend format
      const user = {
        ...userData,
        token,
        chamaId: userData.chama_id || null // Handle potential undefined
      };
  
      setAuthToken(token);
      setAuthState({ 
        user, 
        loading: false, 
        error: null 
      });
  
      return { 
        success: true, 
        redirectTo: determineRedirectPath(user) 
      };
  
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                         error.message || 
                         'Login failed';
      
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const determineRedirectPath = (user) => {
    const from = location.state?.from?.pathname;
    
    // 1. Chairperson without chama goes to create chama
    if (user.role === 'chairperson' && !user.chamaId) {
      return '/dashboard/create-chama';
    }
    // 2. Members without chama go to join chama
    else if (!user.chamaId) {
      return '/dashboard/join-chama';
    }
    // 3. Users with chama go to their chama page
    else if (user.chamaId) {
      return `/chama/${user.chamaId}`;
    }
    // 4. Fallback to original path or dashboard
    return from || '/dashboard';
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