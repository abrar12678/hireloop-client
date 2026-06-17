"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  FileEdit,
  BarChart3,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

/* ──────────────────────── MOCK DATA ──────────────────────── */

const MOCK_JOBS = [
  {
    id: "JOB-001",
    title: "Senior Frontend Developer",
    company: "TechFlow",
    category: "Technology",
    type: "Full-time",
    status: "Active",
    datePosted: "2025-01-15",
    applications: 142,
  },
  {
    id: "JOB-002",
    title: "Product Designer",
    company: "FinGrid",
    category: "Design",
    type: "Full-time",
    status: "Active",
    datePosted: "2025-01-12",
    applications: 98,
  },
  {
    id: "JOB-003",
    title: "Backend Engineer",
    company: "CloudApps",
    category: "Technology",
    type: "Contract",
    status: "Active",
    datePosted: "2025-01-10",
    applications: 76,
  },
  {
    id: "JOB-004",
    title: "DevOps Engineer",
    company: "DataSync",
    category: "Technology",
    type: "Full-time",
    status: "Closed",
    datePosted: "2024-12-20",
    applications: 204,
  },
  {
    id: "JOB-005",
    title: "Marketing Manager",
    company: "NeuralPath",
    category: "Marketing",
    type: "Full-time",
    status: "Active",
    datePosted: "2025-01-18",
    applications: 63,
  },
  {
    id: "JOB-006",
    title: "Data Scientist",
    company: "DesignLab",
    category: "Technology",
    type: "Full-time",
    status: "Active",
    datePosted: "2025-01-08",
    applications: 117,
  },
  {
    id: "JOB-007",
    title: "Sales Representative",
    company: "ScaleUp",
    category: "Sales",
    type: "Full-time",
    status: "Closed",
    datePosted: "2024-12-05",
    applications: 189,
  },
  {
    id: "JOB-008",
    title: "HR Coordinator",
    company: "Quantum Labs",
    category: "HR",
    type: "Part-time",
    status: "Active",
    datePosted: "2025-01-20",
    applications: 41,
  },
  {
    id: "JOB-009",
    title: "Full Stack Developer",
    company: "TechFlow",
    category: "Technology",
    type: "Full-time",
    status: "Draft",
    datePosted: "2025-01-22",
    applications: 0,
  },
  {
    id: "JOB-010",
    title: "UI/UX Designer",
    company: "FinGrid",
    category: "Design",
    type: "Contract",
    status: "Active",
    datePosted: "2025-01-14",
    applications: 85,
  },
];

const CATEGORIES = ["All Categories", "Technology", "Design", "Marketing", "Sales", "HR"];
const ITEMS_PER_PAGE = 6;

/* ──────────────────── HELPER: get initials ───────────────── */

