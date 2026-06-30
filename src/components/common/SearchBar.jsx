import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * @typedef {Object} SearchBarProps
 * @property {string} value - The parent state search query.
 * @property {(val: string) => void} onChange - Callback triggered with the debounced search value.
 * @property {string} [placeholder] - Customizable placeholder text.
 */

/**
 * SearchBar Component
 * Renders an accessible, debounced search input with dynamic clear buttons.
 *
 * @param {SearchBarProps} props - Component props.
 * @returns {React.ReactElement} The rendered SearchBar component.
 */
export default function SearchBar({ value, onChange, placeholder = 'Search by name, company, or email...' }) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const isInitialMount = useRef(true);

  if (value !== prevValue) {
    setLocalValue(value);
    setPrevValue(value);
  }

  // Handle debouncing inside an effect triggered on localValue updates
  useEffect(() => {
    // Skip firing onChange on the initial mounting phase
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange(''); // Immediately update parent state on click clear
  };

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub/70 pointer-events-none" />

      {/* Controlled text input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border-accent bg-bg-canvas/50 text-text-main placeholder-text-sub/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
      />

      {/* Clear button (X) */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-sub/60 hover:text-text-main hover:bg-bg-canvas rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
