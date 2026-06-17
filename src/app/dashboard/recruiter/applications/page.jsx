"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Star,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Briefcase,
  Search,
  Filter,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */

const MOCK_APPLICANTS = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@email.com", role: "Senior Frontend Developer", applied: "Jan 15, 2025", experience: "5 years", status: "screening", rating: 4, avatar: null },
  { id: "2", name: "Marcus Chen", email: "marcus.c@email.com", role: "Product Designer", applied: "Jan 14, 2025", experience: "3 years", status: "interview", rating: 5, avatar: null },
  { id: "3", name: "Emily Davis", email: "emily.d@email.com", role: "Backend Engineer", applied: "Jan 13, 2025", experience: "7 years", status: "offered", rating: 4, avatar: null },
  { id: "4", name: "James Wilson", email: "james.w@email.com", role: "DevOps Engineer", applied: "Jan 12, 2025", experience: "4 years", status: "new", rating: 0, avatar: null },
  { id: "5", name: "Aria Patel", email: "aria.p@email.com", role: "Data Scientist", applied: "Jan 11, 2025", experience: "6 years", status: "rejected", rating: 2, avatar: null },
  { id: "6", name: "Tom Anderson", email: "tom.a@email.com", role: "Full Stack Developer", applied: "Jan 10, 2025", experience: "2 years", status: "new", rating: 0, avatar: null },
  { id: "7", name: "Lisa Zhang", email: "lisa.z@email.com", role: "Senior Frontend Developer", applied: "Jan 9, 2025", experience: "8 years", status: "interview", rating: 5, avatar: null },
  { id: "8", name: "David Kim", email: "david.k@email.com", role: "Backend Engineer", applied: "Jan 8, 2025", experience: "5 years", status: "screening", rating: 3, avatar: null },
  { id: "9", name: "Nina Foster", email: "nina.f@email.com", role: "Product Designer", applied: "Jan 7, 2025", experience: "4 years", status: "hired", rating: 5, avatar: null },
  { id: "10", name: "Ryan Brooks", email: "ryan.b@email.com", role: "DevOps Engineer", applied: "Jan 6, 2025", experience: "3 years", status: "rejected", rating: 1, avatar: null },
];

