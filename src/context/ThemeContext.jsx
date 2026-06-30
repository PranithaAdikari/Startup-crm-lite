import { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { THEME_STORAGE_KEY } from '../constants';


/**
 * ThemeContext object to provide global layout theme settings.
 */
export const ThemeContext = createContext(null);

/**
 * ThemeProvider component that manages light/dark mode states and handles DOM side effects.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be wrapped.
 * @returns {React.ReactElement} The Context Provider wrapping child nodes.
 */
export function ThemeProvider({ children }) {
  /**
   * Persistent dark-mode flag backed by localStorage.
   *
   * Initial value resolution order:
   *  1. Stored boolean from localStorage (user's explicit past choice).
   *  2. System prefers-color-scheme media query (first-time visitor).
   *  3. false (light mode) as the absolute fallback.
   *
   * The hook stores a raw boolean — no string encoding needed.
   * Falls back gracefully if localStorage is unavailable (private browsing).
   */
  const systemPrefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

  const [isDarkMode, setIsDarkMode] = useLocalStorage(
    THEME_STORAGE_KEY,
    systemPrefersDark
  );

  // Apply / remove the 'dark' class on <html> whenever isDarkMode changes.
  // This is a pure DOM side-effect and is intentionally kept separate from
  // storage concerns (which are handled inside the hook).
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to apply theme class to document root:', error);
    }
  }, [isDarkMode]);

  /**
   * Toggles the current UI theme mode between Light and Dark mode.
   *
   * @returns {void}
   */
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, [setIsDarkMode]);

  const contextValue = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume ThemeContext with safety assertion.
 * Ensures the component is wrapped under ThemeProvider.
 *
 * @throws {Error} If consumed outside of a ThemeProvider.
 * @returns {Object} Context value including theme flags and switcher triggers.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
