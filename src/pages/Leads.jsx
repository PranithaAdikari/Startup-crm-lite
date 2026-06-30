import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, List, LayoutGrid, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLeads } from '../context/LeadContext';

// Import custom lead CRUD components
import LeadForm from '../components/leads/LeadForm';
import LeadCard from '../components/leads/LeadCard';
import LeadTable from '../components/leads/LeadTable';

// Import search, filter, and empty state controls
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';

/**
 * Leads Page Component
 * Main CRUD workspace for Leads Management, now enhanced with debounced search,
 * scrollable category buttons, and context-aware empty state graphics.
 *
 * @returns {React.ReactElement} The rendered Leads page.
 */
export default function Leads() {
  const location = useLocation();

  // Primary leads data state from global context
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // UI state controllers
  const [isModalOpen, setIsModalOpen] = useState(() => !!location.state?.openAddModal);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewType, setViewType] = useState('table'); // 'table' | 'card'

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const handleOpenAddModal = useCallback(() => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  // Clean location state if routed here with state from Quick Actions
  useEffect(() => {
    if (location.state?.openAddModal) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Accessible keyboard handler: closes modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleCloseModal]);

  /**
   * Resets active search terms and status filters to defaults.
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('All');
  }, []);

  /**
   * Dispatches create or update operations depending on dialog context.
   *
   * @param {Object} formPayload - Form data compiled from LeadForm.
   */
  const handleFormSubmit = useCallback((formPayload) => {
    if (selectedLead) {
      // Edit / Update mode
      updateLead(selectedLead.id, formPayload);
      toast.success(`Lead "${formPayload.name}" updated successfully!`, {
        icon: '✓',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
    } else {
      // Create mode
      const newLead = addLead(formPayload);
      toast.success(`Lead "${newLead.name}" registered successfully!`, {
        icon: '🎉',
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-accent)',
        },
      });
    }
    handleCloseModal();
  }, [selectedLead, addLead, updateLead, handleCloseModal]);

  /**
   * Deletes a lead and alerts the user with an error/danger styled toast message.
   *
   * @param {string|number} id - Target identifier to delete.
   */
  const handleDeleteLead = useCallback((id) => {
    const leadToDelete = leads.find((l) => l.id === id);
    deleteLead(id);
    toast.error(`Lead "${leadToDelete ? leadToDelete.name : 'Prospect'}" has been removed.`, {
      icon: '🗑️',
      style: {
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-accent)',
      },
    });
  }, [leads, deleteLead]);

  // Derive filteredLeads based on search queries and active category tags
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => activeFilter === 'All' || lead.status === activeFilter)
      .filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [leads, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Configure Toast Alerts container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Page header with add button actions */}
      {/* Page header with add button actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Lead Management</h1>
          <p className="text-text-sub mt-1">Track, qualify, and convert your opportunities.</p>
        </div>
         <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Lead
        </button>
      </div>

      {/* Filter, search, and layout toggle utilities card container */}
      <div className="bg-bg-card p-5 rounded-2xl border border-border-accent flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Debounced Search Input Box */}
          <div className="w-full md:max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* View togglers & summary counts */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
            <span className="text-xs text-text-sub font-semibold">
              Showing <strong className="font-bold text-text-main">{filteredLeads.length}</strong> of{' '}
              <strong className="font-bold text-text-main">{leads.length}</strong>
            </span>

            {/* Table/Card Layout View Mode Toggles (Shown only on Tablet viewports) */}
            <div className="hidden md:flex lg:hidden items-center border border-border-accent bg-bg-canvas p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewType('table')}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  viewType === 'table' ? 'bg-primary text-white shadow-sm' : 'text-text-sub hover:text-text-main'
                }`}
                title="Table View"
                aria-label="Toggle Table View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewType('card')}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  viewType === 'card' ? 'bg-primary text-white shadow-sm' : 'text-text-sub hover:text-text-main'
                }`}
                title="Card View"
                aria-label="Toggle Card View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic scrollable FilterBar row */}
        <div className="border-t border-border-accent/30 pt-3.5">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            leads={leads}
          />
        </div>
      </div>

      {/* Main Listing View area: checks matching lengths and triggers fallback empty states */}
      <div>
        {filteredLeads.length === 0 ? (
          <EmptyState totalCount={leads.length} onClearFilters={handleClearFilters} />
        ) : (
          <>
            {/* Mobile-only view: stacked cards representation */}
            <div className="md:hidden">
              <div className="grid grid-cols-1 gap-4">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            </div>

            {/* Tablet-only view: toggles between interactive data table and cards grid */}
            <div className="hidden md:block lg:hidden animate-fade-in">
              {viewType === 'table' ? (
                <LeadTable
                  leads={filteredLeads}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteLead}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteLead}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop-only view: always displays the full table with all columns */}
            <div className="hidden lg:block animate-fade-in">
              <LeadTable
                leads={filteredLeads}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteLead}
              />
            </div>
          </>
        )}
      </div>

      {/* Accessible background modal dialogue overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Dark backdrop blur mask */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal content viewport wrapper */}
          <div className="flex min-h-screen md:min-h-full items-stretch md:items-center justify-center p-0 md:p-4 text-center">
            <div className="relative transform overflow-y-auto bg-bg-card text-left shadow-2xl transition-all w-full min-h-screen md:min-h-0 md:h-auto rounded-none md:rounded-2xl border-0 md:border md:border-border-accent p-6 md:max-w-lg flex flex-col justify-between animate-scale-in">
              {/* Modal header details */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border-accent/40 mb-5">
                  <h3 className="text-lg font-bold text-text-main tracking-tight">
                    {selectedLead ? 'Edit CRM Prospect' : 'Add New CRM Prospect'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    aria-label="Close dialog"
                    className="w-11 h-11 flex items-center justify-center hover:bg-bg-canvas text-text-sub hover:text-text-main rounded-xl transition-colors duration-200 cursor-pointer shrink-0"
                  >
                    <X className="w-5.5 h-5.5" />
                  </button>
                </div>

                {/* Mounted CRUD Form */}
                <LeadForm
                  initialData={selectedLead}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
