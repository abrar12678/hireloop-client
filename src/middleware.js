import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // All public paths that logged-in users must NOT access
  const publicPrefixes = ["/", "/jobs", "/companies", "/plans"];
  const isPublicPath = publicPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isPublicPath) return NextResponse.next();

  // Check for better-auth session cookie
  const sessionToken = request.cookies.get("better-auth.session_token");

  if (sessionToken && sessionToken.value) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/jobs/:path*", "/companies/:path*", "/plans/:path*"],
};