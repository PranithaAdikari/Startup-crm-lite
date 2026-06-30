/**
 * ConversionFunnel Component
 * Visual funnel chart displaying CRM pipeline stage progression ratios.
 */

/**
 * @typedef {Object} FunnelStage
 * @property {string} name - Display label for the stage.
 * @property {string} count - Formatted count string.
 * @property {string} percentage - Percentage representation string.
 * @property {string} width - Tailwind width class (e.g. "w-4/5").
 * @property {string} color - Tailwind background color class.
 */

/**
 * @typedef {Object} ConversionFunnelProps
 * @property {FunnelStage[]} stages - Array of funnel stages to render.
 */

/**
 * ConversionFunnel Component
 * Renders a stacked horizontal funnel visualization for CRM pipeline conversion stages.
 *
 * @param {ConversionFunnelProps} props - Component props.
 * @returns {React.ReactElement} The rendered ConversionFunnel component.
 */
export default function ConversionFunnel({ stages }) {
  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-main">Conversion Funnel</h2>
        <p className="text-xs text-text-sub mt-0.5">
          Track how prospects progress through our CRM lifecycle stages.
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-text-main">{stage.name}</span>
              <span className="text-text-sub">
                {stage.count}{' '}
                <span className="text-text-sub/60 ml-1">({stage.percentage})</span>
              </span>
            </div>
            {/* Horizontal funnel stage progress line */}
            <div className="w-full h-7 bg-bg-canvas rounded-lg overflow-hidden border border-border-accent/30 relative">
              <div
                className={`h-full ${stage.color} rounded-l-md transition-all duration-1000 ${stage.width}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
