/**
 * Champaran Consultancy Services - Lead Management Backend
 * Google Apps Script Web App (no custom backend needed)
 *
 * Receives lead submissions from the website, uploads resumes to Google
 * Drive, stores every lead (with marketing attribution) in Google Sheets,
 * and sends HTML email notifications to the user and the admin.
 *
 * ── SETUP ────────────────────────────────────────────────────────────
 * 1. Create a Google Sheet for leads. Copy its ID.
 * 2. Create a Google Drive folder for resumes. Copy its ID.
 * 3. In the Apps Script editor: Project Settings → Script Properties, add:
 *      SPREADSHEET_ID   = <your leads sheet id>
 *      DRIVE_FOLDER_ID  = <your resumes folder id>
 *      ADMIN_EMAILS     = you@example.com, second@example.com
 *      BRAND_NAME       = Champaran Consultancy Services   (optional)
 *      REPLY_TO         = info@champaranconsultancy.com    (optional)
 *      WHATSAPP_ENABLED = false                            (optional)
 * 4. Deploy → New deployment → Web app:
 *      Execute as: Me   |   Who has access: Anyone
 * 5. Copy the Web App URL into the site's .env as VITE_LEADS_API_URL.
 *
 * The script auto-creates sheet tabs and header rows on first submission.
 * ─────────────────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID'),
    adminEmails: (props.getProperty('ADMIN_EMAILS') || '').split(',').map(function (s) { return s.trim(); }).filter(String),
    brandName: props.getProperty('BRAND_NAME') || 'Champaran Consultancy Services',
    replyTo: props.getProperty('REPLY_TO') || '',
    whatsappEnabled: (props.getProperty('WHATSAPP_ENABLED') || 'false') === 'true',
  };
}

/** Form-type registry: sheet tab, human label and expected response time. */
var FORM_REGISTRY = {
  'job-application': {
    sheet: 'JobApplications',
    label: 'Job Application',
    responseTime: '24 hours',
    fields: ['jobId', 'jobTitle', 'company'],
  },
  'training-enquiry': {
    sheet: 'TrainingEnquiries',
    label: 'Training Enquiry',
    responseTime: '24 hours',
    fields: ['training', 'trainingId'],
  },
  'consultancy-enquiry': {
    sheet: 'ConsultancyEnquiries',
    label: 'Consultancy Enquiry',
    responseTime: '24 hours',
    fields: ['service'],
  },
  'contact': {
    sheet: 'ContactMessages',
    label: 'Contact Message',
    responseTime: '24 hours',
    fields: [],
  },
};

/** Attribution columns stored with every submission. */
var TRACKING_FIELDS = ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm', 'referrer', 'landingPage', 'page'];

// ---------------------------------------------------------------------
// HTTP entry points
// ---------------------------------------------------------------------

/** Health check: open the web app URL in a browser. */
function doGet() {
  return jsonResponse({ success: true, message: 'CCS lead endpoint is running.' });
}

/** Main entry point for form submissions. */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var registry = FORM_REGISTRY[data.formType];

    // ---- Validation --------------------------------------------------
    if (!registry) return jsonResponse({ success: false, message: 'Unknown form type.' });
    var invalid = validateLead(data);
    if (invalid) return jsonResponse({ success: false, message: invalid });

    var config = getConfig();
    if (!config.spreadsheetId) return jsonResponse({ success: false, message: 'Server not configured: SPREADSHEET_ID missing.' });

    // ---- Resume upload (job applications) ----------------------------
    var resumeUrl = '';
    if (data.formType === 'job-application') {
      if (!data.resume || !data.resume.base64) {
        return jsonResponse({ success: false, message: 'Resume file is required.' });
      }
      resumeUrl = uploadResume(data, config);
    }

    // ---- Store in Google Sheets --------------------------------------
    saveToSheet(data, registry, resumeUrl, config);

    // ---- Notifications ----------------------------------------------
    try {
      sendUserEmail(data, registry, config);
      sendAdminEmail(data, registry, resumeUrl, config);
      if (config.whatsappEnabled) notifyWhatsApp(data, registry, resumeUrl, config);
    } catch (notifyErr) {
      // Lead is already saved - never fail the submission over a notification.
      console.error('Notification error: ' + notifyErr);
    }

    return jsonResponse({ success: true, message: 'Submission received.', resumeUrl: resumeUrl });
  } catch (err) {
    console.error('doPost error: ' + err);
    return jsonResponse({ success: false, message: 'Server error: ' + err.message });
  }
}

// ---------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------

