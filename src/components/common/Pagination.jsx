import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { scrollToTop } from '../../utils/helpers';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const go = (p) => {
    onChange(Math.min(Math.max(1, p), totalPages));
    scrollToTop();
  };

  // Compact page window: 1 … 4 5 6 … 12
  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:border-primary-400 transition"
      >
        <FiChevronLeft aria-hidden="true" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-slate-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-10 min-w-10 rounded-xl px-3 text-sm font-medium transition ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 hover:border-primary-400'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:border-primary-400 transition"
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
