"use client";

import React, { useEffect, useState, useCallback } from "react";
import { clientFetch } from "@/lib/core/client";
import { Eye, TrashBin, Magnifier } from "@gravity-ui/icons";
import Link from "next/link";
import { Button, Modal } from "@heroui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const styles = {
    active: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    closed: "bg-zinc-800 text-zinc-400 border-zinc-700",
    draft: "bg-amber-950/40 text-amber-400 border-amber-800/40",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase ${styles[s] || styles.draft}`}>
      {status || "Unknown"}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ all: "true", page, perPage });
      if (search) sp.set("search", search);
      if (statusFilter !== "all") sp.set("status", statusFilter);
      if (categoryFilter !== "all") sp.set("jobCategory", categoryFilter);
      const data = await clientFetch(`/jobs?${sp.toString()}`);
      if (data && !Array.isArray(data)) {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
      } else {
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleteModal.job) return;
    setDeleting(true);
    try {
      const jobId = deleteModal.job._id?.$oid || deleteModal.job._id;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      await fetch(`${baseUrl}/api/jobs/${jobId}`, { method: "DELETE", credentials: "include" });
      setJobs((prev) => prev.filter((j) => (j._id?.$oid || j._id) !== jobId));
      setDeleteModal({ open: false, job: null });
      toast.success("Job deleted successfully", {
        position: "top-center", autoClose: 2000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    } catch (err) {
      toast.error("Failed to delete job", {
        position: "top-center", autoClose: 3000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    } finally {
      setDeleting(false);
    }
  };

  const categories = [...new Set(jobs.map((j) => j.jobCategory).filter(Boolean))];
  const activeCount = jobs.filter((j) => j.status === "active").length;
  const closedCount = jobs.filter((j) => j.status === "closed").length;
  const totalPages = Math.ceil(total / perPage);

  const statCards = [
    { label: "Engagement Rate", value: "82.4%", sub: "+5.2% from last month", color: "text-emerald-400" },
    { label: "Avg. Time to Fill", value: "14 Days", sub: "Stable performance", color: "text-zinc-400" },
    { label: "Total Applications", value: total.toLocaleString(), sub: "-2.1% across tech sectors", color: "text-amber-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Manage Jobs</h2>
          <p className="text-sm text-zinc-500 mt-1">Oversee all active listings and historical job posts across the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-zinc-800/60 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="capitalize">{cat}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 text-xs font-medium border border-emerald-800/30">
            Active ({activeCount})
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
            Closed ({closedCount})
          </span>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Company</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Date Posted</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-zinc-600">No jobs found.</td></tr>
              ) : (
                jobs.map((job) => {
                  const jobId = job._id?.$oid || job._id;
                  return (
                    <tr key={jobId} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                            {(job.companyName || "C")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-zinc-100 font-medium text-sm">{job.jobTitle}</span>
                            <p className="text-zinc-600 text-xs">HL-{String(jobId).slice(-5)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-zinc-400">{job.companyName || "—"}</td>
                      <td className="py-3 px-5 text-zinc-400 capitalize">{job.jobCategory || "—"}</td>
                      <td className="py-3 px-5 text-zinc-400 capitalize">{job.jobType || "—"}</td>
                      <td className="py-3 px-5 text-zinc-500 text-xs">{formatDate(job.createdAt?.$date || job.createdAt)}</td>
                      <td className="py-3 px-5"><StatusBadge status={job.status} /></td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <Link href={`/jobs/${jobId}`}>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
                              <Eye className="text-zinc-400 w-4 h-4" />
                            </button>
                          </Link>
                          <button onClick={() => setDeleteModal({ open: true, job })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-950/30 transition-colors">
                            <TrashBin className="text-zinc-400 hover:text-rose-400 w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800/40">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total} results
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors text-sm">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors text-sm">›</button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Bottom Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-5 space-y-1">
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className={`text-xs ${card.color}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, job: null })} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Job</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{deleteModal.job?.jobTitle}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm" onPress={() => setDeleteModal({ open: false, job: null })}>Cancel</Button>
              <Button color="danger" className="text-sm" isDisabled={deleting} onPress={handleDelete}>{deleting ? "Deleting..." : "Delete"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
