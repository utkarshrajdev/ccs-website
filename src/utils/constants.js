// Navigation is the ONLY hardcoded data in the project (as per spec).
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Trainings', path: '/trainings' },
  { label: 'Consultancy', path: '/consultancy' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

// Sheet (tab) names inside the Google Spreadsheet.
export const SHEETS = {
  HERO: 'Hero',
  JOBS: 'Jobs',
  TRAININGS: 'Trainings',
  SERVICES: 'Services',
  TESTIMONIALS: 'Testimonials',
  SUCCESS_STORIES: 'SuccessStories',
  TEAM: 'Team',
  FAQS: 'FAQs',
  BLOGS: 'Blogs',
  RECRUITERS: 'Recruiters',
  STATISTICS: 'Statistics',
  GALLERY: 'Gallery',
  CONTACT: 'Contact',
  CAREER_TIPS: 'CareerTips',
};

export const SITE = {
  name: 'Champaran Consultancy Services',
  shortName: 'CCS',
  url: import.meta.env.VITE_SITE_URL || '',
  defaultDescription:
    'Champaran Consultancy Services (CCS) helps you find jobs, professional trainings, study abroad guidance and expert career consultancy.',
};

// Neutral SVG fallback shown when an image URL fails to load.
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e2e8f0"/><g fill="#94a3b8"><circle cx="200" cy="130" r="35"/><rect x="140" y="180" width="120" height="14" rx="7"/></g></svg>`
  );

export const JOBS_PER_PAGE = 6;
export const BLOGS_PER_PAGE = 6;
