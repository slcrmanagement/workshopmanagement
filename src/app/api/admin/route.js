import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readFeedbackFile } from '@/lib/sourceStorage';
import { workshops, getWorkshop } from '@/config/workshops';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId') || workshops[0]?.id;

    if (!workshopId || !getWorkshop(workshopId)) {
      return NextResponse.json({ error: 'Unknown workshop' }, { status: 404 });
    }

    const regFile = path.join(process.cwd(), 'source', `registrations-${workshopId}.json`);
    const registrations = fs.existsSync(regFile)
      ? JSON.parse(fs.readFileSync(regFile, 'utf8'))
      : [];

    const { data: feedback } = await readFeedbackFile(workshopId);

    return NextResponse.json({ registrations, feedback: feedback ?? [] });
  } catch (e) {
    console.error('Admin API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
