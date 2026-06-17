"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  Bookmark,
  Clock,
  MapPin,
  DollarSign,
  Building2,
  Upload,
  ChevronDown,
  Search,
  Briefcase,
  Users,
  Sparkles,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */

const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "TechFlow",
    companyInitial: "TF",
    location: "San Francisco",
    type: "Hybrid",
    salary: "$140k – $180k",
    equity: "0.1 – 0.3%",
    savedAt: "2 hours ago",
    closingStatus: null,
    status: "active",
    category: "design",
    draft: false,
  },
  {
    id: 2,
    title: "Lead Frontend Engineer",
    company: "FinGrid",
    companyInitial: "FG",
    location: "New York",
    type: "Remote",
    salary: "$160k – $200k",
    equity: "0.05 – 0.15%",
    savedAt: "5 hours ago",
    closingStatus: "Closing in 2 days",
    closingUrgent: true,
    status: "active",
    category: "engineering",
    draft: false,
  },
  {
    id: 3,
    title: "Product Manager",
    company: "CloudApps",
    companyInitial: "CA",
    location: "Austin",
    type: "On-site",
    salary: "$130k – $165k",
    equity: "0.08 – 0.2%",
    savedAt: "1 day ago",
    closingStatus: null,
    status: "active",
    category: "product",
    draft: false,
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "DesignLab",
    companyInitial: "DL",
    location: "Seattle",
    type: "Hybrid",
    salary: "$110k – $140k",
    equity: null,
    savedAt: "2 days ago",
    closingStatus: "Closing in 5 days",
    closingUrgent: false,
    status: "active",
    category: "design",
    draft: true,
  },
  {
    id: 5,
    title: "Senior Backend Engineer",
    company: "DataSync",
    companyInitial: "DS",
    location: "Remote",
    type: "Remote",
    salary: "$150k – $190k",
    equity: "0.1 – 0.25%",
    savedAt: "3 days ago",
    closingStatus: null,
    status: "closed",
    category: "engineering",
    draft: false,
  },
  {
    id: 6,
    title: "Growth Product Manager",
    company: "ScaleUp",
    companyInitial: "SU",
    location: "Chicago",
    type: "On-site",
    salary: "$125k – $155k",
    equity: "0.05 – 0.15%",
    savedAt: "4 days ago",
    closingStatus: "Closed",
    closingClosed: true,
    status: "closed",
    category: "product",
    draft: false,
  },
];

const FILTER_TABS = ["All Saved", "Design", "Engineering", "Product"];

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Statistics Card ─── */
function StatisticsCard({ title, value, Icon, color }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-20 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#A1A1AA]">{title}</span>
        <Icon size={16} aria-hidden="true" style={{ color }} />
      </div>
      <span className="text-[34px] font-bold text-white leading-none tracking-tight">{value}</span>
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
  const options = ["Recently Saved", "Closing Soon", "Salary: High to Low", "Alphabetical"];

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
function BookmarkButton({ saved }) {
  const [isSaved, setIsSaved] = useState(saved);
  return (
    <button
      onClick={() => setIsSaved(!isSaved)}
      aria-label={isSaved ? "Remove from saved" : "Save job"}
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
        isSaved
          ? "bg-[#3A3A40] text-[#3B82F6] hover:bg-[#4A4A52]"
          : "bg-[#1B1B1F] text-[#71717A] hover:bg-[#3A3A40]"
      }`}
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
function CompanyLogo({ initial, name }) {
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
function PrimaryActionButton({ status, draft, onRemove }) {
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
        href="#"
        className="h-10 px-5 rounded-[10px] bg-white text-black text-[14px] font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors duration-200 hover:scale-[1.02]"
      >
        Apply Now
      </Link>
    </div>
  );
}

/* ─── Job Card ─── */
function JobCard({ job }) {
  const isClosed = job.status === "closed";

  return (
    <div
      className={`bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-[#232327] transition-all duration-200 ${
        isClosed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <CompanyLogo initial={job.companyInitial} name={job.company} />

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-[20px] font-semibold text-white leading-tight truncate ${
              isClosed ? "line-through opacity-60" : ""
            }`}
          >
            {job.title}
          </h3>

          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-[#3A3A40] text-[11px] font-semibold text-white uppercase tracking-wide">
              {job.company}
            </span>
            <MetadataChip icon={MapPin} text={job.location} />
            <MetadataChip icon={Briefcase} text={job.type} />
            <MetadataChip icon={DollarSign} text={job.salary} />
            {job.equity && <MetadataChip icon={Sparkles} text={job.equity} />}
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
        <BookmarkButton saved={!isClosed} />

        {/* Action */}
        <PrimaryActionButton status={job.status} draft={job.draft} />
      </div>
    </div>
  );
}

/* ─── Load More Control ─── */
function LoadMoreControl() {
  return (
    <div className="flex justify-center pt-4 pb-8">
      <button
        aria-label="Load more saved jobs"
        className="flex items-center gap-2 text-[14px] text-[#71717A] hover:text-white transition-colors duration-200 cursor-pointer"
      >
        Load More
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─── Upload Resume Button ─── */
function UploadResumeButton() {
  return (
    <button
      aria-label="Upload Resume"
      className="h-10 px-5 rounded-[10px] bg-[#1B1B1F] border border-white/[0.06] text-white text-[14px] font-medium flex items-center gap-2 hover:bg-[#232327] transition-colors duration-200 cursor-pointer"
    >
      <Upload size={15} aria-hidden="true" />
      Upload Resume
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   SAVED JOBS PAGE
   ═══════════════════════════════════════════════════ */
export default function SavedJobsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [activeFilter, setActiveFilter] = useState("All Saved");
  const [sortBy, setSortBy] = useState("Recently Saved");

  useEffect(() => {
    // Announce filter changes for screen readers
  }, [activeFilter]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading saved jobs">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const filteredJobs =
    activeFilter === "All Saved"
      ? MOCK_JOBS
      : MOCK_JOBS.filter(
          (j) => j.category === activeFilter.toLowerCase()
        );

  return (
    <div className="space-y-6">
      {/* ── Page Header: Title Left, Stats + Upload Right ── */}
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
          {/* Stats Cards */}
          <div className="flex gap-4">
            <StatisticsCard title="Total Saved" value={12} Icon={Bookmark} color="#3B82F6" />
            <StatisticsCard title="Closing Soon" value={3} Icon={Clock} color="#F59E0B" />
          </div>

          {/* Upload Resume */}
          <div className="hidden lg:block">
            <UploadResumeButton />
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] h-[60px] flex items-center justify-between px-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter jobs by category">
          {FILTER_TABS.map((tab) => (
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

      {/* ── Mobile Upload Resume ── */}
      <div className="lg:hidden">
        <UploadResumeButton />
      </div>

      {/* ── Saved Jobs List ── */}
      <section aria-label="Saved jobs list">
        {filteredJobs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.08] rounded-[14px]">
            <Bookmark size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
            <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">No saved jobs in this category</p>
            <p className="text-[#71717A] text-[14px]">Try selecting a different filter tab.</p>
          </div>
        )}
      </section>

      {/* ── Load More ── */}
      {filteredJobs.length > 0 && <LoadMoreControl />}
    </div>
  );
}