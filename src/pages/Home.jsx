import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiGlobe,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import {
  getBlogs,
  getFaqs,
  getGallery,
  getHero,
  getJobs,
  getRecruiters,
  getServices,
  getStatistics,
  getTestimonials,
  getTrainings,
} from '../services/sheetsService';
import { isTruthy, toNumber } from '../utils/helpers';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';
import Reveal from '../components/common/Reveal';
import Counter from '../components/common/Counter';
import Carousel from '../components/common/Carousel';
import Accordion from '../components/common/Accordion';
import LazyImage from '../components/common/LazyImage';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import JobCard from '../components/cards/JobCard';
import TrainingCard from '../components/cards/TrainingCard';
import BlogCard from '../components/cards/BlogCard';
import TestimonialCard from '../components/cards/TestimonialCard';
import Gallery from '../components/Gallery';

const WHY_US = [
  { icon: FiBriefcase, title: 'Verified Job Openings', text: 'Every listing is screened and verified with the hiring company before it goes live.' },
  { icon: FiAward, title: 'Industry-Ready Trainings', text: 'Practical, mentor-led programs designed around what recruiters actually look for.' },
  { icon: FiUsers, title: 'Personal Career Guidance', text: 'One-on-one counselling for careers, resumes, interviews and study abroad plans.' },
  { icon: FiTrendingUp, title: 'Proven Placement Record', text: 'A growing network of recruiters and a track record of successful placements.' },
];

