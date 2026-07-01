/**
 * Central workshop registry.
 * To add a new workshop:
 *  1. Add a new entry to this array.
 *  2. Create  data/<id>/registrations.json  with participant data.
 *  3. Set feedbackEndpoint to your Google Apps Script web-app URL (or Formspree/etc).
 *  4. npm run build  →  site auto-includes the new workshop.
 */

export const workshops = [
  {
    id: 'scalgo-live-2026',
    title: 'SCALGO Live Workshop 2026',
    shortTitle: 'SCALGO Live 2026',

    // Display dates
    date: '2026-06-25',
    displayDate: '25 June 2026',
    registrationDeadline: '2026-06-20',

    venue: 'Seminar Hall, Department of Civil Engineering, IIT (BHU), Varanasi',
    organizer: 'Smart Laboratory on Clean Rivers (SLCR)',
    organizerFull:
      'Smart Laboratory on Clean Rivers (SLCR), Department of Civil Engineering, IIT (BHU), Varanasi',

    description:
      'A one-day workshop on SCALGO Live organized by the Smart Laboratory on Clean Rivers (SLCR), Department of Civil Engineering, IIT (BHU), Varanasi. This program is intended for officials, engineers, planners, researchers, faculty members, students, and professionals working in water resources, urban planning, rural development, drainage, GIS, environment, and disaster management.',

    tags: ['Water Resources', 'GIS', 'Urban Planning', 'Drainage', 'Environment', 'Disaster Management'],

    // Registration state
    registrationOpen: false,
    feedbackOpen: true,

    // Path relative to /data directory (used at build time + client-side fetch)
    dataFile: 'scalgo-live-2026/registrations.json',

    /**
     * Where to POST feedback submissions.
     * Options:
     *  - Google Apps Script: deploy a script as web app and paste the URL here.
     *  - Formspree: https://formspree.io/f/<id>
     *  - Leave empty ('') to skip submission (certificate still generates).
     */
    feedbackEndpoint: '',

    // Certificate configuration
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
      // Prefix used for certificate serial numbers: PREFIX-001, PREFIX-002 …
      serialPrefix: 'SLCR-SCALGO26',
    },
  },

  // ─── Paste future workshops below this line ───────────────────────────────
];

/** Look up a single workshop by id. */
export function getWorkshop(id) {
  return workshops.find((w) => w.id === id) ?? null;
}
