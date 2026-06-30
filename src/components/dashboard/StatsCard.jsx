import { memo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * @typedef {Object} StatsCardProps
 * @property {string} title - The title/label of the metric.
 * @property {string|number} value - The main numeric or text value to display.
 * @property {React.ComponentType<{ className?: string }>} icon - The Lucide React icon component.
 * @property {string|number} change - The percentage change value (e.g. "+12.5%", "-3.2%").
 * @property {'primary'|'success'|'warning'|'danger'} [color='primary'] - Theme color for the accent and icon background.
 */

/**
 * StatsCard Component
 * Displays a key performance metric with an icon, display value, and change indicator.
 */
const StatsCard = memo(function StatsCard({ title, value, icon: Icon, change, color = 'primary' }) {
  // Map color identifiers to Tailwind styling classes
  const colorMap = {
    primary: {
      text: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    success: {
      text: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
    },
    warning: {
      text: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
    danger: {
      text: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
    },
  };

  const selectedColor = colorMap[color] || colorMap.primary;
  
  // Parse the change prop to determine layout/direction
  const changeStr = String(change);
  const isNegative = changeStr.startsWith('-');
  const displayChange = changeStr.startsWith('+') || changeStr.startsWith('-') 
    ? changeStr 
    : `+${changeStr}`;

  return (
    <div className="bg-bg-card dark:bg-gray-800 p-6 rounded-2xl border border-border-accent dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-sub">{title}</span>
        <div className={`p-2.5 rounded-xl ${selectedColor.bg} ${selectedColor.text} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-text-main tracking-tight">{value}</h3>
        <div className="flex items-center mt-1 text-xs">
          <span
            className={`font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              isNegative 
                ? 'text-danger bg-danger/10' 
                : 'text-success bg-success/10'
            }`}
          >
            {isNegative ? (
              <ArrowDownRight className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            )}
            {displayChange}
          </span>
          <span className="text-text-sub ml-1.5">vs last month</span>
        </div>
      </div>
    </div>
  );
});

export default StatsCard;
