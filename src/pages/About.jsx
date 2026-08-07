import { FaLinkedin } from 'react-icons/fa';
import { FiCompass, FiEye, FiFlag } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getStatistics, getTeam } from '../services/sheetsService';
import { toNumber } from '../utils/helpers';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SectionTitle from '../components/common/SectionTitle';
import Reveal from '../components/common/Reveal';
import Counter from '../components/common/Counter';
import LazyImage from '../components/common/LazyImage';
import { SkeletonGrid } from '../components/common/SkeletonCard';

const JOURNEY = [
  { icon: FiFlag, title: 'Our Mission', text: 'To connect talent from every corner of the region with meaningful careers through honest guidance, quality training and verified opportunities.' },
  { icon: FiEye, title: 'Our Vision', text: 'To become the most trusted career partner in the region - the first name people think of for jobs, skills and global education.' },
  { icon: FiCompass, title: 'Our Journey', text: 'From a small counselling desk in Champaran to a full-service consultancy serving job seekers, students and companies across India.' },
];

export default function About() {
  useSeo({ title: 'About Us', description: 'The story, mission and team behind Champaran Consultancy Services.', path: '/about' });

  const { data: team, loading: teamLoading } = useSheetData(getTeam);
  const { data: stats } = useSheetData(getStatistics);

  return (
    <>
      <div className="container-x section !pt-10 !pb-0">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
        <SectionTitle
          align="left"
          eyebrow="About CCS"
          title="Champaran Consultancy Services"
          subtitle="We believe great careers shouldn't depend on where you were born. CCS was founded to bring verified jobs, world-class training and honest career guidance to everyone."
        />
      </div>

      {/* Mission / Vision / Journey */}
      <section className="container-x pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {JOURNEY.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="card card-hover h-full p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40">
                  <item.icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mb-2 text-lg font-bold">{item.title}</h2>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Statistics */}
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

      {/* Team */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Leadership" title="Meet Our Team" subtitle="The people working behind the scenes for your career." />
          {teamLoading && <SkeletonGrid count={3} />}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(team || []).map((member, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="card card-hover h-full p-6 text-center">
                  <LazyImage src={member.photo} alt={member.name} className="mx-auto mb-4 h-24 w-24 rounded-full" />
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="mb-3 text-sm text-primary-600 dark:text-primary-300">{member.role}</p>
                  <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{member.bio}</p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-slate-800 transition"
                    >
                      <FaLinkedin aria-hidden="true" />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
