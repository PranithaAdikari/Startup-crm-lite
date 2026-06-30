import { Calendar } from 'lucide-react';

/** @type {Array<{id: string, label: string}>} */
const FILTER_OPTIONS = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

/**
 * AnalyticsFilters Component
 * Date-range pill selector that drives all chart updates without page reload.
 * All filtering is handled externally via memoized hooks — this component
 * is a purely controlled UI element.
 *
 * @param {Object} props
 * @param {'7d'|'30d'|'90d'|'year'|'all'} props.value - Currently active range.
 * @param {(range: string) => void} props.onChange - Callback on selection.
 * @returns {React.ReactElement}
 */
export default function AnalyticsFilters({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {/* Calendar icon */}
      <Calendar className="w-4 h-4 text-text-sub flex-shrink-0" />

      {/* Filter pill group */}
      <div
        className="flex items-center gap-1 bg-bg-canvas p-1 rounded-xl border border-border-accent shadow-sm"
        role="group"
        aria-label="Date range filter"
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = value === option.id;
          return (
            <button
              key={option.id}
              id={`analytics-filter-${option.id}`}
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
              className={`
                px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-sub hover:text-text-main hover:bg-bg-card'
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
