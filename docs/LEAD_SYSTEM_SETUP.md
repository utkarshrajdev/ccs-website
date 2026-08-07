# Lead Capture & Marketing Setup Guide

This guide covers the complete lead management system: Google Apps Script backend, Drive resume storage, Sheets lead storage, email notifications, analytics (GA4 / GTM / Meta Pixel), and running ad campaigns.

## Architecture

```
Website form (React)
   │  JSON POST (text/plain - no CORS preflight)
   ▼
Google Apps Script Web App          ←  swappable for Django/FastAPI later
   ├── Google Drive   (resume files)
   ├── Google Sheets  (one tab per form, incl. UTM attribution)
   ├── MailApp        (HTML email → user + admin)
   └── WhatsApp Cloud API (optional stub, off by default)
```

The frontend only knows one thing: `VITE_LEADS_API_URL` accepts a JSON payload and returns `{ success, message }`. To migrate to a real backend later, implement the same contract and change one env variable. No frontend code changes.

**Payload contract** (`src/services/leadService.js`):

```json
{
  "formType": "job-application | training-enquiry | consultancy-enquiry | contact",
  "name": "…", "email": "…", "phone": "…", "message": "…",
  "jobId": "…", "training": "…", "service": "…",
  "resume": { "fileName": "cv.pdf", "mimeType": "application/pdf", "base64": "…" },
  "utmSource": "…", "utmMedium": "…", "utmCampaign": "…", "utmContent": "…", "utmTerm": "…",
  "referrer": "…", "landingPage": "…", "page": "…", "submittedAt": "ISO date"
}
```

## 1. Google Drive (resumes)

1. In Drive, create a folder, e.g. `CCS Resumes`.
2. Open it and copy the folder ID from the URL: `drive.google.com/drive/folders/`**`FOLDER_ID`**.

Uploaded files are named `JOBID_CandidateName_timestamp.pdf` and shared as "anyone with link can view" so the Drive link in the admin email opens directly.

## 2. Google Sheets (leads)

1. Create a new spreadsheet, e.g. `CCS Leads`. Copy its ID from the URL.
2. Nothing else - the script **auto-creates** these tabs with bold, frozen header rows on first submission:
   `JobApplications`, `TrainingEnquiries`, `ConsultancyEnquiries`, `ContactMessages`.

Reference layouts (with sample rows) are in `sheet-templates/Leads_*.csv`. Every row stores UTM Source/Medium/Campaign/Content/Term, Referrer, Landing Page, submission page, timestamp and a human-readable `Source` column (e.g. `instagram / paid / july-jobs`) for quick campaign analysis with pivot tables.

> Keep the leads spreadsheet **private**. It is written server-side by the script; it never needs public sharing (unlike the content CMS sheet).

## 3. Apps Script Deployment

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the default code, paste the full contents of `apps-script/Code.gs`, save.
3. **Project Settings → Script Properties** - add:

   | Property | Value |
   |---|---|
   | `SPREADSHEET_ID` | your leads sheet ID |
   | `DRIVE_FOLDER_ID` | your resumes folder ID |
   | `ADMIN_EMAILS` | `you@example.com, partner@example.com` |
   | `BRAND_NAME` | `Champaran Consultancy Services` (optional) |
   | `REPLY_TO` | `info@champaranconsultancy.com` (optional) |
   | `WHATSAPP_ENABLED` | `false` |

4. In the editor, run the `testSetup` function once → grant the permission prompts → check the log confirms your sheet, folder and admin emails.
5. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web App URL (`https://script.google.com/macros/s/…/exec`) into your `.env`:

```bash
VITE_LEADS_API_URL=https://script.google.com/macros/s/XXXX/exec
```

7. Rebuild/redeploy the site. Test each form and confirm: row appears in the sheet, resume lands in Drive, both emails arrive.

**Updating the script later:** edit code → **Deploy → Manage deployments → Edit (pencil) → New version**. Keeping the same deployment keeps the same URL.

**Quotas:** free Gmail accounts can send ~100 emails/day via MailApp (Workspace: 1,500/day). `testSetup` prints your remaining quota.

## 4. Email Notifications

Both emails use a professional HTML template (blue header, details table) defined in `Code.gs`:

