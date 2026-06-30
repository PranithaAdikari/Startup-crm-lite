import { useState, memo, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Sector,
} from 'recharts';

/**
 * Custom active-shape renderer — expands the hovered slice outward.
 * @param {Object} props - Recharts shape props.
 */
function ActiveSlice(props) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
  } = props;

  return (
    <g>
      {/* Expanded outer slice */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
      {/* Inner ring accent */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
}

/** Custom tooltip */
function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg text-left min-w-[140px]">
      <p className="text-xs font-bold text-text-main mb-1">{name}</p>
      <p className="text-sm font-bold" style={{ color: inner.color }}>
        {value} Leads
      </p>
      <p className="text-xs text-text-sub">{inner.percentage}%</p>
    </div>
  );
}

/**
 * PieChartCard Component
 * Doughnut chart showing lead status distribution with animated active-slice
 * expansion on hover and a center total label.
 */
const PieChartCard = memo(function PieChartCard({ data = [], total = 0 }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleMouseEnter = useCallback((_, index) => setActiveIndex(index), []);
  const handleMouseLeave = useCallback(() => setActiveIndex(null), []);

  const hasData = data.length > 0 && total > 0;

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-text-main">Lead Status Distribution</h2>
        <p className="text-xs text-text-sub mt-0.5">
          Breakdown of all leads by current pipeline stage.
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-text-sub text-sm">
          No data for selected period
        </div>
      ) : (
        <>
          {/* Chart with center label overlay */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={600}
                  activeIndex={activeIndex}
                  activeShape={<ActiveSlice />}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-text-main leading-none">
                {total}
              </span>
              <span className="text-xs text-text-sub mt-1">Total Leads</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: entry.color }}
                  />
                  <span className="text-xs font-medium text-text-sub">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-main">{entry.value}</span>
                  <span className="text-xs text-text-sub/60 w-9 text-right">
                    ({entry.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default PieChartCard;
