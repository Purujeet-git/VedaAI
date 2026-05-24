import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('veda_session')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isProtectedPage = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/assignments') || 
    pathname.startsWith('/create-assignment');

  if (!session && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/assignments/:path*',
    '/create-assignment/:path*',
    '/login',
    '/signup',
  ],
};
