import { NextResponse } from 'next/server';
import { readFeedbackFile, writeFeedbackFile } from '@/lib/sourceStorage';

export async function POST(request) {
  try {
    const { workshopId, participantId, name } = await request.json();

    if (!workshopId || !/^[\w-]+$/.test(workshopId)) {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const { data: feedbacks, sha } = await readFeedbackFile(workshopId);
    const list = feedbacks ?? [];

    const entry = list.find((f) => f.registrationId === participantId);
    if (entry) {
      entry.certificateDownloaded = true;
      entry.downloadedAt = new Date().toISOString();
    } else {
      list.push({
        registrationId: participantId,
        name,
        feedbackDone: false,
        certificateDownloaded: true,
        downloadedAt: new Date().toISOString(),
      });
    }

    await writeFeedbackFile(
      workshopId,
      list,
      sha,
      `Certificate downloaded: ${name} (${workshopId})`
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Certificate-downloaded API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