- **User email** - confirmation with all submitted details and the expected response time; reply-to set to your `REPLY_TO` address.
- **Admin email** - instant alert with all details, marketing attribution table, source, timestamp, and the resume Drive link for job applications. **Reply-to is set to the lead's email**, so hitting Reply contacts the candidate directly.

Customize wording in `sendUserEmail` / `sendAdminEmail`, and layout in `buildEmailShell`.

## 5. WhatsApp Notifications (optional, pre-wired)

Disabled by default. To enable without touching other code, add Script Properties:

| Property | Value |
|---|---|
| `WHATSAPP_ENABLED` | `true` |
| `WHATSAPP_TOKEN` | Meta permanent access token |
| `WHATSAPP_PHONE_ID` | WhatsApp Cloud API phone number ID |
| `WHATSAPP_TO` | admin number, e.g. `9198765XXXXX` |

Prerequisites: a Meta Business account with the WhatsApp Cloud API set up (developers.facebook.com → Create App → WhatsApp). The stub sends a plain text alert; swap to an approved template message in `notifyWhatsApp()` for delivery outside the 24-hour session window.

## 6. Analytics: GA4, GTM, Meta Pixel

Add the IDs to `.env` - each one is optional and loads only when set:

```bash
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
VITE_META_PIXEL_ID=1234567890
```

Where to find them: GA4 → Admin → Data streams → Web (`G-…`); Tag Manager → workspace ID in the top bar (`GTM-…`); Meta Events Manager → Data sources → your Pixel ID.

**Events fired automatically** (`src/utils/tracking.js`):

| Event | When | Meta Pixel mapping |
|---|---|---|
| `page_view` | every route change (SPA-aware) | PageView |
| `cta_clicked` | prominent CTA buttons (with `cta_label`) | custom |
| `form_started` | first interaction with any form (with `form_type`) | custom |
| `resume_uploaded` | valid resume attached | custom |
| `form_submitted` | successful submission (with `form_type`) | **Lead** (standard event - use it as your ad conversion) |

In GA4, mark `form_submitted` as a key event (Admin → Events → toggle). In Meta Ads, optimize campaigns for the **Lead** event.

## 7. Running Ad Campaigns

Every form has a deep link that pre-fills from URL parameters:

| Destination | URL pattern |
|---|---|
| Job application | `/apply?jobId=JOB001` |
| Training enquiry | `/training/enquire?id=TRN001` |
| Consultancy enquiry | `/consultancy/enquire?service=Study%20Abroad` |
| Contact | `/contact` |

Append UTM parameters to the ad's destination URL - they are captured on landing, persisted for the session, and stored with the lead:

```
https://www.champaranconsultancy.com/apply?jobId=JOB001
  &utm_source=instagram&utm_medium=paid&utm_campaign=july-jobs
  &utm_content=reel-a&utm_term=react+developer
```

Suggested conventions: `utm_source` = platform (`instagram`, `facebook`, `youtube`, `google`); `utm_medium` = `paid` / `cpc` / `organic`; `utm_campaign` = one name per campaign; `utm_content` = creative variant for A/B tests.

Analysis: open the leads sheet → Insert → Pivot table → rows = `UTM Campaign`, values = COUNT. That's your leads-per-campaign report; combine with ad spend for cost-per-lead.

## 8. Testing Checklist

- [ ] Each of the 4 forms submits successfully and shows the thank-you screen
- [ ] Row appears in the correct sheet tab with attribution columns filled
- [ ] Resume appears in the Drive folder; link in admin email opens
- [ ] User confirmation + admin alert emails both arrive (check spam initially)
- [ ] Invalid email/phone/oversized file are rejected with inline errors
- [ ] Deep links pre-fill correctly (`/apply?jobId=…` with UTM params)
- [ ] GA4 DebugView shows `form_started` → `form_submitted` events
- [ ] Meta Pixel Helper extension shows the `Lead` event on submission

## 9. Migrating to a Real Backend Later

1. Build an endpoint (Django/FastAPI/Express) accepting the JSON contract above and returning `{ "success": true }`.
2. Handle the base64 `resume` field (store in S3/local/Drive) and replicate email sending.
3. Change `VITE_LEADS_API_URL` to the new endpoint. Done - zero frontend changes.
