import axios from 'axios';
import { SHEETS } from '../utils/constants';
import { camelCase } from '../utils/helpers';

/**
 * Google Sheets CMS service.
 *
 * Reads a published/public Google Spreadsheet via the gviz JSON endpoint -
 * no API key, no backend. Each sheet tab is one content section.
 *
 * If VITE_GOOGLE_SHEET_ID is not set, the service falls back to bundled
 * demo JSON (public/demo/*.json) so the site can be previewed instantly.
 */

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const BASE_URL = import.meta.env.BASE_URL || '/';

// In-memory session cache: each sheet is fetched at most once per visit.
const cache = new Map();
const pending = new Map();

/** Parse the gviz response (JSONP-ish text) into an array of row objects. */
function parseGvizResponse(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Unexpected response from Google Sheets');
  const json = JSON.parse(text.slice(start, end + 1));
  const { cols = [], rows = [] } = json.table || {};

  // Prefer column labels; gviz omits labels when the sheet has no frozen
  // header, in which case the first row holds the headers.
  let headers = cols.map((c) => (c.label || '').trim());
  let dataRows = rows;
  if (headers.every((h) => !h) && rows.length > 0) {
    headers = (rows[0].c || []).map((cell) => (cell && cell.v != null ? String(cell.v) : ''));
    dataRows = rows.slice(1);
  }
  const keys = headers.map((h) => camelCase(h));

  return dataRows
    .map((row) => {
      const obj = {};
      (row.c || []).forEach((cell, i) => {
        if (!keys[i]) return;
        let value = '';
        if (cell) {
          // Use the formatted value for dates/numbers when available.
          if (cell.f != null && String(cell.v).startsWith('Date(')) value = cell.f;
          else if (cell.v != null) value = cell.v;
          else if (cell.f != null) value = cell.f;
        }
        obj[keys[i]] = typeof value === 'string' ? value.trim() : value;
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== '' && v != null));
}

/** Fetch one sheet tab and return rows as plain objects (cached per session). */
export async function fetchSheet(sheetName) {
  if (cache.has(sheetName)) return cache.get(sheetName);
  if (pending.has(sheetName)) return pending.get(sheetName);

  const promise = (async () => {
    let data;
    if (SHEET_ID) {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(sheetName)}`;
      const res = await axios.get(url, { responseType: 'text', transformResponse: [(d) => d] });
      data = parseGvizResponse(res.data);
    } else {
      // Demo mode: bundled sample content.
      const res = await axios.get(`${BASE_URL}demo/${sheetName.toLowerCase()}.json`);
      data = res.data;
    }
    cache.set(sheetName, data);
    pending.delete(sheetName);
    return data;
  })();

  pending.set(sheetName, promise);
  promise.catch(() => pending.delete(sheetName));
  return promise;
}

export const clearSheetCache = () => cache.clear();

// ---- Section-specific getters -------------------------------------------

export const getHero = () => fetchSheet(SHEETS.HERO);
export const getJobs = () => fetchSheet(SHEETS.JOBS);
export const getTrainings = () => fetchSheet(SHEETS.TRAININGS);
export const getServices = () => fetchSheet(SHEETS.SERVICES);
export const getTestimonials = () => fetchSheet(SHEETS.TESTIMONIALS);
export const getSuccessStories = () => fetchSheet(SHEETS.SUCCESS_STORIES);
export const getTeam = () => fetchSheet(SHEETS.TEAM);
export const getFaqs = () => fetchSheet(SHEETS.FAQS);
export const getBlogs = () => fetchSheet(SHEETS.BLOGS);
export const getRecruiters = () => fetchSheet(SHEETS.RECRUITERS);
export const getStatistics = () => fetchSheet(SHEETS.STATISTICS);
export const getGallery = () => fetchSheet(SHEETS.GALLERY);
export const getCareerTips = () => fetchSheet(SHEETS.CAREER_TIPS);

/** Contact sheet has a single row of site-wide contact info. */
export const getContactInfo = async () => {
  const rows = await fetchSheet(SHEETS.CONTACT);
  return rows[0] || {};
};
