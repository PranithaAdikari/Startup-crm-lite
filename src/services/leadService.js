import api from './api';

/**
 * Leads Service
 * Interacts with the backend lead endpoints.
 */
const leadService = {
  /**
   * Fetches paginated, sorted, and filtered leads.
   * 
   * @param {Object} params - Query filters (e.g. { status, search, page, limit }).
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  getLeads: async (params) => {
    const response = await api.get('/api/leads', { params });
    return response.data;
  },

  /**
   * Registers a new lead.
   * 
   * @param {Object} leadData - Lead fields (e.g. { name, company, email, phone, status, source, notes }).
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  createLead: async (leadData) => {
    const response = await api.post('/api/leads', leadData);
    return response.data;
  },

  /**
   * Modifies an existing lead.
   * 
   * @param {string} id - Lead identifier (Mongoose ObjectId).
   * @param {Object} leadData - Updated fields.
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  updateLead: async (id, leadData) => {
    const response = await api.put(`/api/leads/${id}`, leadData);
    return response.data;
  },

  /**
   * Modifies ONLY the status of a lead.
   * 
   * @param {string} id - Lead identifier.
   * @param {string} status - New status.
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  updateLeadStatus: async (id, status) => {
    const response = await api.patch(`/api/leads/${id}/status`, { status });
    return response.data;
  },

  /**
   * Removes a lead document.
   * 
   * @param {string} id - Lead identifier to delete.
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  deleteLead: async (id) => {
    const response = await api.delete(`/api/leads/${id}`);
    return response.data;
  },

  /**
   * Compiles total aggregate lead statistics.
   * 
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  getLeadStats: async () => {
    const response = await api.get('/api/leads/stats');
    return response.data;
  },

  /**
   * Fetches monthly metrics for the analytics dashboard charts.
   * 
   * @returns {Promise<Object>} The API response payload (unwrapped response.data).
   */
  getMonthlyStats: async () => {
    const response = await api.get('/api/leads/monthly-stats');
    return response.data;
  },
};

export default leadService;
