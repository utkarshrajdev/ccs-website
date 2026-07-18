import { Link } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiClock, FiMapPin, FiShare2 } from 'react-icons/fi';
import LazyImage from '../common/LazyImage';
import Reveal from '../common/Reveal';
import { timeAgo, isTruthy } from '../../utils/helpers';
import { SITE } from '../../utils/constants';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useToast } from '../common/Toast';

export default function JobCard({ job, delay = 0 }) {
  const [bookmarks, setBookmarks] = useLocalStorage('ccs-bookmarked-jobs', []);
  const showToast = useToast();
  const bookmarked = bookmarks.includes(job.jobId);

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(job.jobId) ? prev.filter((id) => id !== job.jobId) : [...prev, job.jobId]
    );
    showToast(bookmarked ? 'Bookmark removed' : 'Job bookmarked', 'info');
  };

  const shareJob = async () => {
    const url = `${SITE.url || window.location.origin}/jobs/${job.jobId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, url });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(url);
    showToast('Job link copied');
  };

  return (
    <Reveal delay={delay}>
      <article className="card card-hover relative flex h-full flex-col p-5">
        {isTruthy(job.featured) && (
          <span className="badge absolute -top-2.5 left-5 bg-accent-500 text-white shadow-sm">
            ★ Featured
          </span>
        )}

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <LazyImage
              src={job.companyLogo}
              alt={`${job.company} logo`}
              className="h-12 w-12 shrink-0 rounded-xl"
            />
            <div>
              <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">
                <Link to={`/jobs/${job.jobId}`} className="hover:text-primary-600 transition">
                  {job.title}
                </Link>
              </h3>
              <p className="text-sm text-slate-500">{job.company}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={toggleBookmark}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark job'}
              aria-pressed={bookmarked}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                bookmarked ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/40' : 'text-slate-400 hover:text-primary-600'
              }`}
            >
              <FiBookmark aria-hidden="true" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={shareJob}
              aria-label="Share job"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 transition"
            >
              <FiShare2 aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="badge bg-slate-100 dark:bg-slate-800">
            <FiMapPin aria-hidden="true" /> {job.location}
          </span>
          <span className="badge bg-slate-100 dark:bg-slate-800">
            <FiBriefcase aria-hidden="true" /> {job.experience}
          </span>
          {job.jobType && <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{job.jobType}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div>
            <p className="text-sm font-bold text-primary-700 dark:text-primary-300">{job.salary}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <FiClock aria-hidden="true" /> {timeAgo(job.postedDate)}
            </p>
          </div>
          <Link
            to={`/jobs/${job.jobId}`}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
          >
            Apply
          </Link>
        </div>
      </article>
    </Reveal>
  );
}
