import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBox({ value, onChange, placeholder = 'Search…', suggestions = [], onSelect }) {
  const matched =
    value && suggestions.length
      ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()).slice(0, 5)
      : [];

  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input pl-11 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <FiX aria-hidden="true" />
        </button>
      )}
      {matched.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-card">
          {matched.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-slate-800"
                onClick={() => (onSelect ? onSelect(s) : onChange(s))}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
