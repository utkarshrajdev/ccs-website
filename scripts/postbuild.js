// GitHub Pages has no server-side rewrites, so any deep link (e.g. /jobs) 404s
// at the HTTP level even though public/404.html client-redirects it back into
// the SPA — a real 404 status keeps the page out of Google's index no matter
// what the redirect script does afterwards.
//
// Fix: copy the built index.html into a same-named folder for every static
// route so GitHub Pages serves it directly with a genuine 200. react-router
// then mounts on that URL exactly as it would on "/".
//
// This only covers static routes known at build time. Dynamic detail pages
// (/jobs/:jobId, /trainings/:trainingId, /blog/:slug) still rely on the
// public/404.html fallback since their IDs live in the Google Sheet, not here.
//
// Keep this list in sync with the static <Route path="..."> entries in
// src/App.jsx.
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const indexHtml = join(dist, 'index.html');

const STATIC_ROUTES = [
  'jobs',
  'apply',
  'trainings',
  'training/enquire',
  'consultancy',
  'consultancy/enquire',
  'blog',
  'about',
  'contact',
];

if (!existsSync(indexHtml)) {
  console.error('postbuild: dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

for (const route of STATIC_ROUTES) {
  const dir = join(dist, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(indexHtml, join(dir, 'index.html'));
}

console.log(`postbuild: prerendered ${STATIC_ROUTES.length} static routes for GitHub Pages (200 instead of 404).`);
