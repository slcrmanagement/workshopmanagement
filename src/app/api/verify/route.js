import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { workshopId, email } = await request.json();

    // Prevent path traversal
    if (!workshopId || !/^[\w-]+$/.test(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop' }, { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const sourceFile = path.join(process.cwd(), 'source', `registrations-${workshopId}.json`);

    if (!fs.existsSync(sourceFile)) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const registrations = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const normalizedEmail = email.trim().toLowerCase();

    const match = registrations.find(
      (r) => r.email.trim().toLowerCase() === normalizedEmail
    );

    if (!match) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // Return only id and name — email, phone, address, gender never leave the server
    return NextResponse.json({ id: match.id, name: match.name });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
