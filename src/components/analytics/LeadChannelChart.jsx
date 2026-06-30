/**
 * LeadChannelChart Component
 * Horizontal bar chart showing lead acquisition performance by channel.
 */

/**
 * @typedef {Object} LeadSource
 * @property {string} source - The channel/source name.
 * @property {number} leads - Total lead count from this channel.
 * @property {string} conversion - Conversion rate percentage string.
 * @property {string} value - Tailwind width class for the bar (e.g. "w-[85%]").
 * @property {string} color - Tailwind background color class for the bar.
 */

/**
 * @typedef {Object} LeadChannelChartProps
 * @property {LeadSource[]} sources - Array of lead source objects to display.
 */

/**
 * LeadChannelChart Component
 * Renders a list of lead acquisition channels with relative horizontal bars,
 * lead counts, and conversion rates.
 *
 * @param {LeadChannelChartProps} props - Component props.
 * @returns {React.ReactElement} The rendered LeadChannelChart component.
 */
export default function LeadChannelChart({ sources }) {
  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-main">Lead Channel Acquisition</h2>
        <p className="text-xs text-text-sub mt-0.5">
          Top-performing pipeline channels based on lead volume &amp; conversion rate.
        </p>
      </div>

      <div className="space-y-4">
        {sources.map((source, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-main">{source.source}</span>
              <span className="text-text-sub font-semibold">
                {source.leads} leads{' '}
                <span className="text-success ml-1.5">({source.conversion} conv.)</span>
              </span>
            </div>
            {/* Channel strength status bar */}
            <div className="w-full h-2.5 bg-bg-canvas rounded-full overflow-hidden">
              <div
                className={`h-full ${source.color} rounded-full transition-all duration-1000 ${source.value}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