function validateLead(data) {
  if (!data.name || String(data.name).trim().length < 2) return 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || ''))) return 'A valid email is required.';
  if (!data.phone || String(data.phone).replace(/\D/g, '').length < 8) return 'A valid phone number is required.';
  if (data.resume && data.resume.base64) {
    var bytes = Utilities.base64Decode(data.resume.base64).length;
    if (bytes > 5 * 1024 * 1024) return 'Resume must be smaller than 5 MB.';
    var okType = /\.(pdf|doc|docx)$/i.test(data.resume.fileName || '');
    if (!okType) return 'Resume must be a PDF, DOC or DOCX file.';
  }
  return null;
}

/** Upload the resume to Drive; returns a shareable file URL. */
function uploadResume(data, config) {
  var folder = config.driveFolderId
    ? DriveApp.getFolderById(config.driveFolderId)
    : DriveApp.getRootFolder();

  var blob = Utilities.newBlob(
    Utilities.base64Decode(data.resume.base64),
    data.resume.mimeType || 'application/octet-stream',
    buildResumeFileName(data)
  );
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function buildResumeFileName(data) {
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  var safeName = String(data.name).replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
  var ext = (String(data.resume.fileName).match(/\.(pdf|docx?|)$/i) || ['', 'pdf'])[1] || 'pdf';
  return [data.jobId || 'GENERAL', safeName, stamp].join('_') + '.' + ext.replace('.', '');
}

/** Append the lead to its sheet tab (auto-creating tab + header row). */
function saveToSheet(data, registry, resumeUrl, config) {
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var sheet = ss.getSheetByName(registry.sheet) || ss.insertSheet(registry.sheet);

  var headers = ['Timestamp', 'Name', 'Email', 'Phone']
    .concat(registry.fields.map(titleCase))
    .concat(data.formType === 'job-application' ? ['Resume URL'] : [])
    .concat(['Message'])
    .concat(TRACKING_FIELDS.map(titleCase))
    .concat(['Source']);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var row = [new Date(), data.name, data.email, data.phone]
    .concat(registry.fields.map(function (f) { return data[f] || ''; }))
    .concat(data.formType === 'job-application' ? [resumeUrl] : [])
    .concat([data.message || ''])
    .concat(TRACKING_FIELDS.map(function (f) { return data[f] || ''; }))
    .concat([buildSourceLabel(data)]);

  sheet.appendRow(row);
}

/** Human-readable source, e.g. "instagram / paid / july-jobs" or "Direct". */
function buildSourceLabel(data) {
  var parts = [data.utmSource, data.utmMedium, data.utmCampaign].filter(String);
  if (parts.length) return parts.join(' / ');
  if (data.referrer) return 'Referral: ' + data.referrer;
  return 'Direct';
}

function titleCase(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (c) { return c.toUpperCase(); })
    .replace(/^Utm/, 'UTM');
}

// ---------------------------------------------------------------------
// Email notifications
// ---------------------------------------------------------------------

function sendUserEmail(data, registry, config) {
  var subject = config.brandName + ' - We received your ' + registry.label.toLowerCase();
  var html = buildEmailShell(
    config.brandName,
    'Thank you, ' + escapeHtml(firstName(data.name)) + '!',
    '<p>We have received your <strong>' + registry.label.toLowerCase() + '</strong> and our team is on it. ' +
      'You can expect a response within <strong>' + registry.responseTime + '</strong> on working days.</p>' +
      buildDetailsTable(data, registry, ''),
    'This is an automated confirmation. Simply reply to this email if you want to add anything.'
  );

  var options = { htmlBody: html, name: config.brandName };
  if (config.replyTo) options.replyTo = config.replyTo;
  MailApp.sendEmail(data.email, subject, stripHtml(html), options);
}

function sendAdminEmail(data, registry, resumeUrl, config) {
  if (!config.adminEmails.length) return;

  var subject = '🔔 New ' + registry.label + ': ' + data.name +
    (data.jobTitle ? ' - ' + data.jobTitle : '') +
    (data.training ? ' - ' + data.training : '') +
    (data.service ? ' - ' + data.service : '');

  var trackingRows = TRACKING_FIELDS
    .filter(function (f) { return data[f]; })
    .map(function (f) { return tableRow(titleCase(f), escapeHtml(data[f])); })
    .join('');

  var html = buildEmailShell(
    config.brandName + ' - Admin',
    'New ' + registry.label,
    buildDetailsTable(data, registry, resumeUrl) +
      (trackingRows
        ? '<h3 style="margin:24px 0 8px;font-size:14px;color:#334155;">Marketing Attribution</h3>' +
          '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">' + trackingRows + '</table>'
        : '') +
      tableWrap(tableRow('Source', escapeHtml(buildSourceLabel(data))) + tableRow('Submitted At', escapeHtml(data.submittedAt || new Date().toISOString()))),
    'Reply directly to this email to reach the lead (reply-to is set to their address).'
  );

  MailApp.sendEmail(config.adminEmails.join(','), subject, stripHtml(html), {
    htmlBody: html,
    name: config.brandName + ' Website',
    replyTo: data.email,
  });
}

