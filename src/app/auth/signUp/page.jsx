"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Person from "@gravity-ui/icons/Person";
import Envelope from "@gravity-ui/icons/Envelope";
import Lock from "@gravity-ui/icons/Lock";
import Eye from "@gravity-ui/icons/Eye";
import EyeSlash from "@gravity-ui/icons/EyeSlash";
import ArrowRight from "@gravity-ui/icons/ArrowRight";
import { authClient } from "@/lib/auth-client";
import { Description, Label, Radio, RadioGroup } from "@heroui/react";

const inputBase =
  "w-full rounded-xl border border-white/[0.08] bg-[#141419] text-[14px] leading-5 text-white placeholder:text-[#6B7280] outline-none transition-colors focus:border-[#5C53FE]/50 focus:ring-1 focus:ring-[#5C53FE]/20";

const inputStyle = {
  paddingLeft: "2.5rem",
  paddingRight: "1rem",
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
};

const inputPwdStyle = {
  paddingLeft: "2.5rem",
  paddingRight: "2.5rem",
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
};

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

const PasswordField = ({
  name,
  placeholder,
  label,
  description,
  isRequired,
  validate,
}) => {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (validate) {
      const err = validate(e.target.value);
      setError(err || "");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] text-[#9CA3AF]">
        {label}
        {isRequired && " *"}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={isRequired}
          onChange={handleChange}
          className={inputBase}
          style={inputPwdStyle}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors cursor-pointer"
        >
          {visible ? (
            <EyeSlash className="w-[18px] h-[18px]" />
          ) : (
            <Eye className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
      {description && (
        <p className="text-[12px] text-[#6B7280]">{description}</p>
      )}
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
};

const SignUpPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("seeker");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-center",
        autoClose: 4000,
        theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
      setLoading(false);
      return;
    }

    const plan = role === "seeker" ? "seeker_free" : "recruiter_free";

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: user.name,
        remember: true,
        role: user.role,
        plan: plan,
      });

      if (data) {
        toast.success("Account created successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
          style: { background: "#1a1a2e", color: "#fff" },
        });
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1200);
      }

      if (signUpError) {
        toast.error(
          signUpError.message ||
            "Sign-up failed. Try a different email or check your password.",
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
    document.title = "Sign Up | HireLoop";
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
            Create your account
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            Join HireLoop and find your dream job today
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 sm:gap-5 p-5 sm:p-8"
          >
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#9CA3AF]">Full Name *</label>
              <div className="relative">
                <Person className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className={inputBase}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
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
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordField
              name="password"
              placeholder="Create a password"
              label="Password"
              isRequired
              description="Must be at least 8 characters with 1 uppercase and 1 lowercase letter"
              validate={(value) => {
                if (value.length < 8)
                  return "Password must be at least 8 characters";
                if (!/[A-Z]/.test(value))
                  return "Must contain at least one uppercase letter";
                if (!/[a-z]/.test(value))
                  return "Must contain at least one lowercase letter";
                return null;
              }}
            />

            {/* Confirm Password */}
            <PasswordField
              name="confirmPassword"
              placeholder="Confirm your password"
              label="Confirm Password"
              isRequired
            />

            {/* Role Selection */}
            <div className="flex flex-col gap-4">
              <Label>Role</Label>
              <RadioGroup
                defaultValue="seeker"
                name="role"
                orientation="horizontal"
                onValueChange={(value) => setRole(value)}
              >
                <Radio value="seeker">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Job Seeker</Label>
                  </Radio.Content>
                </Radio>
                <Radio value="Recruiter">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Recruiter</Label>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agreeTerms"
                className="w-4 h-4 rounded border-white/[0.15] bg-[#141419] accent-[#5C53FE]"
              />
              <span className="text-[13px] text-[#9CA3AF]">
                I agree to the{" "}
                <Link
                  href="#"
                  className="text-[#5C53FE] transition-colors hover:text-[#8B5CF6]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-[#5C53FE] transition-colors hover:text-[#8B5CF6]"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

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
                  Create account
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

          {/* Login Link */}
          <p className="text-center text-[12px] sm:text-[13px] text-[#6B7280] pb-5 sm:pb-6">
            Already have an account?{" "}
            <Link
              href={`/auth/signIn?redirect=${redirectTo}`}
              className="font-medium text-[#5C53FE] transition-colors hover:text-[#8B5CF6] hover:underline underline-offset-2"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
