import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPICard Component
 * Displays a single key-performance-indicator with value, trend badge, and description.
 * Accepts both the original props (backward compatible) and extended props for
 * icon-backed metric cards used in the Analytics dashboard.
 *
 * @param {Object} props
 * @param {string}  props.label        - Metric label/title.
 * @param {string}  props.value        - Primary display value.
 * @param {string}  [props.improvement] - Legacy change text (e.g. "+8.4%").
 * @param {boolean} [props.isPositive] - Whether the change is favourable.
 * @param {string}  [props.subtext]    - Descriptive subtitle.
 * @param {React.ElementType} [props.icon] - Lucide icon component.
 * @param {string}  [props.iconBg]     - Tailwind bg class for the icon chip.
 * @param {string}  [props.iconColor]  - Tailwind text class for the icon.
 * @param {number}  [props.trend]      - Numeric % change vs previous period.
 * @param {string}  [props.trendLabel] - Label shown next to the trend badge.
 * @returns {React.ReactElement}
 */
export default function KPICard({
  label,
  value,
  improvement,
  isPositive,
  subtext,
  icon: Icon,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
  trend,
  trendLabel,
}) {
  // Resolve trend from either the new `trend` prop or legacy `improvement` + `isPositive`
  const hasTrend = trend !== undefined || improvement !== undefined;
  const trendValue = trend !== undefined ? trend : null;
  const trendPositive = trendValue !== null ? trendValue >= 0 : isPositive;
  const trendText =
    trend !== undefined
      ? `${trend > 0 ? '+' : ''}${trend}%`
      : improvement;

  const TrendIcon =
    trendValue === 0 ? Minus : trendPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-bg-card p-5 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-3">
      {/* Top row: icon chip + trend badge */}
      <div className="flex items-start justify-between">
        {Icon ? (
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wider text-text-sub">
            {label}
          </span>
        )}

        {hasTrend && trendText && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'text-success bg-success/10'
                : 'text-danger bg-danger/10'
            }`}
          >
            <TrendIcon className="w-3 h-3" />
            {trendText}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        {Icon && (
          <p className="text-xs font-semibold uppercase tracking-wider text-text-sub mb-1">
            {label}
          </p>
        )}
        <span className="text-2xl font-bold text-text-main tracking-tight">
          {value}
        </span>
      </div>

      {/* Subtext */}
      {(subtext || trendLabel) && (
        <p className="text-xs text-text-sub/80 border-t border-border-accent/40 pt-2">
          {subtext || trendLabel}
        </p>
      )}
    </div>
  );
}
