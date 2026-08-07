import { useMemo, useState } from 'react';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import useDebounce from '../hooks/useDebounce';
import { getTrainings } from '../services/sheetsService';
import { unique } from '../utils/helpers';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SearchBox from '../components/common/SearchBox';
import FilterSelect from '../components/common/FilterSelect';
import TrainingCard from '../components/cards/TrainingCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export default function Trainings() {
  useSeo({ title: 'Professional Trainings', description: 'Industry-ready training programs - online and classroom - taught by experienced mentors.', path: '/trainings' });

  const { data: trainings, loading, error, refetch } = useSheetData(getTrainings);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('');
  const debouncedQuery = useDebounce(query);

  const modes = unique((trainings || []).map((t) => t.mode));

  const filtered = useMemo(
    () =>
      (trainings || []).filter((t) => {
        const q = debouncedQuery.toLowerCase();
        return (
          (!q || [t.title, t.instructor, t.description].some((f) => String(f || '').toLowerCase().includes(q))) &&
          (!mode || t.mode === mode)
        );
      }),
    [trainings, debouncedQuery, mode]
  );

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Trainings' }]} />
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Professional Trainings</h1>
        <p className="text-slate-500">Practical programs designed to make you job-ready.</p>
      </div>

      <div className="card mb-8 grid gap-4 p-5 md:grid-cols-[1fr_200px]">
        <SearchBox value={query} onChange={setQuery} placeholder="Search trainings…" />
        <FilterSelect label="Mode" value={mode} onChange={setMode} options={modes} />
      </div>

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState onRetry={refetch} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No trainings found" message="Try a different search or check back soon." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TrainingCard key={t.trainingId || i} training={t} delay={i * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}
