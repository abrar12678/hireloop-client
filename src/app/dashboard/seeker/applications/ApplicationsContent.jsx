"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Code,
  Palette,
  Database,
  Cloud,
  Cpu,
  Briefcase,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";
  const now = new Date();
  const date = new Date(dateString);
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

/* ─── Status Config — unified with dashboard palette ─── */
const STATUS_CONFIG = {
  applied:     { label: "Applied",     bg: "bg-white/[0.06]",    text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  review:      { label: "Under Review", bg: "bg-[#F59E0B]/15",  text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  shortlisted: { label: "Shortlisted", bg: "bg-[#22C55E]/15",  text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  rejected:    { label: "Rejected",    bg: "bg-[#EF4444]/15",  text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  offered:     { label: "Offered",     bg: "bg-[#3B82F6]/15",  text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
};

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── KPI Card ─── */
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
      <span className="text-[36px] font-bold text-white leading-none tracking-tight">
        {value}
      </span>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const key = (status || "applied").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.applied;
  return (
    <span
      className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Toggle Group ─── */
function ToggleGroup({ active, onChange }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[10px] p-1 flex" role="tablist" aria-label="Filter applications">
      {["Active", "Archived"].map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-all duration-150 cursor-pointer ${
            active === tab
              ? "bg-[#3A3A40] text-white"
              : "text-[#A1A1AA] hover:text-[#E4E4E7]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ─── Export Button ─── */
function ExportButton() {
  return (
    <button
      aria-label="Export applications as PDF"
      className="flex items-center gap-2 bg-white text-black h-[38px] px-4 rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-colors duration-200 cursor-pointer"
    >
      <FileDown size={15} aria-hidden="true" />
      Export PDF
    </button>
  );
}

/* ─── Pagination ─── */
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

/* ─── Table Row ─── */
function ApplicationRow({ job, index }) {
  const { icon: JobIcon, bg: iconBg } = getJobIcon(job.jobTitle);
  const status = job.status || "Applied";

  return (
    <div
      className="flex items-center h-[72px] px-6 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
      role="row"
    >
      {/* Job Title + Icon */}
      <div className="flex-[2] flex items-center gap-4 min-w-0" role="cell">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
          <JobIcon size={16} aria-hidden="true" className="text-[#A1A1AA]" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-white truncate">{job.jobTitle}</p>
          <p className="text-[12px] text-[#71717A] mt-0.5">
            {job.workType || "Full-time"} &middot; {job.locationType || "Remote"}
          </p>
        </div>
      </div>

      {/* Company */}
      <div className="flex-1 text-[14px] text-[#A1A1AA] hidden md:block" role="cell">
        {job.companyName}
      </div>

      {/* Applied */}
      <div className="w-28 text-[13px] text-[#71717A] hidden sm:block" role="cell">
        {formatRelativeTime(job.createdAt?.$date || job.createdAt)}
      </div>

      {/* Status */}
      <div className="w-32" role="cell">
        <StatusBadge status={status} />
      </div>

      {/* Action */}
      <div className="w-20 text-right" role="cell">
        <button
          aria-label={`View details for ${job.jobTitle}`}
          className="text-[13px] text-[#A1A1AA] hover:text-white hover:underline underline-offset-2 transition-colors duration-150 cursor-pointer"
        >
          Details
        </button>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ activeTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Award size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
      <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
        {activeTab === "Archived" ? "No archived applications" : "No applications found"}
      </p>
      <p className="text-[#71717A] text-[14px]">
        {activeTab === "Archived" ? "Archived applications will appear here." : "Start applying to jobs to see them here."}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS CONTENT
   ═══════════════════════════════════════════════════ */
export default function ApplicationsContent({ jobs = [] }) {
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("Active");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Announce tab changes for screen readers
  }, [activeTab]);

  /* ── Derive KPIs ── */
  const total = jobs.length || 24;
  const review = jobs.filter((j) => (j.status || "").toLowerCase() === "review").length || 6;
  const shortlisted = jobs.filter((j) => (j.status || "").toLowerCase() === "shortlisted").length || 5;
  const rejected = jobs.filter((j) => (j.status || "").toLowerCase() === "rejected").length || 2;

  /* ── KPI data ── */
  const KPI_DATA = [
    { label: "Total Applications", value: total, Icon: Layers, color: "#ffffff" },
    { label: "Under Review", value: review, Icon: TrendingUp, color: "#F59E0B" },
    { label: "Shortlisted", value: shortlisted, Icon: CheckCircle2, color: "#22C55E" },
    { label: "Rejected", value: rejected, Icon: XCircle, color: "#EF4444" },
  ];

  /* ── Table data (use real data or fallback mock) ── */
  const tableData = jobs.length > 0
    ? jobs
    : [
        { jobId: "1", jobTitle: "Senior Frontend Engineer", companyName: "TechFlow", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: "Applied", workType: "Full-time", locationType: "Remote" },
        { jobId: "2", jobTitle: "Lead Product Designer", companyName: "FinGrid", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: "Review", workType: "Full-time", locationType: "Hybrid" },
        { jobId: "3", jobTitle: "Senior Data Scientist", companyName: "CloudApps", createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), status: "Shortlisted", workType: "Full-time", locationType: "Remote" },
        { jobId: "4", jobTitle: "Cloud Solutions Architect", companyName: "DataSync", createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), status: "Applied", workType: "Full-time", locationType: "On-site" },
        { jobId: "5", jobTitle: "AI/ML Research Engineer", companyName: "ScaleUp", createdAt: new Date(Date.now() - 72 * 3600000).toISOString(), status: "Rejected", workType: "Contract", locationType: "Remote" },
        { jobId: "6", jobTitle: "Senior Backend Engineer", companyName: "DesignLab", createdAt: new Date(Date.now() - 96 * 3600000).toISOString(), status: "Review", workType: "Full-time", locationType: "Hybrid" },
        { jobId: "7", jobTitle: "DevOps Engineer", companyName: "NeuralPath", createdAt: new Date(Date.now() - 120 * 3600000).toISOString(), status: "Offered", workType: "Full-time", locationType: "Remote" },
        { jobId: "8", jobTitle: "Full Stack Developer", companyName: "Quantum Labs", createdAt: new Date(Date.now() - 168 * 3600000).toISOString(), status: "Shortlisted", workType: "Full-time", locationType: "On-site" },
      ];

  const filtered = activeTab === "Archived" ? [] : tableData;
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading applications">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
            Applications
          </h1>
          <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
            Track and manage your job applications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ToggleGroup active={activeTab} onChange={(t) => { setActiveTab(t); setCurrentPage(1); }} />
          <ExportButton />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        {/* Table Header */}
        <div className="flex items-center h-12 px-6 border-b border-white/[0.05]">
          <div className="flex-[2] text-[13px] font-medium text-[#71717A] tracking-wide">Job Title</div>
          <div className="flex-1 text-[13px] font-medium text-[#71717A] tracking-wide hidden md:block">Company</div>
          <div className="w-28 text-[13px] font-medium text-[#71717A] tracking-wide hidden sm:block">Applied</div>
          <div className="w-32 text-[13px] font-medium text-[#71717A] tracking-wide">Status</div>
          <div className="w-20 text-[13px] font-medium text-[#71717A] tracking-wide text-right">Action</div>
        </div>

        {/* Table Body */}
        <div role="table" aria-label="Job applications">
          {paginated.length > 0 ? (
            paginated.map((job, idx) => (
              <ApplicationRow key={job.jobId || idx} job={job} index={idx} />
            ))
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </div>

        {/* Pagination */}
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