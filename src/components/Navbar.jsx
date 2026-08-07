import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { NAV_LINKS, SITE } from '../utils/constants';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, toggleDark] = useDarkMode();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on route change
  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
        : 'text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-300'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-card' : 'bg-white/95 dark:bg-slate-950/95'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} - home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-display text-sm font-bold text-white">
            {SITE.shortName}
          </span>
          <span className="hidden font-display text-base font-bold text-slate-900 dark:text-white sm:block">
            Champaran <span className="text-primary-600">Consultancy</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink to={link.path} end={link.path === '/'} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            {dark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <Link
            to="/contact"
            className="hidden rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition md:block"
          >
            Get in Touch
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            {open ? <FiX size={20} aria-hidden="true" /> : <FiMenu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink to={link.path} end={link.path === '/'} className={linkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
