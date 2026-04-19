import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

const protectedApiPrefixes = [
  '/api/dashboard',
  '/api/orders',
  '/api/customers',
  '/api/content',
  '/api/media',
  '/api/discounts',
  '/api/shopify',
];

const publicApiPrefixes = [
  '/api/products',
  '/api/collections',
  '/api/settings',
];

function isProtectedApi(pathname: string) {
  return protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isPublicApi(pathname: string) {
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
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

  if (isProtectedApi(pathname) && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/api/products/:path*',
    '/api/collections/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/content/:path*',
    '/api/media/:path*',
    '/api/settings/:path*',
    '/api/discounts/:path*',
    '/api/shopify/:path*',
  ],
};
