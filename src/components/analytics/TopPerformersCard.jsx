import { memo } from 'react';
import { Trophy, Award } from 'lucide-react';
import { formatINRCompact } from '../../utils/analyticsHelpers';

/**
 * TopPerformersCard Component
 * Displays ranked sales representatives based on Won Revenue and closed deal count.
 *
 * @param {Object} props
 * @param {Array} props.topPerformers - Array of performer objects from useAnalytics.
 * @returns {React.ReactElement}
 */
const TopPerformersCard = memo(function TopPerformersCard({ topPerformers = [] }) {
  // Rank badge styling
  const getRankBadge = (index) => {
    if (index === 0) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    if (index === 1) return 'text-slate-400 bg-slate-400/10 border-slate-400/25';
    if (index === 2) return 'text-amber-700 bg-amber-700/10 border-amber-700/25';
    return 'text-text-sub bg-border-accent/40 border-border-accent/60';
  };

  // Avatar background colors
  const avatarColors = [
    'bg-amber-500 text-white',
    'bg-indigo-500 text-white',
    'bg-emerald-500 text-white',
    'bg-rose-500 text-white',
    'bg-violet-500 text-white',
  ];

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />
            Top Performers
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-success bg-success/10 border border-success/25">
            Leaderboard
          </span>
        </div>

        {topPerformers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Award className="w-10 h-10 text-text-sub/40 mb-2" />
            <p className="text-sm font-medium text-text-sub">No sales leaderboard data available</p>
            <p className="text-xs text-text-sub/65 mt-0.5">Won leads determine ranking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topPerformers.map((performer, idx) => (
              <div
                key={performer.name}
                className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-border-accent/40 hover:bg-bg-card/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Indicator */}
                  <span
                    className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold border rounded-md select-none ${getRankBadge(
                      idx
                    )}`}
                  >
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                      avatarColors[idx % avatarColors.length]
                    }`}
                  >
                    {performer.initials}
                  </div>

                  {/* Representative Details */}
                  <div>
                    <h4 className="text-sm font-bold text-text-main leading-tight">
                      {performer.name}
                    </h4>
                    <p className="text-xs text-text-sub mt-0.5">
                      {performer.count} {performer.count === 1 ? 'Won Deal' : 'Won Deals'}
                    </p>
                  </div>
                </div>

                {/* Revenue */}
                <div className="text-right">
                  <span className="text-sm font-bold text-text-main">
                    {formatINRCompact(performer.revenue)}
                  </span>
                  <div className="text-[10px] text-text-sub font-medium">Won Vol.</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border-accent/40 pt-4 flex items-center justify-between text-[10px] text-text-sub/60">
        <span>Ranked by closed-won volume</span>
        <span>Top 5 Reps</span>
      </div>
    </div>
  );
});

export default TopPerformersCard;
