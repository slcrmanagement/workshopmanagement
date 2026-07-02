import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readFeedbackFile } from '@/lib/sourceStorage';

export async function POST(request) {
  try {
    const { workshopId, email } = await request.json();

    if (!workshopId || !/^[\w-]+$/.test(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop' }, { status: 400 });
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check registration
    const regFile = path.join(process.cwd(), 'source', `registrations-${workshopId}.json`);
    if (!fs.existsSync(regFile)) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const registrations = JSON.parse(fs.readFileSync(regFile, 'utf8'));
    const normalizedEmail = email.trim().toLowerCase();
    const match = registrations.find(
      (r) => r.email.trim().toLowerCase() === normalizedEmail
    );

    if (!match) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // Check feedback status for this participant
    let feedbackDone = false;
    let certificateDownloaded = false;
    try {
      const { data: feedbacks } = await readFeedbackFile(workshopId);
      if (feedbacks) {
        const entry = feedbacks.find((f) => f.registrationId === match.id);
        if (entry) {
          feedbackDone = entry.feedbackDone ?? false;
          certificateDownloaded = entry.certificateDownloaded ?? false;
        }
      }
    } catch {
      // Non-blocking — if feedback file unreadable, treat as not done
    }

    return NextResponse.json({
      id: match.id,
      name: match.name,
      feedbackDone,
      certificateDownloaded,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
