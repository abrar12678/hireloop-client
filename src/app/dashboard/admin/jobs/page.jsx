"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  TrendingUp,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  FileEdit,
  BarChart3,
  AlertTriangle,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  protectedClientFetch,
  clientMutation,
  clientFetch,
} from "@/lib/core/client";

const ITEMS_PER_PAGE = 6;

const STATUS_TABS = ["All", "Active", "Closed", "Draft", "Flagged"];
const STATUS_DROPDOWN_OPTIONS = [
  "All Statuses",
  "Active",
  "Closed",
  "Draft",
  "Paused",
  "Flagged",
];

/* ──────────────────── HELPERS ───────────────── */

function getInitials(company) {
  if (!company) return "?";
  return company
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getJobId(job) {
  return job._id?.$oid || job._id || job.id || "";
}

function mapJobFromApi(job) {
  const id = getJobId(job);
  return {
    id,
    _id: id,
    title: job.jobTitle || job.title || "Untitled",
    companyName: job.companyName || "",
    company: job.companyName || "",
    category: job.jobCategory || job.category || "Uncategorized",
    jobType: job.jobType || job.type || "",
    type: job.jobType || job.type || "",
    status: job.status || "draft",
    createdAt: job.createdAt || "",
    datePosted: job.createdAt || "",
    applicantCount: job.applicantCount ?? 0,
    applications: job.applicantCount ?? 0,
  };
}

/* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */

/* 1. KpiStatCard */
function KpiStatCard({ icon: Icon, label, value, change, changeType }) {
  const changeColor =
    changeType === "up"
      ? "text-[#22C55E]"
      : changeType === "down"
        ? "text-red-400"
        : "text-[#A1A1AA]";

  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-4 min-h-[90px] flex flex-col justify-between"
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#A1A1AA] text-sm font-medium">{label}</span>
        <div className="w-8 h-8 rounded-[10px] bg-[#3A3A40] flex items-center justify-center">
          <Icon size={16} className="text-[#A1A1AA]" />
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
        <span className={`text-xs font-medium ${changeColor}`}>{change}</span>
      </div>
    </div>
  );
}

/* 2. StatusBadge */
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let classes = "";
  let Icon = null;

  if (s === "active") {
    classes = "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30";
    Icon = CheckCircle2;
  } else if (s === "closed") {
    classes = "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]";
    Icon = XCircle;
  } else if (s === "draft") {
    classes = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    Icon = FileEdit;
  } else if (s === "paused") {
    classes = "bg-sky-500/15 text-sky-400 border-sky-500/30";
    Icon = Clock;
  } else if (s === "flagged") {
    classes = "bg-red-500/15 text-red-400 border-red-500/30";
    Icon = AlertTriangle;
  } else {
    classes = "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${classes}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {Icon && <Icon size={12} />}
      {status}
    </span>
  );
}

/* 3. CategoryPill */
function CategoryPill({ category }) {
  return (
    <span className="bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-full capitalize">
      {category}
    </span>
  );
}

/* 4. JobIcon */
function JobIcon({ company }) {
  return (
    <div
      className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-white text-xs font-bold">{getInitials(company)}</span>
    </div>
  );
}

