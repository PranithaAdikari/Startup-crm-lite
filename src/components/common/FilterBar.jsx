import { memo, useMemo } from 'react';
import { FILTER_OPTIONS } from '../../constants';

/**
 * @typedef {Object} Lead
 * @property {string|number} id - Unique identifier.
 * @property {string} status - Pipeline status of the lead.
 */

/**
 * @typedef {Object} FilterBarProps
 * @property {string} activeFilter - Currently selected status filter.
 * @property {(filter: string) => void} onFilterChange - Callback triggered when a filter is clicked.
 * @property {Lead[]} leads - List of leads used to compute counts.
 */

/**
 * FilterBar Component
 * Renders a row of category filter buttons with dynamic count labels.
 */
const FilterBar = memo(function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  // Pre-calculate counts in O(N) single-pass aggregate when leads change
  const counts = useMemo(() => {
    const acc = { All: leads.length };
    leads.forEach((lead) => {
      const status = lead.status || 'New';
      acc[status] = (acc[status] || 0) + 1;
    });
    return acc;
  }, [leads]);

  return (
    <div className="w-full overflow-x-auto pb-1 -mb-1 scrollbar-thin">
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option;
          const count = option === 'All' ? counts.All : (counts[option] || 0);
          
          return (
            <button
              key={option}
              type="button"
              onClick={() => onFilterChange(option)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-sm hover:shadow active:scale-95 ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg-card hover:bg-bg-canvas text-text-sub hover:text-text-main border-border-accent'
              }`}
            >
              <span>{option}</span>
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-bg-canvas text-text-sub border border-border-accent/40'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FilterBar;