function getInitials(company) {
  return company
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
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
  const s = status.toLowerCase();
  let classes = "";
  if (s === "active") {
    classes = "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30";
  } else if (s === "closed") {
    classes = "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]";
  } else {
    classes = "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${classes}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {s === "active" && <CheckCircle2 size={12} />}
      {s === "closed" && <XCircle size={12} />}
      {s === "draft" && <FileEdit size={12} />}
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

/* 5. ToggleGroup */
function ToggleGroup({ activeTab, onTabChange, activeCount, closedCount }) {
  return (
    <div
      className="inline-flex items-center bg-[#1B1B1F] rounded-[10px] p-1 gap-0.5"
      role="tablist"
      aria-label="Job status filter"
    >
      <button
        role="tab"
        aria-selected={activeTab === "Active"}
        aria-controls="jobs-panel"
        onClick={() => onTabChange("Active")}
        className={`px-3.5 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
          activeTab === "Active"
            ? "bg-[#3A3A40] text-white"
            : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        Active
        <span className="ml-1.5 text-xs opacity-70">({activeCount})</span>
      </button>
      <button
        role="tab"
        aria-selected={activeTab === "Closed"}
        aria-controls="jobs-panel"
        onClick={() => onTabChange("Closed")}
        className={`px-3.5 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
          activeTab === "Closed"
            ? "bg-[#3A3A40] text-white"
            : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        Closed
        <span className="ml-1.5 text-xs opacity-70">({closedCount})</span>
      </button>
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

/* 8. JobRow — Desktop table row */
function JobRow({ job, onView, onDelete }) {
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
          <button
            onClick={() => onDelete(job)}
            aria-label={`Delete ${job.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* 9. JobCard — Mobile card fallback */
function JobCard({ job, onView, onDelete }) {
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
          <button
            onClick={() => onDelete(job)}
            aria-label={`Delete ${job.title}`}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
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

/* 10. Pagination */
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

/* 11. DeleteModal */
function DeleteModal({ job, onConfirm, onCancel }) {
  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Card */}
      <div className="relative bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-6 max-w-md w-full mx-4">
        {/* Close icon */}
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-[8px] text-[#71717A] hover:text-white hover:bg-[#3A3A40] transition-colors"
        >
          <X size={16} />
        </button>
        {/* Icon */}
        <div className="w-12 h-12 rounded-[12px] bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <h3 id="delete-modal-title" className="text-white text-lg font-semibold">
          Delete Job
        </h3>
        <p id="delete-modal-desc" className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{job.title}</span> at{" "}
          <span className="text-white font-medium">{job.company}</span>? This action cannot be
          undone and all associated data will be permanently removed.
        </p>
        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            aria-label="Cancel deletion"
            className="px-4 py-2 rounded-[10px] text-sm font-medium text-[#A1A1AA] bg-[#3A3A40] hover:bg-[#4A4A52] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(job)}
            aria-label={`Confirm delete ${job.title}`}
            className="px-4 py-2 rounded-[10px] text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
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

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

function AdminJobsPage() {
  /* ── Auth loading ── */
  const { data: session, isPending: authLoading } = useSession();

  /* ── State ── */
  const [activeTab, setActiveTab] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, job: null });

  /* ── Counts ── */
  const activeCount = MOCK_JOBS.filter((j) => j.status === "Active").length;
  const closedCount = MOCK_JOBS.filter((j) => j.status === "Closed").length;

  /* ── Filtered & paginated jobs ── */
  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      /* Tab filter */
      if (activeTab === "Active" && job.status === "Closed") return false;
      if (activeTab === "Closed" && job.status !== "Closed") return false;

      /* Status dropdown */
      if (statusFilter !== "All Statuses" && job.status !== statusFilter) return false;

      /* Category dropdown */
      if (categoryFilter !== "All Categories" && job.category !== categoryFilter) return false;

      /* Search */
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !job.title.toLowerCase().includes(q) &&
          !job.company.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  /* Reset page on filter change */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, categoryFilter]);

  /* ── Handlers ── */
  const handleView = (job) => {
    // Navigate to job detail — placeholder
  };

  const handleDeleteClick = (job) => {
    setDeleteModal({ open: true, job });
  };

  const handleDeleteConfirm = (job) => {
    // Delete logic placeholder
    setDeleteModal({ open: false, job: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, job: null });
  };

  /* ── Loading state ── */
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
          options={["All Statuses", "Active", "Closed", "Draft"]}
          ariaLabel="Filter by status"
        />

        {/* Category dropdown */}
        <FilterDropdown
          label="Category"
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          options={CATEGORIES}
          ariaLabel="Filter by category"
        />

        {/* Toggle group */}
        <ToggleGroup
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          activeCount={activeCount}
          closedCount={closedCount}
        />
      </section>

      {/* ──── 3. Jobs Table / Cards ──── */}
      <section
        id="jobs-panel"
        role="tabpanel"
        aria-label="Jobs list"
        className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden"
      >
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
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onView={handleView}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-3 flex flex-col gap-3">
          {paginatedJobs.length === 0 ? (
            <EmptyState />
          ) : (
            paginatedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onView={handleView}
                onDelete={handleDeleteClick}
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
      </section>

      {/* ──── 4. Bottom KPI Cards ──── */}
      <section aria-label="Job performance metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiStatCard
          icon={TrendingUp}
          label="Engagement Rate"
          value="82.4%"
          change="+5.2%"
          changeType="up"
        />
        <KpiStatCard
          icon={Clock}
          label="Avg Time to Fill"
          value="14 Days"
          change="Stable"
          changeType="neutral"
        />
        <KpiStatCard
          icon={Users}
          label="Total Applications"
          value="8,219"
          change="-2.1%"
          changeType="down"
        />
      </section>

      {/* ──── 5. Delete Modal ──── */}
      {deleteModal.open && (
        <DeleteModal
          job={deleteModal.job}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </main>
  );
}

export default AdminJobsPage;