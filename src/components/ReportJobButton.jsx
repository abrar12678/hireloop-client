"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Flag, X } from "lucide-react";
import { clientMutation } from "@/lib/core/client";

const REPORT_REASONS = [
  "Misleading description",
  "Spam/Fraud",
  "Inappropriate content",
  "Duplicate listing",
  "Other",
];

export default function ReportJobButton({ jobId }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user || session.user.role !== "seeker") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    setError("");
    setSubmitting(true);
    try {
      await clientMutation("/api/reports", { jobId, reason, description });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setReason("");
        setDescription("");
      }, 2000);
    } catch (err) {
      setError(err?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium px-4 py-3 rounded-xl transition-colors cursor-pointer"
      >
        <Flag className="w-4 h-4" />
        Report Job
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-[#1B1B1F] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Report This Job</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-medium">Report Submitted</p>
                <p className="text-[#A1A1AA] text-sm mt-1">We&apos;ll review this job listing.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg text-white text-sm px-3 py-2.5 outline-none focus:border-[#3B82F6] transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select a reason...
                    </option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Description <span className="text-[#71717A]">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details..."
                    rows={3}
                    className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg text-white text-sm px-3 py-2.5 outline-none placeholder-[#71717A] focus:border-[#3B82F6] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-[#EF4444] text-sm">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-[#A1A1AA] hover:text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="inline-flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Flag size={14} />
                    )}
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}