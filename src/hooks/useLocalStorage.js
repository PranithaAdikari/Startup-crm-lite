/**
 * @fileoverview useLocalStorage — Custom React hook for localStorage-backed state.
 *
 * Drop-in replacement for React's useState that automatically reads from and
 * writes to localStorage, giving you persistence across browser sessions with
 * an identical API surface.
 *
 * Features:
 *  - Identical API to useState: returns [storedValue, setValue]
 *  - Lazy initializer: reads localStorage only once on mount (avoids re-reads)
 *  - Functional updates: setValue(prev => next) works exactly like setState
 *  - Atomic writes: state and localStorage are updated in the same render cycle
 *  - Graceful degradation: falls back to initialValue when localStorage is
 *    unavailable (private browsing in Firefox/Safari) or JSON is corrupt
 *  - Works with any JSON-serializable type: arrays, objects, strings, numbers,
 *    booleans, and null
 *
 * @module useLocalStorage
 */

import { useState, useCallback } from 'react';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Checks whether localStorage is accessible in the current browsing context.
 * In some private/incognito modes (e.g., Firefox, older Safari) the API exists
 * but throws a SecurityError on any read/write attempt.
 *
 * @returns {boolean} `true` if localStorage can be used safely.
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__useLocalStorage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and JSON-parses a value from localStorage.
 *
 * @template T
 * @param {string} key - localStorage key to read.
 * @param {T} fallback - Value to return when the key is absent or parsing fails.
 * @returns {T} The parsed value, or `fallback`.
 */
function readFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;          // Key doesn't exist yet
    return JSON.parse(raw);                     // Key exists — parse and return
  } catch (error) {
    // JSON.parse failed (corrupted data) or localStorage threw
    console.warn(
      `[useLocalStorage] Could not read key "${key}" from localStorage. ` +
      `Falling back to initialValue.`,
      error
    );
    return fallback;
  }
}

/**
 * JSON-serializes and writes a value to localStorage.
 * Silently swallows errors so a full storage quota or SecurityError
 * never crashes the React tree.
 *
 * @param {string} key - localStorage key to write.
 * @param {*} value - Any JSON-serializable value.
 */
function writeToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Quota exceeded or access denied — log but don't crash
    console.warn(
      `[useLocalStorage] Could not write key "${key}" to localStorage. ` +
      `State is still updated in memory.`,
      error
    );
  }
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

/**
 * Custom hook that synchronises React state with a localStorage key.
 *
 * @template T
 *
 * @param {string} key
 *   The localStorage key under which the value is persisted.
 *   Use a unique, namespaced string (e.g. `'startup-crm-leads'`) to avoid
 *   collisions with other keys on the same origin.
 *
 * @param {T} initialValue
 *   The value to use when the key has never been written to localStorage
 *   (i.e. first-ever load) or when localStorage is unavailable.
 *   Accepts any JSON-serializable value — arrays, objects, strings,
 *   numbers, booleans, and null.
 *
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 *   A tuple of:
 *   - `storedValue` — the current value (mirrors React state)
 *   - `setValue` — setter that updates React state AND localStorage atomically.
 *     Accepts either a new value directly or an updater function
 *     `(prev: T) => T`, exactly like React's `useState` setter.
 *
 * @example
 * // Plain value
 * const [count, setCount] = useLocalStorage('visit-count', 0);
 * setCount(count + 1);
 *
 * @example
 * // Functional updater (safe for arrays / objects)
 * const [leads, setLeads] = useLocalStorage('startup-crm-leads', []);
 * setLeads(prev => [newLead, ...prev]);
 *
 * @example
 * // Boolean (dark mode)
 * const [isDark, setIsDark] = useLocalStorage('startup-crm-theme', false);
 * setIsDark(prev => !prev);
 */
export function useLocalStorage(key, initialValue) {
  // ------------------------------------------------------------------
  // 1. Determine whether localStorage is usable in this context.
  //    Evaluated once outside useState so the check isn't re-run on
  //    every render, yet still happens before the first read attempt.
  // ------------------------------------------------------------------
  const storageAvailable = isLocalStorageAvailable();

  // ------------------------------------------------------------------
  // 2. Lazy initialiser: read from localStorage exactly once.
  //    If storage is unavailable we skip straight to initialValue.
  // ------------------------------------------------------------------
  const [storedValue, setStoredValue] = useState(() => {
    if (!storageAvailable) {
      console.warn(
        `[useLocalStorage] localStorage is not available for key "${key}". ` +
        `State will not persist across sessions.`
      );
      return initialValue;
    }
    return readFromStorage(key, initialValue);
  });

  // ------------------------------------------------------------------
  // 3. Setter — mirrors useState's API exactly.
  //    Accepts a raw value OR an updater function (prev => next).
  //    Writes to localStorage in the same call so state and storage
  //    are always in sync without needing a separate useEffect.
  // ------------------------------------------------------------------

  /**
   * Updates the stored value in both React state and localStorage.
   *
   * @param {T | ((prev: T) => T)} valueOrUpdater
   *   New value, or a function that receives the previous value and returns
   *   the next value.
   */
  const setValue = useCallback(
    (valueOrUpdater) => {
      try {
        setStoredValue((prev) => {
          // Resolve updater function or plain value
          const nextValue =
            typeof valueOrUpdater === 'function'
              ? valueOrUpdater(prev)
              : valueOrUpdater;

          // Persist to localStorage (no-op if storage is unavailable)
          if (storageAvailable) {
            writeToStorage(key, nextValue);
          }

          return nextValue;
        });
      } catch (error) {
        // setStoredValue itself should never throw, but guard anyway
        console.error(
          `[useLocalStorage] Unexpected error setting key "${key}":`,
          error
        );
      }
    },
    [key, storageAvailable]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
