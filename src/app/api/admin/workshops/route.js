import { NextResponse } from 'next/server';
import { readWorkshopsFile, writeWorkshopsFile } from '@/lib/sourceStorage';

const ID_RE = /^[a-z0-9-]+$/;

function cleanFieldList(list) {
  if (!Array.isArray(list)) return undefined;
  const cleaned = list
    .filter((f) => f && f.key && f.label)
    .map((f) => ({
      key: String(f.key).trim(),
      label: String(f.label).trim(),
      type: f.type || 'text',
      required: !!f.required,
      ...(Array.isArray(f.options) && f.options.length ? { options: f.options } : {}),
    }));
  return cleaned.length ? cleaned : undefined;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      shortTitle,
      date,
      displayDate,
      registrationDeadline,
      venue,
      organizer,
      organizerFull,
      description,
      tags,
      feedbackOpen,
      registrationEndpoint,
      feedbackEndpoint,
      certificateTemplatePdf,
      registrationFields,
      feedbackQuestions,
    } = body;

    if (!id || !ID_RE.test(id)) {
      return NextResponse.json(
        { error: 'Workshop id must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }
    if (!title || !shortTitle || !date || !registrationDeadline || !venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, sha } = await readWorkshopsFile();
    const list = data ?? [];

    if (list.some((w) => w.id === id)) {
      return NextResponse.json({ error: 'A workshop with this id already exists' }, { status: 409 });
    }

    const entry = {
      id,
      title,
      shortTitle,
      date,
      displayDate: displayDate || date,
      registrationDeadline,
      venue,
      organizer: organizer || '',
      organizerFull: organizerFull || organizer || '',
      description: description || '',
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      feedbackOpen: !!feedbackOpen,
      registrationEndpoint: registrationEndpoint || '',
      feedbackEndpoint: feedbackEndpoint || '',
      dataFile: `${id}/participants.json`,
      registrationFields: cleanFieldList(registrationFields),
      feedbackQuestions: cleanFieldList(feedbackQuestions),
      certificate: {
        templatePdf: certificateTemplatePdf || `/certificate/${id}.pdf`,
      },
    };

    list.push(entry);
    await writeWorkshopsFile(list, sha, `Add workshop: ${title} (${id})`);

    return NextResponse.json({ ok: true, workshop: entry });
  } catch (e) {
    console.error('Create workshop error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Toggles feedback/certificate availability for a workshop — feedback stays
// closed by default until an admin explicitly activates it here.
export async function PATCH(request) {
  try {
    const { id, feedbackOpen } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { data, sha } = await readWorkshopsFile();
    const list = data ?? [];
    const ws = list.find((w) => w.id === id);

    if (!ws) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    ws.feedbackOpen = !!feedbackOpen;
    await writeWorkshopsFile(
      list,
      sha,
      `${ws.feedbackOpen ? 'Activate' : 'Deactivate'} feedback: ${id}`
    );

    return NextResponse.json({ ok: true, workshop: ws });
  } catch (e) {
    console.error('Update workshop error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
