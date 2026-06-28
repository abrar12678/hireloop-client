"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  FileText,
  Send,
  Trophy,
  PartyPopper,
  UserCircle,
  Mail,
} from "lucide-react";
import { updateApplicationStatus } from "@/lib/action/applications";

/* ═══════════════════════════════════════════════════
   STATUS FLOW CONFIG
   ═══════════════════════════════════════════════════ */

const STATUS_FLOW = [
  { key: "applied",       label: "Applied",       icon: Send,        color: "#A1A1AA", bg: "bg-white/[0.06]",    border: "border-white/[0.08]" },
  { key: "under review",  label: "Under Review",  icon: Eye,         color: "#F59E0B", bg: "bg-[#F59E0B]/10",   border: "border-[#F59E0B]/25" },
  { key: "shortlisted",   label: "Shortlisted",   icon: CheckCircle2, color: "#22C55E", bg: "bg-[#22C55E]/10",   border: "border-[#22C55E]/25" },
  { key: "offered",       label: "Offered",       icon: Send,        color: "#818CF8", bg: "bg-[#818CF8]/10",   border: "border-[#818CF8]/25" },
  { key: "accepted",      label: "Accepted",      icon: CheckCircle2, color: "#3B82F6", bg: "bg-[#3B82F6]/10",   border: "border-[#3B82F6]/25" },
  { key: "hired",         label: "Hired",         icon: Trophy,      color: "#6B63FF", bg: "bg-[#6B63FF]/10",   border: "border-[#6B63FF]/25" },
];

const REJECTED_STATUS = { key: "rejected", label: "Rejected", color: "#EF4444", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/25" };

const ALL_STATUSES = [...STATUS_FLOW.map(s => s.key), "rejected"];

function getStatusConfig(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "rejected") return REJECTED_STATUS;
  return STATUS_FLOW.find(s => s.key === normalized) || STATUS_FLOW[0];
}

