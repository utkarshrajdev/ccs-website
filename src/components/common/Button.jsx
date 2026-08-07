import { Link } from 'react-router-dom';
import { EVENTS, trackEvent } from '../../utils/tracking';

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 dark:bg-slate-900 dark:border-slate-700 dark:text-primary-300 dark:hover:bg-slate-800',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
  ghost: 'text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  track, // optional CTA label - fires a cta_clicked analytics event
  onClick,
  className = '',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  const handleClick = (e) => {
    if (track) trackEvent(EVENTS.CTA_CLICKED, { cta_label: track, page: window.location.pathname });
    onClick?.(e);
  };

  if (to) {
    return (
      <Link to={to} className={classes} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
