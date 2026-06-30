import { memo } from 'react';
import {
  FunnelChart, Funnel, LabelList,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/** Custom funnel tooltip */
function FunnelTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-card border border-border-accent rounded-xl px-4 py-3 shadow-lg min-w-[160px]">
      <p className="text-xs font-bold text-text-main mb-1">{d.fullName || d.name}</p>
      <p className="text-sm font-bold" style={{ color: d.fill }}>{d.value} Leads</p>
    </div>
  );
}

/**
 * FunnelChartCard Component
 * Visualises the CRM pipeline as a descending funnel showing lead count at each stage
 * plus the conversion percentage from stage to stage.
 *
 * @param {Object} props
 * @param {Array<{name:string, value:number, fill:string}>} props.data
 * @returns {React.ReactElement}
 */
const FunnelChartCard = memo(function FunnelChartCard({ data = [] }) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-text-main">Sales Funnel</h2>
        <p className="text-xs text-text-sub mt-0.5">
          Cumulative leads at each pipeline stage.
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-text-sub text-sm">
          No data for selected period
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <FunnelChart>
              <Tooltip content={<FunnelTooltip />} />
              <Funnel
                dataKey="value"
                data={data}
                isAnimationActive
                animationDuration={600}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`fc-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="center"
                  style={{ fill: '#fff', fontSize: 13, fontWeight: 700 }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>

          {/* Stage-by-stage conversion metrics */}
          <div className="mt-4 space-y-2">
            {data.map((stage, idx) => {
              const prev = idx > 0 ? data[idx - 1] : null;
              const convPct =
                prev && prev.value > 0
                  ? Math.round((stage.value / prev.value) * 100)
                  : 100;

              return (
                <div key={stage.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: stage.fill }}
                    />
                    <span className="text-xs font-medium text-text-sub">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-main">{stage.value}</span>
                    {idx > 0 && (
                      <span className={`text-xs font-semibold ${convPct >= 50 ? 'text-success' : 'text-danger'}`}>
                        {convPct}% conv.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});

export default FunnelChartCard;
