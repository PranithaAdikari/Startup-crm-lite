import axios from 'axios';
import toast from 'react-hot-toast';

// Create an Axios instance using the backend URL set in environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Request Interceptor: Inject the JWT authorization token dynamically on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Capture global API response states (e.g. session expiry, server disconnects)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Session Expiration / Unauthorized handlers
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('crm-token');
      
      // Prevent infinite redirect loops if we are already on the login or register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // 2. Network Errors (e.g., server offline, DNS resolution failure)
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.error('[API Network Error Details]:', {
        message: error.message,
        code: error.code,
        config: error.config,
        request: error.request
      });
      toast.error('Cannot connect to server. Check your connection.', {
        id: 'network-connection-error', // Static ID prevents toast spamming on multiple parallel calls
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
    }

    return Promise.reject(error);
  }
);

export default api;
