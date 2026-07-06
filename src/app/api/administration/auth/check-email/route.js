import { NextResponse } from 'next/server';
import { lookupAdminUser } from '@/lib/supabase/admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const result = await lookupAdminUser(email);

    if (!result.exists) {
      return NextResponse.json(
        { error: 'This email is not registered as an admin.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exists: true, hasPassword: result.hasPassword });
  } catch (e) {
    console.error('check-email error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
