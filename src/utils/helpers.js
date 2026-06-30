/**
 * CRM Utility Functions
 * Shared helper functions for formatting, parsing, and working with CRM data.
 */

/**
 * Parses a numeric value from a lead's budget string.
 * Strips all non-numeric characters (except period and minus sign) before parsing.
 *
 * @param {string|number|null|undefined} val - Raw value to parse.
 * @returns {number} Extracted numeric value, or 0 if parsing fails.
 */
export const parseNumericValue = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.-]+/g, '')) || 0;
};

/**
 * Formats a numeric value into a USD currency string.
 *
 * @param {number} val - Numeric value to format.
 * @returns {string} Formatted currency string (e.g. "$8,420").
 */
export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

/**
 * Formats an ISO date string into a short human-readable format.
 *
 * @param {string|null|undefined} dateStr - ISO 8601 date string.
 * @returns {string} Formatted date (e.g. "Jun 20, 2026") or "N/A" if invalid.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Extracts the first two uppercase initials from a full name string.
 *
 * @param {string} name - Full name to process.
 * @returns {string} Up to two uppercase initials.
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generates a unique identifier string.
 * Uses the Web Crypto API (randomUUID) when available, with a timestamp fallback.
 *
 * @param {string} [prefix='id'] - Optional prefix added before the generated ID.
 * @returns {string} A unique identifier string.
 */
export const generateId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Truncates a string to the specified length and appends an ellipsis if needed.
 *
 * @param {string} str - The string to truncate.
 * @param {number} [maxLength=40] - Maximum character length before truncation.
 * @returns {string} The truncated string or original if within limit.
 */
export const truncateText = (str, maxLength = 40) => {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

/**
 * Debounces a function, delaying its execution until after a wait period.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} [delay=300] - Delay in milliseconds.
 * @returns {Function} A debounced version of the provided function.
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
