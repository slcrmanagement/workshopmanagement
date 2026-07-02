/**
 * Read/write source/ files.
 * - Development: direct filesystem (fast, no GitHub token needed)
 * - Production (Vercel): GitHub Contents API (since Vercel FS is read-only)
 *
 * Required env vars in production:
 *   GITHUB_TOKEN  — Personal Access Token with repo write scope
 *   GITHUB_OWNER  — e.g. slcrmanagement
 *   GITHUB_REPO   — e.g. workshopmanagement
 */

import fs from 'fs';
import path from 'path';

const IS_DEV = process.env.NODE_ENV === 'development';

/* ─── Local filesystem (dev) ─────────────────────────────────── */

function localPath(fileName) {
  return path.join(process.cwd(), 'source', fileName);
}

function readLocal(fileName) {
  const p = localPath(fileName);
  if (!fs.existsSync(p)) return { data: null, sha: null };
  return { data: JSON.parse(fs.readFileSync(p, 'utf8')), sha: null };
}

function writeLocal(fileName, data) {
  fs.writeFileSync(localPath(fileName), JSON.stringify(data, null, 2));
}

/* ─── GitHub Contents API (production) ───────────────────────── */

const GH_API = 'https://api.github.com';

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function ghUrl(fileName) {
  const { GITHUB_OWNER, GITHUB_REPO } = process.env;
  return `${GH_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/source/${fileName}`;
}

async function readGitHub(fileName) {
  const res = await fetch(ghUrl(fileName), {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error(`GitHub read failed: ${res.status}`);
  const json = await res.json();
  const data = JSON.parse(Buffer.from(json.content, 'base64').toString('utf8'));
  return { data, sha: json.sha };
}

async function writeGitHub(fileName, data, sha, commitMessage) {
  const body = {
    message: commitMessage,
    content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
  };
  if (sha) body.sha = sha;
  const res = await fetch(ghUrl(fileName), {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write failed: ${res.status} ${err}`);
  }
}

/* ─── Public API ─────────────────────────────────────────────── */

export async function readFeedbackFile(workshopId) {
  const fileName = `feedback-${workshopId}.json`;
  if (IS_DEV) return readLocal(fileName);
  return readGitHub(fileName);
}

export async function writeFeedbackFile(workshopId, data, sha, commitMessage) {
  const fileName = `feedback-${workshopId}.json`;
  if (IS_DEV) return writeLocal(fileName, data);
  return writeGitHub(fileName, data, sha, commitMessage);
}

// Registrations file is auto-created on first write — no setup needed per workshop.
export async function readRegistrationsFile(workshopId) {
  const fileName = `registrations-${workshopId}.json`;
  if (IS_DEV) return readLocal(fileName);
  return readGitHub(fileName);
}

export async function writeRegistrationsFile(workshopId, data, sha, commitMessage) {
  const fileName = `registrations-${workshopId}.json`;
  if (IS_DEV) return writeLocal(fileName, data);
  return writeGitHub(fileName, data, sha, commitMessage);
}
