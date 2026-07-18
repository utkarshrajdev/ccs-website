import { useMemo, useState } from 'react';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import useDebounce from '../hooks/useDebounce';
import { getJobs } from '../services/sheetsService';
import { isTruthy, toNumber, unique } from '../utils/helpers';
import { JOBS_PER_PAGE } from '../utils/constants';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SearchBox from '../components/common/SearchBox';
import FilterSelect from '../components/common/FilterSelect';
import Pagination from '../components/common/Pagination';
import JobCard from '../components/cards/JobCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import Button from '../components/common/Button';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'salary-high', label: 'Salary: high to low' },
  { value: 'title', label: 'Title A–Z' },
];

export default function Jobs() {
  useSeo({ title: 'Job Openings', description: 'Browse verified job openings across categories, locations and experience levels.', path: '/jobs' });

  const { data: jobs, loading, error, refetch } = useSheetData(getJobs);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [salaryBand, setSalaryBand] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query);

  const activeJobs = useMemo(
    () => (jobs || []).filter((j) => isTruthy(j.status ?? 'active')),
    [jobs]
  );

  const categories = unique(activeJobs.map((j) => j.category));
  const locations = unique(activeJobs.map((j) => j.location));
  const experiences = unique(activeJobs.map((j) => j.experience));
  const titles = unique(activeJobs.map((j) => j.title));

  const filtered = useMemo(() => {
    let list = activeJobs.filter((job) => {
      const q = debouncedQuery.toLowerCase();
      const matchesQuery =
        !q ||
        [job.title, job.company, job.category, job.location].some((f) =>
          String(f || '').toLowerCase().includes(q)
        );
      const salary = toNumber(job.salary);
      const matchesSalary =
        !salaryBand ||
        (salaryBand === '0-3' && salary <= 300000) ||
        (salaryBand === '3-6' && salary > 300000 && salary <= 600000) ||
        (salaryBand === '6-10' && salary > 600000 && salary <= 1000000) ||
        (salaryBand === '10+' && salary > 1000000);
      return (
        matchesQuery &&
        (!category || job.category === category) &&
        (!location || job.location === location) &&
        (!experience || job.experience === experience) &&
        matchesSalary
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.postedDate) - new Date(b.postedDate);
        case 'salary-high':
          return toNumber(b.salary) - toNumber(a.salary);
        case 'title':
          return String(a.title).localeCompare(String(b.title));
        default:
          return new Date(b.postedDate) - new Date(a.postedDate);
      }
    });
    return list;
  }, [activeJobs, debouncedQuery, category, location, experience, salaryBand, sort]);

  const totalPages = Math.ceil(filtered.length / JOBS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paginated = filtered.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const resetFilters = () => {
    setQuery('');
    setCategory('');
    setLocation('');
    setExperience('');
    setSalaryBand('');
    setPage(1);
  };

  const applyFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Jobs' }]} />
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Job Openings</h1>
        <p className="text-slate-500">
          {loading ? 'Loading openings…' : `${filtered.length} opportunities waiting for you`}
        </p>
      </div>

      {/* Search + filters */}
      <div className="card mb-8 p-5">
        <div className="mb-4">
          <SearchBox
            value={query}
            onChange={applyFilter(setQuery)}
            placeholder="Search by title, company or keyword…"
            suggestions={titles}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <FilterSelect label="Category" value={category} onChange={applyFilter(setCategory)} options={categories} />
          <FilterSelect label="Location" value={location} onChange={applyFilter(setLocation)} options={locations} />
          <FilterSelect label="Experience" value={experience} onChange={applyFilter(setExperience)} options={experiences} />
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            Salary (₹ per year)
            <select value={salaryBand} onChange={(e) => applyFilter(setSalaryBand)(e.target.value)} className="input text-sm" aria-label="Salary range">
              <option value="">Any</option>
              <option value="0-3">Up to 3 LPA</option>
              <option value="3-6">3 – 6 LPA</option>
              <option value="6-10">6 – 10 LPA</option>
              <option value="10+">10+ LPA</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input text-sm" aria-label="Sort jobs">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Results */}
      {loading && <SkeletonGrid count={6} withImage={false} lines={4} />}
      {error && <ErrorState onRetry={refetch} />}
      {!loading && !error && paginated.length === 0 && (
        <EmptyState
          title="No jobs match your filters"
          message="Try adjusting your search or clearing the filters."
          action={<Button variant="secondary" size="sm" onClick={resetFilters}>Clear filters</Button>}
        />
      )}
      {!loading && !error && paginated.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((job, i) => (
              <JobCard key={job.jobId || i} job={job} delay={i * 0.04} />
            ))}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
