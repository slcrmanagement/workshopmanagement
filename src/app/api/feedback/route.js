import { NextResponse } from 'next/server';
import { readFeedbackFile, writeFeedbackFile } from '@/lib/sourceStorage';

export async function POST(request) {
  try {
    const { workshopId, participantId, name, responses } = await request.json();

    if (!workshopId || !/^[\w-]+$/.test(workshopId)) {
      return NextResponse.json({ error: 'Invalid workshop' }, { status: 400 });
    }
    if (!participantId || !name) {
      return NextResponse.json({ error: 'Missing participant info' }, { status: 400 });
    }

    const { data: feedbacks, sha } = await readFeedbackFile(workshopId);
    const list = feedbacks ?? [];

    const existing = list.find((f) => f.registrationId === participantId);
    if (existing && existing.feedbackDone) {
      return NextResponse.json({ error: 'already submitted' }, { status: 409 });
    }

    const now = new Date().toISOString();
    if (existing) {
      existing.feedbackDone = true;
      existing.responses = responses;
      existing.submittedAt = now;
    } else {
      list.push({
        registrationId: participantId,
        name,
        feedbackDone: true,
        certificateDownloaded: false,
        submittedAt: now,
        responses,
      });
    }

    await writeFeedbackFile(
      workshopId,
      list,
      sha,
      `Feedback submitted: ${name} (${workshopId})`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Feedback API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
