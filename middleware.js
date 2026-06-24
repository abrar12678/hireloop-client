import { NextResponse } from "next/server";

/*
 * ═══════════════════════════════════════════════════════
 *  HireLoop — Edge Route Guard (middleware.js)
 * ═══════════════════════════════════════════════════════
 *
 *  RUNS ON EVERY REQUEST (except excluded paths below)
 *
 *  Rule 1 — Logged-in user visits ANY public/auth page
 *           → redirect to /dashboard  (they must NOT see landing,
 *             jobs, companies, plans, or auth pages)
 *
 *  Rule 2 — Logged-out user visits /dashboard/*
 *           → redirect to /auth/signIn
 *
 *  Auth check: reads better-auth httpOnly cookie —
 *  no DB call, no client JS, runs at the Edge.
 * ═══════════════════════════════════════════════════════
 */

// ─── Route lists ───

// After login, user MUST NOT see ANY of these (all public + auth pages)
const BLOCKED_WHEN_LOGGED_IN = ["/", "/jobs", "/companies", "/plans", "/auth"];

// Before login, user MUST NOT see these
const BLOCKED_WHEN_LOGGED_OUT = ["/dashboard"];

// Never intercept these (API, static, system pages)
const SKIP = ["/api", "/_next", "/images", "/unauthorized", "/plans/success"];

// ─── Helpers ───

function shouldSkip(pathname) {
  return SKIP.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

function isBlockedWhenLoggedIn(pathname) {
  // NO exceptions — ALL public pages are blocked for logged-in users
  return BLOCKED_WHEN_LOGGED_IN.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function isBlockedWhenLoggedOut(pathname) {
  return BLOCKED_WHEN_LOGGED_OUT.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function hasSessionCookie(request) {
  // better-auth default cookie name + fallbacks (same as backend checks)
  return !!(
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("session_token")?.value ||
    request.cookies.get("token")?.value
  );
}

// ─── Main middleware ───

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Static / internal / system routes → skip entirely
  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const loggedIn = hasSessionCookie(request);

  // 2) Logged-in user on ANY public/auth page → kick to dashboard
  if (loggedIn && isBlockedWhenLoggedIn(pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3) Logged-out user on a protected page → kick to sign-in
  if (!loggedIn && isBlockedWhenLoggedOut(pathname)) {
    const signInUrl = new URL("/auth/signIn", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 4) Everything else → proceed normally
  return NextResponse.next();
}

// ─── Matcher ───
// Tells Next.js which routes to run this middleware on.
// Excludes: _next internals, api routes, favicon, images, fonts.

export const config = {
  matcher: ["/((?!api|_next|favicon\\.ico|images/|fonts/).*)"],
};