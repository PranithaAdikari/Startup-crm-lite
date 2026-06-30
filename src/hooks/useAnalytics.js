/**
 * @fileoverview useAnalytics — Custom hook that derives all dashboard analytics
 * from the live leads array via memoized pure functions.
 *
 * All values recalculate only when `leads` or `dateRange` change.
 * Chart components receive plain serialisable data — no raw leads are passed down.
 *
 * @module useAnalytics
 */

import { useMemo } from 'react';
import {
  filterLeadsByDateRange,
  getPreviousPeriodLeads,
  getPeriodGrowth,
  getPipelineValue,
  getWonRevenue,
  getConversionRate,
  getLostRate,
  getAverageSalesCycle,
  getStatusDistribution,
  getFunnelData,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getLeadSourceStats,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData,
} from '../utils/analyticsHelpers';

/**
 * Derives the complete analytics payload from a leads array and a date-range key.
 *
 * @param {Object[]} leads - Full leads array from LeadContext.
 * @param {'7d'|'30d'|'90d'|'year'|'all'} dateRange - Active date filter.
 * @returns {Object} Flat analytics payload consumed by dashboard components.
 *
 * @example
 * const analytics = useAnalytics(leads, '30d');
 * // analytics.totalLeads, analytics.monthlyLeads, analytics.funnelData, …
 */
export function useAnalytics(leads = [], dateRange = 'all') {
  // ------------------------------------------------------------------
  // 1. Filter leads to the active date window
  // ------------------------------------------------------------------
  const filteredLeads = useMemo(
    () => filterLeadsByDateRange(leads, dateRange),
    [leads, dateRange]
  );

  // Previous period leads — used for growth calculations
  const prevLeads = useMemo(
    () => getPreviousPeriodLeads(leads, dateRange),
    [leads, dateRange]
  );

  // ------------------------------------------------------------------
  // 2. KPI scalars — only recalculate when filteredLeads changes
  // ------------------------------------------------------------------
  const kpis = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const prevTotal = prevLeads.length;
    const wonRevenue = getWonRevenue(filteredLeads);
    const prevRevenue = getWonRevenue(prevLeads);

    return {
      totalLeads,
      conversionRate: getConversionRate(filteredLeads),
      pipelineValue: getPipelineValue(filteredLeads),
      wonRevenue,
      avgSalesCycle: getAverageSalesCycle(filteredLeads),
      lostRate: getLostRate(filteredLeads),
      // Growth deltas vs previous period
      leadGrowth: getPeriodGrowth(totalLeads, prevTotal),
      revenueGrowth: getPeriodGrowth(wonRevenue, prevRevenue),
    };
  }, [filteredLeads, prevLeads]);

  // ------------------------------------------------------------------
  // 3. Chart datasets — each independently memoized
  // ------------------------------------------------------------------
  const statusDist = useMemo(
    () => getStatusDistribution(filteredLeads),
    [filteredLeads]
  );

  const funnelData = useMemo(
    () => getFunnelData(filteredLeads),
    [filteredLeads]
  );

  const monthlyLeads = useMemo(
    () => getMonthlyLeads(filteredLeads, 6),
    [filteredLeads]
  );

  const conversionTrend = useMemo(
    () => getConversionByMonth(filteredLeads, 6),
    [filteredLeads]
  );

  const revenueTrend = useMemo(
    () => getRevenueByMonth(filteredLeads, 6),
    [filteredLeads]
  );

  const sourceStats = useMemo(
    () => getLeadSourceStats(filteredLeads),
    [filteredLeads]
  );

  // ------------------------------------------------------------------
  // 4. Widget data — velocity, forecast, performers, heatmap
  // ------------------------------------------------------------------
  const salesVelocity = useMemo(
    () => getSalesVelocity(filteredLeads),
    [filteredLeads]
  );

  const forecast = useMemo(
    () => getForecastRevenue(filteredLeads),
    [filteredLeads]
  );

  const topPerformers = useMemo(
    () => getTopPerformers(filteredLeads),
    [filteredLeads]
  );

  // Heatmap always shows last 84 days of ALL leads (not date-range-filtered)
  // so the grid is always full regardless of the active filter.
  const heatmapData = useMemo(
    () => getActivityHeatmapData(leads),
    [leads]
  );

  // ------------------------------------------------------------------
  // 5. Aggregate and return
  // ------------------------------------------------------------------
  return {
    // Scalars
    ...kpis,

    // Chart arrays
    statusDist,
    funnelData,
    monthlyLeads,
    conversionTrend,
    revenueTrend,
    sourceStats,

    // Widget objects
    salesVelocity,
    forecast,
    topPerformers,
    heatmapData,

    // Convenience flags
    isEmpty: leads.length === 0,
    isFilteredEmpty: filteredLeads.length === 0,
    filteredCount: filteredLeads.length,
  };
}

export default useAnalytics;
