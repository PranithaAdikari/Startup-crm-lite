import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle Component
 * Animated toggle switch with sun/moon icons for switching between light and dark modes.
 * Reads and writes theme state via ThemeContext. Uses Tailwind transitions for smooth animation.
 *
 * @returns {React.ReactElement} The rendered DarkModeToggle component.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-1 py-1 w-[72px] h-9 rounded-full border border-border-accent bg-bg-canvas/80 dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/40"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* Sun icon (visible in light mode) */}
      <span
        className={`absolute left-1.5 flex items-center justify-center w-6 h-6 transition-all duration-300 ${
          isDarkMode ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
        }`}
      >
        <Sun className="w-4 h-4 text-amber-500" />
      </span>

      {/* Moon icon (visible in dark mode) */}
      <span
        className={`absolute right-1.5 flex items-center justify-center w-6 h-6 transition-all duration-300 ${
          isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
        }`}
      >
        <Moon className="w-4 h-4 text-blue-400" />
      </span>

      {/* Sliding thumb indicator */}
      <span
        className={`absolute top-1 w-7 h-7 rounded-full bg-white dark:bg-gray-700 shadow-md border border-border-accent/50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode ? 'left-[calc(100%-32px)]' : 'left-1'
        }`}
      />
    </button>
  );
}
