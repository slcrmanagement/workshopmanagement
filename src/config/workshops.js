import { DEFAULT_REGISTRATION_FIELDS, DEFAULT_FEEDBACK_QUESTIONS } from './formDefaults';

/**
 * Central workshop registry.
 *
 * TO ADD A NEW WORKSHOP:
 *  1. Copy the object below and paste it after the comment at the bottom.
 *  2. Fill in the dates — registrationOpen is AUTO-COMPUTED from registrationDeadline.
 *     Before/on the deadline → Registration Open. After → Closed.
 *  3. Set registrationEndpoint to collect form submissions:
 *       - Formspree (free): create account at formspree.io → paste URL here
 *       - Google Apps Script: deploy as web app → paste URL here
 *       - Leave '' to skip (just show thank-you page, add people manually)
 *  4. registrationFields / feedbackQuestions are optional — omit them to use
 *     the shared defaults in formDefaults.js, or provide your own array to
 *     run a different registration form / feedback survey for this workshop.
 *  5. Registration and feedback JSON files under source/ are created
 *     automatically on first submission — nothing to set up by hand.
 *  6. npm run build → GitHub Actions auto-deploys.
 */

export const workshops = [
  {
    id: 'scalgo-live-2026',
    title: 'SCALGO Live Workshop 2026',
    shortTitle: 'SCALGO Live 2026',

    // ── Dates ─────────────────────────────────────────────────────────────
    date: '2026-06-25',
    displayDate: '25 June 2026',
    // Registration auto-opens/closes based on this date (inclusive end of day).
    // Change this date to control when registration opens or closes.
    registrationDeadline: '2026-06-20',

    // ── Location & organiser ──────────────────────────────────────────────
    venue: 'Seminar Hall, Department of Civil Engineering, IIT (BHU), Varanasi',
    organizer: 'Smart Laboratory on Clean Rivers (SLCR)',
    organizerFull:
      'Smart Laboratory on Clean Rivers (SLCR), Department of Civil Engineering, IIT (BHU), Varanasi',

    description:
      'A one-day workshop on SCALGO Live organized by the Smart Laboratory on Clean Rivers (SLCR), Department of Civil Engineering, IIT (BHU), Varanasi. This program is intended for officials, engineers, planners, researchers, faculty members, students, and professionals working in water resources, urban planning, rural development, drainage, GIS, environment, and disaster management.',

    tags: ['Water Resources', 'GIS', 'Urban Planning', 'Drainage', 'Environment', 'Disaster Management'],

    // ── State flags ───────────────────────────────────────────────────────
    // No registrationOpen field — it is computed automatically from registrationDeadline.
    // Set feedbackOpen: true once the workshop has taken place.
    feedbackOpen: true,

    // ── Registration form endpoint ────────────────────────────────────────
    // Where to POST registration submissions (JSON).
    // Formspree: https://formspree.io/f/<your-id>
    // Apps Script: https://script.google.com/macros/s/<id>/exec
    // Leave '' to show thank-you only (add people manually to registrations.json)
    registrationEndpoint: '',

    // ── Feedback submission endpoint ──────────────────────────────────────
    feedbackEndpoint: '',

    // ── Local data file ───────────────────────────────────────────────────
    // Edit this JSON file to add/remove participants.
    dataFile: 'scalgo-live-2026/participants.json',

    // ── Forms ──────────────────────────────────────────────────────────────
    // Using the shared defaults here — copy formDefaults.js's arrays and
    // edit them per-field if a future workshop needs a different form.
    registrationFields: DEFAULT_REGISTRATION_FIELDS,
    feedbackQuestions: DEFAULT_FEEDBACK_QUESTIONS,

    // ── Certificate ───────────────────────────────────────────────────────
    // PDF in public/certificate/<id>.pdf — participant's name is stamped on it
    certificate: {
      templatePdf: '/certificate/scalgo-live-2026.pdf',
    },
  },

  // ─── Add future workshops below ──────────────────────────────────────────
];

export function getWorkshop(id) {
  return workshops.find((w) => w.id === id) ?? null;
}
