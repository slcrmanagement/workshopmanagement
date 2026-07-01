/**
 * Central workshop registry.
 *
 * TO ADD A NEW WORKSHOP:
 *  1. Copy the object below and paste it after the comment at the bottom.
 *  2. Set registrationOpen: true and fill in the dates.
 *  3. Set registrationEndpoint to collect form submissions:
 *       - Formspree (free): create account at formspree.io → paste URL here
 *       - Google Apps Script: deploy as web app → paste URL here
 *       - Leave '' to skip (just show thank-you page with no storage)
 *  4. Create  data/<id>/registrations.json  (empty array []) — fill manually
 *     after each registration.
 *  5. npm run build → GitHub Actions auto-deploys.
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
    registrationOpen: false,   // set true for future workshops
    feedbackOpen: true,

    // ── Registration form endpoint ────────────────────────────────────────
    // Where to POST registration submissions (JSON).
    // Options:
    //   Formspree  →  https://formspree.io/f/<your-id>
    //   Apps Script →  https://script.google.com/macros/s/<id>/exec
    //   '' to show thank-you only (add people manually to registrations.json)
    registrationEndpoint: '',

    // ── Feedback submission endpoint ──────────────────────────────────────
    // Same options as registrationEndpoint.
    feedbackEndpoint: '',

    // ── Local data file ───────────────────────────────────────────────────
    // Path under /data/ — edit this JSON file to add/remove participants.
    dataFile: 'scalgo-live-2026/registrations.json',

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
      serialPrefix: 'SLCR-SCALGO26',
    },
  },
  

  // ─── Add future workshops below ──────────────────────────────────────────
];

export function getWorkshop(id) {
  return workshops.find((w) => w.id === id) ?? null;
}
