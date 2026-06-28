"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientFetch, protectedClientFetch, clientMutation } from "@/lib/core/client";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Bookmark,
  User,
  Building2,
  Globe,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

function formatSalary(amount) {
  if (!amount) return "0";
  const n = parseInt(amount, 10);
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${n}`;
}

function formatFullDate(dateInput) {
  if (!dateInput) return "N/A";
  const d = new Date(typeof dateInput === "object" && dateInput.$date ? dateInput.$date : dateInput);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function parseList(text) {
  if (!text) return [];
  return text.split(/[\n•\-–]/).map((l) => l.trim()).filter(Boolean);
}

const STATUS_STYLES = {
  applied: { label: "Applied", bg: "bg-white/[0.06]", text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  "under review": { label: "Under Review", bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  review: { label: "Under Review", bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  shortlisted: { label: "Shortlisted", bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  offered: { label: "Offered", bg: "bg-[#818CF8]/15", text: "text-[#818CF8]", border: "border-[#818CF8]/30" },
  accepted: { label: "Accepted", bg: "bg-[#3B82F6]/15", text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  hired: { label: "Hired", bg: "bg-[#6B63FF]/15", text: "text-[#6B63FF]", border: "border-[#6B63FF]/30" },
  rejected: { label: "Rejected", bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
};

/* ═══════════════════════════════════════════════════
   JOB DETAIL PAGE (Inside Dashboard)
   ═══════════════════════════════════════════════════ */
export default function DashboardJobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const [jobData, apps, saved] = await Promise.all([
          clientFetch(`/jobs/${jobId}`),
          protectedClientFetch("/applications"),
          protectedClientFetch("/saved-jobs"),
        ]);

        setJob(jobData);

        // Check application status for this job
        if (Array.isArray(apps)) {
          const myApp = apps.find(
            (a) => a.jobId === jobId || a.jobId === jobId?.toString()
          );
          if (myApp) {
            setApplicationStatus(myApp.status);
            // Check 24hr cooldown for rejected
            if (myApp.status === "rejected" && myApp.updatedAt) {
              const updatedAt = new Date(
                typeof myApp.updatedAt === "object" && myApp.updatedAt.$date
                  ? myApp.updatedAt.$date
                  : myApp.updatedAt
              );
              const cooldownEnd = new Date(updatedAt.getTime() + 24 * 60 * 60 * 1000);
              if (Date.now() < cooldownEnd.getTime()) {
                setCooldown(cooldownEnd);
              }
            }
          }
        }

        // Check if saved
        if (Array.isArray(saved)) {
          const found = saved.some(
            (s) => s.jobId === jobId || s.jobId === jobId?.toString()
          );
          setIsSaved(found);
        }
      } catch (err) {
        console.error("Failed to load job:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  // Cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    const interval = setInterval(() => {
      if (Date.now() >= cooldown.getTime()) {
        setCooldown(null);
        setApplicationStatus(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleApply = async () => {
    if (applying || applicationStatus === "hired") return;
    setApplying(true);
    setToast(null);
    try {
      const res = await clientMutation("/applications", {
        jobId: jobId?.toString(),
      });
      if (res && !res.error) {
        setApplicationStatus("applied");
        setToast({ type: "success", text: "Application submitted successfully!" });
      } else {
        setToast({ type: "error", text: res?.message || "Failed to apply. You may have already applied." });
      }
    } catch (err) {
      setToast({ type: "error", text: err?.message || "Failed to submit application." });
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        const saved = await protectedClientFetch("/saved-jobs");
        if (Array.isArray(saved)) {
          const target = saved.find(
            (s) => s.jobId === jobId || s.jobId === jobId?.toString()
          );
          if (target) {
            const sid = target._id?.$oid || target._id;
            await fetch(`/api/backend/saved-jobs/${sid}`, {
              method: "DELETE",
              credentials: "include",
            });
          }
        }
        setIsSaved(false);
      } else {
        await clientMutation("/saved-jobs", {
          jobId: jobId?.toString(),
          jobTitle: job?.jobTitle,
          companyName: job?.companyName,
          companyLogo: job?.companyLogo,
          location: job?.location,
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[#A1A1AA] text-lg">Job not found</p>
        <button
          onClick={() => router.push("/dashboard/seeker/jobs")}
          className="text-[14px] text-[#3B82F6] hover:underline cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[applicationStatus?.toLowerCase()] || STATUS_STYLES.applied;
  const salaryDisplay =
    job.minSalary && job.maxSalary
      ? `${formatSalary(job.minSalary)} - ${formatSalary(job.maxSalary)} / yr`
      : job.minSalary
        ? `From ${formatSalary(job.minSalary)} / yr`
        : "Negotiable";

  const responsibilities = parseList(job.responsibilities);
  const requirements = parseList(job.requirements);

  const canApply = !applicationStatus || (applicationStatus === "rejected" && !cooldown);
  const isHired = applicationStatus === "hired";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`text-[14px] px-4 py-3 rounded-[12px] border flex items-center justify-between ${
            toast.type === "success"
              ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
              : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
          }`}
        >
          {toast.text}
          <button onClick={() => setToast(null)} className="cursor-pointer"><X size={16} /></button>
        </div>
      )}

      {/* Back Button — always navigates to dashboard jobs list, never uses browser history */}
      <button
        onClick={() => router.push("/dashboard/seeker/jobs")}
        className="flex items-center gap-2 text-[14px] text-[#A1A1AA] hover:text-white transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Jobs
      </button>

      {/* Header Card */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-[12px] bg-[#3A3A40] flex items-center justify-center shrink-0 overflow-hidden">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {(job.companyName || "C").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[24px] font-bold text-white leading-tight">{job.jobTitle}</h1>
                  {applicationStatus && (
                    <span className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {statusStyle.label}
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#A1A1AA] mt-0.5">{job.companyName}</p>
              </div>
            </div>

            {/* Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
                <MapPin size={12} /> {job.isRemote ? "Remote" : job.location || "Not specified"}
              </span>
              <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
                <Briefcase size={12} /> {job.jobType || "Full-time"}
              </span>
              <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
                <DollarSign size={12} /> {salaryDisplay}
              </span>
              {job.experienceLevel && (
                <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
                  <Calendar size={12} /> {job.experienceLevel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-full bg-[#22C55E]/10 text-[12px] font-medium text-[#22C55E] border border-[#22C55E]/20">
                <ShieldCheck size={12} /> Verified
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-10 h-10 rounded-[10px] border border-white/[0.08] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Bookmark size={18} fill={isSaved ? "#3B82F6" : "none"} className={isSaved ? "text-[#3B82F6]" : ""} />
            </button>

            {isHired ? (
              <span className="h-10 px-5 rounded-[10px] bg-[#6B63FF]/15 text-[#6B63FF] text-[14px] font-medium flex items-center gap-2 border border-[#6B63FF]/30">
                <Check size={16} /> Hired
              </span>
            ) : cooldown ? (
              <div className="text-center">
                <button disabled className="h-10 px-5 rounded-[10px] bg-[#EF4444]/10 text-[#EF4444] text-[14px] font-medium border border-[#EF4444]/25 cursor-not-allowed">
                  <X size={14} className="inline mr-1.5 -mt-0.5" /> Rejected
                </button>
                <CooldownTimer endTime={cooldown} />
              </div>
            ) : applicationStatus ? (
              <button
                disabled
                className={`h-10 px-5 rounded-[10px] text-[14px] font-medium flex items-center gap-2 cursor-not-allowed border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {statusStyle.label}
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="h-10 px-5 rounded-[10px] bg-white text-black text-[14px] font-medium flex items-center gap-2 hover:bg-zinc-200 transition-all duration-200 cursor-pointer"
              >
                {applying ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  "Apply Now"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <h2 className="text-[18px] font-semibold text-white mb-4">Job Description</h2>
            <p className="text-[14px] text-[#A1A1AA] leading-relaxed whitespace-pre-line">
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <h2 className="text-[18px] font-semibold text-white mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[14px] text-[#A1A1AA] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <h2 className="text-[18px] font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#22C55E] shrink-0 mt-1" />
                    <span className="text-[14px] text-[#A1A1AA] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <h2 className="text-[18px] font-semibold text-white mb-4">Benefits</h2>
              <p className="text-[14px] text-[#A1A1AA] leading-relaxed whitespace-pre-line">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Company Card */}
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <h3 className="text-[16px] font-semibold text-white mb-4">Company</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-[#3A3A40] flex items-center justify-center overflow-hidden">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={18} className="text-[#71717A]" />
                )}
              </div>
              <div>
                <p className="text-[14px] font-medium text-white">{job.companyName}</p>
                {job.jobCategory && (
                  <p className="text-[12px] text-[#71717A]">{job.jobCategory}</p>
                )}
              </div>
            </div>
            {job.location && (
              <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
                <Globe size={14} /> {job.location}
              </div>
            )}
            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13px] text-[#3B82F6] hover:underline mt-2"
              >
                <Globe size={14} /> Visit Website
              </a>
            )}
          </div>

          {/* Job Details Card */}
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <h3 className="text-[16px] font-semibold text-white mb-4">Job Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[13px] text-[#71717A]">Salary</span>
                <span className="text-[13px] text-white font-medium">{salaryDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#71717A]">Type</span>
                <span className="text-[13px] text-white font-medium capitalize">{job.jobType || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#71717A]">Category</span>
                <span className="text-[13px] text-white font-medium">{job.jobCategory || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-[#71717A]">Experience</span>
                <span className="text-[13px] text-white font-medium">{job.experienceLevel || "N/A"}</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-[#71717A]">Deadline</span>
                  <span className="text-[13px] text-white font-medium">{formatFullDate(job.deadline)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[13px] text-[#71717A]">Posted</span>
                <span className="text-[13px] text-white font-medium">{formatFullDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Application Status Card */}
          {applicationStatus && (
            <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
              <h3 className="text-[16px] font-semibold text-white mb-4">Your Application</h3>
              {/* Status Pipeline */}
              <div className="space-y-2.5 mb-4">
                {[
                  { key: "applied", label: "Applied" },
                  { key: "under review", label: "Under Review" },
                  { key: "shortlisted", label: "Shortlisted" },
                  { key: "offered", label: "Offered" },
                  { key: "accepted", label: "Accepted" },
                  { key: "hired", label: "Hired" },
                ].map((step, idx) => {
                  const steps = ["applied", "under review", "shortlisted", "offered", "accepted", "hired"];
                  const currentIdx = steps.indexOf((applicationStatus || "").toLowerCase());
                  const stepIdx = steps.indexOf(step.key);
                  const isActive = step.key === (applicationStatus || "").toLowerCase();
                  const isRejected = (applicationStatus || "").toLowerCase() === "rejected";
                  const isCompleted = !isRejected && stepIdx < currentIdx;
                  const isCurrent = !isRejected && stepIdx === currentIdx;

                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-200 ${
                        isRejected
                          ? stepIdx === 0
                            ? "bg-white/[0.06] border border-white/[0.08] text-[#A1A1AA]"
                            : "bg-zinc-800/50 border border-zinc-800 text-zinc-700"
                          : isCompleted
                            ? "bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]"
                            : isCurrent
                              ? `${STATUS_STYLES[step.key]?.bg || ""} border ${STATUS_STYLES[step.key]?.border || ""} ${STATUS_STYLES[step.key]?.text || ""}`
                              : "bg-zinc-800/50 border border-zinc-800 text-zinc-700"
                      }`}>
                        {isCompleted ? <Check size={12} /> : idx + 1}
                      </div>
                      <span className={`text-[13px] transition-colors duration-200 ${
                        isRejected && stepIdx > 0
                          ? "text-zinc-700 line-through"
                          : isCompleted
                            ? "text-[#22C55E]"
                            : isCurrent
                              ? "text-white font-medium"
                              : "text-zinc-600"
                      }`}>
                        {step.label}
                      </span>
                      {isCurrent && !isRejected && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto ${STATUS_STYLES[step.key]?.bg || ""} ${STATUS_STYLES[step.key]?.text || ""}`}>
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Rejected state */}
              {(applicationStatus || "").toLowerCase() === "rejected" && (
                <div className="flex items-center gap-2 text-[12px] text-[#EF4444] bg-[#EF4444]/10 rounded-lg px-3 py-2 border border-[#EF4444]/20">
                  <X size={14} />
                  <span>This application was rejected.</span>
                </div>
              )}
              {cooldown && (
                <div className="flex items-center gap-2 text-[12px] text-[#F59E0B] mt-2">
                  <AlertTriangle size={13} />
                  <span>You can reapply after the cooldown period.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cooldown Timer Component ─── */
function CooldownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("");
        return;
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <p className="text-[11px] text-[#F59E0B] mt-1 flex items-center gap-1">
      <AlertTriangle size={11} /> Reapply in {timeLeft}
    </p>
  );
}