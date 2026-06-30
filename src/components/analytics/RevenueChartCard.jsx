import { memo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatINRCompact, formatINR } from '../../utils/analyticsHelpers';
import { REVENUE_COLOR } from '../../constants/analyticsColors';

/** Custom revenue tooltip */
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-text-main mb-1">{label} Revenue</p>
      <p className="text-sm font-bold text-success">{formatINR(payload[0].value)}</p>
    </div>
  );
}

/**
 * RevenueChartCard Component
 * Area chart showing monthly Won-deal revenue for the last 6 months.
 * Gradient fill from success-green to transparent for depth.
 *
 * @param {Object} props
 * @param {Array<{month:string, revenue:number}>} props.data
 * @returns {React.ReactElement}
 */
const RevenueChartCard = memo(function RevenueChartCard({ data = [] }) {
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-text-main">Revenue Analytics</h2>
          <p className="text-xs text-text-sub mt-0.5">
            Won deal revenue by month (last 6 months).
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-sub">6-mo total</p>
          <p className="text-lg font-bold text-success">{formatINRCompact(totalRevenue)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={REVENUE_COLOR} stopOpacity={0.25} />
              <stop offset="95%" stopColor={REVENUE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

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
            tickFormatter={(v) => formatINRCompact(v)}
            tick={{ fontSize: 10, fill: 'var(--text-sub)' }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<RevenueTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={REVENUE_COLOR}
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: REVENUE_COLOR, r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RevenueChartCard;
