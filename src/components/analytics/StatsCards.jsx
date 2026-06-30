import { Users, TrendingUp, Banknote, Trophy, Clock, TrendingDown } from 'lucide-react';
import { memo } from 'react';
import KPICard from './KPICard';
import { formatINRCompact } from '../../utils/analyticsHelpers';

/**
 * StatsCards Component
 * Renders the 6-KPI summary row at the top of the Analytics dashboard.
 * Each card is driven by live computed analytics data.
 *
 * @param {Object} props
 * @param {Object} props.stats - Analytics payload from useAnalytics().
 * @returns {React.ReactElement}
 */
const StatsCards = memo(function StatsCards({ stats }) {
  const {
    totalLeads = 0,
    conversionRate = 0,
    pipelineValue = 0,
    wonRevenue = 0,
    avgSalesCycle = 0,
    lostRate = 0,
    leadGrowth = 0,
    revenueGrowth = 0,
  } = stats;

  /** @type {Array<import('./KPICard').default>} */
  const cards = [
    {
      id: 'kpi-total-leads',
      label: 'Total Leads',
      value: totalLeads.toLocaleString('en-IN'),
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: leadGrowth,
      trendLabel: 'vs previous period',
    },
    {
      id: 'kpi-conversion-rate',
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      trend: conversionRate > 0 ? conversionRate : 0,
      trendLabel: 'Won ÷ Total Leads',
    },
    {
      id: 'kpi-pipeline-value',
      label: 'Pipeline Value',
      value: formatINRCompact(pipelineValue),
      icon: Banknote,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      trendLabel: 'Active deals combined',
    },
    {
      id: 'kpi-won-revenue',
      label: 'Won Revenue',
      value: formatINRCompact(wonRevenue),
      icon: Trophy,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      trend: revenueGrowth,
      trendLabel: 'Closed-won revenue',
    },
    {
      id: 'kpi-avg-cycle',
      label: 'Avg Sales Cycle',
      value: avgSalesCycle > 0 ? `${avgSalesCycle} Days` : 'N/A',
      icon: Clock,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      trendLabel: 'Creation to close',
    },
    {
      id: 'kpi-lost-rate',
      label: 'Lost Rate',
      value: `${lostRate}%`,
      icon: TrendingDown,
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      // Lost rate — positive trend is actually bad, so invert
      trend: lostRate > 0 ? -lostRate : 0,
      trendLabel: 'Lost ÷ Total Leads',
    },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      aria-label="Key performance indicators"
    >
      {cards.map((card) => (
        <div key={card.id} id={card.id}>
          <KPICard {...card} />
        </div>
      ))}
    </div>
  );
});

export default StatsCards;
