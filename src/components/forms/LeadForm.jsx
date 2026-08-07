import { useRef, useState } from 'react';
import { FiCheckCircle, FiLoader, FiPaperclip, FiSend, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import { submitLead, validateResume } from '../../services/leadService';
import { EVENTS, trackEvent } from '../../utils/tracking';
import { useToast } from '../common/Toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{7,15}$/;

/**
 * Reusable, mobile-first lead capture form.
 *
 * @param {string}  formType     one of FORM_TYPES (leadService)
 * @param {string}  title        card heading
 * @param {string}  subtitle     small text under the heading
 * @param {object}  prefill      values merged into the payload (jobId, trainingId, service…)
 * @param {object}  select       optional dropdown: { name, label, options, value }
 * @param {boolean} withResume   show resume upload (job applications)
 * @param {string}  successNote  extra line on the thank-you screen
 */
export default function LeadForm({
  formType,
  title = 'Send an Enquiry',
  subtitle,
  prefill = {},
  select,
  withResume = false,
  successNote = 'Our team typically responds within 24 hours on working days.',
}) {
  const showToast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [selectValue, setSelectValue] = useState(select?.value || '');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const startedRef = useRef(false);
  const honeypotRef = useRef(null);
  const fileInputRef = useRef(null);

  const markStarted = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent(EVENTS.FORM_STARTED, { form_type: formType });
    }
  };

  const update = (field) => (e) => {
    markStarted();
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onFileChange = (e) => {
    markStarted();
    const selected = e.target.files?.[0] || null;
    const error = selected ? validateResume(selected) : null;
    if (error) {
      setFile(null);
      setErrors((prev) => ({ ...prev, resume: error }));
      e.target.value = '';
      return;
    }
    setFile(selected);
    setErrors((prev) => ({ ...prev, resume: undefined }));
    if (selected) trackEvent(EVENTS.RESUME_UPLOADED, { form_type: formType, file_type: selected.type });
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Please enter a valid email address.';
    if (!PHONE_RE.test(form.phone)) next.phone = 'Please enter a valid phone number.';
    if (select && select.required !== false && !selectValue) next.select = `Please choose a ${select.label.toLowerCase()}.`;
    if (withResume) {
      const resumeError = validateResume(file);
      if (resumeError) next.resume = resumeError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypotRef.current?.value) return; // bot trap - silently drop
    if (!validate()) return;

    setStatus('submitting');
    try {
      await submitLead(
        formType,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          ...(select ? { [select.name]: selectValue } : {}),
          ...prefill,
        },
        withResume ? file : undefined
      );
      trackEvent(EVENTS.FORM_SUBMITTED, { form_type: formType, ...prefill });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      showToast(err.message || 'Something went wrong. Please try again.', 'info');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center" role="status">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20">
          <FiCheckCircle size={30} aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Thank you, {form.name.split(' ')[0]}!</h2>
        <p className="mb-1 text-slate-500">
          Your {withResume ? 'application' : 'enquiry'} has been received. A confirmation email is on its way to{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{form.email}</span>.
        </p>
        <p className="text-sm text-slate-400">{successNote}</p>
      </div>
    );
  }

  const inputError = (key) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-500" role="alert">{errors[key]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8" aria-label={title} noValidate>
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      {subtitle && <p className="mb-5 text-sm text-slate-500">{subtitle}</p>}

      {/* Honeypot field - hidden from humans, catches naive bots */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
          <input type="text" required autoComplete="name" value={form.name} onChange={update('name')} className="input mt-1.5" placeholder="Your full name" />
          {inputError('name')}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Email <span className="text-red-500" aria-hidden="true">*</span>
            <input type="email" required autoComplete="email" value={form.email} onChange={update('email')} className="input mt-1.5" placeholder="you@example.com" />
            {inputError('email')}
          </label>
          <label className="block text-sm font-medium">
            Phone <span className="text-red-500" aria-hidden="true">*</span>
            <input type="tel" required autoComplete="tel" value={form.phone} onChange={update('phone')} className="input mt-1.5" placeholder="+91 98765 43210" />
            {inputError('phone')}
          </label>
        </div>

        {select && (
          <label className="block text-sm font-medium">
            {select.label} {select.required !== false && <span className="text-red-500" aria-hidden="true">*</span>}
            <select
              value={selectValue}
              onChange={(e) => { markStarted(); setSelectValue(e.target.value); setErrors((p) => ({ ...p, select: undefined })); }}
              className="input mt-1.5"
            >
              <option value="">Select…</option>
              {select.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {inputError('select')}
          </label>
        )}

        {withResume && (
          <div className="block text-sm font-medium">
            Resume (PDF / DOC / DOCX, max 5 MB) <span className="text-red-500" aria-hidden="true">*</span>
            <div className="mt-1.5">
              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-primary-800 dark:text-primary-200">
                    <FiPaperclip aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-primary-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </span>
                  <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} aria-label="Remove file" className="text-primary-500 hover:text-primary-700">
                    <FiX aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-center transition hover:border-primary-400 dark:border-slate-700">
                  <FiPaperclip className="text-slate-400" aria-hidden="true" />
                  <span className="text-sm text-slate-500">Tap to attach your resume</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onFileChange}
                    className="sr-only"
                    aria-label="Upload resume"
                  />
                </label>
              )}
            </div>
            {inputError('resume')}
          </div>
        )}

        <label className="block text-sm font-medium">
          Message {withResume && <span className="font-normal text-slate-400">(optional)</span>}
          <textarea rows={4} value={form.message} onChange={update('message')} className="input mt-1.5 resize-none" placeholder="Anything you'd like us to know?" />
        </label>

        <Button size="lg" className="w-full" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <FiLoader className="animate-spin" aria-hidden="true" /> Submitting…
            </>
          ) : (
            <>
              <FiSend aria-hidden="true" /> {withResume ? 'Submit Application' : 'Send Enquiry'}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-slate-400">
          By submitting, you agree to be contacted by our team about your enquiry.
        </p>
      </div>
    </form>
  );
}
