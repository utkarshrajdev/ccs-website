import { Link } from 'react-router-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import LazyImage from '../common/LazyImage';
import Reveal from '../common/Reveal';
import { formatDate, truncate } from '../../utils/helpers';

export default function BlogCard({ blog, delay = 0, featured = false }) {
  return (
    <Reveal delay={delay}>
      <article className={`card card-hover flex h-full flex-col overflow-hidden ${featured ? 'lg:flex-row' : ''}`}>
        <LazyImage
          src={blog.image}
          alt={blog.title}
          className={featured ? 'h-56 lg:h-auto lg:w-1/2' : 'h-44 w-full'}
        />
        <div className="flex flex-1 flex-col p-5">
          {blog.category && (
            <span className="badge mb-3 w-fit bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {blog.category}
            </span>
          )}
          <h3 className={`mb-2 font-semibold leading-snug text-slate-900 dark:text-white ${featured ? 'text-xl' : ''}`}>
            <Link to={`/blog/${blog.slug}`} className="hover:text-primary-600 transition">
              {blog.title}
            </Link>
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {truncate(blog.excerpt || '', featured ? 180 : 100)}
          </p>
          <div className="mt-auto flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <FiUser aria-hidden="true" /> {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar aria-hidden="true" /> {formatDate(blog.date)}
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
