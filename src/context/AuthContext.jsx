import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

// Create AuthContext
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages the global authentication state and token persistence.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore user session on mount if token is found
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          setIsLoading(true);
          const responseData = await authService.getProfile();
          // Assuming backend returns successResponse with user in data field
          setUser(responseData.data);
          setToken(storedToken);
        } catch (error) {
          console.error('[AuthContext] Session restoration failed:', error);
          // Clean up state and local storage on auth failures
          localStorage.removeItem('crm-token');
          setUser(null);
          setToken(null);
          navigate('/login');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [navigate]);

  /**
   * Log in user using email and password.
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const responseData = await authService.login(email, password);
      const { token: receivedToken, user: userProfile } = responseData.data;
      
      localStorage.setItem('crm-token', receivedToken);
      setUser(userProfile);
      setToken(receivedToken);
      
      toast.success(responseData.message || 'Successfully logged in!', {
        icon: '🔑',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      
      navigate('/');
      return responseData.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMsg, {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Register a new user and log them in automatically.
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const responseData = await authService.register(name, email, password);
      const { token: receivedToken, user: userProfile } = responseData.data;

      localStorage.setItem('crm-token', receivedToken);
      setUser(userProfile);
      setToken(receivedToken);

      toast.success(responseData.message || 'Registration successful!', {
        icon: '🎉',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });

      navigate('/');
      return responseData.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMsg, {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Log out the current user, clear tokens, and redirect to login.
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully.', {
      icon: '👋',
      style: {
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-accent)',
      },
    });
    navigate('/login');
  }, [navigate]);

  // Context value bundle
  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }), [user, token, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Custom Hook
 * Safely consumes AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
