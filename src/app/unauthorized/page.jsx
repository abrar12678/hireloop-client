"use client";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080f] px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-red-900/30 p-4 text-red-400">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-white">401</h1>
          <h2 className="text-2xl font-bold tracking-tight text-white">Unauthorized Access</h2>
        </div>
        <p className="text-base text-zinc-400">
          Oops! You don&apos;t have permission to access this page. Please sign
          in with an authorized account or head back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/auth/signIn"
            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 shadow-sm hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}