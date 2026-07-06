import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const PUBLIC_ADMIN_PATHS = ['/administration/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createMiddlewareClient(request);

  // getUser() revalidates the JWT against the Auth server — don't use
  // getSession() here, it only trusts the (possibly stale) cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/administration/login', request.url));
  }

  return getResponse();
}

export const config = {
  matcher: ['/administration/:path*', '/api/admin/:path*'],
};