const JOB_OPTIONS = [
  "All Jobs",
  "Senior Frontend Developer",
  "Product Designer",
  "Backend Engineer",
  "DevOps Engineer",
  "Data Scientist",
];

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  new:        { label: "New",        bg: "bg-white/[0.06]",    text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  screening:  { label: "Screening",  bg: "bg-[#F59E0B]/15",   text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  interview:  { label: "Interview",  bg: "bg-[#3B82F6]/15",   text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  offered:    { label: "Offered",    bg: "bg-[#22C55E]/15",   text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  hired:      { label: "Hired",      bg: "bg-[#A855F7]/15",   text: "text-[#A855F7]", border: "border-[#A855F7]/30" },
  rejected:   { label: "Rejected",   bg: "bg-[#EF4444]/15",   text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
};

const FILTER_TABS = ["All", "New", "Screening", "Interview", "Offered", "Hired", "Rejected"];

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── KPI Stat Card ─── */
function KpiStatCard({ label, value, Icon, color, index }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[90px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center">
          <Icon size={18} aria-hidden="true" className="text-[#A1A1AA]" />
        </div>
        <span className="text-[12px] text-[#71717A] uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <span className="text-[36px] font-bold text-white leading-none tracking-tight">
        {value}
      </span>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const key = (status || "new").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.new;
  return (
    <span
      className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Candidate Avatar ─── */
function CandidateAvatar({ name, rating }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="relative shrink-0">
      <div
        className="w-9 h-9 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-[11px] font-semibold"
        aria-hidden="true"
      >
        {initials}
      </div>
      {rating > 0 && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F59E0B] flex items-center justify-center">
          <Star size={9} aria-hidden="true" className="text-black" fill="black" />
        </div>
      )}
    </div>
  );
}

/* ─── Filter Tab Bar ─── */
function FilterTabBar({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter applicants by status">
      {FILTER_TABS.map((tab) => {
        const key = tab.toLowerCase();
        const count = tab === "All" ? counts.total : (counts[key] || 0);
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
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${
              active === tab ? "bg-white/[0.1] text-white" : "bg-white/[0.04] text-[#71717A]"
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Job Filter Dropdown ─── */
function JobFilterDropdown({ value, onChange, jobs }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by job"
        className="appearance-none h-10 bg-[#1B1B1F] border border-white/[0.05] rounded-[10px] pl-3 pr-8 text-[14px] text-white outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 cursor-pointer font-[family-name:var(--font-inter)]"
      >
        {jobs.map((job) => (
          <option key={job} value={job} className="bg-[#1B1B1F] text-white">
            {job}
          </option>
        ))}
      </select>
      <Filter size={14} aria-hidden="true" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
    </div>
  );
}

/* ─── Search Input ─── */
function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-[260px]">
      <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search applicants..."
        aria-label="Search applicants"
        className="w-full h-10 bg-[#1B1B1F] border border-white/[0.05] rounded-full pl-9 pr-4 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/* ─── Export Button ─── */
function ExportButton() {
  return (
    <button
      aria-label="Export applicants as CSV"
      className="flex items-center gap-2 bg-white text-black h-[38px] px-4 rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-colors duration-200 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
    >
      <FileDown size={15} aria-hidden="true" />
      Export
    </button>
  );
}

/* ─── Action Icon Button ─── */
function ActionButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 cursor-pointer ${
        danger
          ? "text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
          : "text-[#71717A] hover:text-white hover:bg-white/[0.06]"
      } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]`}
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}

/* ─── Applicant Table Row (Desktop) ─── */
function ApplicantRow({ applicant, onView, onMessage, onReject }) {
  return (
    <tr className="h-[72px] border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150">
      <td className="px-6" role="cell">
        <div className="flex items-center gap-3">
          <CandidateAvatar name={applicant.name} rating={applicant.rating} />
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">{applicant.name}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">{applicant.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 hidden lg:table-cell" role="cell">
        <div className="flex items-center gap-2 text-[14px] text-[#A1A1AA]">
          <Briefcase size={14} aria-hidden="true" className="text-[#71717A] shrink-0" />
          <span className="truncate">{applicant.role}</span>
        </div>
      </td>
      <td className="px-6 hidden xl:table-cell" role="cell">
        <span className="text-[13px] text-[#A1A1AA]">{applicant.experience}</span>
      </td>
      <td className="px-6 hidden sm:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
          <Calendar size={13} aria-hidden="true" />
          {applicant.applied}
        </div>
      </td>
      <td className="px-6" role="cell">
        <StatusBadge status={applicant.status} />
      </td>
      <td className="px-6 text-right" role="cell">
        <div className="flex items-center justify-end gap-1">
          <ActionButton icon={Eye} label={`View ${applicant.name}`} onClick={() => onView(applicant)} />
          <ActionButton icon={MessageSquare} label={`Message ${applicant.name}`} onClick={() => onMessage(applicant)} />
          <ActionButton icon={XCircle} label={`Reject ${applicant.name}`} onClick={() => onReject(applicant)} danger />
        </div>
      </td>
    </tr>
  );
}

/* ─── Applicant Mobile Card ─── */
function ApplicantCard({ applicant, onView, onMessage, onReject }) {
  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CandidateAvatar name={applicant.name} rating={applicant.rating} />
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">{applicant.name}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5 truncate">{applicant.email}</p>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
        <span className="flex items-center gap-1"><Briefcase size={12} aria-hidden="true" />{applicant.role}</span>
        <span>&middot;</span>
        <span>{applicant.experience}</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-[12px] text-[#71717A]">
          <Calendar size={12} aria-hidden="true" />
          {applicant.applied}
        </span>
        <div className="flex items-center gap-1">
          <ActionButton icon={Eye} label={`View ${applicant.name}`} onClick={() => onView(applicant)} />
          <ActionButton icon={MessageSquare} label={`Message ${applicant.name}`} onClick={() => onMessage(applicant)} />
          <ActionButton icon={XCircle} label={`Reject ${applicant.name}`} onClick={() => onReject(applicant)} danger />
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ activeFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Users size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
      <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
        {activeFilter === "All" ? "No applicants found" : `No ${activeFilter.toLowerCase()} applicants`}
      </p>
      <p className="text-[#71717A] text-[14px]">
        {activeFilter === "All"
          ? "Applicants will appear here once they apply to your job postings."
          : `${activeFilter} applicants will appear here.`}
      </p>
    </div>
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

/* ═══════════════════════════════════════════════════
   APPLICATIONS PAGE
   ═══════════════════════════════════════════════════ */
export default function RecruiterApplicationsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [activeFilter, setActiveFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Derive KPIs ── */
  const total = MOCK_APPLICANTS.length;
  const newCount = MOCK_APPLICANTS.filter((a) => a.status === "new").length;
  const interviewCount = MOCK_APPLICANTS.filter((a) => a.status === "interview").length;
  const hiredCount = MOCK_APPLICANTS.filter((a) => a.status === "hired").length;

  const KPI_DATA = [
    { label: "Total Applicants", value: total.toString(), Icon: Users, color: "#ffffff" },
    { label: "New", value: newCount.toString(), Icon: Clock, color: "#A1A1AA" },
    { label: "In Interview", value: interviewCount.toString(), Icon: UserCheck, color: "#3B82F6" },
    { label: "Hired", value: hiredCount.toString(), Icon: CheckCircle2, color: "#22C55E" },
  ];

  /* ── Filter counts ── */
  const counts = {
    total,
    new: newCount,
    screening: MOCK_APPLICANTS.filter((a) => a.status === "screening").length,
    interview: interviewCount,
    offered: MOCK_APPLICANTS.filter((a) => a.status === "offered").length,
    hired: hiredCount,
    rejected: MOCK_APPLICANTS.filter((a) => a.status === "rejected").length,
  };

  /* ── Filter + Search ── */
  const filtered = MOCK_APPLICANTS.filter((app) => {
    const matchesStatus = activeFilter === "All" || app.status === activeFilter.toLowerCase();
    const matchesJob = jobFilter === "All Jobs" || app.role === jobFilter;
    const matchesSearch = !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesJob && matchesSearch;
  });

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  /* ── Action handlers ── */
  const handleView = (app) => {};
  const handleMessage = (app) => {};
  const handleReject = (app) => {};

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
            Review and manage candidates who applied to your job postings.
          </p>
        </div>
        <ExportButton />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiStatCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.05]">
          <FilterTabBar
            active={activeFilter}
            onChange={(tab) => { setActiveFilter(tab); setCurrentPage(1); }}
            counts={counts}
          />
          <div className="flex items-center gap-3 shrink-0">
            <JobFilterDropdown
              value={jobFilter}
              onChange={(j) => { setJobFilter(j); setCurrentPage(1); }}
              jobs={JOB_OPTIONS}
            />
            <SearchInput
              value={searchQuery}
              onChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" role="table" aria-label="Applicant list">
            <thead>
              <tr className="h-12 border-b border-white/[0.05]">
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Candidate</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Applied For</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden xl:table-cell">Experience</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">Applied</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Status</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((app) => (
                <ApplicantRow
                  key={app.id}
                  applicant={app}
                  onView={handleView}
                  onMessage={handleMessage}
                  onReject={handleReject}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/[0.05]">
          {paginated.map((app) => (
            <ApplicantCard
              key={app.id}
              applicant={app}
              onView={handleView}
              onMessage={handleMessage}
              onReject={handleReject}
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
    </div>
  );
}