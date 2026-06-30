import { memo, useMemo } from 'react';
import { Calendar } from 'lucide-react';

/**
 * ActivityHeatmap Component
 * Renders a GitHub-style contribution grid of lead activity (created/meeting scheduled)
 * for the last 84 days (12 weeks).
 *
 * @param {Object} props
 * @param {Object[]} props.heatmapData - Array of 84 objects containing { date, count, dayOfWeek, label }
 * @returns {React.ReactElement}
 */
const ActivityHeatmap = memo(function ActivityHeatmap({ heatmapData = [] }) {
  // Chunk the flat 84 days into 12 columns (weeks) of 7 days
  const weeks = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [];
    const chunks = [];
    const dataCopy = [...heatmapData];
    while (dataCopy.length) {
      chunks.push(dataCopy.splice(0, 7));
    }
    return chunks;
  }, [heatmapData]);

  // Color mapping based on activity count
  const getCellColor = (count) => {
    if (count === 0) return 'bg-border-accent/30 dark:bg-zinc-800/40 hover:bg-border-accent/60';
    if (count === 1) return 'bg-primary/20 hover:bg-primary/30';
    if (count === 2) return 'bg-primary/40 hover:bg-primary/50';
    if (count === 3) return 'bg-primary/65 hover:bg-primary/75';
    return 'bg-primary hover:brightness-110';
  };

  // Find month boundaries to render month labels on top
  const monthLabels = useMemo(() => {
    if (!weeks.length) return [];
    const labels = [];
    let lastMonth = '';
    weeks.forEach((week, weekIdx) => {
      // Look at the middle day of the week to place label
      const midDay = week[3];
      if (midDay) {
        const dateObj = new Date(midDay.date);
        const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
        if (monthName !== lastMonth) {
          labels.push({ label: monthName, colIndex: weekIdx });
          lastMonth = monthName;
        }
      }
    });
    return labels;
  }, [weeks]);

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-bg-card rounded-2xl border border-border-accent p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Lead Activity Heatmap
          </h3>
          <span className="text-[10px] text-text-sub font-semibold">
            Last 84 Days (Created / Meetings)
          </span>
        </div>

        {/* Heatmap Grid container */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-accent scrollbar-track-transparent">
          <div className="min-w-[320px] flex flex-col">
            {/* Month Header Row */}
            <div className="flex pl-8 h-5 relative text-[10px] text-text-sub/80 font-bold mb-1">
              {monthLabels.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute"
                  style={{ left: `${32 + item.colIndex * 19.5}px` }}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Grid Layout: Days labels on left, weeks as vertical columns */}
            <div className="flex items-start gap-2">
              {/* Day Labels Column */}
              <div className="flex flex-col gap-[3.5px] text-[9px] text-text-sub/70 font-semibold w-6 pt-0.5 select-none">
                {weekdays.map((day, idx) => (
                  <div key={idx} className="h-4 flex items-center justify-end pr-1">
                    {idx % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {/* Weeks Columns */}
              <div className="flex gap-[3.5px]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`w-4 h-4 rounded-[3px] transition-all duration-150 cursor-help relative group ${getCellColor(
                          day.count
                        )}`}
                      >
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 pointer-events-none bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap">
                          {day.count === 0 ? 'No' : day.count}{' '}
                          {day.count === 1 ? 'activity' : 'activities'} on {day.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 flex items-center justify-between border-t border-border-accent/40 pt-4 text-[10px] text-text-sub/80 select-none">
        <span>Recent 12 Weeks</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-border-accent/30 dark:bg-zinc-800/40" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/20" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/40" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/65" />
          <div className="w-3 h-3 rounded-[2px] bg-primary" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
});

export default ActivityHeatmap;
