import { useMemo, useState } from 'react';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import useDebounce from '../hooks/useDebounce';
import { getBlogs } from '../services/sheetsService';
import { unique } from '../utils/helpers';
import { BLOGS_PER_PAGE } from '../utils/constants';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SearchBox from '../components/common/SearchBox';
import Pagination from '../components/common/Pagination';
import BlogCard from '../components/cards/BlogCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export default function Blog() {
  useSeo({ title: 'Blog & Career Tips', description: 'Career advice, industry insights and success guides from the CCS team.', path: '/blog' });

  const { data: blogs, loading, error, refetch } = useSheetData(getBlogs);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query);

  const sorted = useMemo(
    () => [...(blogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [blogs]
  );
  const categories = unique(sorted.map((b) => b.category));
  const featured = !debouncedQuery && !category ? sorted[0] : null;

  const filtered = useMemo(
    () =>
      sorted.filter((b) => {
        const q = debouncedQuery.toLowerCase();
        return (
          (!q || [b.title, b.excerpt, b.author].some((f) => String(f || '').toLowerCase().includes(q))) &&
          (!category || b.category === category) &&
          b !== featured
        );
      }),
    [sorted, debouncedQuery, category, featured]
  );

  const totalPages = Math.ceil(filtered.length / BLOGS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice((currentPage - 1) * BLOGS_PER_PAGE, currentPage * BLOGS_PER_PAGE);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Blog' }]} />
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Blog & Career Tips</h1>
        <p className="text-slate-500">Insights to help you learn, grow and get hired.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search articles…" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => { setCategory(''); setPage(1); }}
            className={`badge px-3.5 py-1.5 transition ${!category ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary-50'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCategory(c === category ? '' : c); setPage(1); }}
              aria-pressed={c === category}
              className={`badge px-3.5 py-1.5 transition ${c === category ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState onRetry={refetch} />}
      {!loading && !error && paginated.length === 0 && !featured && (
        <EmptyState title="No articles found" message="Try a different search or category." />
      )}

      {!loading && !error && (
        <>
          {featured && (
            <div className="mb-8">
              <BlogCard blog={featured} featured />
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((blog, i) => (
              <BlogCard key={blog.slug || i} blog={blog} delay={i * 0.05} />
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
