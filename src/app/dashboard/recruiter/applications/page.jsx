"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
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
  X,
  Globe,
  MapPin,
  Phone,
} from "lucide-react";
import ApplicationPipeline from "@/components/dashboard/ApplicationPipeline";
import { clientMutation } from "@/lib/core/client";
import { LogoGithub, LogoLinkedin } from "@gravity-ui/icons";

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  new: {
    label: "New",
    bg: "bg-white/[0.06]",
    text: "text-[#A1A1AA]",
    border: "border-white/[0.08]",
  },
  applied: {
    label: "New",
    bg: "bg-white/[0.06]",
    text: "text-[#A1A1AA]",
    border: "border-white/[0.08]",
  },
  screening: {
    label: "Screening",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
  },
  interview: {
    label: "Interview",
    bg: "bg-[#3B82F6]/15",
    text: "text-[#3B82F6]",
    border: "border-[#3B82F6]/30",
  },
  interview_scheduled: {
    label: "Interview",
    bg: "bg-[#F97316]/15",
    text: "text-[#F97316]",
    border: "border-[#F97316]/30",
  },
  offered: {
    label: "Offered",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
    border: "border-[#22C55E]/30",
  },
  hired: {
    label: "Hired",
    bg: "bg-[#A855F7]/15",
    text: "text-[#A855F7]",
    border: "border-[#A855F7]/30",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#EF4444]/15",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]/30",
  },
};

const FILTER_TABS = [
  "All",
  "New",
  "Screening",
  "Interview",
  "Offered",
  "Hired",
  "Rejected",
];

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

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

