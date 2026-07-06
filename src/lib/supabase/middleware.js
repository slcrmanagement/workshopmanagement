import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Middleware needs its own cookie adapter (distinct from server.js) — it must
// write refreshed cookies to both the incoming request and the outgoing
// response so the rest of the request pipeline sees the refreshed session.
export function createMiddlewareClient(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, getResponse: () => response };
}
