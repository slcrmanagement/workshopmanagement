/**
 * Runs automatically before every build (via "prebuild" in package.json).
 * Also run manually: node scripts/sync-participants.js [workshopId]
 *
 * READS (admin manages these — plain email, no hash needed):
 *   source/registrations-<workshopId>.json   ← existing / manually added participants
 *   source/website-<workshopId>.json         ← auto-collected from website form (if configured)
 *
 * WRITES (never edit these by hand):
 *   public/data/<workshopId>/participants.json         ← id + name + emailHash (no email)
 *   public/data/<workshopId>/hashes/<hash>.json        ← id + name only (one file per person)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'source');
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');

function sha256(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    console.warn(`  Warning: could not parse ${filePath}`);
    return [];
  }
}

function processWorkshop(workshopId) {
  // Load admin-managed registrations
  const manual = readJSON(path.join(SOURCE_DIR, `registrations-${workshopId}.json`));

  // Load website form submissions (if any have been collected)
  const website = readJSON(path.join(SOURCE_DIR, `website-${workshopId}.json`));

  // Merge — website entries get IDs continuing from manual list
  const allEmails = new Set(manual.map((r) => r.email.trim().toLowerCase()));
  let nextId = manual.length > 0 ? Math.max(...manual.map((r) => r.id)) + 1 : 1;

  const merged = [...manual];
  for (const r of website) {
    const key = r.email.trim().toLowerCase();
    if (!allEmails.has(key)) {
      merged.push({ ...r, id: nextId++ });
      allEmails.add(key);
    }
  }

  if (merged.length === 0) {
    console.log(`  skipped ${workshopId} — no registrations yet`);
    return;
  }

  const outDir = path.join(PUBLIC_DATA, workshopId);
  const hashDir = path.join(outDir, 'hashes');
  fs.mkdirSync(hashDir, { recursive: true });

  // Build participants list — hashes generated here, admin never touches hashes
  const participants = merged.map((r) => ({
    id: r.id,
    name: r.name,
    emailHash: sha256(r.email),
  }));

  // Write participants.json (no email, no personal data)
  fs.writeFileSync(
    path.join(outDir, 'participants.json'),
    JSON.stringify(participants, null, 2)
  );

  // Remove stale hash files (for deleted/updated entries)
  const activeHashes = new Set(participants.map((p) => p.emailHash));
  for (const file of fs.readdirSync(hashDir)) {
    if (!activeHashes.has(file.replace('.json', ''))) {
      fs.unlinkSync(path.join(hashDir, file));
    }
  }

  // One file per person — contains ONLY id + name (no email, no hash visible to user)
  for (const p of participants) {
    fs.writeFileSync(
      path.join(hashDir, `${p.emailHash}.json`),
      JSON.stringify({ id: p.id, name: p.name })
    );
  }

  console.log(`  ✓ ${workshopId} — ${participants.length} participant(s) synced`);
}

// Determine which workshops to process
const arg = process.argv[2];

if (arg) {
  processWorkshop(arg);
} else {
  // Auto-detect all source files
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log('No source/ directory found — skipping participant sync');
    process.exit(0);
  }
  const ids = new Set(
    fs.readdirSync(SOURCE_DIR)
      .filter((f) => f.startsWith('registrations-') && f.endsWith('.json'))
      .map((f) => f.replace('registrations-', '').replace('.json', ''))
  );
  if (ids.size === 0) {
    console.log('No registrations found in source/ — skipping');
  } else {
    console.log('Syncing participants...');
    for (const id of ids) processWorkshop(id);
  }
}
