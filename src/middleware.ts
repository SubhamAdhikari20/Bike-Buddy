// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if (!token) return;
    const { username, role } = token as { username?: string, role?: string };

    if (token &&
        (
            url.pathname.startsWith("/sign-in") ||
            url.pathname.startsWith("/sign-up") ||
            url.pathname.startsWith("/verify") ||
            url.pathname.startsWith("/")
        )
    ) {
        if (token && token.isVerified) {
            return NextResponse.redirect(new URL(`/${username}/${role}/dashboard`, request.url));
        }
        // return NextResponse.redirect(new URL('/home', request.url));
        return NextResponse.next();
    }

    // any /[user]/[role]/... route must be both signed‑in AND verified
    const protectedRoute = /^\/[^\/]+\/(customer|owner|admin)\//.test(url.pathname);
    if (protectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
        if (!token.isVerified) {
            // send unverified users to the verify page
            return NextResponse.redirect(new URL(`/verify/${token.username}`, request.url));
        }
    }
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/verify/:path*",
        // "/:username/:role/:path*"
    ]
}