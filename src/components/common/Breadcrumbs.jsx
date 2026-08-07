import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/** items: [{ label, path? }] - last item is the current page. */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li>
          <Link to="/" className="hover:text-primary-600 transition">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <FiChevronRight className="text-slate-400" aria-hidden="true" />
            {item.path ? (
              <Link to={item.path} className="hover:text-primary-600 transition">{item.label}</Link>
            ) : (
              <span aria-current="page" className="font-medium text-slate-900 dark:text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
