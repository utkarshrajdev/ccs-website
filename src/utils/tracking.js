/**
 * Marketing attribution + analytics layer.
 *
 * - Captures UTM parameters, referrer and landing page on first visit
 *   (persisted in sessionStorage so attribution survives navigation).
 * - Dynamically loads GA4, Google Tag Manager and Meta Pixel when their
 *   IDs are configured via environment variables.
 * - trackEvent() fans one event out to all configured trackers.
 */

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const GTM_ID = import.meta.env.VITE_GTM_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

const ATTRIBUTION_KEY = 'ccs-attribution';

/** Standard conversion event names used across the site. */
export const EVENTS = {
  CTA_CLICKED: 'cta_clicked',
  FORM_STARTED: 'form_started',
  FORM_SUBMITTED: 'form_submitted',
  RESUME_UPLOADED: 'resume_uploaded',
};

/** Capture UTM/referrer/landing page once per session (first page hit wins). */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(ATTRIBUTION_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const attribution = {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
      utmContent: params.get('utm_content') || '',
      utmTerm: params.get('utm_term') || '',
      referrer: document.referrer || '',
      landingPage: window.location.href,
    };
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    /* storage unavailable */
  }
}

/** Attribution data attached to every lead submission. */
export function getAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)) || {};
  } catch {
    return {};
  }
}

function injectScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

/** Load GA4 / GTM / Meta Pixel for the IDs configured in .env. Idempotent. */
export function initAnalytics() {
  if (window.__ccsAnalyticsReady) return;
  window.__ccsAnalyticsReady = true;

  // Google Tag Manager
  if (GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }

  // GA4 (gtag) - safe to run alongside GTM
  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  }

  // Meta Pixel
  if (META_PIXEL_ID) {
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
}

/** Report an SPA page view (called on every route change). */
export function trackPageView(path) {
  if (window.gtag && GA4_ID) window.gtag('event', 'page_view', { page_path: path });
  if (window.dataLayer && GTM_ID) window.dataLayer.push({ event: 'page_view', page_path: path });
  if (window.fbq) window.fbq('track', 'PageView');
}

/** Fan a conversion event out to GA4, GTM dataLayer and Meta Pixel. */
export function trackEvent(name, params = {}) {
  try {
    if (window.gtag && GA4_ID) window.gtag('event', name, params);
    if (window.dataLayer && GTM_ID) window.dataLayer.push({ event: name, ...params });
    if (window.fbq) {
      // Map key events to standard Meta events for ad optimization
      if (name === EVENTS.FORM_SUBMITTED) window.fbq('track', 'Lead', params);
      else window.fbq('trackCustom', name, params);
    }
  } catch {
    /* analytics must never break the UI */
  }
}