function getStatusIndex(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "rejected") return -1;
  const idx = STATUS_FLOW.findIndex(s => s.key === normalized);
  return idx >= 0 ? idx : 0;
}

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";
  const now = new Date();
  const date = new Date(typeof dateString === "object" && dateString.$date ? dateString.$date : dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return diffInHours <= 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

/* ═══════════════════════════════════════════════════
   STATUS PROGRESS BAR (visual pipeline)
   ═══════════════════════════════════════════════════ */

function StatusPipeline({ status }) {
  const currentIndex = getStatusIndex(status);
  const isRejected = (status || "").toLowerCase() === "rejected";

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {STATUS_FLOW.map((step, idx) => {
        const isCompleted = !isRejected && idx < currentIndex;
        const isCurrent = !isRejected && idx === currentIndex;
        const StepIcon = step.icon;

        return (
          <React.Fragment key={step.key}>
            {idx > 0 && (
              <div className={`w-4 h-px mx-0.5 ${isCompleted ? "bg-[#22C55E]/50" : "bg-white/[0.08]"}`} />
            )}
            <div
              className={`flex items-center gap-1 h-[22px] px-2 rounded-full text-[10px] font-medium border transition-all duration-200 ${
                isCompleted
                  ? "bg-[#22C55E]/10 border-[#22C55E]/25 text-[#22C55E]"
                  : isCurrent
                    ? `${step.bg} ${step.border} text-[${step.color}]`
                    : "bg-transparent border-white/[0.06] text-[#71717A]"
              }`}
              title={step.label}
            >
              {isCompleted ? (
                <CheckCircle2 size={10} />
              ) : isCurrent ? (
                <StepIcon size={10} />
              ) : null}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
      {isRejected && (
        <>
          <div className="w-4 h-px mx-0.5 bg-[#EF4444]/40" />
          <div className="flex items-center gap-1 h-[22px] px-2 rounded-full text-[10px] font-medium bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444]">
            <XCircle size={10} />
            <span className="hidden sm:inline">Rejected</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACTION BUTTONS (step-by-step forward + reject)
   ═══════════════════════════════════════════════════ */

function ActionButtons({ currentStatus, onStatusChange, applicantName }) {
  const currentIndex = getStatusIndex(currentStatus);
  const isRejected = (currentStatus || "").toLowerCase() === "rejected";
  const isHired = (currentStatus || "").toLowerCase() === "hired";

  // If hired, nothing more to do
  if (isHired) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#6B63FF]/10 border border-[#6B63FF]/25 text-[#6B63FF] text-[12px] font-medium">
        <PartyPopper size={14} />
        Hired Successfully
      </div>
    );
  }

  const nextStep = STATUS_FLOW[currentIndex + 1];
  const [updating, setUpdating] = useState(false);

  const handleAdvance = async () => {
    if (!nextStep || updating) return;
    setUpdating(true);
    try {
      await onStatusChange(nextStep.key);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await onStatusChange("rejected");
    } finally {
      setUpdating(false);
    }
  };

  const handleReopen = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await onStatusChange("under review");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Forward Button */}
      {nextStep && (
        <button
          onClick={handleAdvance}
          disabled={updating}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            backgroundColor: `${nextStep.color}15`,
            color: nextStep.color,
            border: `1px solid ${nextStep.color}40`,
          }}
        >
          {updating ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {nextStep.label}
              <ChevronRight size={13} />
            </>
          )}
        </button>
      )}

      {/* Reject Button (hide if already rejected) */}
      {!isRejected && (
        <button
          onClick={handleReject}
          disabled={updating}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 hover:bg-[#EF4444]/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {updating ? (
            <div className="w-3 h-3 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <XCircle size={13} />
              Reject
            </>
          )}
        </button>
      )}

      {/* Reopen Button (only if rejected) */}
      {isRejected && (
        <button
          onClick={handleReopen}
          disabled={updating}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25 hover:bg-[#F59E0B]/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {updating ? (
            <div className="w-3 h-3 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Clock size={13} />
              Reopen
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EXPANDABLE APPLICANT CARD
   ═══════════════════════════════════════════════════ */

function ApplicantCard({ applicant, onStatusChange }) {
  const appId = applicant._id?.$oid || applicant._id;
  const status = applicant.status || "Applied";
  const statusCfg = getStatusConfig(status);
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = statusCfg.icon || Clock;
  const isRejected = status.toLowerCase() === "rejected";
  const isHired = status.toLowerCase() === "hired";

  return (
    <div
      className={`bg-[#151516] rounded-xl border transition-all duration-200 ${
        isHired ? "border-[#6B63FF]/30" : isRejected ? "border-[#EF4444]/20" : "border-zinc-800/50"
      } ${expanded ? "shadow-lg" : "hover:border-zinc-700/60"}`}
    >
      {/* Compact Row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
          {applicant.applicantName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* Name + Email */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-white truncate">
            {applicant.applicantName || "Unknown"}
          </p>
          <p className="text-[12px] text-zinc-500 truncate">
            {applicant.applicantEmail || "N/A"}
          </p>
        </div>

        {/* Date */}
        <span className="text-[12px] text-zinc-600 hidden sm:block w-24 text-right shrink-0">
          {formatRelativeTime(applicant.createdAt?.$date || applicant.createdAt)}
        </span>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-[12px] font-medium border shrink-0 ${statusCfg.bg} ${statusCfg.border}`}
          style={{ color: statusCfg.color }}
        >
          <StatusIcon size={11} />
          {statusCfg.label}
        </span>

        {/* Expand Arrow */}
        <ChevronRight
          size={16}
          className={`text-zinc-600 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-zinc-800/40 pt-4">
          {/* Status Pipeline */}
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-2">Progress</p>
            <StatusPipeline status={status} />
          </div>

          {/* Notes / Cover Letter */}
          {applicant.additionalNotes && (
            <div>
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-1.5">Cover Letter / Notes</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed bg-zinc-900/50 rounded-lg p-3">
                {applicant.additionalNotes}
              </p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {applicant.resumeUrl && (
              <a
                href={applicant.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-purple-400 hover:text-purple-300 transition-colors"
              >
                <FileText size={13} />
                View Resume
              </a>
            )}
            {applicant.portfolioLink && (
              <a
                href={applicant.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <UserCircle size={13} />
                Portfolio
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-1">
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-2">Actions</p>
            <ActionButtons
              currentStatus={status}
              onStatusChange={(newStatus) => onStatusChange(appId, newStatus)}
              applicantName={applicant.applicantName}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

const fetchApplicantsData = async (id) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/applications?jobId=${id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error("Failed to fetch applicants:", err);
  }
  return [];
};

const ApplicantsPage = ({ params: paramsPromise }) => {
  const router = useRouter();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;
    paramsPromise.then(async (p) => {
      const id = p.jobId;
      if (cancelled) return;
      setJobId(id);
      const data = await fetchApplicantsData(id);
      if (!cancelled) {
        setApplicants(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [paramsPromise]);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await updateApplicationStatus(applicantId, newStatus);
      setApplicants((prev) =>
        prev.map((a) =>
          (a._id?.$oid || a._id) === applicantId
            ? { ...a, status: newStatus, updatedAt: new Date() }
            : a
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Filter
  const filtered = filterStatus === "all"
    ? applicants
    : applicants.filter((a) => (a.status || "").toLowerCase() === filterStatus);

  // Count by status
  const statusCounts = {};
  for (const a of applicants) {
    const s = (a.status || "applied").toLowerCase();
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-white">
            Applicants
          </h2>
          <p className="text-[13px] text-zinc-500 mt-1">
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} for this position
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-[13px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          Back to Jobs
        </button>
      </div>

      {/* Status Filter Tabs */}
      {applicants.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-white text-black"
                : "bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All ({applicants.length})
          </button>
          {STATUS_FLOW.map((s) => {
            const count = statusCounts[s.key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  filterStatus === s.key
                    ? `${s.bg} ${s.border}`
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
                style={filterStatus === s.key ? { color: s.color } : {}}
              >
                {s.label} ({count})
              </button>
            );
          })}
          {(statusCounts["rejected"] || 0) > 0 && (
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                filterStatus === "rejected"
                  ? "bg-[#EF4444]/10 border-[#EF4444]/25 text-[#EF4444]"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Rejected ({statusCounts["rejected"]})
            </button>
          )}
        </div>
      )}

      {/* Applicant Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((applicant) => (
            <ApplicantCard
              key={applicant._id?.$oid || applicant._id}
              applicant={applicant}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <Mail size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-lg">No applicants for this position yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Share this job to get more applicants.</p>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500">No applicants match this filter.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;