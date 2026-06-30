import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { LEADS_BAR_COLOR } from '../../constants/analyticsColors';

/** Custom bar tooltip */
function BarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-text-main mb-1">{label}</p>
      <p className="text-sm font-bold text-primary">
        {payload[0].value} {payload[0].value === 1 ? 'Lead' : 'Leads'}
      </p>
    </div>
  );
}

/**
 * BarChartCard Component
 * Vertical bar chart showing monthly lead acquisition for the last 6 months.
 *
 * @param {Object} props
 * @param {Array<{month:string, leads:number}>} props.data
 * @returns {React.ReactElement}
 */
const BarChartCard = memo(function BarChartCard({ data = [] }) {
  const maxVal = Math.max(...data.map((d) => d.leads), 1);

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-text-main">Monthly Leads</h2>
        <p className="text-xs text-text-sub mt-0.5">
          New leads acquired over the last 6 months.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="35%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-accent)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--text-sub)', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--border-accent)', radius: 6, opacity: 0.4 }} />
          <Bar
            dataKey="leads"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell
                key={`bar-${index}`}
                fill={entry.leads === maxVal ? LEADS_BAR_COLOR : `${LEADS_BAR_COLOR}80`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default BarChartCard;
