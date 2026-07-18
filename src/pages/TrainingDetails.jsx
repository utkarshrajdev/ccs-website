import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiCheck, FiClock, FiMonitor, FiTag, FiUser } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getTrainings } from '../services/sheetsService';
import { slugify, splitList } from '../utils/helpers';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import LazyImage from '../components/common/LazyImage';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import TrainingCard from '../components/cards/TrainingCard';
import Reveal from '../components/common/Reveal';

export default function TrainingDetails() {
  const { trainingId } = useParams();
  const { data: trainings, loading, error, refetch } = useSheetData(getTrainings);

  const training = useMemo(
    () =>
      (trainings || []).find(
        (t) => String(t.trainingId) === String(trainingId) || slugify(t.title) === trainingId
      ),
    [trainings, trainingId]
  );

  const others = useMemo(
    () => (trainings || []).filter((t) => t !== training).slice(0, 3),
    [trainings, training]
  );

  useSeo({
    title: training?.title || 'Training Details',
    description: training?.description?.slice(0, 155),
    path: `/trainings/${trainingId}`,
    jsonLd: training
      ? {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: training.title,
          description: training.description,
          provider: { '@type': 'Organization', name: 'Champaran Consultancy Services' },
        }
      : null,
  });

  if (loading) return <Loader label="Loading training…" />;
  if (error) return <div className="container-x section"><ErrorState onRetry={refetch} /></div>;
  if (!training) {
    return (
      <div className="container-x section">
        <EmptyState title="Training not found" action={<Button to="/trainings" variant="secondary" size="sm">All trainings</Button>} />
      </div>
    );
  }

  const syllabus = splitList(training.syllabus);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Trainings', path: '/trainings' }, { label: training.title }]} />

      <div className="grid gap-8 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <article className="card overflow-hidden">
            <LazyImage src={training.image} alt={training.title} className="h-64 w-full md:h-80" />
            <div className="p-6 md:p-8">
              <h1 className="mb-4 text-2xl font-bold md:text-3xl">{training.title}</h1>

              <div className="mb-6 flex flex-wrap gap-3">
                <span className="badge bg-slate-100 dark:bg-slate-800"><FiClock aria-hidden="true" /> {training.duration}</span>
                <span className="badge bg-slate-100 dark:bg-slate-800"><FiMonitor aria-hidden="true" /> {training.mode}</span>
                {training.instructor && <span className="badge bg-slate-100 dark:bg-slate-800"><FiUser aria-hidden="true" /> {training.instructor}</span>}
                {training.price && <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"><FiTag aria-hidden="true" /> {training.price}</span>}
              </div>

              <p className="mb-8 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
                {training.description}
              </p>

              {syllabus.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-3 text-lg font-bold">What You'll Learn</h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {syllabus.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                        <FiCheck className="mt-1 shrink-0 text-primary-600" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Button to="/contact" size="lg">Enroll Now</Button>
            </div>
          </article>
        </Reveal>

        <aside aria-label="Other trainings">
          <h2 className="mb-4 text-lg font-bold">Other Trainings</h2>
          <div className="space-y-4">
            {others.map((t, i) => (
              <TrainingCard key={t.trainingId || i} training={t} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
