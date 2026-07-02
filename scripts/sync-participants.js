/**
 * Runs automatically before `npm run dev` and `npm run build`.
 * Also run manually: node scripts/sync-participants.js [workshopId]
 *
 * READS  (admin edits only these — plain email, no hash):
 *   source/registrations-<workshopId>.json
 *
 * WRITES (never edit by hand — auto-generated):
 *   public/data/<workshopId>/participants.json   →  id + name + emailHash only
 *
 * Admin workflow:
 *   1. Add person to source/registrations-<id>.json  (name + email, nothing else required)
 *   2. npm run dev  OR  push to GitHub — file auto-generated, no manual hash work
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'source');
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');

function sha256(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

function processWorkshop(workshopId) {
  const sourceFile = path.join(SOURCE_DIR, `registrations-${workshopId}.json`);
  if (!fs.existsSync(sourceFile)) {
    console.error(`  ✗ Not found: source/registrations-${workshopId}.json`);
    return;
  }

  const registrations = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

  // Generate: id + name + emailHash only — no email, phone, address, gender
  const participants = registrations.map((r) => ({
    id: r.id,
    name: r.name,
    emailHash: sha256(r.email),
  }));

  const outDir = path.join(PUBLIC_DATA, workshopId);
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'participants.json'),
    JSON.stringify(participants, null, 2)
  );

  console.log(`  ✓ ${workshopId} — ${participants.length} participant(s)`);
}

const arg = process.argv[2];

if (arg) {
  processWorkshop(arg);
} else {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log('source/ not found — skipping');
    process.exit(0);
  }
  const ids = fs.readdirSync(SOURCE_DIR)
    .filter((f) => f.startsWith('registrations-') && f.endsWith('.json'))
    .map((f) => f.replace('registrations-', '').replace('.json', ''));

  if (ids.length === 0) {
    console.log('No registrations in source/ — skipping');
  } else {
    console.log('Syncing participants...');
    ids.forEach(processWorkshop);
  }
}
