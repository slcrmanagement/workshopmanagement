import { NextResponse } from 'next/server';
import { getWorkshop } from '@/config/workshops';
import { isRegistrationOpen } from '@/lib/workshopUtils';
import { readRegistrationsFile, writeRegistrationsFile } from '@/lib/sourceStorage';
import { DEFAULT_REGISTRATION_FIELDS } from '@/config/formDefaults';

export async function POST(request) {
  try {
    const { workshopId, fields } = await request.json();

    if (!workshopId || !/^[\w-]+$/.test(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop' }, { status: 400 });
    }

    const ws = getWorkshop(workshopId);
    if (!ws) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    if (!isRegistrationOpen(ws.registrationDeadline)) {
      return NextResponse.json({ error: 'Registration closed' }, { status: 403 });
    }

    const formFields = ws.registrationFields ?? DEFAULT_REGISTRATION_FIELDS;
    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const missing = formFields.find((f) => f.required && !String(fields[f.key] ?? '').trim());
    if (missing) {
      return NextResponse.json({ error: `Missing required field: ${missing.label}` }, { status: 400 });
    }
    // name and email are structural — used for certificate personalization and email lookup.
    if (!fields.name || !fields.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // File is created automatically on first write — nothing to set up for a new workshop.
    const { data, sha } = await readRegistrationsFile(workshopId);
    const list = data ?? [];

    const nextId = list.reduce((max, r) => Math.max(max, r.id ?? 0), 0) + 1;

    const entry = { id: nextId, registeredAt: new Date().toISOString() };
    for (const f of formFields) entry[f.key] = fields[f.key] ?? '';
    // Attendance is confirmed by an admin after the workshop, not by the registrant.
    entry.attendee = false;

    list.push(entry);

    await writeRegistrationsFile(workshopId, list, sha, `Registration: ${fields.name} (${workshopId})`);

    return NextResponse.json({ ok: true, id: nextId });
  } catch (e) {
    console.error('Register API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
