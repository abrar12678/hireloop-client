"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Envelope from "@gravity-ui/icons/Envelope";
import ArrowRight from "@gravity-ui/icons/ArrowRight";

const inputBase =
  "w-full rounded-xl border border-white/[0.08] bg-[#141419] text-[14px] leading-5 text-white placeholder:text-[#6B7280] outline-none transition-colors focus:border-[#5C53FE]/50 focus:ring-1 focus:ring-[#5C53FE]/20";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password | HireLoop";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    try {
      const res = await fetch("/api/backend/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send reset email.", {
          position: "top-center",
          autoClose: 4000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
      } else {
        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.", {
          position: "top-center",
          autoClose: 4000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
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

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <span className="text-lg sm:text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Forgot Password
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          {emailSent ? (
            <div className="p-5 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-800/40">
                <Envelope className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-sm text-gray-400">
                  We sent a password reset link to your email address. Please
                  check your inbox and follow the instructions.
                </p>
              </div>
              <Link
                href="/auth/signIn"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Back to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
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
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-center text-[12px] sm:text-[13px] text-[#6B7280] pb-5 sm:pb-6">
            Remember your password?{" "}
            <Link
              href="/auth/signIn"
              className="font-medium text-[#5C53FE] transition-colors hover:text-[#8B5CF6] hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
