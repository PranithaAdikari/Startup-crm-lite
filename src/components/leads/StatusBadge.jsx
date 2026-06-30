import { memo } from 'react';
import { STATUS_COLOR_MAP } from '../../constants';

/**
 * @typedef {Object} StatusBadgeProps
 * @property {string} status - The status of the lead (e.g. "New", "Contacted", "Won", "Lost").
 * @property {string} [className] - Optional extra Tailwind utility classes.
 */

/**
 * StatusBadge Component
 * Displays a pill-shaped colored badge tailored to the lead's current pipeline status.
 */
const StatusBadge = memo(function StatusBadge({ status, className = '' }) {
  // Normalize the status string to match keys
  const normalizedStatus = String(status || 'New').trim();

  // Retrieve styled classes, fallback to Slate/Gray if status is unknown
  const badgeClasses = STATUS_COLOR_MAP[normalizedStatus] || 
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize whitespace-nowrap ${badgeClasses} ${className}`}
    >
      {normalizedStatus}
    </span>
  );
});

export default StatusBadge;
