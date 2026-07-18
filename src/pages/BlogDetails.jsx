import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiCalendar, FiCopy, FiUser } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getBlogs } from '../services/sheetsService';
import { formatDate } from '../utils/helpers';
import { SITE } from '../utils/constants';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import LazyImage from '../components/common/LazyImage';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import BlogCard from '../components/cards/BlogCard';
import Reveal from '../components/common/Reveal';
import { useToast } from '../components/common/Toast';

export default function BlogDetails() {
  const { slug } = useParams();
  const { data: blogs, loading, error, refetch } = useSheetData(getBlogs);
  const showToast = useToast();

  const blog = useMemo(() => (blogs || []).find((b) => b.slug === slug), [blogs, slug]);
  const recent = useMemo(
    () => (blogs || []).filter((b) => b.slug !== slug).slice(0, 3),
    [blogs, slug]
  );

  useSeo({
    title: blog?.title || 'Blog',
    description: blog?.excerpt?.slice(0, 155),
    path: `/blog/${slug}`,
    image: blog?.image,
    jsonLd: blog
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blog.title,
          image: blog.image,
          author: { '@type': 'Person', name: blog.author },
          datePublished: blog.date,
          description: blog.excerpt,
        }
      : null,
  });

  if (loading) return <Loader label="Loading article…" />;
  if (error) return <div className="container-x section"><ErrorState onRetry={refetch} /></div>;
  if (!blog) {
    return (
      <div className="container-x section">
        <EmptyState title="Article not found" action={<Button to="/blog" variant="secondary" size="sm">All articles</Button>} />
      </div>
    );
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${SITE.url || window.location.origin}/blog/${slug}`);
    showToast('Link copied');
  };

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }, { label: blog.title }]} />

      <Reveal>
        <article className="mx-auto max-w-3xl">
          {blog.category && (
            <span className="badge mb-4 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {blog.category}
            </span>
          )}
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">{blog.title}</h1>
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><FiUser aria-hidden="true" /> {blog.author}</span>
            <span className="flex items-center gap-1.5"><FiCalendar aria-hidden="true" /> {formatDate(blog.date)}</span>
            <button type="button" onClick={copyLink} className="flex items-center gap-1.5 hover:text-primary-600 transition" aria-label="Copy article link">
              <FiCopy aria-hidden="true" /> Copy link
            </button>
          </div>

          <LazyImage src={blog.image} alt={blog.title} className="mb-8 h-64 w-full rounded-2xl md:h-96" />

          <div className="prose-slate whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
            {blog.content}
          </div>
        </article>
      </Reveal>

      {recent.length > 0 && (
        <section className="mt-16" aria-label="Recent posts">
          <h2 className="mb-6 text-2xl font-bold">Recent Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b, i) => (
              <BlogCard key={b.slug || i} blog={b} delay={i * 0.05} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
