"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Eye,
  Clock,
  Archive,
  Plus,
  Search,
  FileEdit,
  Pause,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */

const MOCK_JOBS = [
  { id: "1", title: "Senior Frontend Developer", type: "Full-time", category: "Technology", location: "Remote", salary: "$120K – $160K", applicants: 42, status: "active", posted: "Jan 10, 2025", deadline: "Feb 28, 2025" },
  { id: "2", title: "Product Designer", type: "Full-time", category: "Design", location: "San Francisco, CA", salary: "$100K – $140K", applicants: 28, status: "active", posted: "Jan 8, 2025", deadline: "Mar 15, 2025" },
  { id: "3", title: "Backend Engineer", type: "Contract", category: "Technology", location: "New York, NY", salary: "$90K – $130K", applicants: 35, status: "paused", posted: "Jan 5, 2025", deadline: "Feb 20, 2025" },
  { id: "4", title: "DevOps Engineer", type: "Full-time", category: "Technology", location: "Austin, TX", salary: "$110K – $150K", applicants: 19, status: "active", posted: "Jan 3, 2025", deadline: "Mar 1, 2025" },
  { id: "5", title: "Marketing Manager", type: "Full-time", category: "Marketing", location: "Chicago, IL", salary: "$85K – $120K", applicants: 54, status: "closed", posted: "Dec 20, 2024", deadline: "Jan 15, 2025" },
  { id: "6", title: "Data Scientist", type: "Full-time", category: "Technology", location: "Remote", salary: "$130K – $170K", applicants: 22, status: "active", posted: "Jan 12, 2025", deadline: "Mar 10, 2025" },
  { id: "7", title: "Sales Representative", type: "Full-time", category: "Sales", location: "Dallas, TX", salary: "$60K – $90K", applicants: 67, status: "draft", posted: "—", deadline: "—", },
  { id: "8", title: "HR Coordinator", type: "Part-time", category: "Human Resources", location: "Miami, FL", salary: "$45K – $60K", applicants: 31, status: "paused", posted: "Dec 28, 2024", deadline: "Feb 10, 2025" },
];

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  active: { label: "Active",  bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  paused: { label: "Paused",  bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  closed: { label: "Closed",  bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  draft:  { label: "Draft",   bg: "bg-white/[0.06]",  text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
};

const FILTER_TABS = ["All", "Active", "Paused", "Closed", "Draft"];

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
    <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Filter jobs by status">
      {FILTER_TABS.map((tab) => {
        const count = tab === "All" ? counts.total : counts[tab.toLowerCase()] || 0;
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

/* ─── Search Input ─── */
function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-[280px]">
      <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
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

/* ─── Job Table Row (Desktop) ─── */
function JobRow({ job, onView, onEdit, onToggle, onDelete }) {
  return (
    <tr className="h-[72px] border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150">
      <td className="px-6" role="cell">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
            <Briefcase size={16} aria-hidden="true" className="text-[#A1A1AA]" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">{job.title}</p>
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
        <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
          <Calendar size={13} aria-hidden="true" className="text-[#71717A]" />
          {job.posted}
        </div>
      </td>
      <td className="px-6" role="cell">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-6 text-right" role="cell">
        <div className="flex items-center justify-end gap-1">
          <ActionButton icon={Eye} label={`View ${job.title}`} onClick={() => onView(job)} />
          <ActionButton icon={FileEdit} label={`Edit ${job.title}`} onClick={() => onEdit(job)} />
          <ActionButton
            icon={job.status === "paused" ? Play : Pause}
            label={job.status === "paused" ? `Resume ${job.title}` : `Pause ${job.title}`}
            onClick={() => onToggle(job)}
          />
          <ActionButton icon={Trash2} label={`Delete ${job.title}`} onClick={() => onDelete(job)} danger />
        </div>
      </td>
    </tr>
  );
}

/* ─── Job Mobile Card ─── */
function JobCard({ job, onView, onEdit, onToggle, onDelete }) {
  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
            <Briefcase size={16} aria-hidden="true" className="text-[#A1A1AA]" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">{job.title}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">{job.category} &middot; {job.type}</p>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
        <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{job.location}</span>
        <span className="flex items-center gap-1"><DollarSign size={12} aria-hidden="true" />{job.salary}</span>
        <span className="flex items-center gap-1"><Users size={12} aria-hidden="true" />{job.applicants}</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[12px] text-[#71717A]">Posted {job.posted}</span>
        <div className="flex items-center gap-1">
          <ActionButton icon={Eye} label={`View ${job.title}`} onClick={() => onView(job)} />
          <ActionButton icon={FileEdit} label={`Edit ${job.title}`} onClick={() => onEdit(job)} />
          <ActionButton
            icon={job.status === "paused" ? Play : Pause}
            label={job.status === "paused" ? `Resume ${job.title}` : `Pause ${job.title}`}
            onClick={() => onToggle(job)}
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
        {activeFilter === "All" ? "No jobs found" : `No ${activeFilter.toLowerCase()} jobs`}
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

/* ═══════════════════════════════════════════════════
   MANAGE JOBS PAGE
   ═══════════════════════════════════════════════════ */
export default function ManageJobsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Derive KPIs ── */
  const totalJobs = MOCK_JOBS.length;
  const activeJobs = MOCK_JOBS.filter((j) => j.status === "active").length;
  const totalApplicants = MOCK_JOBS.reduce((sum, j) => sum + j.applicants, 0);
  const closedJobs = MOCK_JOBS.filter((j) => j.status === "closed").length;

  const KPI_DATA = [
    { label: "Total Jobs", value: totalJobs.toString(), Icon: Briefcase, color: "#ffffff" },
    { label: "Active Jobs", value: activeJobs.toString(), Icon: Play, color: "#22C55E" },
    { label: "Total Applicants", value: totalApplicants.toLocaleString(), Icon: Users, color: "#3B82F6" },
    { label: "Jobs Closed", value: closedJobs.toString(), Icon: Archive, color: "#EF4444" },
  ];

  /* ── Filter counts ── */
  const counts = {
    total: totalJobs,
    active: activeJobs,
    paused: MOCK_JOBS.filter((j) => j.status === "paused").length,
    closed: closedJobs,
    draft: MOCK_JOBS.filter((j) => j.status === "draft").length,
  };

  /* ── Filter + Search ── */
  const filtered = MOCK_JOBS.filter((job) => {
    const matchesFilter = activeFilter === "All" || job.status === activeFilter.toLowerCase();
    const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  /* ── Action handlers (no-ops for demo) ── */
  const handleView = (job) => {};
  const handleEdit = (job) => {};
  const handleToggle = (job) => {};
  const handleDelete = (job) => {};

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading jobs">
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
            onChange={(tab) => { setActiveFilter(tab); setCurrentPage(1); }}
            counts={counts}
          />
          <SearchInput value={searchQuery} onChange={(q) => { setSearchQuery(q); setCurrentPage(1); }} />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" role="table" aria-label="Job listings">
            <thead>
              <tr className="h-12 border-b border-white/[0.05]">
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Job Title</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Location</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden xl:table-cell">Salary</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden md:table-cell">Applicants</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">Posted</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Status</th>
                <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
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
              onEdit={handleEdit}
              onToggle={handleToggle}
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
    </div>
  );
}