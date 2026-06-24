"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Client-side redirect to sign-in page.
 *
 * WHY this exists instead of server-side redirect():
 * ─────────────────────────────────────────────────────
 * Server-side redirect() throws a 307, and browser history
 * behavior for 307 during a soft (client-side) navigation
 * is UNPREDICTABLE across browsers. Some browsers collapse
 * the redirect chain, erasing the referrer entry from history.
 *
 * Using router.replace() here gives us DETERMINISTIC control:
 *   - It REPLACES the current history entry with the sign-in page.
 *   - After login, the sign-in entry is replaced with the target URL.
 *   - Result: clean history, no redirect loops.
 *
 * Props:
 *   redirectTo — explicit dashboard path to redirect to after login.
 *                If provided, MUST start with /dashboard/ (security enforced
 *                in signIn page). If omitted, defaults to /dashboard.
 *
 *   Example: <RedirectToSignIn redirectTo="/dashboard/seeker/jobs/abc123" />
 */

export default function RedirectToSignIn({ redirectTo }) {
  const router = useRouter();

  useEffect(() => {
    // Build the redirect target for after login
    let redirectTarget = "/dashboard"; // safe default

    if (redirectTo && typeof redirectTo === "string") {
      // Only allow dashboard paths — never public paths
      if (redirectTo.startsWith("/dashboard/")) {
        redirectTarget = redirectTo;
      }
    }

    router.replace(
      `/auth/signIn?redirect=${encodeURIComponent(redirectTarget)}`
    );
  }, [router, redirectTo]);

  return null;
}