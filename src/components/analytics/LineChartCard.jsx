import { memo } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CONVERSION_COLOR } from '../../constants/analyticsColors';

/** Custom conversion tooltip */
function LineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-text-main mb-1">{label}</p>
      <p className="text-sm font-bold text-success">{payload[0].value}%</p>
      <p className="text-xs text-text-sub">Conversion rate</p>
    </div>
  );
}

/**
 * LineChartCard Component
 * Smooth line chart showing monthly win-rate (Won ÷ Total) as a percentage
 * for the last 6 months.
 *
 * @param {Object} props
 * @param {Array<{month:string, rate:number}>} props.data
 * @returns {React.ReactElement}
 */
const LineChartCard = memo(function LineChartCard({ data = [] }) {
  const avgRate =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length)
      : 0;

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-text-main">Conversion Trend</h2>
          <p className="text-xs text-text-sub mt-0.5">
            Monthly win rate over the last 6 months.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-sub">6-mo avg</p>
          <p className="text-lg font-bold text-success">{avgRate}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: 'var(--text-sub)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<LineTooltip />} />
          {avgRate > 0 && (
            <ReferenceLine
              y={avgRate}
              stroke={CONVERSION_COLOR}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{ value: `Avg ${avgRate}%`, fontSize: 10, fill: 'var(--text-sub)', position: 'insideTopRight' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="rate"
            stroke={CONVERSION_COLOR}
            strokeWidth={2.5}
            dot={{ fill: CONVERSION_COLOR, r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={700}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default LineChartCard;
