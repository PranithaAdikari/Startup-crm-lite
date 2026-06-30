import { memo } from 'react';
import { Target, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import { formatINRCompact } from '../../utils/analyticsHelpers';

/**
 * SalesVelocityCard Component
 * Displays computed sales velocity (₹/day) with details of formula components.
 *
 * @param {Object} props
 * @param {Object} props.velocity - The velocity object from useAnalytics.
 * @returns {React.ReactElement}
 */
const SalesVelocityCard = memo(function SalesVelocityCard({ velocity }) {
  const {
    value = 0,
    opportunities = 0,
    winRate = 0,
    avgDeal = 0,
    cycle = 1,
  } = velocity || {};

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning fill-warning/20" />
            Sales Velocity
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-warning bg-warning/10 border border-warning/25">
            Realtime Speed
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xs text-text-sub uppercase tracking-wider font-semibold">Velocity Rate</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-text-main tracking-tight">
              {formatINRCompact(value)}
            </span>
            <span className="text-sm font-semibold text-text-sub">/ day</span>
          </div>
          <p className="text-xs text-text-sub/80 mt-1">
            Expected revenue added to your business daily based on current speed.
          </p>
        </div>

        {/* Formula breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-accent/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-text-sub uppercase font-bold">Opps</p>
              <p className="text-sm font-bold text-text-main">{opportunities}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-text-sub uppercase font-bold">Win Rate</p>
              <p className="text-sm font-bold text-text-main">{Math.round(winRate * 100)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <DollarSign className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-[10px] text-text-sub uppercase font-bold">Avg Size</p>
              <p className="text-sm font-bold text-text-main">{formatINRCompact(avgDeal)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-warning/10">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-text-sub uppercase font-bold">Sales Cycle</p>
              <p className="text-sm font-bold text-text-main">{cycle} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formula tooltip/infobox */}
      <div className="mt-6 p-3 bg-bg-card/50 border border-border-accent/50 rounded-xl">
        <div className="flex items-center justify-between text-[10px] font-mono text-text-sub">
          <span>Formula</span>
          <span className="text-text-main font-bold">V = (O × W × A) / C</span>
        </div>
        <div className="w-full bg-border-accent/40 h-1.5 rounded-full mt-2 overflow-hidden flex">
          <div className="bg-primary h-full" style={{ width: '30%' }} />
          <div className="bg-success h-full" style={{ width: '20%' }} />
          <div className="bg-violet-500 h-full" style={{ width: '30%' }} />
          <div className="bg-warning h-full" style={{ width: '20%' }} />
        </div>
      </div>
    </div>
  );
});

export default SalesVelocityCard;
