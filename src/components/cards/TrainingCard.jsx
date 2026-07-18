import { Link } from 'react-router-dom';
import { FiClock, FiMonitor, FiUser } from 'react-icons/fi';
import LazyImage from '../common/LazyImage';
import Reveal from '../common/Reveal';
import { isTruthy, truncate, slugify } from '../../utils/helpers';

export default function TrainingCard({ training, delay = 0 }) {
  const id = training.trainingId || slugify(training.title);

  return (
    <Reveal delay={delay}>
      <article className="card card-hover flex h-full flex-col overflow-hidden">
        <div className="relative">
          <LazyImage src={training.image} alt={training.title} className="h-44 w-full" />
          {isTruthy(training.featured) && (
            <span className="badge absolute left-3 top-3 bg-accent-500 text-white shadow-sm">★ Popular</span>
          )}
          {training.price && (
            <span className="badge absolute bottom-3 right-3 glass font-bold text-primary-700 dark:text-primary-300">
              {training.price}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 font-semibold leading-snug text-slate-900 dark:text-white">
            <Link to={`/trainings/${id}`} className="hover:text-primary-600 transition">
              {training.title}
            </Link>
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {truncate(training.description || '', 90)}
          </p>

          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="badge bg-slate-100 dark:bg-slate-800">
              <FiClock aria-hidden="true" /> {training.duration}
            </span>
            <span className="badge bg-slate-100 dark:bg-slate-800">
              <FiMonitor aria-hidden="true" /> {training.mode}
            </span>
            {training.instructor && (
              <span className="badge bg-slate-100 dark:bg-slate-800">
                <FiUser aria-hidden="true" /> {training.instructor}
              </span>
            )}
          </div>

          <Link
            to={`/trainings/${id}`}
            className="mt-auto rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700 transition"
          >
            Enroll Now
          </Link>
        </div>
      </article>
    </Reveal>
  );
}
