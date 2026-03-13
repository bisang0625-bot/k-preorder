import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all sub-routes of /admin except the login page itself (/admin)
    if (pathname.startsWith('/admin/')) {
        const adminSessionCookie = request.cookies.get('admin_session');

        if (!adminSessionCookie || adminSessionCookie.value !== 'authenticated') {
            // Redirect to the login page if not authenticated
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
