"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Label,
  TextField,
  FieldError,
  Description,
  Form,
  Checkbox,
  Separator,
} from "@heroui/react";
import Person from "@gravity-ui/icons/Person";
import Envelope from "@gravity-ui/icons/Envelope";
import Lock from "@gravity-ui/icons/Lock";
import ArrowRight from "@gravity-ui/icons/ArrowRight";
import { authClient } from "@/lib/auth-client";

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

const InputWithIcon = ({ icon: Icon, children }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
    <div className="[&_>input]:pl-10">{children}</div>
  </div>
);

const SignUpPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    // Check passwords match
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await authClient.signUp.email({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    setLoading(false);

    if (data) {
      router.push("/");
      router.refresh();
    }

    if (signUpError) {
      setError(
        signUpError.message ||
          "Sign-up failed. Try a different email or check your password.",
      );
    }
  };

  const handleGoogleSignin = async () => {
    await authClient.signIn.social({ provider: "google" });
  };

  useEffect(() => {
    document.title = "Sign Up | HireLoop";
  }, []);

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-2">
            Join HireLoop and find your dream job today
          </p>
        </div>

        {/* Card */}
        <Card className="border border-white/[0.06] bg-[#0c0c14]">
          <Form onSubmit={onSubmit} className="flex flex-col gap-4 p-6 sm:p-8">
            {/* Error Banner */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Full Name */}
            <TextField isRequired name="name" type="text">
              <Label className="text-[13px] text-[#9CA3AF]">Full Name</Label>
              <InputWithIcon icon={Person}>
                <Input
                  placeholder="Enter your full name"
                  variant="bordered"
                  className="text-[14px]"
                />
              </InputWithIcon>
              <FieldError />
            </TextField>

            {/* Email */}
            <TextField
              isRequired
              name="email"
              type="email"
              validate={(value) => {
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                  return "Please enter a valid email address";
                }
                return null;
              }}
            >
              <Label className="text-[13px] text-[#9CA3AF]">
                Email Address
              </Label>
              <InputWithIcon icon={Envelope}>
                <Input
                  placeholder="john@example.com"
                  variant="bordered"
                  className="text-[14px]"
                />
              </InputWithIcon>
              <FieldError />
            </TextField>

            {/* Password */}
            <TextField
              isRequired
              name="password"
              type="password"
              validate={(value) => {
                if (value.length < 8)
                  return "Password must be at least 8 characters";
                if (!/[A-Z]/.test(value))
                  return "Must contain at least one uppercase letter";
                if (!/[a-z]/.test(value))
                  return "Must contain at least one lowercase letter";
                return null;
              }}
            >
              <Label className="text-[13px] text-[#9CA3AF]">Password</Label>
              <InputWithIcon icon={Lock}>
                <Input
                  placeholder="Create a password"
                  variant="bordered"
                  className="text-[14px]"
                />
              </InputWithIcon>
              <Description className="text-[12px] text-[#6B7280]">
                Must be at least 8 characters with 1 uppercase and 1 lowercase
                letter
              </Description>
              <FieldError />
            </TextField>

            {/* Confirm Password */}
            <TextField isRequired name="confirmPassword" type="password">
              <Label className="text-[13px] text-[#9CA3AF]">
                Confirm Password
              </Label>
              <InputWithIcon icon={Lock}>
                <Input
                  placeholder="Confirm your password"
                  variant="bordered"
                  className="text-[14px]"
                />
              </InputWithIcon>
              <FieldError />
            </TextField>

            {/* Terms Checkbox */}
            <Checkbox.Root name="agreeTerms" className="gap-3">
              <Checkbox.Control className="w-[18px] h-[18px] rounded" />
              <Checkbox.Indicator className="w-[18px] h-[18px]" />
              <Checkbox.Content className="select-none text-[13px] text-[#9CA3AF]">
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
              </Checkbox.Content>
            </Checkbox.Root>

            {/* Submit Button */}
            <Button.Root
              type="submit"
              variant="accent"
              fullWidth
              isLoading={loading}
              className="h-[50px] rounded-xl text-[15px] font-semibold mt-2"
            >
              <span className="flex items-center gap-2">
                Create account
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button.Root>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-4 px-6 sm:px-8">
            <Separator.Root orientation="horizontal" className="flex-1" />
            <span className="shrink-0 text-[13px] font-medium text-[#6B7280]">
              or continue with
            </span>
            <Separator.Root orientation="horizontal" className="flex-1" />
          </div>

          {/* Google Button */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-6">
            <button
              onClick={handleGoogleSignin}
              type="button"
              className="w-full flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-[#141419] px-5 py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1a1a22]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-[13px] text-[#6B7280] pb-6">
            Already have an account?{" "}
            <Link
              href="/sign-in"
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
