/**
 * @fileoverview analyticsColors — Centralized color palette for the Analytics Dashboard.
 *
 * All Recharts SVG fill/stroke props must use these hex values directly because
 * SVG attributes cannot reference CSS custom properties at paint time.
 * The UI card elements use Tailwind CSS variables which DO adapt to dark mode.

 */

/**
 * Pipeline status colors used in PieChart, FunnelChart, and status badges.
 * Matches the CRM pipeline stage vocabulary exactly.
 *
 * @type {Record<string, string>}
 */
export const STATUS_COLORS = {
  New: '#94A3B8',
  Contacted: '#2563EB',
  'Meeting Scheduled': '#F59E0B',
  'Proposal Sent': '#7C3AED',
  Won: '#22C55E',
  Lost: '#EF4444',
};

/**
 * Sequential palette for multi-series charts (bar, line, area).
 * Ordered by visual priority — primary, success, warning, etc.
 *
 * @type {string[]}
 */
export const CHART_COLORS = [
  '#2563EB', // primary blue
  '#22C55E', // success green
  '#F59E0B', // warning amber
  '#7C3AED', // violet
  '#EF4444', // danger red
  '#94A3B8', // slate
  '#06B6D4', // cyan
  '#F97316', // orange
];

/**
 * Funnel stage colors — ordered from widest (top) to narrowest (bottom).
 * @type {string[]}
 */
export const FUNNEL_COLORS = [
  '#94A3B8', // New — slate
  '#2563EB', // Contacted — blue
  '#F59E0B', // Meeting — amber
  '#7C3AED', // Proposal — violet
  '#22C55E', // Won — green
];

/**
 * Revenue / area chart stroke and gradient colors.
 */
export const REVENUE_COLOR = '#22C55E';
export const REVENUE_GRADIENT_START = 'rgba(34, 197, 94, 0.25)';
export const REVENUE_GRADIENT_END = 'rgba(34, 197, 94, 0.00)';

/**
 * Conversion line chart color.
 */
export const CONVERSION_COLOR = '#2563EB';

/**
 * Leads bar chart color.
 */
export const LEADS_BAR_COLOR = '#2563EB';
