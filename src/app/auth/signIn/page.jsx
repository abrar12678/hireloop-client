"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Envelope from "@gravity-ui/icons/Envelope";
import Lock from "@gravity-ui/icons/Lock";
import Eye from "@gravity-ui/icons/Eye";
import EyeSlash from "@gravity-ui/icons/EyeSlash";
import ArrowRight from "@gravity-ui/icons/ArrowRight";
import { authClient } from "@/lib/auth-client";

const inputBase =
  "w-full rounded-xl border border-white/[0.08] bg-[#141419] text-[14px] leading-5 text-white placeholder:text-[#6B7280] outline-none transition-colors focus:border-[#5C53FE]/50 focus:ring-1 focus:ring-[#5C53FE]/20";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const getDashboardPath = (role) => {
  const map = {
    seeker: "/dashboard/seeker",
    recruiter: "/dashboard/recruiter",
    admin: "/dashboard/admin",
  };
  return map[role] || "/dashboard/seeker";
};

/**
 * Security check: only allow redirect URLs that start with /dashboard/
 * This prevents open-redirect attacks and ensures logged-in users
 * are NEVER sent to public pages after login.
 */
const isSafeRedirect = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("/dashboard/");
};

const SignInPage = () => {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: user.email,
        password: user.password,
      });

      if (data) {
        toast.success("Signed in successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });

        /* Fetch session to get user role */
        const { data: sessionData } = await authClient.getSession();
        const role = sessionData?.session?.user?.role || sessionData?.user?.role || "seeker";

        setTimeout(() => {
          if (isSafeRedirect(rawRedirect)) {
            /*
             * Safe redirect flow (e.g., job apply from public page):
             * 1. Replace sign-in entry in history with dashboard jobs page
             *    so "back" from target lands on a dashboard page, NOT a public page.
             * 2. PUSH (not replace) the actual target so it sits on top.
             */
            const fallback = getDashboardPath(role) + "/jobs";
            window.history.replaceState(null, "", fallback);
            window.location.href = rawRedirect;
          } else {
            /* Normal login — always go to role-specific dashboard.
             * window.location.replace removes sign-in from browser history,
             * so the back button can NEVER return to the landing page. */
            window.location.replace(getDashboardPath(role));
          }
        }, 1200);
      }

      if (signInError) {
        toast.error(
          signInError.message ||
            "Sign-in failed. Check your email and password.",
          {
            position: "top-center",
            autoClose: 4000,
            theme: "dark",
            style: { background: "#1a1a2e", color: "#fff" },
          },
        );
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }

    setLoading(false);
  };

  const handleGoogleSignin = async () => {
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch {
      toast.error("Google sign-in failed. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }
  };

  useEffect(() => {
    document.title = "Sign In | HireLoop";
  }, []);

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <span className="text-lg sm:text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            Sign in to your HireLoop account
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 sm:gap-5 p-5 sm:p-8"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#9CA3AF]">
                Email Address *
              </label>
              <div className="relative">
                <Envelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className={inputBase}
                  style={{
                    paddingLeft: "2.5rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#9CA3AF]">Password *</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className={inputBase}
                  style={{
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeSlash className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 rounded border-white/[0.15] bg-[#141419] accent-[#5C53FE]"
                />
                <span className="text-[12px] sm:text-[13px] text-[#9CA3AF]">
                  Remember me
                </span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-[12px] sm:text-[13px] font-medium text-[#5C53FE] transition-colors hover:text-[#8B5CF6] hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-1 sm:mt-2"
              style={{
                height: "48px",
                backgroundColor: "#ffffff",
                color: "#08080f",
                fontSize: "15px",
              }}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 px-5 sm:px-8">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="shrink-0 text-[12px] sm:text-[13px] font-medium text-[#6B7280]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google Button */}
          <div className="px-5 sm:px-8 pb-5 sm:pb-8 pt-5 sm:pt-6">
            <button
              onClick={handleGoogleSignin}
              type="button"
              className="w-full flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-[#141419] text-[14px] font-medium text-white transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1a1a22]"
              style={{ paddingTop: "0.875rem", paddingBottom: "0.875rem" }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-[12px] sm:text-[13px] text-[#6B7280] pb-5 sm:pb-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signUp"
              className="font-medium text-[#5C53FE] transition-colors hover:text-[#8B5CF6] hover:underline underline-offset-2"
            >
              Create account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;