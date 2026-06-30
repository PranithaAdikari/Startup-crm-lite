import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import useAnalytics from '../hooks/useAnalytics';

// Import analytics dashboard components
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import ForecastCard from '../components/analytics/ForecastCard';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';

/**
 * Analytics Component
 * Renders the full advanced sales and pipeline dashboard.
 * All computations are driven live by useLeads() state and useAnalytics() hook.
 */
export default function Analytics() {
  const { leads = [] } = useLeads();
  const [dateRange, setDateRange] = useState('all');

  const analytics = useAnalytics(leads, dateRange);

  // If lead database is entirely empty, show Empty State
  if (analytics.isEmpty) {
    return <EmptyAnalyticsState />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12" aria-label="Analytics Dashboard">
      {/* Header section with title and date filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Analytics</h1>
          <p className="text-text-sub mt-1">
            Deep-dive view into your startup's live pipeline performance, revenue growth, and team effectiveness.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AnalyticsFilters value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Grid of 6 KPI Cards (Total Leads, Conversion Rate, Pipeline Value, Won Revenue, Avg Sales Cycle, Lost Rate) */}
      <StatsCards stats={analytics} />

      {/* Grid 1: Status Distribution (Pie) & Funnel Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <PieChartCard data={analytics.statusDist} total={analytics.totalLeads} />
        </div>
        <div className="h-full">
          <FunnelChartCard data={analytics.funnelData} />
        </div>
      </div>

      {/* Grid 2: Monthly Leads (Bar) & Monthly Conversion Trend (Line) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <BarChartCard data={analytics.monthlyLeads} />
        </div>
        <div className="h-full">
          <LineChartCard data={analytics.conversionTrend} />
        </div>
      </div>

      {/* Grid 3: Revenue Trend (Area) & Lead Sources (Horizontal Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <RevenueChartCard data={analytics.revenueTrend} />
        </div>
        <div className="h-full">
          <LeadSourceChart data={analytics.sourceStats} />
        </div>
      </div>

      {/* Grid 4: Activity Heatmap & Top Performers leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <ActivityHeatmap heatmapData={analytics.heatmapData} />
        </div>
        <div className="h-full">
          <TopPerformersCard topPerformers={analytics.topPerformers} />
        </div>
      </div>

      {/* Grid 5: Revenue Forecast & Sales Velocity Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <ForecastCard forecast={analytics.forecast} />
        </div>
        <div className="h-full">
          <SalesVelocityCard velocity={analytics.salesVelocity} />
        </div>
      </div>
    </div>
  );
}

