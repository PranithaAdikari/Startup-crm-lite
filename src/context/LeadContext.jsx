import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import leadService from '../services/leadService';
import { useAuth } from './AuthContext';

/**
 * LeadContext object to provide global leads data and management operations.
 */
export const LeadContext = createContext(null);

/**
 * LeadProvider component that manages and distributes lead state.
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  const { isAuthenticated } = useAuth();

  /**
   * Fetches leads from the backend database with optional filters.
   * 
   * @param {Object} params - Query filters (e.g. { status, search, page, limit })
   */
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.getLeads(params);
      // Backend paginatedResponse returns `{ success: true, data: Array, pagination: Object }`
      const mapped = (responseData.data || []).map(lead => ({
        ...lead,
        id: lead.id || lead._id,
      }));
      setLeads(mapped);
      setPagination(responseData.pagination || { total: 0, page: 1, limit: 20, pages: 0 });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch leads';
      toast.error(errorMsg, {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leads automatically on session start/change
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    } else {
      setLeads([]);
      setPagination({ total: 0, page: 1, limit: 20, pages: 0 });
    }
  }, [isAuthenticated, fetchLeads]);

  /**
   * Adds a new lead to the database.
   * 
   * @param {Object} newLeadData - Lead attributes from form.
   * @returns {Promise<Object>} The newly created lead object.
   */
  const addLead = useCallback(async (newLeadData) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.createLead(newLeadData);
      const rawLead = responseData.data;
      const newLead = { ...rawLead, id: rawLead.id || rawLead._id };
      setLeads((prev) => [newLead, ...prev]);
      
      toast.success(`Lead "${newLead.name}" registered successfully!`, {
        icon: '🎉',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      return newLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add lead';
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
  }, []);

  /**
   * Updates fields of an existing lead.
   * 
   * @param {string} id - Unique identifier (ObjectId) of the lead.
   * @param {Object} updatedFields - Fields to update.
   * @returns {Promise<Object>} The updated lead object.
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.updateLead(id, updatedFields);
      const rawLead = responseData.data;
      const updatedLead = { ...rawLead, id: rawLead.id || rawLead._id };
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id || lead._id === id ? updatedLead : lead))
      );
      
      toast.success(`Lead "${updatedLead.name}" updated successfully!`, {
        icon: '✓',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      return updatedLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update lead';
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
  }, []);

  /**
   * Updates status specifically using PATCH /api/leads/:id/status
   */
  const updateLeadStatus = useCallback(async (id, status) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.updateLeadStatus(id, status);
      const rawLead = responseData.data;
      const updatedLead = { ...rawLead, id: rawLead.id || rawLead._id };
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id || lead._id === id ? updatedLead : lead))
      );
      toast.success(`Lead status updated to "${status}"!`, {
        icon: '✓',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
      return updatedLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update status';
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
  }, []);

  /**
   * Deletes a lead from the database.
   * 
   * @param {string} id - Unique identifier (ObjectId) of the lead.
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await leadService.deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id && lead._id !== id));
      
      toast.success('Lead deleted successfully.', {
        icon: '🗑️',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete lead';
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
  }, []);

  /**
   * Resolves a lead object by its identifier.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id || lead._id === id);
  }, [leads]);

  // Context value bundle containing both state and action dispatchers
  const contextValue = useMemo(() => ({
    leads,
    isLoading,
    pagination,
    fetchLeads,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    getLeadById,
  }), [leads, isLoading, pagination, fetchLeads, addLead, updateLead, updateLeadStatus, deleteLead, getLeadById]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to consume LeadContext with safety checks.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
