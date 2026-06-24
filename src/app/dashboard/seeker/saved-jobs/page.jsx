"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { protectedClientFetch, clientDelete } from "@/lib/core/client";
import {
  Bookmark,
  MapPin,
  DollarSign,
  ChevronDown,
  Briefcase,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(
    typeof dateInput === "object" && dateInput.$date
      ? dateInput.$date
      : dateInput
  );
  if (isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
  return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}

function formatSalary(min, max) {
  if (!min && !max) return "Not specified";
  if (min === 0 && max === 0) return "Not specified";
  const fmt = (v) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (v >= 1000) return `$${Math.round(v / 1000)}k`;
    return `$${v}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

function getCompanyInitial(name) {
  if (!name) return "?";
  return name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function mapApiToJob(item) {
  // Handle both nested (item.job) and flat (item directly) API structures
  const j = item.job || item;
  const jobType = j.jobType || "";
  const isRemote = j.isRemote;
  const typeLabel = [jobType, isRemote ? "Remote" : ""].filter(Boolean).join(" \u2022 ") || "Not specified";
  const jobCategory = j.jobCategory || "";

  // Determine location: prefer explicit location, fallback to remote flag
  let location = j.location || "";
  if (!location && isRemote) location = "Remote";
  if (!location) location = "Not specified";

  // Determine salary
  const minSalary = j.minSalary ? parseInt(j.minSalary, 10) : 0;
  const maxSalary = j.maxSalary ? parseInt(j.maxSalary, 10) : 0;
  const salary = formatSalary(minSalary || null, maxSalary || null);

  // Determine company
  const companyName = j.companyName || j.company?.name || "Unknown Company";

  return {
    id: item._id?.$oid || item._id,
    realJobId: item.jobId || j._id?.$oid || j._id,
    title: j.jobTitle || j.title || "Untitled",
    company: companyName,
    companyInitial: getCompanyInitial(companyName),
    companyLogo: j.companyLogo || j.company?.logo || null,
    location: location,
    type: typeLabel,
    salary: salary,
    equity: null,
    savedAt: formatRelativeTime(item.savedAt?.$date || item.savedAt),
    status: "active",
    category: (jobCategory || j.category || "other").toLowerCase(),
    draft: false,
    closingStatus: null,
    closingUrgent: false,
    closingClosed: false,
    experienceLevel: j.experienceLevel || "",
    jobCategory: jobCategory,
  };
}

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Statistics Card ─── */
function StatisticsCard({ title, value, Icon, color }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[90px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[#A1A1AA]">{title}</span>
        <Icon size={16} aria-hidden="true" style={{ color }} />
      </div>
      <span className="text-[36px] font-bold text-white leading-none tracking-tight">{value}</span>
    </div>
  );
}

/* ─── Filter Tab ─── */
function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 px-4 rounded-full text-[14px] font-medium transition-all duration-150 cursor-pointer ${
        active
          ? "bg-[#3A3A40] text-white"
          : "text-[#A1A1AA] hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── Sort Dropdown ─── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const options = ["Recently Saved", "Salary: High to Low", "Alphabetical"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Sort saved jobs"
        aria-expanded={open}
        className="flex items-center gap-2 text-[14px] text-[#A1A1AA] hover:text-white transition-colors duration-200 cursor-pointer"
      >
        <span className="text-[13px]">Sort by:</span>
        <span className="text-[14px] font-medium text-white">{value}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-full mt-2 w-52 bg-[#1B1B1F] border border-white/[0.06] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.4)] py-1.5 z-20 overflow-hidden"
            role="listbox"
          >
            {options.map((opt) => (
              <button
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors duration-150 cursor-pointer ${
                  value === opt
                    ? "text-white bg-white/[0.04]"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Metadata Chip ─── */
function MetadataChip({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 h-[26px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
      <Icon size={12} aria-hidden="true" />
      {text}
    </span>
  );
}

/* ─── Bookmark Button ─── */
function BookmarkButton({ saved, onDelete, deleting }) {
  const [isSaved, setIsSaved] = useState(saved);

  const handleClick = async () => {
    if (deleting) return;
    if (!isSaved) return;
    setIsSaved(false);
    try {
      await onDelete();
    } catch {
      setIsSaved(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={deleting}
      aria-label={isSaved ? "Remove from saved" : "Save job"}
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
        isSaved
          ? "bg-[#3A3A40] text-[#3B82F6] hover:bg-[#4A4A52]"
          : "bg-[#1B1B1F] text-[#71717A] hover:bg-[#3A3A40]"
      } ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Bookmark
        size={16}
        aria-hidden="true"
        fill={isSaved ? "#3B82F6" : "none"}
      />
    </button>
  );
}

/* ─── Company Logo ─── */
function CompanyLogo({ initial, name, logo }) {
  if (logo) {
    return (
      <div
        className="w-12 h-12 rounded-[12px] bg-[#3A3A40] flex items-center justify-center shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        <img src={logo} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-[12px] bg-[#3A3A40] flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-white text-[13px] font-bold">{initial}</span>
    </div>
  );
}

/* ─── Status Indicator ─── */
function StatusIndicator({ savedAt, closingStatus, closingUrgent, closingClosed }) {
  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <span className="text-[12px] text-[#71717A]">{savedAt}</span>
      {closingStatus && (
        <span className={`text-[12px] font-medium ${closingUrgent ? "text-[#F59E0B]" : closingClosed ? "text-[#EF4444]" : "text-[#71717A]"}`}>
          {closingStatus}
        </span>
      )}
    </div>
  );
}

/* ─── Primary Action Button ─── */
function PrimaryActionButton({ status, draft, realJobId }) {
  if (status === "closed") {
    return (
      <button
        aria-label="This position is closed"
        className="h-10 px-5 rounded-[10px] border border-[#EF4444]/30 text-[#EF4444] text-[14px] font-medium transition-colors duration-200 cursor-default opacity-70"
      >
        Closed
      </button>
    );
  }

  if (draft) {
    return (
      <Link
        href="#"
        className="h-10 px-5 rounded-[10px] bg-[#3A3A40] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#4A4A52] transition-colors duration-200"
      >
        Draft Started
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={realJobId ? `/dashboard/seeker/jobs/${realJobId}` : "#"}
        className="h-10 px-5 rounded-[10px] bg-white text-black text-[14px] font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors duration-200 hover:scale-[1.02]"
      >
        View & Apply
      </Link>
    </div>
  );
}

/* ─── Job Card ─── */
function JobCard({ job, onDelete, deletingId }) {
  const isClosed = job.status === "closed";
  const isDeleting = deletingId === job.id;

  const handleDelete = async () => {
    if (!job.id) return;
    await clientDelete(`/saved-jobs/${job.id}`);
    onDelete(job.id);
  };

  return (
    <div
      className={`bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-[#232327] transition-all duration-200 ${
        isClosed || isDeleting ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <CompanyLogo initial={job.companyInitial} name={job.company} logo={job.companyLogo} />

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-[20px] font-semibold text-white leading-tight truncate ${
              isClosed ? "line-through opacity-60" : ""
            }`}
          >
            {job.title}
          </h3>

          <p className="text-[14px] text-[#A1A1AA] mt-1 truncate">
            {job.company}
          </p>

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            <MetadataChip icon={MapPin} text={job.location} />
            <MetadataChip icon={Briefcase} text={job.type} />
            <MetadataChip icon={DollarSign} text={job.salary} />
            {job.experienceLevel && (
              <span className="inline-flex items-center h-[26px] px-3 rounded-full bg-[#3A3A40] text-[12px] font-medium text-[#A1A1AA]">
                {job.experienceLevel}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status */}
        <StatusIndicator
          savedAt={job.savedAt}
          closingStatus={job.closingStatus}
          closingUrgent={job.closingUrgent}
          closingClosed={job.closingClosed}
        />

        {/* Bookmark */}
        <BookmarkButton saved={!isClosed} onDelete={handleDelete} deleting={isDeleting} />

        {/* Action */}
        <PrimaryActionButton status={job.status} draft={job.draft} realJobId={job.realJobId} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SAVED JOBS PAGE
   ═══════════════════════════════════════════════════ */
export default function SavedJobsPage() {
  const [rawJobs, setRawJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All Saved");
  const [sortBy, setSortBy] = useState("Recently Saved");
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch saved jobs ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await protectedClientFetch("/saved-jobs");
        if (!cancelled) setRawJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load saved jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Map API data to UI shape ── */
  const jobs = useMemo(() => rawJobs.map(mapApiToJob), [rawJobs]);

  /* ── Derive dynamic filter tabs from data ── */
  const filterTabs = useMemo(() => {
    const categories = [...new Set(jobs.map((j) => j.category).filter(Boolean))];
    const capitalized = categories
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
      .sort();
    return ["All Saved", ...capitalized];
  }, [jobs]);

  /* ── Reset filter if current tab no longer exists ── */
  useEffect(() => {
    if (!filterTabs.includes(activeFilter)) {
      setActiveFilter("All Saved");
    }
  }, [filterTabs, activeFilter]);

  /* ── Filter ── */
  const filteredJobs = useMemo(() => {
    const base =
      activeFilter === "All Saved"
        ? jobs
        : jobs.filter((j) => j.category === activeFilter.toLowerCase());

    /* ── Sort ── */
    const sorted = [...base];
    if (sortBy === "Alphabetical") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "Salary: High to Low") {
      sorted.sort((a, b) => {
        const parseSalary = (s) => {
          const nums = (s || "").match(/[\d.]+/g);
          if (!nums) return 0;
          return Math.max(...nums.map(Number));
        };
        return parseSalary(b.salary) - parseSalary(a.salary);
      });
    }
    // "Recently Saved" — default order from API (already newest first)
    return sorted;
  }, [jobs, activeFilter, sortBy]);

  /* ── Delete handler ── */
  const handleDelete = useCallback((id) => {
    setDeletingId(id);
    setRawJobs((prev) => prev.filter((item) => {
      const itemId = item._id?.$oid || item._id;
      return itemId !== id;
    }));
    setDeletingId(null);
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading saved jobs">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[#EF4444] text-[16px] font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-5 rounded-[10px] bg-white text-black text-[14px] font-medium hover:bg-zinc-200 transition-colors duration-200 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header: Title Left, Stats Right ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
            Track and manage jobs you&#39;ve bookmarked for later.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Stats Card — Total Saved only */}
          <StatisticsCard title="Total Saved" value={jobs.length} Icon={Bookmark} color="#3B82F6" />
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      {filterTabs.length > 1 && (
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] h-[60px] flex items-center justify-between px-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1" role="tablist" aria-label="Filter jobs by category">
            {filterTabs.map((tab) => (
              <FilterTab
                key={tab}
                label={tab}
                active={activeFilter === tab}
                onClick={() => setActiveFilter(tab)}
              />
            ))}
          </div>

          {/* Sort */}
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      )}

      {/* ── Saved Jobs List ── */}
      <section aria-label="Saved jobs list">
        {filteredJobs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onDelete={handleDelete} deletingId={deletingId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.08] rounded-[14px]">
            <Bookmark size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
            <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
              {jobs.length === 0 ? "No saved jobs yet" : "No saved jobs in this category"}
            </p>
            <p className="text-[#71717A] text-[14px]">
              {jobs.length === 0 ? "Browse jobs and bookmark the ones you like." : "Try selecting a different filter tab."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}