"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
import {
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";

/* ─── Helpers ─── */
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
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
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG = {
  shortlisted: {
    label: "Shortlisted",
    bg: "bg-[#3B82F6]/15",
    text: "text-[#3B82F6]",
    border: "border-[#3B82F6]/30",
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    bg: "bg-[#A855F7]/15",
    text: "text-[#A855F7]",
    border: "border-[#A855F7]/30",
  },
  interview: {
    label: "Interview",
    bg: "bg-[#A855F7]/15",
    text: "text-[#A855F7]",
    border: "border-[#A855F7]/30",
  },
  offered: {
    label: "Offered",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
    border: "border-[#22C55E]/30",
  },
  hired: {
    label: "Hired",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
    border: "border-[#22C55E]/30",
  },
  applied: {
    label: "Applied",
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
  reviewing: {
    label: "Reviewing",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#EF4444]/15",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]/30",
  },
};

function StatusBadge({ status }) {
  const key = (status || "applied").toLowerCase().replace(/\s+/g, "_");
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.applied;
  return (
    <span
      className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Main Page ─── */
export default function CandidatesPage() {
  const { data: session, isPending } = useSession();

  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await protectedClientFetch(
        `/api/candidates?page=${page}&perPage=${perPage}`
      );
      if (data && !Array.isArray(data)) {
        setCandidates(data.candidates || data.applications || []);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setCandidates(data);
        setTotal(data.length);
      } else {
        setCandidates([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!isPending) fetchCandidates();
  }, [isPending, fetchCandidates]);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Candidates
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          View candidates who have applied to your job postings.
        </p>
      </div>

      {candidates.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" role="table" aria-label="Candidates">
                <thead>
                  <tr className="h-12 border-b border-white/[0.05]">
                    <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
                      Candidate
                    </th>
                    <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
                      Job Title
                    </th>
                    <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
                      Status
                    </th>
                    <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, idx) => {
                    const name = c.name || c.applicant?.name || c.applicantDetails?.name || "Unknown";
                    const email = c.email || c.applicant?.email || c.applicantDetails?.email || "";
                    const image = c.image || c.applicant?.image || c.applicantDetails?.image || null;
                    const jobTitle = c.jobTitle || c.jobDetails?.jobTitle || "—";
                    const status = c.status || c.applicationStatus || "applied";
                    const appliedDate = c.createdAt || c.appliedAt || c.applicationDate || "";

                    return (
                      <tr
                        key={c._id || idx}
                        className="h-16 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
                      >
                        <td className="px-6" role="cell">
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img src={image} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                                {getInitials(name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-[14px] font-medium text-white block truncate">{name}</span>
                              <span className="text-[12px] text-[#71717A] flex items-center gap-1 truncate">
                                <Mail size={11} className="shrink-0" />
                                {email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 text-[14px] text-[#A1A1AA]" role="cell">
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={13} aria-hidden="true" className="text-[#71717A] shrink-0" />
                            {jobTitle}
                          </div>
                        </td>
                        <td className="px-6" role="cell">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 hidden lg:table-cell" role="cell">
                          <div className="flex items-center gap-1.5 text-[13px] text-[#71717A]">
                            <Calendar size={13} aria-hidden="true" className="shrink-0" />
                            {formatDate(appliedDate)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/[0.05]">
              {candidates.map((c, idx) => {
                const name = c.name || c.applicant?.name || c.applicantDetails?.name || "Unknown";
                const email = c.email || c.applicant?.email || c.applicantDetails?.email || "";
                const image = c.image || c.applicant?.image || c.applicantDetails?.image || null;
                const jobTitle = c.jobTitle || c.jobDetails?.jobTitle || "—";
                const status = c.status || c.applicationStatus || "applied";
                const appliedDate = c.createdAt || c.appliedAt || c.applicationDate || "";

                return (
                  <div key={c._id || idx} className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {image ? (
                        <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
                          {getInitials(name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-white truncate">{name}</p>
                        <p className="text-[12px] text-[#71717A] truncate">{email}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-[#71717A]">
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} aria-hidden="true" />
                        {jobTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} aria-hidden="true" />
                        {formatDate(appliedDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.05]">
                <span className="text-[13px] text-[#71717A]">
                  Showing {(page - 1) * perPage + 1}&ndash;{Math.min(page * perPage, total)} of {total}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-[13px] font-medium flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        page === p
                          ? "bg-white text-black"
                          : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users size={40} className="text-[#3A3A40] mb-4" />
          <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">No candidates found</p>
          <p className="text-[#71717A] text-[14px]">
            Candidates who apply to your jobs will appear here.
          </p>
        </div>
      )}
    </div>
  );
}