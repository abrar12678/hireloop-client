"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Flag,
  CheckCircle,
  XCircle,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";

const ITEMS_PER_PAGE = 15;

const REASON_STYLES = {
  "Misleading description": "text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/10",
  "Spam/Fraud": "text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/10",
  "Inappropriate content": "text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/10",
  "Duplicate listing": "text-[#A1A1AA] border-[#A1A1AA]/20 bg-[#A1A1AA]/10",
  Other: "text-[#A1A1AA] border-[#A1A1AA]/20 bg-[#A1A1AA]/10",
};

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    resolved: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
    dismissed: "bg-[#71717A]/15 text-[#71717A] border-[#71717A]/30",
  };
  return (
    <span className={`inline-flex items-center text-[12px] font-medium px-2.5 py-[3px] rounded-full border ${styles[status] || ""} capitalize`}>
      {status}
    </span>
  );
}

function ActionModal({ open, onClose, title, onConfirm, loading }) {
  const [note, setNote] = useState("");
  if (!open) return null;

  const handleConfirm = () => onConfirm(note);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1B1B1F] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Admin Note <span className="text-[#71717A]">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the reporter..."
              rows={3}
              className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg text-white text-sm px-3 py-2.5 outline-none placeholder-[#71717A] focus:border-[#3B82F6] transition-colors resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[#A1A1AA] hover:text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const { data: session, isPending } = useSession();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.set("status", activeFilter);
      params.set("page", currentPage);
      params.set("perPage", ITEMS_PER_PAGE);
      const data = await protectedClientFetch(`/api/reports?${params.toString()}`);
      setReports(data?.reports || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, currentPage]);

  useEffect(() => {
    if (!isPending) fetchReports();
  }, [isPending, fetchReports]);

  const handleAction = (report, action) => {
    setSelectedReport(report);
    setModalAction(action);
    setModalOpen(true);
  };

  const confirmAction = async (note) => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const reportId = selectedReport._id?.$oid || selectedReport._id;
      await clientMutation(`/api/reports/${reportId}`, {
        status: modalAction,
        adminNote: note || undefined,
      }, "PATCH");
      setModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      console.error("Failed to update report:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "resolved", label: "Resolved" },
    { key: "dismissed", label: "Dismissed" },
  ];

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  if (isPending) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight text-white leading-none">
          Job Reports
        </h1>
        <p className="text-[#A1A1AA] text-sm mt-2">
          Review and manage reported job listings from seekers.
        </p>
      </div>

      {/* Filter Tabs */}
      <nav className="flex items-center gap-1" role="tablist" aria-label="Filter reports by status">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeFilter === tab.key}
            onClick={() => {
              setActiveFilter(tab.key);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 text-sm font-medium rounded-[10px] transition-colors cursor-pointer ${
              activeFilter === tab.key
                ? "bg-[#3A3A40] text-white"
                : "text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Table */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-[#71717A] text-sm">
            No reports found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Reports list">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Job Title</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Reporter</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Reason</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const reportId = report._id?.$oid || report._id;
                  const reasonStyle = REASON_STYLES[report.reason] || REASON_STYLES.Other;
                  const dateStr = report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : "N/A";

                  return (
                    <tr key={reportId} className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="text-white font-medium">
                          {report.jobDetails?.jobTitle || "Unknown Job"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#A1A1AA]">
                        {report.reporterDetails?.name || report.reporterDetails?.email || "Unknown"}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[12px] font-medium px-2.5 py-[3px] rounded-full border ${reasonStyle}`}>
                          {report.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#71717A] text-sm whitespace-nowrap">{dateStr}</td>
                      <td className="py-3.5 px-5"><StatusBadge status={report.status} /></td>
                      <td className="py-3.5 px-5">
                        {report.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(report, "resolved")}
                              className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors cursor-pointer"
                              aria-label="Resolve report"
                            >
                              <CheckCircle size={13} />
                              Resolve
                            </button>
                            <button
                              onClick={() => handleAction(report, "dismissed")}
                              className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#71717A]/40 bg-[#71717A]/10 text-[#71717A] hover:bg-[#71717A]/20 transition-colors cursor-pointer"
                              aria-label="Dismiss report"
                            >
                              <XCircle size={13} />
                              Dismiss
                            </button>
                          </div>
                        )}
                        {report.status !== "pending" && report.adminNote && (
                          <span className="text-[#A1A1AA] text-xs" title={report.adminNote}>
                            <MessageSquare size={13} className="inline mr-1" />
                            Note added
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-xs text-[#71717A]">
              Showing <span className="text-[#A1A1AA]">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total)}</span>
              –<span className="text-[#A1A1AA]">{Math.min(currentPage * ITEMS_PER_PAGE, total)}</span>
              of <span className="text-[#A1A1AA]">{total}</span> reports
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-[#3A3A40] text-white text-sm font-medium">
                {currentPage}
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <ActionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedReport(null); }}
        title={modalAction === "resolved" ? "Resolve Report" : "Dismiss Report"}
        onConfirm={confirmAction}
        loading={actionLoading}
      />
    </div>
  );
}