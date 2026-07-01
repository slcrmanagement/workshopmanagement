/**
 * Central workshop registry.
 *
 * TO ADD A NEW WORKSHOP:
 *  1. Copy the object below and paste it after the comment at the bottom.
 *  2. Create  data/<id>/registrations.json  with participant rows.
 *  3. Fill in googleRegistrationFormUrl, feedbackGoogleFormUrl, googleSheetId if you have them.
 *  4. Set feedbackEndpoint to a Google Apps Script URL or Formspree URL to collect feedback.
 *  5. npm run build  →  GitHub Actions deploys automatically.
 */

export const workshops = [
  {
    id: 'scalgo-live-2026',
    title: 'SCALGO Live Workshop 2026',
    shortTitle: 'SCALGO Live 2026',

    // ── Dates ─────────────────────────────────────────────────────────────
    date: '2026-06-25',
    displayDate: '25 June 2026',
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
    registrationOpen: false,
    feedbackOpen: true,

    // ── Google integration (fill in when available) ───────────────────────
    googleRegistrationFormUrl: '', // Google Form URL used for registration
    feedbackGoogleFormUrl: '',     // Google Form URL for feedback (alternate channel)
    googleSheetId: '',             // Sheet ID of the registration responses spreadsheet

    // ── Local data file ───────────────────────────────────────────────────
    // Path relative to /data/ directory — served as static JSON by GitHub Pages
    dataFile: 'scalgo-live-2026/registrations.json',

    // ── Feedback submission endpoint ──────────────────────────────────────
    // POST target for feedback JSON. Options:
    //   Google Apps Script web app URL   →  deploy script as web app, paste URL here
    //   Formspree                        →  https://formspree.io/f/<id>
    //   Leave '' to skip (certificate still generates)
    feedbackEndpoint: '',

    // ── Certificate ───────────────────────────────────────────────────────
    certificate: {
      title: 'Certificate of Participation',
      eventName: 'SCALGO Live Workshop 2026',
      eventDate: '25th June 2026',
      venue: 'Department of Civil Engineering, IIT (BHU), Varanasi',
      issuedBy: 'Smart Laboratory on Clean Rivers (SLCR)\nDepartment of Civil Engineering, IIT (BHU), Varanasi',
      signatories: [
        {
          name: 'Workshop Coordinator',
          title: 'SLCR, IIT (BHU) Varanasi',
        },
      ],
      // Prefix for serial numbers → SLCR-SCALGO26-001, -002 …
      serialPrefix: 'SLCR-SCALGO26',
    },
  },

  // ─── Paste future workshops below this line ───────────────────────────────
];

/** Look up a single workshop by id. */
export function getWorkshop(id) {
  return workshops.find((w) => w.id === id) ?? null;
}
