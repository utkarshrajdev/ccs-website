import Reveal from './Reveal';

export default function SectionTitle({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  return (
    <Reveal className={`flex flex-col gap-3 mb-10 md:mb-14 ${alignment}`}>
      {eyebrow && (
        <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 uppercase tracking-wider">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="max-w-2xl text-slate-500 dark:text-slate-400 md:text-lg">{subtitle}</p>
      )}
    </Reveal>
  );
}
