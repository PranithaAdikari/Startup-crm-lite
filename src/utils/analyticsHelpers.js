/**
 * @fileoverview analyticsHelpers — Pure analytics computation functions.
 *
 * All functions are:
 *  - Pure (same input → same output, no side effects)
 *  - Memoization-friendly (safe to wrap with useMemo)
 *  - Defensively null-safe (handle missing/undefined fields gracefully)
 *  - Compatible with leads whose `value` field is either a number or a
 *    locale-formatted string such as '₹8,75,000' or '$25,000'.
 *
 * @module analyticsHelpers
 */

import { parseNumericValue } from './helpers';
import { STATUS_COLORS, FUNNEL_COLORS, CHART_COLORS } from '../constants/analyticsColors';

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/** Ordered pipeline stage names (index = stage depth, higher = further along). */
const STAGE_ORDER = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won'];

/** Maps a date-range string key to the number of days to look back. */
const DATE_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  year: 365,
  all: null,
};

// ---------------------------------------------------------------------------
// Formatting helpers (exported for use in components)
// ---------------------------------------------------------------------------

/**
 * Formats a number as Indian Rupee currency (e.g. 875000 → "₹8,75,000").
 *
 * @param {number} value - Numeric rupee amount.
 * @returns {string} Formatted currency string.
 */
