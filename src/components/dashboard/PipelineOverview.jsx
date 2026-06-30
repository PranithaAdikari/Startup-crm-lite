import { memo, useMemo } from 'react';
import { parseNumericValue, formatCurrency } from '../../utils/helpers';
import { PIPELINE_STAGES } from '../../constants';

/**
 * @typedef {Object} Lead
 * @property {string|number} id - Unique identifier for the lead.
 * @property {string} name - Name of the contact.
 * @property {string} company - Associated company name.
 * @property {string|number} value - Estimated budget/value of the lead.
 * @property {string} [stage] - The pipeline stage (e.g. "New Lead", "Contacted").
 * @property {string} [status] - Alternative stage identifier or quality tier.
 */

/**
 * @typedef {Object} PipelineOverviewProps
 * @property {Lead[]} leads - List of lead objects to aggregate and visualize.
 */

/**
 * PipelineOverview Component
 * Renders a stacked horizontal segment bar representing CRM pipeline values across stages.
 */
const PipelineOverview = memo(function PipelineOverview({ leads = [] }) {
  // Memoize stage aggregation so it only recalculates when leads change
  const { stages, totalPipelineValue, totalLeadCount } = useMemo(() => {
    // Initialize unified stages data aggregator from the centralized constant
    const stagesAcc = {
      New: { ...PIPELINE_STAGES.New, value: 0, count: 0 },
      Contacted: { ...PIPELINE_STAGES.Contacted, value: 0, count: 0 },
      Proposal: { ...PIPELINE_STAGES.Proposal, value: 0, count: 0 },
      Negotiation: { ...PIPELINE_STAGES.Negotiation, value: 0, count: 0 },
    };

    let totalValue = 0;
    let totalCount = 0;

    leads.forEach((lead) => {
      const rawStage = lead.stage || lead.status || 'New';
      const numValue = parseNumericValue(lead.value);

      let canonical;
      if (rawStage.toLowerCase().includes('new')) canonical = 'New';
      else if (rawStage.toLowerCase().includes('contact')) canonical = 'Contacted';
      else if (rawStage.toLowerCase().includes('proposal')) canonical = 'Proposal';
      else if (rawStage.toLowerCase().includes('negotiat')) canonical = 'Negotiation';
      else {
        canonical = rawStage;
        if (!stagesAcc[canonical]) {
          stagesAcc[canonical] = {
            label: canonical,
            value: 0,
            count: 0,
            bg: 'bg-slate-400',
            text: 'text-slate-400',
          };
        }
      }

      stagesAcc[canonical].value += numValue;
      stagesAcc[canonical].count += 1;
      totalValue += numValue;
      totalCount += 1;
    });

    return { stages: stagesAcc, totalPipelineValue: totalValue, totalLeadCount: totalCount };
  }, [leads]);

  // Calculate percentage width segments, filtered to only include non-empty stages
  const segments = useMemo(() => {
    return Object.entries(stages)
      .map(([key, stage]) => {
        const percentage = totalPipelineValue > 0
          ? (stage.value / totalPipelineValue) * 100
          : stage.count > 0
            ? (stage.count / totalLeadCount) * 100
            : 0;
        return { key, ...stage, percentage };
      })
      .filter((seg) => seg.count > 0);
  }, [stages, totalPipelineValue, totalLeadCount]);

  return (
    <div className="bg-bg-card dark:bg-gray-800 p-6 rounded-2xl border border-border-accent dark:border-gray-700 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">Pipeline Value</h2>
          <p className="text-xs text-text-sub mt-0.5">Value distribution by pipeline stage</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-text-main block tracking-tight">
            {formatCurrency(totalPipelineValue)}
          </span>
          <span className="text-xs text-text-sub font-medium">
            {totalLeadCount} active {totalLeadCount === 1 ? 'prospect' : 'prospects'}
          </span>
        </div>
      </div>

      {/* Stacked Horizontal Segmented Progress Bar */}
      <div className="w-full h-4 bg-bg-canvas dark:bg-gray-900 rounded-full overflow-visible flex border border-border-accent/40 dark:border-gray-700/40 relative">
        {segments.length > 0 ? (
          segments.map((segment) => (
            <div
              key={segment.key}
              style={{ width: `${segment.percentage}%` }}
              className={`h-full ${segment.bg} first:rounded-l-full last:rounded-r-full hover:opacity-90 transition-all cursor-help relative group`}
            >
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] py-1.5 px-2.5 rounded-lg whitespace-nowrap z-20 shadow-lg border border-border-accent/10 font-semibold transition-all duration-200">
                {segment.label}: {formatCurrency(segment.value)} ({segment.count} {segment.count === 1 ? 'lead' : 'leads'})
                {/* Pointer arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-text-sub/50 font-medium">
            No pipeline leads available
          </div>
        )}
      </div>

      {/* Detailed Grid Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border-accent/30 dark:border-gray-700/30">
        {Object.entries(stages).map(([key, stage]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-text-sub font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${stage.bg} block shrink-0`} />
              <span className="truncate">{stage.label}</span>
            </div>
            <div>
              <span className="text-sm font-bold text-text-main block">
                {formatCurrency(stage.value)}
              </span>
              <span className="text-[10px] text-text-sub font-medium block">
                {stage.count} {stage.count === 1 ? 'lead' : 'leads'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default PipelineOverview;
