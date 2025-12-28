import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Only protect /quiz/dashboard and /quiz/[slug] routes
  if (request.nextUrl.pathname.startsWith('/quiz/dashboard') || 
      (request.nextUrl.pathname.startsWith('/quiz/') && request.nextUrl.pathname !== '/quiz')) {
      
    const token = request.cookies.get('quiz_token');

    if (!token) {
      // Redirect to login if no token found
      return NextResponse.redirect(new URL('/quiz', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/quiz/:path*'],
};
