"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { protectedClientFetch } from "@/lib/core/client";
import {
  Code, Palette, Database, Cloud, Cpu, Briefcase,
  ChevronLeft, ChevronRight, Layers, TrendingUp, CheckCircle2,
  XCircle, Award, ArrowRight,
} from "lucide-react";

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

const getJobIcon = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("frontend") || t.includes("web") || t.includes("engineer")) return { icon: Code, bg: "bg-[#3A3A40]" };
  if (t.includes("design") || t.includes("product") || t.includes("ux")) return { icon: Palette, bg: "bg-[#3A3A40]" };
  if (t.includes("data") || t.includes("scientist") || t.includes("analyst")) return { icon: Database, bg: "bg-[#3A3A40]" };
  if (t.includes("cloud") || t.includes("architect") || t.includes("devops")) return { icon: Cloud, bg: "bg-[#3A3A40]" };
  if (t.includes("ai") || t.includes("machine") || t.includes("research")) return { icon: Cpu, bg: "bg-[#3A3A40]" };
  return { icon: Briefcase, bg: "bg-[#3A3A40]" };
};

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  applied:     { label: "Applied",     bg: "bg-white/[0.06]",    text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  review:      { label: "Under Review", bg: "bg-[#F59E0B]/15",  text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  "under review": { label: "Under Review", bg: "bg-[#F59E0B]/15",  text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  shortlisted: { label: "Shortlisted", bg: "bg-[#22C55E]/15",  text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  accepted:    { label: "Accepted",    bg: "bg-[#3B82F6]/15",  text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  hired:       { label: "Hired",       bg: "bg-[#6B63FF]/15",  text: "text-[#6B63FF]", border: "border-[#6B63FF]/30" },
  rejected:    { label: "Rejected",    bg: "bg-[#EF4444]/15",  text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  offered:     { label: "Offered",     bg: "bg-[#3B82F6]/15",  text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
};

/* ─── Status Tabs Config ─── */
const STATUS_TABS = [
  { key: "all", label: "Total" },
  { key: "applied", label: "Applied" },
  { key: "under review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "accepted", label: "Accepted" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

function KpiCard({ label, value, Icon, color, index }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[90px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-[#222228] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#A1A1AA]">{label}</span>
        <Icon size={16} aria-hidden="true" style={{ color }} />
      </div>
      <span className="text-[36px] font-bold text-white leading-none tracking-tight">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const key = (status || "applied").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.applied;
  return (
    <span className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function StatusTabBar({ activeTab, onChange, counts }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-1.5 flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter applications by status">
      {STATUS_TABS.map((tab) => {
        const count = tab.key === "all" ? Object.values(counts).reduce((s, v) => s + v, 0) : (counts[tab.key] || 0);
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-[8px] transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              isActive
                ? "bg-[#3A3A40] text-white"
                : "text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/10 text-white" : "bg-white/[0.04] text-[#71717A]"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const perPage = 8;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.05]">
      <span className="text-[13px] text-[#71717A]">
        Showing {(currentPage - 1) * perPage + 1}&ndash;{Math.min(currentPage * perPage, totalItems)} of {totalItems}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={currentPage === p ? "page" : undefined}
            className={`w-7 h-7 rounded-md text-[13px] font-medium flex items-center justify-center transition-all duration-150 cursor-pointer ${
              currentPage === p
                ? "bg-white text-black"
                : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ApplicationRow({ app, index, onViewDetails }) {
  const jobTitle = app.jobDetails?.jobTitle || app.jobTitle || "Unknown";
  const companyName = app.jobDetails?.companyName || app.companyName || "N/A";
  const workType = app.jobDetails?.jobType || app.workType || "Full-time";
  const locationType = app.jobDetails?.isRemote ? "Remote" : app.locationType || "";
  const { icon: JobIcon, bg: iconBg } = getJobIcon(jobTitle);
  const status = app.status || "Applied";

  return (
    <div
      className="flex items-center h-[72px] px-6 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
      role="row"
    >
      <div className="flex-[2] flex items-center gap-4 min-w-0" role="cell">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
          <JobIcon size={16} aria-hidden="true" className="text-[#A1A1AA]" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-white truncate">{jobTitle}</p>
          <p className="text-[12px] text-[#71717A] mt-0.5">
            {workType} &middot; {locationType || "Remote"}
          </p>
        </div>
      </div>
      <div className="flex-1 text-[14px] text-[#A1A1AA] hidden md:block" role="cell">{companyName}</div>
      <div className="w-28 text-[13px] text-[#71717A] hidden sm:block" role="cell">
        {formatRelativeTime(app.createdAt?.$date || app.createdAt)}
      </div>
      <div className="w-32" role="cell"><StatusBadge status={status} /></div>
      <div className="w-20 text-right" role="cell">
        <button
          onClick={() => onViewDetails(app)}
          aria-label={`View details for ${jobTitle}`}
          className="text-[13px] text-[#A1A1AA] hover:text-white hover:underline underline-offset-2 transition-colors duration-150 cursor-pointer"
        >
          Details
        </button>
      </div>
    </div>
  );
}

function EmptyState({ activeTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Award size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
      <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
        {activeTab === "all" ? "No applications yet" : `No ${activeTab} applications`}
      </p>
      <p className="text-[#71717A] text-[14px]">
        {activeTab === "all" ? "Start applying to jobs to see them here." : `You don't have any ${activeTab} applications.`}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS CONTENT
   ═══════════════════════════════════════════════════ */
export default function ApplicationsContent({ jobs = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Derive counts ── */
  const countByStatus = (matchStatuses) =>
    jobs.filter((j) => matchStatuses.some((s) => (j.status || "").toLowerCase() === s.toLowerCase())).length;

  const counts = {
    applied: countByStatus(["applied"]),
    "under review": countByStatus(["under review", "review"]),
    shortlisted: countByStatus(["shortlisted"]),
    accepted: countByStatus(["accepted"]),
    hired: countByStatus(["hired"]),
    rejected: countByStatus(["rejected"]),
  };

  /* ── KPI data ── */
  const KPI_DATA = [
    { label: "Total Applications", value: jobs.length, Icon: Layers, color: "#ffffff" },
    { label: "Under Review", value: counts["under review"], Icon: TrendingUp, color: "#F59E0B" },
    { label: "Shortlisted", value: counts.shortlisted, Icon: CheckCircle2, color: "#22C55E" },
    { label: "Rejected", value: counts.rejected, Icon: XCircle, color: "#EF4444" },
  ];

  /* ── Filter by active tab ── */
  const filtered = activeTab === "all"
    ? jobs
    : jobs.filter((j) => {
        const s = (j.status || "").toLowerCase();
        if (activeTab === "under review") return s === "under review" || s === "review";
        return s === activeTab;
      });

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetails = (app) => {
    const jobId = app.jobId || app.jobDetails?._id?.$oid || app.jobDetails?._id;
    if (jobId) {
      router.push(`/dashboard/seeker/jobs/${jobId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Applications</h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Track and manage your job applications.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Status Tab Bar ── */}
      <StatusTabBar activeTab={activeTab} onChange={handleTabChange} counts={counts} />

      {/* ── Applications Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="flex items-center h-12 px-6 border-b border-white/[0.05]">
          <div className="flex-[2] text-[13px] font-medium text-[#71717A] tracking-wide">Job Title</div>
          <div className="flex-1 text-[13px] font-medium text-[#71717A] tracking-wide hidden md:block">Company</div>
          <div className="w-28 text-[13px] font-medium text-[#71717A] tracking-wide hidden sm:block">Applied</div>
          <div className="w-32 text-[13px] font-medium text-[#71717A] tracking-wide">Status</div>
          <div className="w-20 text-[13px] font-medium text-[#71717A] tracking-wide text-right">Action</div>
        </div>

        <div role="table" aria-label="Job applications">
          {paginated.length > 0 ? (
            paginated.map((job, idx) => (
              <ApplicationRow key={job._id || job.jobId || idx} app={job} index={idx} onViewDetails={handleViewDetails} />
            ))
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
          />
        )}
      </div>
    </div>
  );
}