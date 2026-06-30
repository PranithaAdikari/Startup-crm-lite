import { Plus, ArrowRight, Download } from 'lucide-react';

/**
 * @typedef {Object} QuickActionsProps
 * @property {() => void} [onAddLead] - Callback invoked when clicking "Add New Lead".
 * @property {() => void} [onViewLeads] - Callback invoked when clicking "View All Leads".
 * @property {() => void} [onExport] - Callback invoked when clicking "Export Data".
 */

/**
 * QuickActions Component
 * Renders a collection of primary dashboard action buttons with responsive layouts.
 *
 * @param {QuickActionsProps} props - Component props.
 * @returns {React.ReactElement} The rendered QuickActions widget component.
 */
export default function QuickActions({ onAddLead, onViewLeads, onExport }) {
  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm flex flex-col h-full">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-main">Quick Actions</h2>
        <p className="text-xs text-text-sub mt-0.5">Common shortcuts and data utility operations</p>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 flex-1 justify-center">
        {/* Add New Lead Action Button */}
        <button
          type="button"
          onClick={onAddLead}
          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
        >
          <Plus className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>Add New Lead</span>
        </button>

        {/* View All Leads Action Button */}
        <button
          type="button"
          onClick={onViewLeads}
          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-text-main bg-bg-card hover:bg-bg-canvas border border-border-accent rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
        >
          <span>View All Leads</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-text-sub transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Export Data Action Button */}
        <button
          type="button"
          onClick={onExport}
          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-semibold text-text-main bg-bg-card hover:bg-bg-canvas border border-border-accent rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
        >
          <Download className="w-4 h-4 shrink-0 text-text-sub transition-transform group-hover:translate-y-0.5" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  );
}
