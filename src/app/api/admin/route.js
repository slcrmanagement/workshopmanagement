import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readFeedbackFile } from '@/lib/sourceStorage';
import { getWorkshops, getWorkshop } from '@/config/workshops';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workshops = await getWorkshops();
    const workshopId = searchParams.get('workshopId') || workshops[0]?.id;

    if (!workshopId || !(await getWorkshop(workshopId))) {
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
