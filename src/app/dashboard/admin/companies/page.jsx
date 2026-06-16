"use client";

import React, { useEffect, useState, useCallback } from "react";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";
import { Magnifier, Check, Xmark, Clock, ShieldCheck, TriangleExclamation } from "@gravity-ui/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StatusDot = ({ status }) => {
  const colors = { Approved: "bg-emerald-500", Pending: "bg-amber-500", Rejected: "bg-rose-500" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-zinc-500"}`} />;
};

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: "text-emerald-400",
    Pending: "text-amber-400",
    Rejected: "text-rose-400",
  };
  return (
    <div className="flex items-center gap-2">
      <StatusDot status={status} />
      <span className={`text-sm font-medium ${styles[status] || "text-zinc-400"}`}>{status}</span>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (search) sp.set("search", search);
      const data = await protectedClientFetch(`/companies?${sp.toString()}`);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleStatusUpdate = async (companyId, newStatus) => {
    try {
      await clientMutation(`/companies/${companyId}`, { status: newStatus }, "PATCH");
      toast.success(`Company ${newStatus.toLowerCase()}`, {
        position: "top-center", autoClose: 2000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
      fetchCompanies();
    } catch (err) {
      toast.error("Failed to update company status", {
        position: "top-center", autoClose: 3000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }
  };

  const pendingCount = companies.filter((c) => c.status === "Pending").length;
  const approvedCount = companies.filter((c) => c.status === "Approved").length;
  const rejectedCount = companies.filter((c) => c.status === "Rejected").length;

  const statCards = [
    { label: "Pending Review", value: pendingCount, sub: "+12% vs last week", color: "text-emerald-400", icon: Clock },
    { label: "Approved Partners", value: approvedCount, sub: "+5% vs last week", color: "text-emerald-400", icon: ShieldCheck },
    { label: "Total Rejections", value: rejectedCount, sub: "Stable", color: "text-zinc-400", icon: TriangleExclamation },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Company Registrations</h2>
          <p className="text-sm text-zinc-500 mt-1">Review and manage corporate entity access requests for the HireLoop ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-800/60 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-600 w-64"
            />
          </div>
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
              <card.icon width={22} height={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-zinc-500">{card.label}</p>
              <p className={`text-xs ${card.color}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Companies Table */}
      <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Company Name</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Recruiter Email</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Industry</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Date Submitted</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-600">No companies found.</td></tr>
              ) : (
                companies.map((c) => {
                  const cid = c._id?.$oid || c._id;
                  const initials = (c.name || "C").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={cid} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">{initials}</div>
                          <span className="text-zinc-100 font-medium">{c.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-zinc-400 text-xs">{c.recruiterId || "—"}</td>
                      <td className="py-3 px-5 text-zinc-400 capitalize">{c.industry || "—"}</td>
                      <td className="py-3 px-5"><StatusBadge status={c.status} /></td>
                      <td className="py-3 px-5 text-zinc-500 text-xs">{formatDate(c.createdAt?.$date || c.createdAt)}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          {(c.status === "Pending" || c.status === "Rejected") && (
                            <button onClick={() => handleStatusUpdate(cid, "Approved")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800/30 transition-colors">
                              <Check width={12} height={12} /> Approve
                            </button>
                          )}
                          {(c.status === "Pending" || c.status === "Approved") && (
                            <button onClick={() => handleStatusUpdate(cid, "Rejected")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-950/60 border border-rose-800/30 transition-colors">
                              <Xmark width={12} height={12} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800/40">
          <p className="text-xs text-zinc-500">
            Showing 1-{companies.length} of {companies.length} companies
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCompaniesPage;
