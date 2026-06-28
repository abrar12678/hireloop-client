"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
import { updateJob, deleteJob, toggleJobStatus } from "@/lib/api-client/jobs";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Eye,
  Plus,
  Search,
  FileEdit,
  Pause,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  DollarSign,
  Calendar,
  X,
  Save,
  CheckCircle,
} from "lucide-react";

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
    border: "border-[#22C55E]/30",
  },
  paused: {
    label: "Paused",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
  },
  closed: {
    label: "Closed",
    bg: "bg-[#EF4444]/15",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]/30",
  },
  draft: {
    label: "Draft",
    bg: "bg-white/[0.06]",
    text: "text-[#A1A1AA]",
    border: "border-white/[0.08]",
  },
};

const FILTER_TABS = ["All", "Active", "Draft", "Paused", "Closed"];

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── KPI Stat Card (colorful) ─── */
function KpiStatCard({ label, value, Icon, color, index }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={22} aria-hidden="true" style={{ color }} />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[12px] text-[#71717A] uppercase tracking-wide font-medium leading-none">
          {label}
        </span>
        <span className="text-[28px] font-bold text-white leading-tight tracking-tight mt-1">
          {value}
        </span>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const key = (status || "draft").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Filter Tab Bar ─── */
function FilterTabBar({ active, onChange, counts }) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto"
      role="tablist"
      aria-label="Filter jobs by status"
    >
      {FILTER_TABS.map((tab) => {
        const count =
          tab === "All" ? counts.total : counts[tab.toLowerCase()] || 0;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            onClick={() => onChange(tab)}
            className={`h-9 px-4 rounded-[10px] text-[13px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              active === tab
                ? "bg-[#3A3A40] text-white"
                : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-[#E4E4E7]"
            }`}
          >
            {tab}
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                active === tab
                  ? "bg-white/[0.1] text-white"
                  : "bg-white/[0.04] text-[#71717A]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Search Input ─── */
function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-[280px]">
      <Search
        size={16}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search jobs..."
        aria-label="Search jobs"
        className="w-full h-10 bg-[#1B1B1F] border border-white/[0.05] rounded-full pl-9 pr-4 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/* ─── Action Icon Button ─── */
function ActionButton({ icon: Icon, label, onClick, danger = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
          : "text-[#71717A] hover:text-white hover:bg-white/[0.06]"
      } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]`}
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}

/* ─── Job Table Row (Desktop) ─── */
function JobRow({ job, onView, onDraft, onPause, onDelete }) {
  const isClosed = job.status === "closed" || job.isDeadlinePassed;
  return (
    <tr className={`h-[72px] border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150 ${isClosed ? "opacity-60" : ""}`}>
      <td className="px-6" role="cell">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
            <Briefcase
              size={16}
              aria-hidden="true"
              className="text-[#A1A1AA]"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">
              {job.title}
            </p>
            <p className="text-[12px] text-[#71717A] mt-0.5">{job.category}</p>
          </div>
        </div>
      </td>
      <td className="px-6 hidden lg:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#A1A1AA]">
          <MapPin size={13} aria-hidden="true" className="text-[#71717A]" />
          {job.location}
        </div>
      </td>
      <td className="px-6 hidden xl:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#A1A1AA]">
          <DollarSign size={13} aria-hidden="true" className="text-[#71717A]" />
          {job.salary}
        </div>
      </td>
      <td className="px-6 hidden md:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#A1A1AA]">
          <Users size={13} aria-hidden="true" className="text-[#71717A]" />
          {job.applicants}
        </div>
      </td>
      <td className="px-6 hidden sm:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#A1A1AA]">
          <Calendar size={13} aria-hidden="true" className="text-[#71717A]" />
          {job.posted}
        </div>
      </td>
      <td className="px-6" role="cell">
        {isClosed && job.status !== "closed" ? (
          <StatusBadge status="closed" />
        ) : (
          <StatusBadge status={job.status} />
        )}
      </td>
      <td className="px-6 text-right" role="cell">
        <div className="flex items-center justify-end gap-1">
          <ActionButton
            icon={Eye}
            label={`View ${job.title}`}
            onClick={() => onView(job)}
          />
          <ActionButton
            icon={job.status === "draft" ? Play : FileEdit}
            label={
              job.status === "draft"
                ? `Activate ${job.title}`
                : `Draft ${job.title}`
            }
            onClick={() => onDraft(job)}
          />
          <ActionButton
            icon={job.status === "paused" ? Play : Pause}
            label={
              job.status === "paused"
                ? `Resume ${job.title}`
                : `Pause ${job.title}`
            }
            onClick={() => onPause(job)}
            disabled={job.status === "draft" || job.status === "closed"}
          />
          <ActionButton
            icon={Trash2}
            label={`Delete ${job.title}`}
            onClick={() => onDelete(job)}
            danger
          />
        </div>
      </td>
    </tr>
  );
}

/* ─── Job Mobile Card ─── */
function JobCard({ job, onView, onDraft, onPause, onDelete }) {
  const isClosed = job.status === "closed" || job.isDeadlinePassed;
  return (
    <div className={`px-5 py-4 space-y-3 ${isClosed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
            <Briefcase
              size={16}
              aria-hidden="true"
              className="text-[#A1A1AA]"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">
              {job.title}
            </p>
            <p className="text-[12px] text-[#71717A] mt-0.5">
              {job.category} &middot; {job.type}
            </p>
          </div>
        </div>
        {isClosed && job.status !== "closed" ? (
          <StatusBadge status="closed" />
        ) : (
          <StatusBadge status={job.status} />
        )}
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
        <span className="flex items-center gap-1">
          <MapPin size={12} aria-hidden="true" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={12} aria-hidden="true" />
          {job.salary}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} aria-hidden="true" />
          {job.applicants}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[12px] text-[#71717A]">Posted {job.posted}</span>
        <div className="flex items-center gap-1">
          <ActionButton icon={Eye} label={`View ${job.title}`} onClick={() => onView(job)} />
          <ActionButton
            icon={job.status === "draft" ? Play : FileEdit}
            label={job.status === "draft" ? `Activate ${job.title}` : `Draft ${job.title}`}
            onClick={() => onDraft(job)}
          />
          <ActionButton
            icon={job.status === "paused" ? Play : Pause}
            label={job.status === "paused" ? `Resume ${job.title}` : `Pause ${job.title}`}
            onClick={() => onPause(job)}
            disabled={job.status === "draft" || job.status === "closed"}
          />
          <ActionButton icon={Trash2} label={`Delete ${job.title}`} onClick={() => onDelete(job)} danger />
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ activeFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Briefcase size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
      <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
        {activeFilter === "All"
          ? "No jobs found"
          : `No ${activeFilter.toLowerCase()} jobs`}
      </p>
      <p className="text-[#71717A] text-[14px]">
        {activeFilter === "All"
          ? "Create your first job posting to start receiving applications."
          : `${activeFilter} jobs will appear here.`}
      </p>
      {activeFilter === "All" && (
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="mt-4 h-10 px-5 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <Plus size={16} aria-hidden="true" />
          Post Your First Job
        </Link>
      )}
    </div>
  );
}

/* ─── Pagination ─── */
function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const perPage = 6;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.05]">
      <span className="text-[13px] text-[#71717A]">
        Showing {(currentPage - 1) * perPage + 1}&ndash;
        {Math.min(currentPage * perPage, totalItems)} of {totalItems}
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

/* ─── Floating Action Button ─── */
function FloatingActionButton() {
  return (
    <Link
      href="/dashboard/recruiter/jobs/new"
      aria-label="Create new job post"
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.30)] hover:scale-105 transition-all duration-150 z-40"
    >
      <Plus size={24} aria-hidden="true" />
    </Link>
  );
}

/* ─── View / Edit Job Modal ─── */
function ViewJobModal({ job, rawJob, onClose, onSave }) {
  const [formData, setFormData] = useState(rawJob || {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!job) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full h-10 bg-[#0E0E11] border border-white/[0.08] rounded-[10px] px-3 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)]";
  const labelClass = "block text-[13px] text-[#71717A] mb-1.5 font-medium";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`View ${job.title}`}
        className="w-full max-w-[680px] mx-4 bg-[#1B1B1F] border border-white/[0.05] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-6 max-h-[85vh] overflow-y-auto"
        style={{ animation: "slideUp 200ms ease-out" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[18px] font-semibold text-white">Job Details</h3>
            <p className="text-[14px] text-[#71717A] mt-1">Edit and save changes.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#A1A1AA] hover:bg-[#222228] hover:text-white transition-all duration-150 cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle size={40} className="text-[#22C55E] mb-3" />
            <p className="text-white text-[16px] font-medium">Job updated successfully!</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Job Title</label>
                <input className={fieldClass} value={formData.jobTitle || ""} onChange={(e) => handleChange("jobTitle", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Job Category</label>
                <input className={fieldClass} value={formData.jobCategory || ""} onChange={(e) => handleChange("jobCategory", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Job Type</label>
                <select
                  className={fieldClass + " appearance-none cursor-pointer"}
                  value={formData.jobType || ""}
                  onChange={(e) => handleChange("jobType", e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input className={fieldClass} value={formData.isRemote ? "Remote" : formData.location || ""} disabled={formData.isRemote} onChange={(e) => handleChange("location", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Min Salary</label>
                <input className={fieldClass} type="number" value={formData.minSalary || ""} onChange={(e) => handleChange("minSalary", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Max Salary</label>
                <input className={fieldClass} type="number" value={formData.maxSalary || ""} onChange={(e) => handleChange("maxSalary", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <input className={fieldClass} value={formData.currency || "USD"} onChange={(e) => handleChange("currency", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Deadline</label>
                <input className={fieldClass} type="date" value={formData.deadline ? formData.deadline.split("T")[0] : ""} onChange={(e) => handleChange("deadline", e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Skills</label>
              <input className={fieldClass} value={formData.skills || ""} onChange={(e) => handleChange("skills", e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Responsibilities</label>
              <textarea
                className={fieldClass + " min-h-[80px] resize-y"}
                rows={3}
                value={formData.responsibilities || ""}
                onChange={(e) => handleChange("responsibilities", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Requirements</label>
              <textarea
                className={fieldClass + " min-h-[80px] resize-y"}
                rows={3}
                value={formData.requirements || ""}
                onChange={(e) => handleChange("requirements", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Benefits</label>
              <textarea
                className={fieldClass + " min-h-[60px] resize-y"}
                rows={2}
                value={formData.benefits || ""}
                onChange={(e) => handleChange("benefits", e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.05] pt-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="h-10 px-4 text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-5 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={15} aria-hidden="true" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ─── Map DB job to UI shape ─── */
function mapJob(job) {
  const currency = job.currency || "$";
  const min = job.minSalary
    ? `${currency}${Number(job.minSalary).toLocaleString()}`
    : "";
  const max = job.maxSalary
    ? `${currency}${Number(job.maxSalary).toLocaleString()}`
    : "";
  const salary = min && max ? `${min} – ${max}` : min || max || "Not specified";

  let posted = "—";
  if (job.createdAt) {
    try {
      posted = new Date(job.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {}
  }

  // Check if deadline has passed
  let isDeadlinePassed = false;
  if (job.deadline) {
    try {
      isDeadlinePassed = new Date(job.deadline) < new Date();
    } catch {}
  }

  return {
    id: job._id,
    title: job.jobTitle || "Untitled",
    type: job.jobType || "—",
    category: job.jobCategory || "—",
    location: job.isRemote ? "Remote" : job.location || "—",
    salary,
    applicants: job.applicantCount || 0,
    status: job.status || "draft",
    posted,
    deadline: job.deadline || "—",
    isDeadlinePassed,
  };
}

/* ═══════════════════════════════════════════════════
   MANAGE JOBS PAGE
   ═══════════════════════════════════════════════════ */
export default function ManageJobsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [rawJobs, setRawJobs] = useState([]);
  const [rawJobsMap, setRawJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewJob, setViewJob] = useState(null);
  const [viewRawJob, setViewRawJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch jobs via proxy ── */
  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;

    try {
      // 1. Get recruiter's company through proxy
      const company = await protectedClientFetch(
        `/api/my/companies?recruiterId=${user.id}`,
      );

      const companyObj = Array.isArray(company) ? company[0] : company;
      if (!companyObj?._id) {
        console.log("[ManageJobs] No company found for recruiter:", user.id);
        setRawJobs([]);
        return;
      }

      // 2. Get all jobs for this company through proxy
      const data = await protectedClientFetch(
        `/api/jobs?companyId=${companyObj._id}&all=true&perPage=200`,
      );

      const jobs = data?.jobs || [];
      const mapped = jobs.map(mapJob);
      setRawJobs(mapped);
      // Keep raw jobs for view/edit modal
      const map = {};
      jobs.forEach((j) => { map[j._id] = j; });
      setRawJobsMap(map);
    } catch (err) {
      console.error("[ManageJobs] Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!sessionPending) {
      fetchJobs();
    }
  }, [fetchJobs, sessionPending]);

  /* ── Derive KPIs ── */
  const totalJobs = rawJobs.length;
  const activeJobs = rawJobs.filter((j) => j.status === "active").length;
  const draftJobs = rawJobs.filter((j) => j.status === "draft").length;
  const pausedJobs = rawJobs.filter((j) => j.status === "paused").length;

  const KPI_DATA = [
    { label: "Total Jobs", value: totalJobs.toString(), Icon: Briefcase, color: "#ffffff" },
    { label: "Active Jobs", value: activeJobs.toString(), Icon: Play, color: "#22C55E" },
    { label: "Draft Jobs", value: draftJobs.toString(), Icon: FileEdit, color: "#F59E0B" },
    { label: "Paused Jobs", value: pausedJobs.toString(), Icon: Pause, color: "#3B82F6" },
  ];

  /* ── Filter counts ── */
  const counts = {
    total: totalJobs,
    active: activeJobs,
    paused: pausedJobs,
    closed: rawJobs.filter((j) => j.status === "closed" || j.isDeadlinePassed).length,
    draft: draftJobs,
  };

  /* ── Filter + Search ── */
  const filtered = rawJobs.filter((job) => {
    const matchesFilter =
      activeFilter === "All" || job.status === activeFilter.toLowerCase();
    // For "Closed" toggle, also include deadline-passed jobs
    const isClosedLike = activeFilter === "Closed"
      ? job.status === "closed" || job.isDeadlinePassed
      : false;
    const matchesClosedFilter = isClosedLike;

    const matchesStatus = matchesFilter || matchesClosedFilter;
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  /* ── Action handlers ── */
  const handleView = (job) => {
    setViewJob(job);
    setViewRawJob(rawJobsMap[job.id] || {});
  };

  const handleSaveJob = async (formData) => {
    if (!viewJob?.id) return;
    await updateJob(viewJob.id, formData);
    // Update local state
    const updated = mapJob(formData);
    setRawJobs((prev) =>
      prev.map((j) => (j.id === viewJob.id ? { ...j, ...updated } : j))
    );
    // Update raw map
    setRawJobsMap((prev) => ({ ...prev, [viewJob.id]: { ...prev[viewJob.id], ...formData } }));
    showToast("Job updated successfully!");
  };

  const handleDraft = async (job) => {
    const newStatus = job.status === "draft" ? "active" : "draft";
    await toggleJobStatus(job.id, newStatus);
    setRawJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );
    showToast(newStatus === "draft" ? "Job moved to draft" : "Job activated");
  };

  const handlePause = async (job) => {
    const newStatus = job.status === "paused" ? "active" : "paused";
    await toggleJobStatus(job.id, newStatus);
    setRawJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );
    showToast(newStatus === "paused" ? "Job paused" : "Job resumed");
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) return;
    await deleteJob(job.id);
    setRawJobs((prev) => prev.filter((j) => j.id !== job.id));
    setRawJobsMap((prev) => {
      const next = { ...prev };
      delete next[job.id];
      return next;
    });
    showToast("Job deleted");
  };

  if (sessionPending || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        role="status"
        aria-label="Loading jobs"
      >
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 border text-[14px] font-medium px-5 py-3 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center gap-2 transition-all duration-200 ${
          toast.type === "success"
            ? "bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]"
            : "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]"
        }`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
          {toast.message}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
            Manage Jobs
          </h1>
          <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
            View, edit, and manage all your job postings.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 inline-flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <Plus size={16} aria-hidden="true" />
          Post New Job
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiStatCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Jobs Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.05]">
          <FilterTabBar
            active={activeFilter}
            onChange={(tab) => {
              setActiveFilter(tab);
              setCurrentPage(1);
            }}
            counts={counts}
          />
          <SearchInput
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" role="table" aria-label="Job listings">
            <thead>
              <tr className="h-12 border-b border-white/[0.05]">
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
                  Job Title
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">
                  Location
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden xl:table-cell">
                  Salary
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden md:table-cell">
                  Applicants
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">
                  Posted
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
                  Status
                </th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onView={handleView}
                  onDraft={handleDraft}
                  onPause={handlePause}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/[0.05]">
          {paginated.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleView}
              onDraft={handleDraft}
              onPause={handlePause}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Empty State */}
        {paginated.length === 0 && <EmptyState activeFilter={activeFilter} />}

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

      {/* ── FAB ── */}
      <FloatingActionButton />

      {/* ── View/Edit Modal ── */}
      {viewJob && (
        <ViewJobModal
          job={viewJob}
          rawJob={viewRawJob}
          onClose={() => { setViewJob(null); setViewRawJob(null); }}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
}