/** Details table shared by user + admin emails. */
function buildDetailsTable(data, registry, resumeUrl) {
  var rows =
    tableRow('Name', escapeHtml(data.name)) +
    tableRow('Email', escapeHtml(data.email)) +
    tableRow('Phone', escapeHtml(data.phone));

  registry.fields.forEach(function (f) {
    if (data[f]) rows += tableRow(titleCase(f), escapeHtml(data[f]));
  });
  if (resumeUrl) {
    rows += tableRow('Resume', '<a href="' + resumeUrl + '" style="color:#2563eb;">View resume on Google Drive</a>');
  }
  if (data.message) rows += tableRow('Message', escapeHtml(data.message));

  return '<h3 style="margin:24px 0 8px;font-size:14px;color:#334155;">Submitted Details</h3>' + tableWrap(rows);
}

// ---- HTML email template helpers ------------------------------------

function buildEmailShell(brand, heading, bodyHtml, footerNote) {
  return (
    '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">' +
    '<table cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5f9;padding:24px 0;"><tr><td align="center">' +
    '<table cellpadding="0" cellspacing="0" style="width:600px;max-width:94%;background:#ffffff;border-radius:12px;overflow:hidden;">' +
    '<tr><td style="background:#1d4ed8;padding:20px 32px;">' +
    '<span style="color:#ffffff;font-size:18px;font-weight:bold;">' + escapeHtml(brand) + '</span></td></tr>' +
    '<tr><td style="padding:32px;">' +
    '<h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">' + heading + '</h2>' +
    '<div style="font-size:14px;line-height:1.6;color:#475569;">' + bodyHtml + '</div></td></tr>' +
    '<tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">' +
    '<p style="margin:0;font-size:12px;color:#94a3b8;">' + escapeHtml(footerNote) + '</p></td></tr>' +
    '</table></td></tr></table></body></html>'
  );
}

function tableWrap(rows) {
  return '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">' + rows + '</table>';
}

function tableRow(label, valueHtml) {
  return (
    '<tr>' +
    '<td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-size:13px;color:#64748b;width:160px;">' + label + '</td>' +
    '<td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a;">' + valueHtml + '</td>' +
    '</tr>'
  );
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0];
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(html) {
  return html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------
// WhatsApp notifications (extension point)
// ---------------------------------------------------------------------

/**
 * Stubbed WhatsApp notification via Meta WhatsApp Cloud API.
 *
 * To enable later WITHOUT changing any other code:
 * 1. Add Script Properties:
 *      WHATSAPP_ENABLED = true
 *      WHATSAPP_TOKEN   = <Meta permanent access token>
 *      WHATSAPP_PHONE_ID = <Cloud API phone number id>
 *      WHATSAPP_TO      = 91XXXXXXXXXX   (admin number, country code, no +)
 * 2. Create an approved message template in Meta Business Manager
 *    (or send a plain text message within a 24h session window).
 */
function notifyWhatsApp(data, registry, resumeUrl, config) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('WHATSAPP_TOKEN');
  var phoneId = props.getProperty('WHATSAPP_PHONE_ID');
  var to = props.getProperty('WHATSAPP_TO');
  if (!token || !phoneId || !to) return;

  var text =
    'New ' + registry.label + '\n' +
    'Name: ' + data.name + '\n' +
    'Phone: ' + data.phone + '\n' +
    'Email: ' + data.email +
    (resumeUrl ? '\nResume: ' + resumeUrl : '') +
    '\nSource: ' + buildSourceLabel(data);

  UrlFetchApp.fetch('https://graph.facebook.com/v19.0/' + phoneId + '/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text },
    }),
    muteHttpExceptions: true,
  });
}

// ---------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to verify configuration + permissions. */
function testSetup() {
  var config = getConfig();
  console.log('Spreadsheet: ' + (config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId).getName() : 'MISSING'));
  console.log('Drive folder: ' + (config.driveFolderId ? DriveApp.getFolderById(config.driveFolderId).getName() : 'MISSING (root will be used)'));
  console.log('Admin emails: ' + (config.adminEmails.join(', ') || 'MISSING'));
  console.log('Mail quota remaining today: ' + MailApp.getRemainingDailyQuota());
}
