"use client";

import React, { useState } from "react";
import {
  Code,
  Palette,
  Database,
  Cloud,
  Cpu,
  Settings,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Briefcase,
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
  if (t.includes("frontend") || t.includes("web") || t.includes("engineer")) return { icon: Code, bg: "bg-slate-700" };
  if (t.includes("design") || t.includes("product") || t.includes("ux")) return { icon: Palette, bg: "bg-indigo-950/60" };
  if (t.includes("data") || t.includes("scientist") || t.includes("analyst")) return { icon: Database, bg: "bg-slate-700" };
  if (t.includes("cloud") || t.includes("architect") || t.includes("devops")) return { icon: Cloud, bg: "bg-sky-950/40" };
  if (t.includes("ai") || t.includes("machine") || t.includes("research")) return { icon: Cpu, bg: "bg-slate-700" };
  return { icon: Briefcase, bg: "bg-slate-700" };
};

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  applied:     { label: "Applied",     bg: "bg-gray-700",       text: "text-gray-200", border: "border-gray-600" },
  review:      { label: "Review",      bg: "bg-amber-500/20",   text: "text-amber-400", border: "border-amber-500" },
  shortlisted: { label: "Shortlisted", bg: "bg-green-500/20",   text: "text-green-400", border: "border-green-500" },
  rejected:    { label: "Rejected",    bg: "bg-red-500/20",     text: "text-red-400",   border: "border-red-500" },
  offered:     { label: "Offered",     bg: "bg-gray-600",       text: "text-gray-100", border: "border-gray-500" },
};

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── KPI Card ─── */
function KpiCard({ label, value, Icon, accentColor }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-gray-600 transition-all duration-200 ease-out">
      <p className="text-sm text-gray-400">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <span className="text-2xl font-semibold text-white">{value}</span>
        <Icon size={20} aria-hidden="true" style={{ color: accentColor }} />
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const key = (status || "applied").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.applied;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Toggle Group ─── */
function ToggleGroup({ active, onChange }) {
  return (
    <div className="bg-gray-800 rounded-lg p-1 flex" role="tablist" aria-label="Filter applications">
      {["Active", "Archived"].map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer ${
            active === tab
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-gray-300"
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
      className="flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
    >
      <FileDown size={15} aria-hidden="true" />
      Export PDF
    </button>
  );
}

/* ─── Pagination ─── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-800">
      <span className="text-xs text-gray-500">
        Showing {(currentPage - 1) * 8 + 1}–{Math.min(currentPage * 8, totalPages * 8)} of {totalPages * 8}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={currentPage === p ? "page" : undefined}
            className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all duration-150 cursor-pointer ${
              currentPage === p
                ? "bg-gray-200 text-black font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS TABLE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function ApplicationsTable({ jobs = [] }) {
  const [activeTab, setActiveTab] = useState("Active");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Derive KPIs ── */
  const total = jobs.length || 24;
  const review = jobs.filter((j) => (j.status || "").toLowerCase() === "review").length || 6;
  const shortlisted = jobs.filter((j) => (j.status || "").toLowerCase() === "shortlisted").length || 5;
  const offered = jobs.filter((j) => (j.status || "").toLowerCase() === "offered").length || 1;

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

  return (
    <div className="space-y-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Applications
          </h1>
          <p className="text-sm text-gray-400">
            Track and manage your job applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ToggleGroup active={activeTab} onChange={(t) => { setActiveTab(t); setCurrentPage(1); }} />
          <ExportButton />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Applications" value={total} Icon={Layers} accentColor="#9ca3af" />
        <KpiCard label="Under Review" value={review} Icon={TrendingUp} accentColor="#f59e0b" />
        <KpiCard label="Shortlisted" value={shortlisted} Icon={CheckCircle2} accentColor="#22c55e" />
        <KpiCard label="Rejected" value={jobs.filter((j) => (j.status || "").toLowerCase() === "rejected").length || 2} Icon={XCircle} accentColor="#ef4444" />
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center h-12 px-6 border-b border-gray-800">
          <div className="flex-[2] text-sm font-medium text-gray-400 tracking-wide">Job Title</div>
          <div className="flex-1 text-sm font-medium text-gray-400 tracking-wide hidden md:block">Company</div>
          <div className="w-28 text-sm font-medium text-gray-400 tracking-wide hidden sm:block">Applied</div>
          <div className="w-28 text-sm font-medium text-gray-400 tracking-wide">Status</div>
          <div className="w-20 text-sm font-medium text-gray-400 tracking-wide text-right">Action</div>
        </div>

        {/* Table Body */}
        <div role="table" aria-label="Job applications">
          {paginated.length > 0 ? (
            paginated.map((job, idx) => {
              const { icon: JobIcon, bg: iconBg } = getJobIcon(job.jobTitle);
              const status = job.status || "Applied";

              return (
                <div
                  key={job.jobId || idx}
                  className="flex items-center h-[72px] px-6 border-t border-gray-800 hover:bg-gray-800 transition-colors duration-150"
                  role="row"
                >
                  {/* Job Title */}
                  <div className="flex-[2] flex items-center gap-4 min-w-0" role="cell">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
                      <JobIcon size={16} aria-hidden="true" className="text-gray-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{job.jobTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job.workType || "Full-time"} · {job.locationType || "Remote"}
                      </p>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex-1 text-sm text-gray-300 hidden md:block" role="cell">
                    {job.companyName}
                  </div>

                  {/* Applied */}
                  <div className="w-28 text-xs text-gray-400 hidden sm:block" role="cell">
                    {formatRelativeTime(job.createdAt?.$date || job.createdAt)}
                  </div>

                  {/* Status */}
                  <div className="w-28" role="cell">
                    <StatusBadge status={status} />
                  </div>

                  {/* Action */}
                  <div className="w-20 text-right" role="cell">
                    <button
                      aria-label={`View details for ${job.jobTitle}`}
                      className="text-sm text-gray-300 hover:text-white hover:underline underline-offset-2 transition-colors duration-150 cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Award size={36} aria-hidden="true" className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium mb-1">
                {activeTab === "Archived" ? "No archived applications" : "No applications found"}
              </p>
              <p className="text-gray-600 text-xs">
                {activeTab === "Archived" ? "Archived applications will appear here." : "Start applying to jobs to see them here."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}