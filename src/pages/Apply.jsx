import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiBriefcase, FiMapPin } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getJobs } from '../services/sheetsService';
import { FORM_TYPES } from '../services/leadService';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LeadForm from '../components/forms/LeadForm';
import LazyImage from '../components/common/LazyImage';
import Reveal from '../components/common/Reveal';
import Loader from '../components/common/Loader';

/** Deep-linkable job application page: /apply?jobId=JOB001 */
export default function Apply() {
  const [params] = useSearchParams();
  const jobId = params.get('jobId') || '';
  const { data: jobs, loading } = useSheetData(getJobs);

  const job = useMemo(
    () => (jobs || []).find((j) => String(j.jobId) === String(jobId)),
    [jobs, jobId]
  );

  useSeo({
    title: job ? `Apply - ${job.title}` : 'Apply for a Job',
    description: 'Submit your application with your resume. Our placement team will get back to you within 24 hours.',
    path: '/apply',
  });

  if (loading && jobId) return <Loader label="Loading job…" />;

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Jobs', path: '/jobs' }, { label: 'Apply' }]} />

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <h1 className="mb-3 text-3xl font-bold">Apply Now</h1>
            {job ? (
              <div className="card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <LazyImage src={job.companyLogo} alt={`${job.company} logo`} className="h-12 w-12 rounded-xl" />
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-slate-100 dark:bg-slate-800"><FiMapPin aria-hidden="true" /> {job.location}</span>
                  <span className="badge bg-slate-100 dark:bg-slate-800"><FiBriefcase aria-hidden="true" /> {job.experience}</span>
                  {job.salary && <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{job.salary}</span>}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">
                Send us your resume and our placement team will match you with suitable openings.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <LeadForm
            formType={FORM_TYPES.JOB_APPLICATION}
            title="Job Application"
            subtitle={job ? `Applying for: ${job.title} at ${job.company}` : 'General application'}
            prefill={{ jobId: jobId || 'GENERAL', jobTitle: job?.title || '', company: job?.company || '' }}
            withResume
            successNote="Our placement team reviews every application and responds within 24 hours on working days."
          />
        </Reveal>
      </div>
    </div>
  );
}
