/**
 * RevenueTrendChart Component
 * SVG-based line chart showing historical and projected revenue pipeline trends.
 */

/**
 * RevenueTrendChart Component
 * Renders a beautiful SVG area/line graph with grid lines, data points,
 * gradient fills, and month labels.
 *
 * @returns {React.ReactElement} The rendered RevenueTrendChart component.
 */
export default function RevenueTrendChart() {
  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-main">Revenue Pipeline Trends</h2>
          <p className="text-xs text-text-sub mt-0.5">
            Historical and projected cumulative contract value.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-text-sub">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary block" /> Closed Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary/40 block" /> Pipeline Forecast
          </span>
        </div>
      </div>

      {/* SVG line graph */}
      <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 1000 240" preserveAspectRatio="none">
          <defs>
            {/* Primary gradient fill */}
            <linearGradient id="gradient-primary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            {/* Forecast gradient fill */}
            <linearGradient id="gradient-forecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <line x1="0" y1="60"  x2="1000" y2="60"  stroke="var(--border-accent)" strokeWidth="0.5" strokeDasharray="4,4" />
          <line x1="0" y1="120" x2="1000" y2="120" stroke="var(--border-accent)" strokeWidth="0.5" strokeDasharray="4,4" />
          <line x1="0" y1="180" x2="1000" y2="180" stroke="var(--border-accent)" strokeWidth="0.5" strokeDasharray="4,4" />

          {/* Closed Revenue - Area fill */}
          <path
            d="M 0 200 Q 150 160 300 130 T 600 90 T 900 40 L 1000 30 L 1000 240 L 0 240 Z"
            fill="url(#gradient-primary)"
          />

          {/* Closed Revenue - Line path */}
          <path
            d="M 0 200 Q 150 160 300 130 T 600 90 T 900 40 L 1000 30"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Pipeline Forecast - Dashed projection line */}
          <path
            d="M 1000 30 Q 1050 20 1100 15"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6,4"
            opacity="0.5"
          />

          {/* Data highlight dots on closed revenue line */}
          <circle cx="300" cy="130" r="5" fill="var(--primary)" stroke="white" strokeWidth="2" />
          <circle cx="600" cy="90"  r="5" fill="var(--primary)" stroke="white" strokeWidth="2" />
          <circle cx="900" cy="40"  r="5" fill="var(--primary)" stroke="white" strokeWidth="2" />
          <circle cx="1000" cy="30" r="5" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2" opacity="0.6" />
        </svg>

        {/* Month X-axis labels */}
        <div className="flex justify-between text-[11px] font-semibold text-text-sub mt-2 px-1">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
}
