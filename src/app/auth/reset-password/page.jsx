"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lock from "@gravity-ui/icons/Lock";
import Eye from "@gravity-ui/icons/Eye";
import EyeSlash from "@gravity-ui/icons/EyeSlash";
import ArrowRight from "@gravity-ui/icons/ArrowRight";
import CircleCheckFill from "@gravity-ui/icons/CircleCheckFill";
import ShieldExclamation from "@gravity-ui/icons/ShieldExclamation";

const inputBase =
  "w-full rounded-xl border border-white/[0.08] bg-[#141419] text-[14px] leading-5 text-white placeholder:text-[#6B7280] outline-none transition-colors focus:border-[#5C53FE]/50 focus:ring-1 focus:ring-[#5C53FE]/20";

const inputPwdStyle = {
  paddingLeft: "2.5rem",
  paddingRight: "2.5rem",
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
};

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

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const validatePassword = (value) => {
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Must contain at least one lowercase letter";
    return "";
  };

  const handlePasswordChange = (e) => {
    const err = validatePassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: err }));
  };

  const handleConfirmChange = (e) => {
    const formData = new FormData(e.target.form);
    const password = formData.get("password") || "";
    if (e.target.value && e.target.value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    /* Client-side validation */
    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      setErrors((prev) => ({ ...prev, password: pwdErr }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/backend/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Password reset successfully!", {
          position: "top-center",
          autoClose: 4000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
      } else {
        toast.error(
          data.error || data.message || "Failed to reset password.",
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

    setLoading(false);
  };

  /* Invalid / missing token */
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
              <span className="text-lg sm:text-xl font-bold text-white">H</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Reset Password
            </h1>
          </div>

          <Card className="border border-white/[0.06] bg-[#0c0c14]">
            <div className="p-5 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-950/40 border border-red-800/40">
                <ShieldExclamation className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Invalid or Expired Link
                </h2>
                <p className="text-sm text-gray-400">
                  This password reset link is invalid or has expired. Please
                  request a new one to continue.
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Request New Link
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

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
  }

  /* Success state */
  if (success) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
              <span className="text-lg sm:text-xl font-bold text-white">H</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Reset Password
            </h1>
          </div>

          <Card className="border border-white/[0.06] bg-[#0c0c14]">
            <div className="p-5 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-800/40">
                <CircleCheckFill className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Password Reset Successfully
                </h2>
                <p className="text-sm text-gray-400">
                  Your password has been updated. You can now sign in with your
                  new password.
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
          </Card>
        </div>
      </div>
    );
  }

  /* Reset form */
  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <span className="text-lg sm:text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Reset Password
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 sm:gap-5 p-5 sm:p-8"
          >
            {/* New Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#9CA3AF]">
                New Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  onChange={handlePasswordChange}
                  className={inputBase}
                  style={inputPwdStyle}
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
              <p className="text-[12px] text-[#6B7280]">
                Must be at least 8 characters with 1 uppercase and 1 lowercase
                letter
              </p>
              {errors.password && (
                <p className="text-[12px] text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#9CA3AF]">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  onChange={handleConfirmChange}
                  className={inputBase}
                  style={inputPwdStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[12px] text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
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
                <Spinner />
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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

const ResetPasswordPage = () => {
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
                Reset Password
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
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;