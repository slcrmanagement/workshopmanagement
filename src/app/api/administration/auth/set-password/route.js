import { NextResponse } from 'next/server';
import { createAdminClient, lookupAdminUser } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Re-verify server-side — don't trust the client's step-gating alone.
    const result = await lookupAdminUser(email);
    if (!result.exists) {
      return NextResponse.json({ error: 'This email is not registered as an admin.' }, { status: 404 });
    }
    if (result.hasPassword) {
      return NextResponse.json({ error: 'A password is already set for this account.' }, { status: 409 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(result.userId, {
      password,
      app_metadata: { password_set: true },
    });

    if (error) {
      return NextResponse.json({ error: error.message || 'Could not set password' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('set-password error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
