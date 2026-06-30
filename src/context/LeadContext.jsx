import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SAMPLE_LEADS } from '../data/sampleLeads';
import { LEADS_STORAGE_KEY } from '../constants';

/**
 * TypeScript-style definition of the Lead object shape.
 * 
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier generated for the lead.
 * @property {string} name - Prospect's full name.
 * @property {string} company - Associated company name.
 * @property {string} email - Primary email address.
 * @property {string} phone - Contact phone number.
 * @property {'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'} status - Pipeline status of the lead.
 * @property {'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other'} source - Acquisition channel.
 * @property {string} createdAt - ISO 8601 date string representation of when the lead was created.
 * @property {string} [value] - Optional estimated budget or deal value (e.g. '$8,500').
 * @property {string} [dateAdded] - Legacy YYYY-MM-DD date field for compatibility with table views.
 */



/**
 * LeadContext object to provide global leads data and management operations.
 */
export const LeadContext = createContext(null);

/**
 * LeadProvider component that manages and distributes lead state.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be wrapped.
 * @returns {React.ReactElement} The Context Provider wrapping child nodes.
 */
export function LeadProvider({ children }) {
  /**
   * Persistent leads array backed by localStorage.
   * - On first load (empty storage): initialises with SAMPLE_LEADS.
   * - On subsequent loads: restores the last-saved array from storage.
   * - Falls back to SAMPLE_LEADS if localStorage is unavailable or corrupted.
   *
   * setLeads accepts both direct values and functional updaters, identical
   * to React's own useState setter.
   */
  const [leads, setLeads] = useLocalStorage(LEADS_STORAGE_KEY, SAMPLE_LEADS);

  /**
   * Adds a new lead to the CRM workspace.
   * Generates a unique ID and appends creation date metadata automatically.
   *
   * @param {Omit<Lead, 'id' | 'createdAt' | 'dateAdded'>} newLeadData - Lead attributes collected from form.
   * @returns {Lead} The newly created lead object.
   */
  const addLead = useCallback((newLeadData) => {
    const isoString = new Date().toISOString();
    
    // Generate secure unique ID, falling back to timestamp-based string if unavailable
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `lead-${Date.now()}`;

    const newLead = {
      ...newLeadData,
      id: generatedId,
      createdAt: isoString,
      dateAdded: isoString.split('T')[0] // For backward compatibility with existing tables
    };

    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, [setLeads]);

  /**
   * Updates fields of an existing lead matching the specified identifier.
   *
   * @param {string|number} id - Unique identifier of the lead to update.
   * @param {Partial<Lead>} updatedFields - Subset of lead attributes to merge.
   * @returns {void}
   */
  const updateLead = useCallback((id, updatedFields) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, ...updatedFields } : lead
      )
    );
  }, [setLeads]);

  /**
   * Deletes a lead from the state tracking.
   *
   * @param {string|number} id - Unique identifier of the lead to remove.
   * @returns {void}
   */
  const deleteLead = useCallback((id) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, [setLeads]);

  /**
   * Resolves a lead object by its identifier.
   *
   * @param {string|number} id - Unique identifier to look up.
   * @returns {Lead|undefined} The matched lead object or undefined if not found.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  // Context value bundle containing both state and action dispatchers
  const contextValue = useMemo(() => ({
    leads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById
  }), [leads, addLead, updateLead, deleteLead, getLeadById]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to consume LeadContext with safety checks.
 * Ensures the component is wrapped under LeadProvider.
 *
 * @throws {Error} If consumed outside of a LeadProvider.
 * @returns {Object} Context value including leads and mutative actions.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
