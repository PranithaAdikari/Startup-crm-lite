import { memo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { formatINRCompact } from '../../utils/analyticsHelpers';

/**
 * ForecastCard Component
 * Displays predicted next-month revenue based on past trends, confidence score, and direction.
 *
 * @param {Object} props
 * @param {Object} props.forecast - The forecast object from useAnalytics.
 * @returns {React.ReactElement}
 */
const ForecastCard = memo(function ForecastCard({ forecast }) {
  const {
    nextMonth = 0,
    avgMonthly = 0,
    confidence = 70,
    trend = 0,
  } = forecast || {};

  const isPositive = trend >= 0;

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary fill-primary/10" />
            Revenue Forecast
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-primary bg-primary/10 border border-primary/25">
            Predictive AI
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xs text-text-sub uppercase tracking-wider font-semibold">Next Month Estimate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-text-main tracking-tight">
              {formatINRCompact(nextMonth)}
            </span>
            {trend !== 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                  }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <p className="text-xs text-text-sub/80 mt-1">
            Based on a weighted average of your last 6 months won deals.
          </p>
        </div>

        {/* Details and metrics */}
        <div className="space-y-4 pt-4 border-t border-border-accent/40">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-sub font-medium">Historical Run Rate</span>
            <span className="text-text-main font-semibold">{formatINRCompact(avgMonthly)} / mo</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-sub font-medium flex items-center gap-1">
                Forecast Confidence
                <HelpCircle className="w-3.5 h-3.5 text-text-sub/60" title="Based on frequency and distribution of closed deals." />
              </span>
              <span className="text-text-main font-bold">{confidence}%</span>
            </div>
            <div className="w-full bg-border-accent/45 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-text-sub/60 flex items-center justify-between">
        <span>Model: Weighted Moving Average</span>
        <span>Updated: Just now</span>
      </div>
    </div>
  );
});

export default ForecastCard;
