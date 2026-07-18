import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiBriefcase, FiCheck, FiClock, FiCopy, FiDollarSign, FiMapPin, FiShare2 } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import useLocalStorage from '../hooks/useLocalStorage';
import { getJobs } from '../services/sheetsService';
import { formatDate, splitList } from '../utils/helpers';
import { SITE } from '../utils/constants';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import LazyImage from '../components/common/LazyImage';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import JobCard from '../components/cards/JobCard';
import Reveal from '../components/common/Reveal';
import { useToast } from '../components/common/Toast';

export default function JobDetails() {
  const { jobId } = useParams();
  const { data: jobs, loading, error, refetch } = useSheetData(getJobs);
  const showToast = useToast();
  const [, setRecent] = useLocalStorage('ccs-recent-jobs', []);

  const job = useMemo(
    () => (jobs || []).find((j) => String(j.jobId) === String(jobId)),
    [jobs, jobId]
  );

  const related = useMemo(
    () =>
      (jobs || [])
        .filter((j) => j.category === job?.category && String(j.jobId) !== String(jobId))
        .slice(0, 3),
    [jobs, job, jobId]
  );

  // Track recently viewed jobs
  useEffect(() => {
    if (job?.jobId) {
      setRecent((prev) => [job.jobId, ...prev.filter((id) => id !== job.jobId)].slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.jobId]);

  useSeo({
    title: job ? `${job.title} at ${job.company}` : 'Job Details',
    description: job?.description?.slice(0, 155),
    path: `/jobs/${jobId}`,
    jsonLd: job
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description,
          datePosted: job.postedDate,
          employmentType: job.jobType,
          hiringOrganization: { '@type': 'Organization', name: job.company, logo: job.companyLogo },
          jobLocation: { '@type': 'Place', address: job.location },
          baseSalary: job.salary,
        }
      : null,
  });

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${SITE.url || window.location.origin}/jobs/${jobId}`);
    showToast('Job link copied');
  };

  const shareJob = async () => {
    const url = `${SITE.url || window.location.origin}/jobs/${jobId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: job?.title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    copyLink();
  };

  if (loading) return <Loader label="Loading job…" />;
  if (error) return <div className="container-x section"><ErrorState onRetry={refetch} /></div>;
  if (!job) {
    return (
      <div className="container-x section">
        <EmptyState title="Job not found" message="This job may have been closed or removed." action={<Button to="/jobs" variant="secondary" size="sm">Browse all jobs</Button>} />
      </div>
    );
  }

  const responsibilities = splitList(job.responsibilities);
  const requirements = splitList(job.requirements);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Jobs', path: '/jobs' }, { label: job.title }]} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <Reveal className="lg:col-span-2">
          <article className="card p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <LazyImage src={job.companyLogo} alt={`${job.company} logo`} className="h-16 w-16 rounded-2xl" />
                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">{job.title}</h1>
                  <p className="text-slate-500">{job.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={shareJob} aria-label="Share job">
                  <FiShare2 aria-hidden="true" /> Share
                </Button>
                <Button variant="ghost" size="sm" onClick={copyLink} aria-label="Copy job link">
                  <FiCopy aria-hidden="true" /> Copy link
                </Button>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60 sm:grid-cols-4">
              {[
                { icon: FiMapPin, label: 'Location', value: job.location },
                { icon: FiBriefcase, label: 'Experience', value: job.experience },
                { icon: FiDollarSign, label: 'Salary', value: job.salary },
                { icon: FiClock, label: 'Posted', value: formatDate(job.postedDate) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <Icon aria-hidden="true" /> {label}
                  </p>
                  <p className="text-sm font-semibold">{value || '—'}</p>
                </div>
              ))}
            </div>

            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold">Job Description</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">{job.description}</p>
            </section>

            {responsibilities.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-bold">Responsibilities</h2>
                <ul className="space-y-2">
                  {responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                      <FiCheck className="mt-1 shrink-0 text-primary-600" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {requirements.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-bold">Requirements</h2>
                <ul className="space-y-2">
                  {requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                      <FiCheck className="mt-1 shrink-0 text-primary-600" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Button href={job.applyLink || undefined} to={job.applyLink ? undefined : '/contact'} size="lg" className="w-full sm:w-auto">
              Apply Now
            </Button>
          </article>
        </Reveal>

        {/* Sidebar: related jobs */}
        <aside aria-label="Related jobs">
          <h2 className="mb-4 text-lg font-bold">Related Jobs</h2>
          <div className="space-y-4">
            {related.length === 0 && <p className="text-sm text-slate-500">No related jobs right now.</p>}
            {related.map((j) => (
              <JobCard key={j.jobId} job={j} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
