# Champaran Consultancy Services (CCS) - Website

A modern, responsive, production-ready website built with **React + Vite + Tailwind CSS**, using **Google Sheets as a no-backend CMS**. The site owner only edits a Google Sheet - the website shows updated content on the next page refresh.

## Features

- **No backend** - all content comes from Google Sheets (or bundled demo data)
- **Lead capture system** - Job Application (with resume upload to Drive), Training / Consultancy / Contact enquiry forms, powered by Google Apps Script with user + admin HTML email notifications and UTM attribution stored per lead. See **[docs/LEAD_SYSTEM_SETUP.md](./docs/LEAD_SYSTEM_SETUP.md)**
- **Marketing-ready** - deep-linkable forms (`/apply?jobId=…`, `/training/enquire?id=…`, `/consultancy/enquire`), UTM capture, GA4 + GTM + Meta Pixel with conversion events (`form_started`, `form_submitted`, `resume_uploaded`, `cta_clicked`)
- Home, Jobs (search / filters / sort / pagination), Job Details, Trainings, Training Details, Consultancy, Blog, Blog Details, About, Contact, 404
- Dark mode, bookmarks, recently viewed jobs, share/copy job link, toasts, animated counters, scroll progress, scroll-reveal animations, floating WhatsApp button, back-to-top
- Lazy-loaded routes and images, session caching of sheet data, skeleton loaders, empty/error states
- SEO: per-page meta, Open Graph, Twitter Cards, JSON-LD, canonical URLs, robots.txt, sitemap.xml
- Accessible: semantic HTML, keyboard navigation, ARIA labels, focus states

## Quick Start

```bash
npm install
npm run dev
```

With no configuration, the site runs in **demo mode** using the sample data in `public/demo/`. To connect your own Google Sheet, follow the steps below.

---

## 1. Google Sheet Setup

1. Create a new Google Spreadsheet.
2. Create one **tab per section**, named exactly:
   `Hero`, `Jobs`, `Trainings`, `Services`, `Testimonials`, `SuccessStories`, `Team`, `FAQs`, `Blogs`, `Recruiters`, `Statistics`, `Gallery`, `Contact`, `CareerTips`
3. For each tab, copy the header row (and sample row) from the matching CSV in [`sheet-templates/`](./sheet-templates). You can import each CSV via **File → Import → Upload → Append to current sheet**.
4. Row 1 must be the header row. Column headers are converted to camelCase keys automatically (`Company Logo` → `companyLogo`), so keep them as given in the templates.

### Multi-value cells
Cells like `Responsibilities`, `Requirements`, `Syllabus`, `Features`, `Benefits` can hold multiple items. Separate items with a pipe `|`, semicolon, or new lines (Ctrl+Enter inside a cell).

### Images
Images are **not** stored in the project. Put a direct image URL in the image column of each row. Free options:

- Any public image URL (your hosting, Cloudinary, ImgBB, etc.)
- Google Drive: share the file publicly, then use `https://drive.google.com/uc?export=view&id=FILE_ID`

Broken/missing URLs automatically fall back to a neutral placeholder.

## 2. Publishing the Sheet

The site reads the sheet through Google's public `gviz` endpoint - no API key needed. The sheet just needs to be viewable by anyone:

1. Click **Share** (top right).
2. Under *General access*, choose **Anyone with the link → Viewer**.
3. Done. (Optionally also do **File → Share → Publish to web**, but link-sharing is sufficient.)

## 3. Configuring the Sheet ID

1. Copy the Sheet ID from your spreadsheet URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit`
2. Create a `.env` file (copy `.env.example`):

```bash
VITE_GOOGLE_SHEET_ID=your_long_sheet_id_here
VITE_BASE_PATH=/
VITE_SITE_URL=https://yourusername.github.io/ccs-website
```

3. Restart `npm run dev`. The site now loads live sheet data. Edit the sheet, refresh the page, and the content updates.

> Sheet data is cached in memory for the session, so each sheet is fetched once per visit - fast and gentle on quotas.

## 4. Deployment to GitHub Pages

1. Push the project to a GitHub repository.
2. In `.env`, set the base path to your repo name (needed for project sites):

```bash
VITE_BASE_PATH=/your-repo-name/
VITE_SITE_URL=https://yourusername.github.io/your-repo-name
```

3. Deploy:

```bash
npm run deploy
```

This builds the site and pushes `dist/` to the `gh-pages` branch (via the `gh-pages` package). Then in GitHub: **Settings → Pages → Source: `gh-pages` branch**.

4. Update `public/robots.txt` and `public/sitemap.xml` with your real URL.

**Note on routing:** `public/404.html` handles deep links (e.g. `/jobs/JOB001`) on GitHub Pages by redirecting through the SPA shell. It works automatically for `*.github.io/repo-name/` sites.

**Environment variables on CI:** if you deploy via GitHub Actions instead, add `VITE_GOOGLE_SHEET_ID` etc. as repository variables and expose them at build time.

## 5. Adding a New Section

Say you want a new "Events" section:

1. **Sheet:** add an `Events` tab with a header row (e.g. `Title, Date, Image, Description`).
2. **Constant:** add `EVENTS: 'Events'` to `SHEETS` in `src/utils/constants.js`.
3. **Service:** add one line in `src/services/sheetsService.js`:
   ```js
   export const getEvents = () => fetchSheet(SHEETS.EVENTS);
   ```
4. **UI:** in any page/component:
   ```js
   const { data: events, loading, error } = useSheetData(getEvents);
   ```
5. (Demo mode) optionally add `public/demo/events.json` with sample rows.

That's it - no backend, no schema migrations.

## Project Structure

```
src/
├── components/
│   ├── cards/          # JobCard, TrainingCard, BlogCard, TestimonialCard
│   ├── common/         # Button, SectionTitle, Carousel, Accordion, Pagination,
│   │                   # SearchBox, Filters, Loader, Skeletons, Empty/Error states,
│   │                   # LazyImage, Toasts, BackToTop, ScrollProgress, WhatsApp float
│   ├── forms/          # LeadForm - reusable validated lead capture form
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── Gallery.jsx
├── pages/              # One file per route (lazy-loaded), incl. Apply / enquiry pages
├── layouts/            # MainLayout (navbar + footer + analytics + floating elements)
├── services/           # sheetsService.js (content CMS) + leadService.js (form submissions)
├── hooks/              # useSheetData, useDebounce, useLocalStorage, useDarkMode, useSeo
├── utils/              # constants, helpers, tracking.js (UTM + GA4/GTM/Pixel)
└── assets/             # static assets (kept empty by design - images live in Sheets)
apps-script/            # Code.gs - complete Google Apps Script lead backend
docs/                   # LEAD_SYSTEM_SETUP.md - leads, emails, analytics & ads guide
sheet-templates/        # CSV templates: content tabs + Leads_* reference layouts
public/demo/            # sample data used when no Sheet ID is configured
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build + publish to GitHub Pages |

## Tech Stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Framer Motion · React Icons · Axios
