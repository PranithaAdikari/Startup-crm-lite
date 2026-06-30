/**
 * CRM Constants and Static Data Configuration
 * Centralized static data for lead statuses, sources, pipeline stages, and color mappings.
 */

/**
 * Available pipeline status options for CRM leads.
 * @type {string[]}
 */
export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

/**
 * Available acquisition source channels for CRM leads.
 * @type {string[]}
 */
export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Other',
];

/**
 * Filter options for the Lead filter bar (includes "All" catch-all).
 * @type {string[]}
 */
export const FILTER_OPTIONS = ['All', ...LEAD_STATUSES];

/**
 * Status color mapping for badges and visual indicators.
 * Maps each status string to a set of Tailwind CSS class strings (including dark mode).
 *
 * @type {Record<string, string>}
 */
export const STATUS_COLOR_MAP = {
  New: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
  Contacted: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/25',
  'Meeting Scheduled': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25',
  'Proposal Sent': 'bg-warning/10 text-warning border-warning/20 dark:bg-warning/15 dark:text-warning dark:border-warning/25',
  Won: 'bg-success/10 text-success border-success/20 dark:bg-success/15 dark:text-success dark:border-success/25',
  Lost: 'bg-danger/10 text-danger border-danger/20 dark:bg-danger/15 dark:text-danger dark:border-danger/25',
};

/**
 * Pipeline stage aggregation buckets used in the PipelineOverview component.
 * Maps canonical stage names to display labels, theme colors, and styles.
 *
 * @type {Record<string, { label: string, bg: string, text: string }>}
 */
export const PIPELINE_STAGES = {
  New: { label: 'New', bg: 'bg-success', text: 'text-success' },
  Contacted: { label: 'Contacted', bg: 'bg-primary', text: 'text-primary' },
  Proposal: { label: 'Proposal', bg: 'bg-warning', text: 'text-warning' },
  Negotiation: { label: 'Negotiation', bg: 'bg-danger', text: 'text-danger' },
};

/**
 * localStorage key used by the leads context for persistence.
 * @type {string}
 */
export const LEADS_STORAGE_KEY = 'startup-crm-leads';

/**
 * localStorage key used by the theme context for persistence.
 * @type {string}
 */
export const THEME_STORAGE_KEY = 'startup-crm-theme';

/**
 * App metadata constants used across components and HTML.
 */
export const APP_META = {
  name: 'CRM Lite',
  tagline: 'Startup CRM Lite',
  version: 'v1.0.0',
  stage: 'Beta',
  description: 'A lightweight CRM for startups to track, qualify, and convert leads.',
};
