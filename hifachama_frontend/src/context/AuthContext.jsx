import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getAuthToken, setAuthTokens, clearAuthTokens } from '../utils/auth';
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

  const initializeAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: user } = await api.get('/api/users/me/');
      setAuthState({
        user,
        loading: false,
        error: null
      });
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      clearAuthTokens();
      setAuthState({
        user: null,
        loading: false,
        error: error.response?.data?.detail || 'Session expired'
      });
      if (!location.pathname.startsWith('/login')) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }
    initializeAuth();
  }, [initializeAuth, location.pathname]);

  const login = async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await api.post('/api/login/', { email, password });

      setAuthTokens({
        access: data.access,
        refresh: data.refresh
      });

      const user = data.user;
      const chama = data.chama || null;
      
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("chama", JSON.stringify(chama));
      setAuthState({
        user,
        loading: false,
        error: null
      });
      
      // 🧭 Redirect logic
      let redirectPath;
      if (chama?.id) {
        redirectPath = `/dashboard/${chama.type}/${chama.id}`;
      } else if (user.role.toLowerCase() === 'chairperson') {
        redirectPath = '/dashboard/create-chama';
      } else {
        redirectPath = '/dashboard/join-chama';
      }
      
      console.log('Navigating to:', redirectPath);
      navigate(redirectPath);

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.message || 'Login failed';

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      clearAuthTokens();
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = useCallback(() => {
    clearAuthTokens();
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
    navigate('/login', { replace: true });
    toast.info('You have been logged out');
  }, [navigate]);

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
          <p className="loading-text">Loading as we wait for redirect...</p>
        </div>
      ) : (
        children
      )}
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