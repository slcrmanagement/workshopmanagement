import { createBrowserClient } from '@supabase/ssr';

// Browser-only client (anon key). Create a fresh instance per call — cheap,
// and avoids sharing state across components in unexpected ways.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
