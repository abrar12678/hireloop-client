"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import Footer2 from "@/components/Footer2";

/* ─── Route config ─── */

// These paths never show Navbar/Footer
const HIDDEN_PATHS = ["/dashboard", "/auth"];

// ALL public paths that logged-in users must be redirected away from
const PUBLIC_PATHS = ["/", "/jobs", "/companies", "/plans"];

/* ─── Helpers ─── */

const matchesPath = (pathname, prefix) =>
  pathname === prefix || pathname.startsWith(prefix + "/");

/* ─── Component ─── */

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const redirected = useRef(false);

  const hideShell = HIDDEN_PATHS.some((p) => matchesPath(pathname, p));
  const isPublicPath = PUBLIC_PATHS.some((p) => matchesPath(pathname, p));

  // ── Logged-in user on ANY public page → kick to dashboard ──
  // This is a client-side fallback. The edge middleware is the primary guard.
  useEffect(() => {
    if (redirected.current) return;
    if (isPending) return; // wait for session to load
    if (user && isPublicPath) {
      redirected.current = true;
      window.location.replace("/dashboard");
    }
  }, [user, isPending, isPublicPath]);

  // While session is loading on a public page, render normally (no flash)
  // Once session loads → if logged in, the effect above redirects immediately

  // ── Don't render Navbar/Footer on dashboard/auth ──
  if (hideShell) {
    return <>{children}</>;
  }

  // ── Logged-in user about to be redirected → show blank (no flash) ──
  if (!isPending && user && isPublicPath) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer2 />
    </>
  );
}