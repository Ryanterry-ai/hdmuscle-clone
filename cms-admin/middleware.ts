import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

const publicApiPrefixes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/storefront/published',
  '/api/storefront/payload',
  '/api/storefront/sections',
];

function isPublicApi(pathname: string) {
  return publicApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard') && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
