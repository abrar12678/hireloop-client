"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Envelope from "@gravity-ui/icons/Envelope";
import ArrowRight from "@gravity-ui/icons/ArrowRight";
import CircleCheckFill from "@gravity-ui/icons/CircleCheckFill";
import ShieldExclamation from "@gravity-ui/icons/ShieldExclamation";

const Spinner = () => (
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
);

const VerifyEmailForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [resending, setResending] = useState(false);

  const verifyEmail = useCallback(async () => {
    if (!token || !email) {
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/backend/auth/verify-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      if (res.ok) {
        setStatus("success");
        toast.success("Email verified successfully!", {
          position: "top-center",
          autoClose: 4000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [token, email]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);

    try {
      const res = await fetch("/api/backend/auth/send-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Verification email sent! Check your inbox.", {
          position: "top-center",
          autoClose: 4000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(
          data.error || data.message || "Failed to send verification email.",
          {
            position: "top-center",
            autoClose: 4000,
            theme: "dark",
            style: { background: "#1a1a2e", color: "#fff" },
          },
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <span className="text-lg sm:text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Verify Email
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Your email has been verified"}
            {status === "error" && "We couldn't verify your email"}
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          {/* Loading State */}
          {status === "loading" && (
            <div className="p-10 sm:p-14 flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-8 w-8 text-[#5C53FE]"
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
              <p className="text-sm text-gray-400">
                Please wait while we verify your email...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="p-5 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-800/40">
                <CircleCheckFill className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-sm text-gray-400">
                  Your email address has been verified. You can now access all
                  features of your account.
                </p>
              </div>
              <Link
                href="/dashboard/seeker"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="p-5 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-950/40 border border-red-800/40">
                <ShieldExclamation className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Invalid or Expired Verification Link
                </h2>
                <p className="text-sm text-gray-400">
                  This verification link is invalid or has expired. You can
                  request a new verification email to continue.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                {email && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    style={{ height: "44px" }}
                  >
                    {resending ? (
                      <Spinner />
                    ) : (
                      <>
                        <Envelope className="w-4 h-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                )}
                <Link
                  href="/auth/signIn"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Back to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
          <div className="w-full max-w-[440px]">
            <div className="text-center mb-6 sm:mb-8">
              <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                <span className="text-lg sm:text-xl font-bold text-white">H</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Verify Email
              </h1>
            </div>
            <Card className="border border-white/[0.06] bg-[#0c0c14]">
              <div className="flex items-center justify-center p-10">
                <svg
                  className="animate-spin h-6 w-6 text-[#5C53FE]"
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
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
};

export default VerifyEmailPage;