export function formatINR(value) {
  if (!value && value !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a large number compactly (e.g. 8750000 → "₹87.5L").
 *
 * @param {number} value - Numeric rupee amount.
 * @returns {string} Compact currency string.
 */
export function formatINRCompact(value) {
  if (!value && value !== 0) return '₹0';
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)}K`;
  return `₹${Math.round(value)}`;
}

// ---------------------------------------------------------------------------
// Date-range filtering
// ---------------------------------------------------------------------------

/**
 * Returns leads whose `createdAt` falls within the specified date range.
 *
 * @param {Object[]} leads - Full leads array.
 * @param {'7d'|'30d'|'90d'|'year'|'all'} dateRange - Range key.
 * @returns {Object[]} Filtered subset of leads.
 */
export function filterLeadsByDateRange(leads, dateRange = 'all') {
  if (!leads || leads.length === 0) return [];
  const days = DATE_RANGE_DAYS[dateRange] ?? null;
  if (!days) return leads; // 'all' — no filter
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return leads.filter((lead) => {
    const created = lead.createdAt ? new Date(lead.createdAt) : null;
    return created && created >= cutoff;
  });
}

/**
 * Returns leads from the previous equivalent period (for growth comparison).
 * E.g. for '30d', returns leads from 60 days ago to 30 days ago.
 *
 * @param {Object[]} leads - Full leads array.
 * @param {'7d'|'30d'|'90d'|'year'|'all'} dateRange - Current range key.
 * @returns {Object[]} Previous-period leads.
 */
export function getPreviousPeriodLeads(leads, dateRange = 'all') {
  if (!leads || leads.length === 0) return [];
  const days = DATE_RANGE_DAYS[dateRange] ?? null;
  if (!days) return leads;
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - days);
  return leads.filter((lead) => {
    const created = lead.createdAt ? new Date(lead.createdAt) : null;
    return created && created >= prevStart && created < currentStart;
  });
}

// ---------------------------------------------------------------------------
// Period growth
// ---------------------------------------------------------------------------

/**
 * Computes the percentage change between two values.
 *
 * @param {number} current - Current period value.
 * @param {number} previous - Previous period value.
 * @returns {number} Rounded percentage change (positive = growth).
 */
export function getPeriodGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ---------------------------------------------------------------------------
// KPI computations
// ---------------------------------------------------------------------------

/**
 * Computes total pipeline value (sum of all non-Lost lead values).
 *
 * @param {Object[]} leads
 * @returns {number}
 */
export function getPipelineValue(leads) {
  if (!leads || leads.length === 0) return 0;
  return leads
    .filter((l) => l.status !== 'Lost')
    .reduce((sum, l) => sum + parseNumericValue(l.value), 0);
}

/**
 * Computes total Won revenue (sum of Won lead values).
 *
 * @param {Object[]} leads
 * @returns {number}
 */
export function getWonRevenue(leads) {
  if (!leads || leads.length === 0) return 0;
  return leads
    .filter((l) => l.status === 'Won')
    .reduce((sum, l) => sum + parseNumericValue(l.value), 0);
}

/**
 * Computes conversion rate as a 0–100 percentage.
 *
 * @param {Object[]} leads
 * @returns {number}
 */
export function getConversionRate(leads) {
  if (!leads || leads.length === 0) return 0;
  const won = leads.filter((l) => l.status === 'Won').length;
  return Math.round((won / leads.length) * 100);
}

/**
 * Computes lost rate as a 0–100 percentage.
 *
 * @param {Object[]} leads
 * @returns {number}
 */
export function getLostRate(leads) {
  if (!leads || leads.length === 0) return 0;
  const lost = leads.filter((l) => l.status === 'Lost').length;
  return Math.round((lost / leads.length) * 100);
}

/**
 * Computes the average sales cycle length in days.
 * Uses `wonAt` if available; falls back to using `createdAt` as both endpoints
 * (resulting in 0 days) so the average is never NaN.
 *
 * @param {Object[]} leads
 * @returns {number} Average days rounded to nearest integer, or 0 if no Won leads.
 */
export function getAverageSalesCycle(leads) {
  if (!leads || leads.length === 0) return 0;
  const wonLeads = leads.filter((l) => l.status === 'Won' && l.createdAt);
  if (wonLeads.length === 0) return 0;
  const totalDays = wonLeads.reduce((sum, l) => {
    const start = new Date(l.createdAt);
    const end = l.wonAt ? new Date(l.wonAt) : new Date();
    const days = Math.max(0, Math.round((end - start) / 86_400_000));
    return sum + days;
  }, 0);
  return Math.round(totalDays / wonLeads.length);
}

// ---------------------------------------------------------------------------
// Status / Pie chart
// ---------------------------------------------------------------------------

/**
 * Builds the status distribution array for the Pie/Doughnut chart.
 *
 * @param {Object[]} leads
 * @returns {Array<{name: string, value: number, color: string}>}
 */
export function getStatusDistribution(leads) {
  if (!leads || leads.length === 0) return [];
  const counts = {};
  leads.forEach((l) => {
    counts[l.status] = (counts[l.status] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#94A3B8',
      percentage: Math.round((value / leads.length) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Funnel chart
// ---------------------------------------------------------------------------

/**
 * Returns cumulative funnel stage counts.
 * Each stage shows how many leads have progressed TO or BEYOND that stage.
 * Lost leads are counted at "New" (they entered the funnel but did not progress).
 *
 * @param {Object[]} leads
 * @returns {Array<{name: string, value: number, fill: string}>}
 */
export function getFunnelData(leads) {
  if (!leads || leads.length === 0) return [];

  const stageIndex = (status) => {
    const idx = STAGE_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx; // 'Lost' → 0 (New level)
  };

  const stageLabels = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won'];

  return STAGE_ORDER.map((stage, idx) => ({
    name: stageLabels[idx],
    fullName: stage,
    value: leads.filter((l) => stageIndex(l.status) >= idx).length,
    fill: FUNNEL_COLORS[idx],
  }));
}

// ---------------------------------------------------------------------------
// Monthly trends
// ---------------------------------------------------------------------------

/**
 * Builds monthly lead-count data for the last N months.
 *
 * @param {Object[]} leads
 * @param {number} [months=6]
 * @returns {Array<{month: string, leads: number, fullDate: string}>}
 */
export function getMonthlyLeads(leads, months = 6) {
  const now = new Date();
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const count = (leads || []).filter((lead) => {
      if (!lead.createdAt) return false;
      const c = new Date(lead.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    }).length;
    result.push({ month: label, leads: count, fullDate: d.toISOString() });
  }
  return result;
}

/**
 * Builds monthly conversion-rate data for the last N months.
 *
 * @param {Object[]} leads
 * @param {number} [months=6]
 * @returns {Array<{month: string, rate: number}>}
 */
export function getConversionByMonth(leads, months = 6) {
  const now = new Date();
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const monthLeads = (leads || []).filter((lead) => {
      if (!lead.createdAt) return false;
      const c = new Date(lead.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    });
    const won = monthLeads.filter((l) => l.status === 'Won').length;
    const rate = monthLeads.length > 0 ? Math.round((won / monthLeads.length) * 100) : 0;
    result.push({ month: label, rate });
  }
  return result;
}

/**
 * Builds monthly won-revenue data for the last N months.
 *
 * @param {Object[]} leads
 * @param {number} [months=6]
 * @returns {Array<{month: string, revenue: number}>}
 */
export function getRevenueByMonth(leads, months = 6) {
  const now = new Date();
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const revenue = (leads || [])
      .filter((lead) => {
        if (lead.status !== 'Won' || !lead.createdAt) return false;
        const c = new Date(lead.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      })
      .reduce((sum, l) => sum + parseNumericValue(l.value), 0);
    result.push({ month: label, revenue });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Lead source analytics
// ---------------------------------------------------------------------------

/**
 * Groups and sorts leads by acquisition source.
 *
 * @param {Object[]} leads
 * @returns {Array<{source: string, count: number, color: string}>}
 */
export function getLeadSourceStats(leads) {
  if (!leads || leads.length === 0) return [];
  const counts = {};
  leads.forEach((l) => {
    const src = l.source || 'Unknown';
    counts[src] = (counts[src] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([source, count], idx) => ({
      source,
      count,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Sales velocity
// ---------------------------------------------------------------------------

/**
 * Computes sales velocity in ₹/day.
 * Formula: (Opportunities × WinRate × AvgDealSize) / AvgSalesCycleDays
 *
 * @param {Object[]} leads
 * @returns {{ value: number, opportunities: number, winRate: number, avgDeal: number, cycle: number }}
 */
export function getSalesVelocity(leads) {
  if (!leads || leads.length === 0) {
    return { value: 0, opportunities: 0, winRate: 0, avgDeal: 0, cycle: 0 };
  }
  const opportunities = leads.filter(
    (l) => l.status !== 'Lost' && l.status !== 'Won'
  ).length;
  const winRate = leads.length > 0 ? leads.filter((l) => l.status === 'Won').length / leads.length : 0;
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const avgDeal =
    wonLeads.length > 0
      ? wonLeads.reduce((s, l) => s + parseNumericValue(l.value), 0) / wonLeads.length
      : 0;
  const cycle = Math.max(getAverageSalesCycle(leads), 1); // avoid div/0
  const velocity = (opportunities * winRate * avgDeal) / cycle;
  return { value: Math.round(velocity), opportunities, winRate, avgDeal, cycle };
}

// ---------------------------------------------------------------------------
// Revenue forecast
// ---------------------------------------------------------------------------

/**
 * Predicts next-month revenue using the average of the last 6 months of Won revenue.
 * Confidence score scales with the number of data-rich months (months with > 0 revenue).
 *
 * @param {Object[]} leads
 * @returns {{ nextMonth: number, avgMonthly: number, confidence: number, trend: number }}
 */
export function getForecastRevenue(leads) {
  const monthlyData = getRevenueByMonth(leads, 6);
  const nonZero = monthlyData.filter((m) => m.revenue > 0);
  const avg =
    nonZero.length > 0
      ? Math.round(nonZero.reduce((s, m) => s + m.revenue, 0) / nonZero.length)
      : 0;

  // Trend: compare last 3 months vs first 3 months of the window
  const first3 = monthlyData.slice(0, 3).reduce((s, m) => s + m.revenue, 0) / 3;
  const last3 = monthlyData.slice(3).reduce((s, m) => s + m.revenue, 0) / 3;
  const trend = first3 > 0 ? Math.round(((last3 - first3) / first3) * 100) : 0;

  // Confidence: scale 40–95% based on data richness
  const confidence = Math.min(40 + nonZero.length * 10, 95);

  return { nextMonth: avg, avgMonthly: avg, confidence, trend };
}

// ---------------------------------------------------------------------------
// Top performers
// ---------------------------------------------------------------------------

/**
 * Groups Won leads by `owner` field and ranks by total Won revenue.
 * Falls back to lead.name when owner is missing.
 *
 * @param {Object[]} leads
 * @returns {Array<{name: string, revenue: number, count: number, initials: string}>}
 */
export function getTopPerformers(leads) {
  if (!leads || leads.length === 0) return [];
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const map = {};
  wonLeads.forEach((lead) => {
    const key = lead.owner || lead.name || 'Unassigned';
    if (!map[key]) map[key] = { name: key, revenue: 0, count: 0 };
    map[key].revenue += parseNumericValue(lead.value);
    map[key].count += 1;
  });
  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      initials: p.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    }));
}

// ---------------------------------------------------------------------------
// Activity heatmap
// ---------------------------------------------------------------------------

/**
 * Builds a 84-day activity grid (12 weeks × 7 days), oldest-first.
 * Activity = number of leads created or meetings scheduled on that day.
 *
 * @param {Object[]} leads
 * @returns {Array<{date: string, count: number, dayOfWeek: number}>}
 */
export function getActivityHeatmapData(leads) {
  const grid = [];
  const now = new Date();

  // Build lookup: dateStr → count
  const dateCounts = {};
  (leads || []).forEach((lead) => {
    const addCount = (isoStr) => {
      if (!isoStr) return;
      const d = isoStr.split('T')[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    };
    addCount(lead.createdAt);
    addCount(lead.meetingAt);
  });

  // Generate 84-day grid
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    grid.push({
      date: dateStr,
      count: dateCounts[dateStr] || 0,
      dayOfWeek: d.getDay(), // 0=Sun, 1=Mon … 6=Sat
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    });
  }
  return grid;
}
