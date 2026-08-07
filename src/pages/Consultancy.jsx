import { FiArrowRight, FiCheck } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getServices } from '../services/sheetsService';
import { splitList } from '../utils/helpers';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import LazyImage from '../components/common/LazyImage';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import Reveal from '../components/common/Reveal';
import SectionTitle from '../components/common/SectionTitle';

export default function Consultancy() {
  useSeo({
    title: 'Consultancy Services',
    description: 'Study abroad, career guidance, resume building, interview preparation, placement assistance, corporate training and HR consulting.',
    path: '/consultancy',
  });

  const { data: services, loading, error, refetch } = useSheetData(getServices);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Consultancy' }]} />
      <SectionTitle
        align="left"
        eyebrow="Services"
        title="Consultancy Services"
        subtitle="Expert guidance for every step of your career - from your first resume to your first international offer."
      />

      {loading && <SkeletonGrid count={4} className="grid gap-8 md:grid-cols-2" />}
      {error && <ErrorState onRetry={refetch} />}
      {!loading && !error && (!services || services.length === 0) && <EmptyState title="Services coming soon" />}

      <div className="space-y-10">
        {(services || []).map((service, i) => {
          const features = splitList(service.features);
          const benefits = splitList(service.benefits);
          const reversed = i % 2 === 1;
          return (
            <Reveal key={i}>
              <article className={`card grid gap-0 overflow-hidden md:grid-cols-2 ${reversed ? 'md:[direction:rtl]' : ''}`}>
                <LazyImage src={service.image} alt={service.title} className="h-64 md:h-full [direction:ltr]" />
                <div className="p-7 md:p-10 [direction:ltr]">
                  <h2 className="mb-3 text-2xl font-bold">{service.title}</h2>
                  <p className="mb-5 leading-relaxed text-slate-600 dark:text-slate-300">{service.description}</p>

                  {features.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">What's included</h3>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <FiCheck className="mt-0.5 shrink-0 text-primary-600" aria-hidden="true" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {benefits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Benefits</h3>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {benefits.map((b, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <FiCheck className="mt-0.5 shrink-0 text-accent-500" aria-hidden="true" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    to={`/consultancy/enquire?service=${encodeURIComponent(service.title || '')}`}
                    track={`consultancy_${service.title}`}
                  >
                    {service.ctaText || 'Book a Consultation'} <FiArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
