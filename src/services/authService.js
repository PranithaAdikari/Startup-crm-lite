import api from './api';

/**
 * Authentication Service
 * Wraps user authentication and profile API calls.
 */
const authService = {
  /**
   * Registers a new user account.
   * 
   * @param {string} name - User's full name.
   * @param {string} email - User's email address.
   * @param {string} password - User's password (min 6 characters).
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  register: async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Authenticates user credentials.
   * 
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Session logout (Stateless JWT clear).
   * Removes client-side tokens and triggers cleanup.
   */
  logout: () => {
    localStorage.removeItem('crm-token');
    // Optional request to backend endpoint to match Express.js logout route
    api.post('/api/auth/logout').catch(() => {
      // Ignore failure as backend is stateless and token is already destroyed on frontend
    });
  },

  /**
   * Fetches the profile of the currently logged-in user.
   * 
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  /**
   * Updates profile fields of the currently logged-in user.
   * 
   * @param {Object} data - Update payloads (e.g. { name, currentPassword, newPassword }).
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },
};

export default authService;
