import { Search, FolderOpen, RefreshCw } from 'lucide-react';

/**
 * @typedef {Object} EmptyStateProps
 * @property {number} totalCount - Total unfiltered leads count in the CRM.
 * @property {() => void} onClearFilters - Callback to clear query and category states.
 */

/**
 * EmptyState Component
 * Displays a descriptive message when a leads query yields zero results.
 * Distinguishes between a brand-new setup and active search filtering.
 *
 * @param {EmptyStateProps} props - Component props.
 * @returns {React.ReactElement} The rendered EmptyState component.
 */
export default function EmptyState({ totalCount, onClearFilters }) {
  const isCrmEmpty = totalCount === 0;

  return (
    <div className="bg-bg-card border-2 border-dashed border-border-accent rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto my-8 animate-fade-in flex flex-col items-center justify-center space-y-4">
      {/* Dynamic Graphic Icon based on state */}
      <div className="p-4 rounded-full bg-bg-canvas text-text-sub/50">
        {isCrmEmpty ? (
          <FolderOpen className="w-10 h-10 animate-pulse" />
        ) : (
          <Search className="w-10 h-10" />
        )}
      </div>

      {/* Main heading */}
      <h3 className="text-lg font-bold text-text-main tracking-tight">
        {isCrmEmpty ? 'Your lead pipeline is empty' : 'No matching leads found'}
      </h3>

      {/* Description text */}
      <p className="text-sm text-text-sub max-w-sm font-medium leading-relaxed">
        {isCrmEmpty
          ? "Welcome! You haven't added any leads to your startup database yet. Use the 'Add Lead' button in the toolbar to create your first prospect."
          : 'No prospects match your current search queries or category filters. Try adjusting your filters or search keywords.'}
      </p>

      {/* Clear actions button (only shown when results are filtered) */}
      {!isCrmEmpty && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-text-main hover:text-white bg-bg-canvas hover:bg-primary border border-border-accent hover:border-primary rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Search & Filters</span>
        </button>
      )}
    </div>
  );
}