export default function Home() {
  useSeo({
    title: 'Jobs, Trainings & Career Guidance',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Champaran Consultancy Services',
      potentialAction: { '@type': 'SearchAction', target: '/jobs?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    },
  });

  const { data: heroRows } = useSheetData(getHero);
  const { data: jobs, loading: jobsLoading } = useSheetData(getJobs);
  const { data: trainings, loading: trainingsLoading } = useSheetData(getTrainings);
  const { data: services } = useSheetData(getServices);
  const { data: stats } = useSheetData(getStatistics);
  const { data: testimonials } = useSheetData(getTestimonials);
  const { data: blogs } = useSheetData(getBlogs);
  const { data: recruiters } = useSheetData(getRecruiters);
  const { data: gallery } = useSheetData(getGallery);
  const { data: faqs } = useSheetData(getFaqs);

  const hero = heroRows?.[0];
  const featuredJobs = (jobs || []).filter((j) => isTruthy(j.featured)).slice(0, 6);
  const popularTrainings = (trainings || []).filter((t) => isTruthy(t.featured)).slice(0, 3);
  const latestBlogs = (blogs || []).slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        {hero?.backgroundImage && (
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero.backgroundImage})` }}
            aria-hidden="true"
          />
        )}
        <div className="container-x relative py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <span className="badge mb-5 bg-white/10 text-primary-100 backdrop-blur">
              <FiGlobe aria-hidden="true" /> Trusted Career Partner
            </span>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-white md:text-6xl">
              {hero?.title || 'Build the Career You Deserve'}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-primary-100 md:text-xl">
              {hero?.subtitle || 'Jobs, trainings and expert guidance — all in one place.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button to={hero?.buttonLink || '/jobs'} variant="accent" size="lg">
                {hero?.buttonText || 'Browse Jobs'} <FiArrowRight aria-hidden="true" />
              </Button>
              <Button to="/trainings" size="lg" className="!bg-white/10 !text-white backdrop-blur hover:!bg-white/20">
                Explore Trainings
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────── */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Why CCS" title="Why Choose Us" subtitle="Everything you need to move your career forward, backed by real people who care." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="card card-hover h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40">
                    <item.icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ────────────────────────────────── */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x">
          <SectionTitle eyebrow="Openings" title="Featured Jobs" subtitle="Hand-picked opportunities from our verified recruiter network." />
          {jobsLoading ? (
            <SkeletonGrid count={3} withImage={false} lines={4} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(featuredJobs.length ? featuredJobs : (jobs || []).slice(0, 6)).map((job, i) => (
                <JobCard key={job.jobId || i} job={job} delay={i * 0.06} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Button to="/jobs" variant="secondary">
              View All Jobs <FiArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Popular Trainings ────────────────────────────── */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Learn & Grow" title="Popular Trainings" subtitle="Job-oriented programs taught by industry practitioners." />
          {trainingsLoading ? (
            <SkeletonGrid count={3} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(popularTrainings.length ? popularTrainings : (trainings || []).slice(0, 3)).map((t, i) => (
                <TrainingCard key={t.trainingId || i} training={t} delay={i * 0.06} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Button to="/trainings" variant="secondary">
              View All Trainings <FiArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Statistics ───────────────────────────────────── */}
      {stats?.length > 0 && (
        <section className="bg-gradient-to-r from-primary-800 to-primary-600 py-16 text-white">
          <div className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={i} delay={i * 0.08} className="text-center">
                <p className="font-display text-4xl font-bold md:text-5xl">
                  <Counter value={toNumber(stat.value)} suffix={stat.suffix || '+'} />
                </p>
                <p className="mt-1 text-sm text-primary-100">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Services ─────────────────────────────────────── */}
      {services?.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionTitle eyebrow="What We Do" title="Our Services" subtitle="End-to-end consultancy for every stage of your career journey." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <Link to="/consultancy" className="card card-hover group flex h-full items-start gap-4 p-6">
                    <LazyImage src={service.image} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
                    <div>
                      <h3 className="mb-1 font-semibold group-hover:text-primary-600 transition">{service.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{service.description?.slice(0, 90)}…</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────── */}
      {testimonials?.length > 0 && (
        <section className="section bg-slate-50 dark:bg-slate-900/50">
          <div className="container-x">
            <SectionTitle eyebrow="Success Stories" title="What People Say" />
            <Carousel
              items={testimonials}
              label="Testimonials"
              renderItem={(t) => <TestimonialCard testimonial={t} />}
            />
          </div>
        </section>
      )}

      {/* ── Latest Blogs ─────────────────────────────────── */}
      {latestBlogs.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionTitle eyebrow="Insights" title="Latest from the Blog" subtitle="Career tips, industry insights and success guides." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.map((blog, i) => (
                <BlogCard key={blog.slug || i} blog={blog} delay={i * 0.06} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recruiters ───────────────────────────────────── */}
      {recruiters?.length > 0 && (
        <section className="section bg-slate-50 py-14 dark:bg-slate-900/50">
          <div className="container-x">
            <SectionTitle eyebrow="Our Network" title="Top Recruiters" />
            <div className="overflow-hidden" aria-label="Recruiter logos">
              <div className="flex w-max animate-marquee items-center gap-12">
                {[...recruiters, ...recruiters].map((r, i) => (
                  <a
                    key={i}
                    href={r.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                  >
                    <LazyImage src={r.logo} alt={`${r.company} logo`} className="h-12 w-24 rounded-lg !bg-transparent" />
                    <span className="text-xs text-slate-500">{r.company}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────── */}
      {gallery?.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionTitle eyebrow="Moments" title="Gallery" />
            <Gallery items={gallery.slice(0, 6)} />
          </div>
        </section>
      )}

      {/* ── FAQs ─────────────────────────────────────────── */}
      {faqs?.length > 0 && (
        <section className="section bg-slate-50 dark:bg-slate-900/50">
          <div className="container-x max-w-3xl">
            <SectionTitle eyebrow="FAQs" title="Frequently Asked Questions" />
            <Accordion items={faqs} />
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 p-10 text-center text-white md:p-16">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to Take the Next Step?</h2>
              <p className="mx-auto mb-8 max-w-xl text-primary-100">
                Talk to our career experts today — whether it's a new job, a new skill, or studying abroad.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button to="/contact" variant="accent" size="lg">
                  <FiCheckCircle aria-hidden="true" /> Get Free Consultation
                </Button>
                <Button to="/jobs" size="lg" className="!bg-white/10 !text-white backdrop-blur hover:!bg-white/20">
                  Browse Jobs
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
