export const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

export const camelCase = (text = '') =>
  String(text)
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');

export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const timeAgo = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
};

// Split a cell containing multiple items (newline, pipe or semicolon separated)
export const splitList = (value = '') =>
  String(value)
    .split(/\r?\n|\||;/)
    .map((s) => s.trim())
    .filter(Boolean);

export const truncate = (text = '', length = 120) =>
  text.length > length ? `${text.slice(0, length).trim()}…` : text;

export const isTruthy = (value) =>
  ['true', 'yes', '1', 'y', 'active'].includes(String(value).trim().toLowerCase());

export const toNumber = (value) => {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

export const unique = (items) => [...new Set(items.filter(Boolean))];

export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
