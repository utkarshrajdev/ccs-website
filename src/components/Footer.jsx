import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { NAV_LINKS, SITE } from '../utils/constants';
import useSheetData from '../hooks/useSheetData';
import { getContactInfo, getJobs } from '../services/sheetsService';
import { isTruthy, truncate } from '../utils/helpers';
import { useToast } from './common/Toast';

export default function Footer() {
  const { data: contact } = useSheetData(getContactInfo);
  const { data: jobs } = useSheetData(getJobs);
  const showToast = useToast();

  const latestJobs = (jobs || []).filter((j) => isTruthy(j.status ?? 'true')).slice(0, 4);

  const socials = [
    { icon: FaFacebook, href: contact?.facebook, label: 'Facebook' },
    { icon: FaInstagram, href: contact?.instagram, label: 'Instagram' },
    { icon: FaLinkedin, href: contact?.linkedin, label: 'LinkedIn' },
    {
      icon: FaWhatsapp,
      href: contact?.whatsapp ? `https://wa.me/${String(contact.whatsapp).replace(/[^0-9]/g, '')}` : null,
      label: 'WhatsApp',
    },
  ].filter((s) => s.href);

  const handleNewsletter = (e) => {
    e.preventDefault();
    e.target.reset();
    showToast('Thanks for subscribing!');
  };

  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-display text-sm font-bold text-white">
              {SITE.shortName}
            </span>
            <span className="font-display font-bold text-slate-900 dark:text-white">
              Champaran Consultancy
            </span>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your trusted partner for jobs, trainings, study abroad and career growth.
          </p>
          <ul className="flex gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 transition"
                >
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer quick links">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-slate-500 hover:text-primary-600 dark:text-slate-400 transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Latest jobs */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Latest Jobs</h3>
          <ul className="space-y-2.5 text-sm">
            {latestJobs.length === 0 && <li className="text-slate-400">Jobs coming soon…</li>}
            {latestJobs.map((job) => (
              <li key={job.jobId}>
                <Link
                  to={`/jobs/${job.jobId}`}
                  className="text-slate-500 hover:text-primary-600 dark:text-slate-400 transition"
                >
                  {truncate(job.title || '', 36)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + newsletter */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Contact</h3>
          <ul className="mb-5 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
            {contact?.phone && (
              <li className="flex items-center gap-2">
                <FiPhone className="shrink-0 text-primary-600" aria-hidden="true" />
                <a href={`tel:${contact.phone}`} className="hover:text-primary-600 transition">{contact.phone}</a>
              </li>
            )}
            {contact?.email && (
              <li className="flex items-center gap-2">
                <FiMail className="shrink-0 text-primary-600" aria-hidden="true" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition">{contact.email}</a>
              </li>
            )}
            {contact?.address && (
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-primary-600" aria-hidden="true" />
                {contact.address}
              </li>
            )}
          </ul>
          <form onSubmit={handleNewsletter} aria-label="Newsletter subscription">
            <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium">
              Newsletter
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email"
                className="input text-sm"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition"
              >
                <FiSend aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
