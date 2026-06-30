import { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { CHART_COLORS } from '../../constants/analyticsColors';

/** Custom source tooltip */
function SourceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-text-main mb-1">{d.source}</p>
      <p className="text-sm font-bold" style={{ color: d.color }}>
        {d.count} {d.count === 1 ? 'Lead' : 'Leads'}
      </p>
    </div>
  );
}

/**
 * LeadSourceChart Component
 * Horizontal bar chart ranking lead acquisition sources by volume, sorted descending.
 *
 * @param {Object} props
 * @param {Array<{source:string, count:number, color:string}>} props.data
 * @returns {React.ReactElement}
 */
const LeadSourceChart = memo(function LeadSourceChart({ data = [] }) {
  const hasData = data.length > 0;
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-text-main">Lead Sources</h2>
        <p className="text-xs text-text-sub mt-0.5">
          Acquisition channels ranked by lead volume.
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-text-sub text-sm">
          No data for selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(sorted.length * 44, 200)}>
          <BarChart
            layout="vertical"
            data={sorted}
            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-accent)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="source"
              width={90}
              tick={{ fontSize: 11, fill: 'var(--text-sub)', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<SourceTooltip />} cursor={{ fill: 'var(--border-accent)', opacity: 0.3 }} />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              isAnimationActive
              animationDuration={600}
            >
              {sorted.map((entry, index) => (
                <Cell
                  key={`source-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-sub)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

export default LeadSourceChart;
