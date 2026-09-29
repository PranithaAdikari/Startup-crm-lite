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
    
    // 2. Network Errors (e.g., server offline, CORS rejection, or DNS resolution failure)
    if (!error.response || error.code === 'ERR_NETWORK') {
      const targetUrl = error.config?.baseURL || window.location.origin;
      const isLocalhost = targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1');

      console.error('[API Network Error Details]:', {
        message: error.message,
        code: error.code,
        targetUrl,
        config: error.config,
      });

      const message = isLocalhost
        ? 'Cannot connect to backend (port 5000). Run `npm run dev` to start both frontend & backend.'
        : 'Cannot connect to backend server. Please verify the backend service is deployed and running.';

      toast.error(message, {
        id: 'network-connection-error', // Static ID prevents toast spamming on multiple parallel calls
        duration: 5000,
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