function StatusBadge({ status }) {
  const colorMap = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    reviewed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    shortlisted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    interview: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    accepted: "bg-green-500/15 text-green-400 border-green-500/20",
    rejected: "bg-red-500/15 text-red-400 border-red-500/20",
    new: "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]",
    applied: "bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]",
    screening: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    offered: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
    hired: "bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/30",
  };
  const s = (status || "pending").toLowerCase();
  const cfg = STATUS_CONFIG[s];
  if (cfg) {
    return (
      <span
        className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
      >
        {cfg.label}
      </span>
    );
  }
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${
        colorMap[s] || colorMap.pending
      }`}
    >
      {s}
    </span>
  );
}

function CandidateAvatar({ name, rating }) {
  const initials = (name || "??")
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
          <Star
            size={9}
            aria-hidden="true"
            className="text-black"
            fill="black"
          />
        </div>
      )}
    </div>
  );
}

function FilterTabBar({ active, onChange, counts }) {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto"
      role="tablist"
      aria-label="Filter applicants by status"
    >
      {FILTER_TABS.map((tab) => {
        const key = tab.toLowerCase();
        const count = tab === "All" ? counts.total : counts[key] || 0;
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
      <Filter
        size={14}
        aria-hidden="true"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none"
      />
    </div>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-[260px]">
      <Search
        size={16}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
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

function ApplicantRow({ applicant, onView, onAdvance, onReject }) {
  return (
    <tr className="border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150">
      <td className="px-6 py-3" role="cell">
        <div className="flex items-center gap-3">
          <CandidateAvatar name={applicant.name} rating={applicant.rating} />
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">
              {applicant.name}
            </p>
            <p className="text-[12px] text-[#71717A] mt-0.5">
              {applicant.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 hidden lg:table-cell" role="cell">
        <div className="flex items-center gap-2 text-[14px] text-[#A1A1AA]">
          <Briefcase
            size={14}
            aria-hidden="true"
            className="text-[#71717A] shrink-0"
          />
          <span className="truncate">{applicant.role}</span>
        </div>
      </td>
      <td className="px-6 hidden sm:table-cell" role="cell">
        <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
          <Calendar size={13} aria-hidden="true" />
          {applicant.applied}
        </div>
      </td>
      <td className="px-6" role="cell">
        <ApplicationPipeline
          currentStatus={applicant.status}
          onAdvance={(nextStage) => onAdvance(applicant, nextStage)}
          onReject={() => onReject(applicant)}
        />
      </td>
      <td className="px-6 text-right" role="cell">
        <div className="flex items-center justify-end gap-1">
          <ActionButton
            icon={Eye}
            label={`View ${applicant.name}`}
            onClick={() => onView(applicant)}
          />
          <ActionButton
            icon={MessageSquare}
            label={`Message ${applicant.name}`}
            onClick={() => {}}
          />
        </div>
      </td>
    </tr>
  );
}

function ApplicantCard({ applicant, onView, onAdvance, onReject }) {
  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CandidateAvatar name={applicant.name} rating={applicant.rating} />
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-white truncate">
              {applicant.name}
            </p>
            <p className="text-[12px] text-[#71717A] mt-0.5 truncate">
              {applicant.email}
            </p>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>
      <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
        <span className="flex items-center gap-1">
          <Briefcase size={12} aria-hidden="true" />
          {applicant.role}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-[12px] text-[#71717A]">
          <Calendar size={12} aria-hidden="true" />
          {applicant.applied}
        </span>
        <div className="flex items-center gap-1">
          <ActionButton
            icon={Eye}
            label={`View ${applicant.name}`}
            onClick={() => onView(applicant)}
          />
          <ActionButton
            icon={MessageSquare}
            label={`Message ${applicant.name}`}
            onClick={() => onMessage(applicant)}
          />
          <ActionButton
            icon={XCircle}
            label={`Reject ${applicant.name}`}
            onClick={() => onReject(applicant)}
            danger
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ activeFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Users size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
      <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">
        {activeFilter === "All"
          ? "No applicants found"
          : `No ${activeFilter.toLowerCase()} applicants`}
      </p>
      <p className="text-[#71717A] text-[14px]">
        {activeFilter === "All"
          ? "Applicants will appear here once they apply to your job postings."
          : `${activeFilter} applicants will appear here.`}
      </p>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const perPage = 8;
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

/* ─── Modal Sub-components ─── */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
  );
}

function Label({ children }) {
  return <p className="text-[11px] text-[#71717A] mb-0.5">{children}</p>;
}

function Value({ children }) {
  return <p className="text-sm text-[#D4D4D8]">{children}</p>;
}

function LinkRow({ label, href }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0E0E11] border border-[#3A3A40]/50">
      <svg
        className="w-4 h-4 text-purple-400 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <span className="text-sm text-[#71717A] min-w-[80px]">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-purple-400 hover:text-purple-300 truncate"
      >
        {href}
      </a>
    </div>
  );
}

/* ─── Applicant Detail Modal (Custom — no HeroUI dependency) ─── */
function ApplicantDetailModal({ applicant, isOpen, onClose }) {
  if (!isOpen || !applicant) return null;

  // applicant = mapped object from mapApplication(), raw DB data is in .rawData
  const raw = applicant.rawData || applicant;
  const profile = raw.applicantDetails || {};
  const job = raw.jobDetails || {};

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Box */}
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#3A3A40] bg-[#1B1B1F] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#3A3A40] bg-[#1B1B1F] px-6 py-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              (profile.name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {profile.name || "Unknown"}
            </h2>
            <p className="text-sm text-[#71717A] truncate">
              {profile.email || "No email"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-[#71717A] hover:text-white transition-colors p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">
          {/* ── Application Info ── */}
          <Section title="Application Info">
            <InfoGrid>
              <div>
                <Label>Applied For</Label>
                <Value>{job.jobTitle || raw.jobId || "N/A"}</Value>
              </div>
              <div>
                <Label>Status</Label>
                <Value>
                  <StatusBadge status={raw.status || "pending"} />
                </Value>
              </div>
              <div>
                <Label>Applied On</Label>
                <Value>
                  {raw.createdAt || raw.appliedAt
                    ? new Date(
                        raw.createdAt || raw.appliedAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </Value>
              </div>
              <div>
                <Label>Job Type</Label>
                <Value>{job.jobType || "N/A"}</Value>
              </div>
              <div>
                <Label>Company</Label>
                <Value>{job.companyName || "N/A"}</Value>
              </div>
              <div>
                <Label>Category</Label>
                <Value>{job.jobCategory || "N/A"}</Value>
              </div>
            </InfoGrid>
          </Section>

          {/* ── Personal Info ── */}
          <Section title="Personal Information">
            <InfoGrid>
              <div>
                <Label>Phone</Label>
                <Value>{profile.phone || "Not provided"}</Value>
              </div>
              <div>
                <Label>Location</Label>
                <Value>
                  {profile.location || profile.address || "Not provided"}
                </Value>
              </div>
              <div>
                <Label>Gender</Label>
                <Value>{profile.gender || "Not provided"}</Value>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Value>
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not provided"}
                </Value>
              </div>
            </InfoGrid>
          </Section>

          {/* ── Bio / About ── */}
          {profile.bio && (
            <Section title="About">
              <p className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </Section>
          )}

          {/* ── Skills ── */}
          {profile.skills && profile.skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20"
                  >
                    {typeof skill === "string"
                      ? skill
                      : skill.name || skill.skill || JSON.stringify(skill)}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── Education ── */}
          {profile.education && profile.education.length > 0 && (
            <Section title="Education">
              <div className="space-y-3">
                {profile.education.map((edu, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0E0E11] border border-[#3A3A40]/50"
                  >
                    <p className="text-sm font-medium text-white">
                      {edu.degree ||
                        edu.qualification ||
                        "Degree not specified"}
                    </p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      {edu.institution ||
                        edu.school ||
                        edu.university ||
                        "Institution not specified"}
                    </p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {edu.fieldOfStudy && (
                        <p className="text-xs text-[#71717A]">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu.startYear || edu.endYear) && (
                        <p className="text-xs text-[#71717A]">
                          {edu.startYear || ""} - {edu.endYear || "Present"}
                        </p>
                      )}
                      {edu.grade && (
                        <p className="text-xs text-[#71717A]">
                          GPA: {edu.grade}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Experience ── */}
          {profile.experience && profile.experience.length > 0 && (
            <Section title="Experience">
              <div className="space-y-3">
                {profile.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0E0E11] border border-[#3A3A40]/50"
                  >
                    <p className="text-sm font-medium text-white">
                      {exp.title ||
                        exp.position ||
                        exp.role ||
                        "Position not specified"}
                    </p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      {exp.company ||
                        exp.organization ||
                        exp.employer ||
                        "Company not specified"}
                    </p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {(exp.startDate || exp.startYear || exp.from) && (
                        <p className="text-xs text-[#71717A]">
                          {exp.startDate || exp.startYear || exp.from}
                          {" - "}
                          {exp.endDate ||
                            exp.endYear ||
                            exp.to ||
                            (exp.current ? "Present" : "")}
                        </p>
                      )}
                      {exp.duration && (
                        <p className="text-xs text-[#71717A]">{exp.duration}</p>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Cover Letter ── */}
          {(raw.coverLetter || applicant.coverLetter) && (
            <Section title="Cover Letter">
              <div className="p-3 rounded-lg bg-[#0E0E11] border border-[#3A3A40]/50">
                <p className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-line">
                  {raw.coverLetter || applicant.coverLetter}
                </p>
              </div>
            </Section>
          )}

          {/* ── Portfolio & Links ── */}
          {(profile.portfolio ||
            profile.website ||
            profile.linkedin ||
            profile.resume ||
            profile.github ||
            raw.resume) && (
            <Section title="Portfolio & Links">
              <div className="space-y-2">
                {profile.portfolio && (
                  <LinkRow label="Portfolio" href={profile.portfolio} />
                )}
                {profile.website && (
                  <LinkRow label="Website" href={profile.website} />
                )}
                {profile.linkedin && (
                  <LinkRow label="LinkedIn" href={profile.linkedin} />
                )}
                {profile.github && (
                  <LinkRow label="GitHub" href={profile.github} />
                )}
                {(raw.resume || profile.resume) && (
                  <LinkRow label="Resume" href={raw.resume || profile.resume} />
                )}
              </div>
            </Section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 border-t border-[#3A3A40] bg-[#1B1B1F] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-[#71717A] hover:text-white border border-[#3A3A40] hover:border-[#52525B] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Map DB application to UI shape ─── */
function mapApplication(app) {
  const applicantName = app.applicantDetails?.name || "Unknown";
  const applicantEmail = app.applicantDetails?.email || "—";
  const jobTitle = app.jobDetails?.jobTitle || "—";

  let applied = "—";
  if (app.createdAt) {
    try {
      applied = new Date(app.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {}
  }

  return {
    id: app._id,
    name: applicantName,
    email: applicantEmail,
    role: jobTitle,
    applied,
    status: app.status || "applied",
    rating: 0,
    rawData: app,
  };
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS PAGE
   ═══════════════════════════════════════════════════ */
export default function RecruiterApplicationsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [rawApps, setRawApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  /* ── Fetch applications via proxy ── */
  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await protectedClientFetch("/api/applications");
      const apps = Array.isArray(data) ? data : [];
      setRawApps(apps.map(mapApplication));
    } catch (err) {
      console.error("[Applications] Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!sessionPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchApplications();
    }
  }, [fetchApplications, sessionPending]);

  /* ── Build job filter options from data ── */
  const jobTitles = [...new Set(rawApps.map((a) => a.role).filter(Boolean))];
  const jobOptions = ["All Jobs", ...jobTitles];

  /* ── Derive KPIs ── */
  const total = rawApps.length;
  const newCount = rawApps.filter(
    (a) => a.status === "new" || a.status === "applied",
  ).length;
  const interviewCount = rawApps.filter((a) => a.status === "interview").length;
  const hiredCount = rawApps.filter((a) => a.status === "hired").length;

  const KPI_DATA = [
    {
      label: "Total Applicants",
      value: total.toString(),
      Icon: Users,
      color: "#ffffff",
    },
    { label: "New", value: newCount.toString(), Icon: Clock, color: "#A1A1AA" },
    {
      label: "In Interview",
      value: interviewCount.toString(),
      Icon: UserCheck,
      color: "#3B82F6",
    },
    {
      label: "Hired",
      value: hiredCount.toString(),
      Icon: CheckCircle2,
      color: "#22C55E",
    },
  ];

  const counts = {
    total,
    new: newCount,
    screening: rawApps.filter((a) => a.status === "screening").length,
    interview: interviewCount,
    offered: rawApps.filter((a) => a.status === "offered").length,
    hired: hiredCount,
    rejected: rawApps.filter((a) => a.status === "rejected").length,
  };

  /* ── Filter + Search ── */
  const filtered = rawApps.filter((app) => {
    const statusMatch =
      activeFilter === "All" || app.status === activeFilter.toLowerCase();
    const jobMatch = jobFilter === "All Jobs" || app.role === jobFilter;
    const searchMatch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && jobMatch && searchMatch;
  });

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const handleView = (app) => setSelectedApplicant(app);
  const handleAdvance = async (app, nextStage) => {
    const appId = app.id?.$oid || app.id;
    if (!appId) return;
    try {
      await clientMutation(`/applications/${appId}/status`, { status: nextStage });
      setRawApps((prev) =>
        prev.map((a) => {
          const aId = a.id?.$oid || a.id;
          return aId === appId
            ? { ...a, status: nextStage }
            : a;
        }),
      );
    } catch (err) {
      console.error("Failed to advance application:", err);
    }
  };
  const handleReject = async (app) => {
    const appId = app.id?.$oid || app.id;
    if (!appId) return;
    try {
      await clientMutation(`/applications/${appId}/status`, { status: "rejected" });
      setRawApps((prev) =>
        prev.map((a) => {
          const aId = a.id?.$oid || a.id;
          return aId === appId
            ? { ...a, status: "rejected" }
            : a;
        }),
      );
    } catch (err) {
      console.error("Failed to reject application:", err);
    }
  };

  if (sessionPending || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        role="status"
        aria-label="Loading applications"
      >
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.05]">
          <FilterTabBar
            active={activeFilter}
            onChange={(tab) => {
              setActiveFilter(tab);
              setCurrentPage(1);
            }}
            counts={counts}
          />
          <div className="flex items-center gap-3 shrink-0">
            <JobFilterDropdown
              value={jobFilter}
              onChange={(j) => {
                setJobFilter(j);
                setCurrentPage(1);
              }}
              jobs={jobOptions}
            />
            <SearchInput
              value={searchQuery}
              onChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full" role="table" aria-label="Applicant list">
            <thead>
              <tr className="h-12 border-b border-white/[0.05]">
                <th
                  scope="col"
                  className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6"
                >
                  Candidate
                </th>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell"
                >
                  Applied For
                </th>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell"
                >
                  Applied
                </th>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((app) => (
                <ApplicantRow
                  key={app.id}
                  applicant={app}
                  onView={handleView}
                onAdvance={handleAdvance}
                onReject={handleReject}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-white/[0.05]">
          {paginated.map((app) => (
            <ApplicantCard
              key={app.id}
              applicant={app}
              onView={handleView}
              onAdvance={handleAdvance}
              onReject={handleReject}
            />
          ))}
        </div>

        {paginated.length === 0 && <EmptyState activeFilter={activeFilter} />}

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
          />
        )}
      </div>

      {/* ── Applicant Detail Modal ── */}
      <ApplicantDetailModal
        applicant={selectedApplicant}
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
      />
    </div>
  );
}
