import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Components / Route Handlers client (anon key, bound to the request's
// cookies). Use this to read the current admin's session server-side.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookies can't be set here.
            // Safe to ignore as long as middleware is refreshing sessions.
          }
        },
      },
    }
  );
}
