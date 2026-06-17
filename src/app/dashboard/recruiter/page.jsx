"use client";

import React from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Zap,
  CircleCheckBig,
  ArrowRight,
  Plus,
  Building2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */

const KPI_DATA = [
  { label: "Total Job Posts", value: "48", Icon: Briefcase, color: "#ffffff" },
  { label: "Total Applicants", value: "1,284", Icon: Users, color: "#3B82F6" },
  { label: "Active Jobs", value: "18", Icon: Zap, color: "#FACC15" },
  { label: "Jobs Closed", value: "32", Icon: CircleCheckBig, color: "#22C55E" },
];

const RECENT_APPLICATIONS = [
  { name: "Sarah Johnson", role: "Senior Frontend Developer", date: "Jan 15, 2025", experience: "5 years", status: "interviewing" },
  { name: "Marcus Chen", role: "Product Designer", date: "Jan 14, 2025", experience: "3 years", status: "new" },
  { name: "Emily Davis", role: "Backend Engineer", date: "Jan 13, 2025", experience: "7 years", status: "reviewing" },
  { name: "James Wilson", role: "DevOps Engineer", date: "Jan 12, 2025", experience: "4 years", status: "interviewing" },
  { name: "Aria Patel", role: "Data Scientist", date: "Jan 11, 2025", experience: "6 years", status: "rejected" },
  { name: "Tom Anderson", role: "Full Stack Developer", date: "Jan 10, 2025", experience: "2 years", status: "new" },
];

const TOP_COMPANIES = [
  { name: "TechFlow Inc.", industry: "Technology", jobs: 24, letter: "TF" },
  { name: "FinGrid", industry: "Fintech", jobs: 18, letter: "FG" },
  { name: "CloudApps", industry: "SaaS", jobs: 12, letter: "CA" },
  { name: "DataSync", industry: "Data Analytics", jobs: 31, letter: "DS" },
];

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  interviewing: { label: "Interviewing", bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  new:          { label: "New",          bg: "bg-white/[0.06]",    text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  reviewing:    { label: "Reviewing",    bg: "bg-[#F59E0B]/15",  text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  rejected:     { label: "Rejected",     bg: "bg-[#EF4444]/15",  text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
};

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
        {/* Icon container */}
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
function CandidateAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/* ─── Applications Table ─── */
function ApplicationsTable({ applications }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5">
        <h3 className="text-[18px] font-medium text-white">Recent Applications</h3>
        <button
          aria-label="View all applications"
          className="text-[14px] text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-lg"
        >
          View all
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" role="table" aria-label="Recent applications">
          <thead>
            <tr className="h-12 border-t border-b border-white/[0.05]">
              <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Candidate Name</th>
              <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Role</th>
              <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Date Applied</th>
              <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden xl:table-cell">Experience</th>
              <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, idx) => (
              <tr
                key={idx}
                className="h-16 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
              >
                <td className="px-6" role="cell">
                  <div className="flex items-center gap-3">
                    <CandidateAvatar name={app.name} />
                    <span className="text-[14px] font-medium text-white">{app.name}</span>
                  </div>
                </td>
                <td className="px-6 text-[14px] text-[#A1A1AA]" role="cell">{app.role}</td>
                <td className="px-6 text-[14px] text-[#71717A] hidden lg:table-cell" role="cell">{app.date}</td>
                <td className="px-6 text-[14px] text-[#A1A1AA] hidden xl:table-cell" role="cell">{app.experience}</td>
                <td className="px-6 text-right" role="cell">
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/[0.05]">
        {applications.map((app, idx) => (
          <div key={idx} className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CandidateAvatar name={app.name} />
                <span className="text-[14px] font-medium text-white">{app.name}</span>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-[13px] text-[#A1A1AA]">{app.role}</p>
            <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
              <span>{app.date}</span>
              <span>&middot;</span>
              <span>{app.experience}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Company Row ─── */
function CompanyRow({ company }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-[10px] hover:bg-[#222228] transition-colors duration-150">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0" aria-hidden="true">
          <span className="text-white text-[12px] font-bold">{company.letter}</span>
        </div>
        <div>
          <p className="text-[14px] font-medium text-white">{company.name}</p>
          <p className="text-[12px] text-[#71717A]">{company.industry}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-semibold text-white">{company.jobs}</p>
        <p className="text-[10px] text-[#71717A] uppercase tracking-wide">Active Jobs</p>
      </div>
    </div>
  );
}

/* ─── Companies Panel ─── */
function CompaniesPanel({ companies }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] font-medium text-white">My Top Companies</h3>
        <button
          aria-label="View all companies"
          className="text-[14px] text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-lg"
        >
          View all
        </button>
      </div>

      {/* Company List */}
      <div className="space-y-1">
        {companies.map((company, idx) => (
          <CompanyRow key={idx} company={company} />
        ))}
      </div>

      {/* View All Button */}
      <Link
        href="/dashboard/recruiter/company"
        className="block w-full mt-6 h-10 border border-white/[0.06] rounded-[10px] text-[14px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white transition-all duration-150 text-center leading-10 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
      >
        View All Companies
      </Link>
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
   RECRUITER DASHBOARD PAGE
   ═══════════════════════════════════════════════════ */
export default function RecruiterDashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading dashboard">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Welcome back, {user?.name || "Alex Sterling"}
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Here&apos;s an overview of your recruiting activity.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiStatCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Content Grid: Applications (2 col) + Companies (1 col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApplicationsTable applications={RECENT_APPLICATIONS} />
        </div>
        <div>
          <CompaniesPanel companies={TOP_COMPANIES} />
        </div>
      </div>

      {/* ── FAB ── */}
      <FloatingActionButton />
    </div>
  );
}