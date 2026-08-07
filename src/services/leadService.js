import { getAttribution } from '../utils/tracking';

/**
 * Lead submission service.
 *
 * Currently targets a Google Apps Script Web App (see apps-script/Code.gs),
 * but the interface is backend-agnostic: submitLead(formType, data, file)
 * always resolves to { success, message }. Swapping Apps Script for
 * Django/FastAPI later only requires changing VITE_LEADS_API_URL - the
 * payload shape is plain JSON.
 *
 * Note: we use fetch with a plain-text body (not axios/application-json)
 * because Google Apps Script does not answer CORS preflight requests.
 * A "simple request" avoids the preflight entirely.
 */

const API_URL = import.meta.env.VITE_LEADS_API_URL;

export const FORM_TYPES = {
  JOB_APPLICATION: 'job-application',
  TRAINING_ENQUIRY: 'training-enquiry',
  CONSULTANCY_ENQUIRY: 'consultancy-enquiry',
  CONTACT: 'contact',
};

export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Validate a resume file. Returns an error string or null. */
export function validateResume(file) {
  if (!file) return 'Please attach your resume.';
  const extOk = /\.(pdf|doc|docx)$/i.test(file.name);
  if (!RESUME_TYPES.includes(file.type) && !extOk) return 'Resume must be a PDF, DOC or DOCX file.';
  if (file.size > RESUME_MAX_BYTES) return 'Resume must be smaller than 5 MB.';
  return null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]); // strip data: prefix
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Submit a lead.
 * @param {string} formType - one of FORM_TYPES
 * @param {object} data - form fields
 * @param {File} [file] - optional resume file
 */
export async function submitLead(formType, data, file) {
  const payload = {
    formType,
    ...data,
    ...getAttribution(),
    page: window.location.href,
    submittedAt: new Date().toISOString(),
  };

  if (file) {
    payload.resume = {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64: await fileToBase64(file),
    };
  }

  // Demo mode: no endpoint configured - simulate success so the UI works.
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 900));
    return { success: true, demo: true, message: 'Demo mode: no endpoint configured.' };
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload), // text/plain - no CORS preflight
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Submission failed.');
  return json;
}
