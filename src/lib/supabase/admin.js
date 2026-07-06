import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client — the only place SUPABASE_SERVICE_ROLE_KEY is read.
 * Server-only. Never import this from a 'use client' file.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Looks up an admin-provisioned user by email without sending any email
// (generateLink only creates a token, it never dispatches it). Password state
// is tracked via app_metadata.password_set, set by scripts/add-admin-user.js
// and flipped by the set-password route — never guessed from internal
// Supabase representations.
export async function lookupAdminUser(email) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });

  if (error || !data?.user) {
    return { exists: false };
  }

  return {
    exists: true,
    hasPassword: !!data.user.app_metadata?.password_set,
    userId: data.user.id,
  };
}