/* 5. StatusTabGroup — replaces ToggleGroup with more tabs */
function StatusTabGroup({ activeTab, onTabChange }) {
  return (
    <div
      className="inline-flex items-center bg-[#1B1B1F] rounded-[10px] p-1 gap-0.5"
      role="tablist"
      aria-label="Job status filter"
    >
      {STATUS_TABS.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls="jobs-panel"
          onClick={() => onTabChange(tab)}
          className={`px-3.5 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-[#3A3A40] text-white"
              : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* 6. FilterDropdown */
function FilterDropdown({ label, value, onChange, options, ariaLabel }) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="appearance-none bg-[#0E0E11] border border-white/[0.08] rounded-[10px] text-[#A1A1AA] text-sm pl-3 pr-8 py-2.5 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] cursor-pointer transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0E0E11] text-white">
            {opt}
          </option>
        ))}
      </select>
      <ChevronRight
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-[#71717A] pointer-events-none"
      />
    </div>
  );
}

/* 7. SearchInput */
function SearchInput({ value, onChange, ariaLabel }) {
  return (
    <div className="relative">
      <label htmlFor="job-search" className="sr-only">
        {ariaLabel}
      </label>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="job-search"
        type="search"
        placeholder="Search jobs by title or company..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-full text-white text-sm pl-10 pr-4 py-2.5 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] placeholder-[#71717A] transition-colors"
      />
    </div>
  );
}

/* 8. StatusActionDropdown — admin status management */
function StatusActionDropdown({ currentStatus, onChangeStatus, disabled }) {
  const [open, setOpen] = useState(false);
  const statusOptions = ["active", "closed", "draft", "paused", "flagged"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-label="Change job status"
        className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-white hover:bg-[#3A3A40] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full mt-1 z-50 bg-[#1B1B1F] border border-white/[0.08] rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.5)] py-1 min-w-[140px]"
            role="menu"
            aria-label="Status options"
          >
            <p className="text-[#71717A] text-[10px] uppercase tracking-wider font-semibold px-3 pt-2 pb-1">
              Set Status
            </p>
            {statusOptions.map((s) => (
              <button
                key={s}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  if (s !== currentStatus) onChangeStatus(s);
                }}
                className={`w-full text-left px-3 py-2 text-sm capitalize transition-colors flex items-center gap-2 ${
                  s === currentStatus
                    ? "text-[#3B82F6] bg-[#3B82F6]/10"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {s === "active" && <CheckCircle2 size={14} />}
                {s === "closed" && <XCircle size={14} />}
                {s === "draft" && <FileEdit size={14} />}
                {s === "paused" && <Clock size={14} />}
                {s === "flagged" && <AlertTriangle size={14} />}
                {s}
                {s === currentStatus && (
                  <span className="ml-auto text-[10px] opacity-60">current</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* 9. JobRow — Desktop table row */
function JobRow({ job, onView, onStatusChange }) {
  return (
    <tr className="border-b border-white/[0.04] hover:bg-[#222228] transition-colors group">
      {/* Title (initials + title + ID) */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <JobIcon company={job.company} />
          <div>
            <span className="text-white text-sm font-medium block leading-tight">
              {job.title}
            </span>
            <span className="text-[#71717A] text-xs">{job.id}</span>
          </div>
        </div>
      </td>
      {/* Company */}
      <td className="py-3.5 px-5 text-sm text-[#A1A1AA]">{job.company}</td>
      {/* Category */}
      <td className="py-3.5 px-5">
        <CategoryPill category={job.category} />
      </td>
      {/* Type */}
      <td className="py-3.5 px-5 text-sm text-[#A1A1AA] capitalize">{job.type}</td>
      {/* Date Posted */}
      <td className="py-3.5 px-5 text-sm text-[#A1A1AA]">{formatDate(job.datePosted)}</td>
      {/* Status */}
      <td className="py-3.5 px-5">
        <StatusBadge status={job.status} />
      </td>
      {/* Actions */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(job)}
            aria-label={`View ${job.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-white hover:bg-[#3A3A40] transition-colors"
          >
            <Eye size={16} />
          </button>
          <StatusActionDropdown
            currentStatus={job.status}
            onChangeStatus={(newStatus) => onStatusChange(job.id, newStatus)}
          />
        </div>
      </td>
    </tr>
  );
}

/* 10. JobCard — Mobile card fallback */
function JobCard({ job, onView, onStatusChange }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-4 flex flex-col gap-3">
      {/* Top: icon + title + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <JobIcon company={job.company} />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{job.title}</p>
            <p className="text-[#71717A] text-xs mt-0.5">
              {job.company} &middot; {job.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onView(job)}
            aria-label={`View ${job.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-white hover:bg-[#3A3A40] transition-colors"
          >
            <Eye size={16} />
          </button>
          <StatusActionDropdown
            currentStatus={job.status}
            onChangeStatus={(newStatus) => onStatusChange(job.id, newStatus)}
          />
        </div>
      </div>
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryPill category={job.category} />
        <span className="text-[#71717A] text-xs capitalize">{job.type}</span>
        <span className="text-[#71717A] text-xs">&middot;</span>
        <span className="text-[#71717A] text-xs">{formatDate(job.datePosted)}</span>
      </div>
      {/* Bottom: status */}
      <div className="flex items-center justify-between">
        <StatusBadge status={job.status} />
        <span className="text-[#71717A] text-xs">{job.applications} applicants</span>
      </div>
    </div>
  );
}

/* 11. Pagination */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="flex items-center justify-between px-5 py-4 border-t border-white/[0.04]"
      aria-label="Pagination"
    >
      <p className="text-xs text-[#71717A]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-white text-black"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

/* 12. EmptyState */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
      <div className="w-14 h-14 rounded-[14px] bg-[#3A3A40] flex items-center justify-center mb-4">
        <Briefcase size={24} className="text-[#71717A]" />
      </div>
      <p className="text-white text-sm font-medium">No jobs found</p>
      <p className="text-[#71717A] text-xs mt-1 max-w-xs">
        Try adjusting your search or filter criteria to find what you&apos;re looking for.
      </p>
    </div>
  );
}

/* 13. LoadingSpinner */
function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      role="status"
      aria-label="Loading jobs"
    >
      <div className="w-10 h-10 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[#A1A1AA] text-sm">Loading jobs&hellip;</p>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

function AdminJobsPage() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = useSession();

  /* ── State ── */
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState(["All Categories"]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0 });

  // Loading state
  const [jobsLoading, setJobsLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(null); // job id being changed

  /* ── Determine effective status for API ── */
  const getEffectiveStatus = useCallback(() => {
    // Tab takes priority over dropdown
    if (activeTab !== "All") return activeTab.toLowerCase();
    // Dropdown "All Statuses" → no filter
    if (statusFilter === "All Statuses") return undefined;
    return statusFilter.toLowerCase();
  }, [activeTab, statusFilter]);

  /* ── Fetch jobs ── */
  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      params.set("page", String(currentPage));
      params.set("perPage", String(ITEMS_PER_PAGE));

      const effectiveStatus = getEffectiveStatus();
      if (effectiveStatus) {
        params.set("status", effectiveStatus);
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      if (categoryFilter !== "All Categories") {
        params.set("jobCategory", categoryFilter);
      }

      const data = await protectedClientFetch(`/api/jobs?${params.toString()}`);
      if (data) {
        const mappedJobs = (data.jobs || []).map(mapJobFromApi);
        setJobs(mappedJobs);
        setTotal(data.total ?? mappedJobs.length);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  }, [currentPage, getEffectiveStatus, searchQuery, categoryFilter]);

  /* ── Fetch categories ── */
  const fetchCategories = useCallback(async () => {
    try {
      const data = await clientFetch("/api/categories");
      if (Array.isArray(data) && data.length > 0) {
        // Support both {name: "..."} and plain string
        const catNames = data.map((c) => (typeof c === "string" ? c : c.name || c));
        setCategories(["All Categories", ...catNames]);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  /* ── Fetch admin stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const data = await protectedClientFetch("/admin/stats");
      if (data) {
        setStats({
          totalJobs: data.totalJobs ?? total,
          activeJobs: data.activeJobs ?? 0,
          totalApplications: data.totalApplications ?? 0,
        });
      }
    } catch (err) {
      // Stats endpoint might not exist — compute from what we have
      console.warn("Admin stats endpoint unavailable, using defaults");
    }
  }, [total]);

  /* ── Effects ── */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (total > 0) {
      fetchStats();
    }
  }, [total, fetchStats]);

  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, categoryFilter]);

  /* ── Handlers ── */
  const handleView = useCallback(
    (job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router]
  );

  const handleStatusChange = useCallback(
    async (jobId, newStatus) => {
      setStatusChanging(jobId);
      try {
        await clientMutation(`/api/jobs/${jobId}/admin-status`, { status: newStatus }, "PATCH");
        await fetchJobs();
      } catch (err) {
        console.error("Failed to change status:", err);
      } finally {
        setStatusChanging(null);
      }
    },
    [fetchJobs]
  );

  /* ── Computed ── */
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  /* ── Auth loading ── */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Render ── */
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ──── 1. Header ──── */}
      <header>
        <h1 className="text-[42px] font-bold tracking-tight text-white leading-none">
          Manage Jobs
        </h1>
        <p className="text-[#A1A1AA] text-sm mt-2 max-w-xl">
          Oversee all job listings, track applications, and manage postings across the platform.
        </p>
      </header>

      {/* ──── 2. Filters Row ──── */}
      <section aria-label="Job filters" className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        {/* Search */}
        <div className="flex-1 w-full lg:max-w-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            ariaLabel="Search jobs by title or company"
          />
        </div>

        {/* Status dropdown */}
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={STATUS_DROPDOWN_OPTIONS}
          ariaLabel="Filter by status"
        />

        {/* Category dropdown */}
        <FilterDropdown
          label="Category"
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          options={categories}
          ariaLabel="Filter by category"
        />

        {/* Tab group */}
        <StatusTabGroup
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </section>

      {/* ──── 3. Jobs Table / Cards ──── */}
      <section
        id="jobs-panel"
        role="tabpanel"
        aria-label="Jobs list"
        className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden"
      >
        {jobsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Date Posted
                    </th>
                    <th
                      scope="col"
                      className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-right text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        onView={handleView}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-3 flex flex-col gap-3">
              {jobs.length === 0 ? (
                <EmptyState />
              ) : (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={handleView}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* ──── 4. Bottom KPI Cards ──── */}
      <section aria-label="Job performance metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiStatCard
          icon={BarChart3}
          label="Total Jobs"
          value={stats.totalJobs || total}
          change={activeTab === "All" ? "All" : `${activeTab}`}
          changeType="neutral"
        />
        <KpiStatCard
          icon={TrendingUp}
          label="Active Jobs"
          value={stats.activeJobs || "—"}
          change="Live"
          changeType="up"
        />
        <KpiStatCard
          icon={Users}
          label="Total Applications"
          value={stats.totalApplications || "—"}
          change="Platform-wide"
          changeType="neutral"
        />
      </section>
    </main>
  );
}

export default AdminJobsPage;