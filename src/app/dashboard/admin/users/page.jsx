"use client";

import React, { useEffect, useState, useCallback } from "react";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";
import { Magnifier, ArrowUpRight } from "@gravity-ui/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoleBadge = ({ role }) => {
  const styles = {
    seeker: "bg-zinc-800 text-zinc-300 border-zinc-700",
    recruiter: "bg-white/10 text-zinc-100 border-white/20",
    admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[role] || styles.seeker} capitalize`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    suspended: "bg-rose-950/40 text-rose-400 border-rose-800/40",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page, perPage });
      if (search) sp.set("search", search);
      if (roleFilter !== "all") sp.set("role", roleFilter);
      const data = await protectedClientFetch(`/users?${sp.toString()}`);
      if (data && !Array.isArray(data)) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await clientMutation(`/users/${userId}/role`, { role: newRole }, "PATCH");
      toast.success(`User role updated to ${newRole}`, {
        position: "top-center", autoClose: 2000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role", {
        position: "top-center", autoClose: 3000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await clientMutation(`/users/${userId}/status`, { status: newStatus }, "PATCH");
      toast.success(`User ${newStatus}`, {
        position: "top-center", autoClose: 2000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status", {
        position: "top-center", autoClose: 3000, theme: "dark",
        style: { background: "#1a1a2e", color: "#fff" },
      });
    }
  };

  const totalPages = Math.ceil(total / perPage);

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const recruiterCount = users.filter((u) => u.role === "recruiter").length;

  const statCards = [
    { label: "Total Active Users", value: total.toLocaleString(), sub: "+12% vs last month", color: "text-emerald-400" },
    { label: "Recruiter Growth", value: recruiterCount.toLocaleString(), sub: "High demand", color: "text-emerald-400" },
    { label: "Suspended Accounts", value: suspendedCount.toLocaleString(), sub: "0.8% of total", color: "text-zinc-400" },
    { label: "New Signups (24h)", value: "—", sub: "Steady activity", color: "text-amber-400" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">User Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Review, filter, and manage platform access for all users.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-xl px-4 py-2 outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="seeker">Seekers</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Export List
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-5 space-y-1">
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className={`text-xs ${card.color}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-zinc-800/60 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-600"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">User Name</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Email Address</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Role</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Join Date</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left text-zinc-500 font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-zinc-600">No users found.</td></tr>
              ) : (
                users.map((u) => {
                  const uid = u._id?.$oid || u._id;
                  const initials = (u.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={uid} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">{initials}</div>
                          )}
                          <span className="text-zinc-100 font-medium">{u.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-zinc-400">{u.email || "—"}</td>
                      <td className="py-3 px-5"><RoleBadge role={u.role} /></td>
                      <td className="py-3 px-5 text-zinc-500 text-xs">{formatDate(u.createdAt?.$date || u.createdAt)}</td>
                      <td className="py-3 px-5"><StatusBadge status={u.status || "active"} /></td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          {u.role === "seeker" && (
                            <button onClick={() => handleRoleChange(uid, "recruiter")} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                              Make Recruiter
                            </button>
                          )}
                          {u.role === "recruiter" && (
                            <button onClick={() => handleRoleChange(uid, "seeker")} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                              Make Seeker
                            </button>
                          )}
                          {u.status === "active" ? (
                            <button onClick={() => handleStatusChange(uid, "suspended")} className="text-xs px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-950/60 border border-rose-800/30 transition-colors">
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(uid, "active")} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800/30 transition-colors">
                              Activate
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800/40">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} users
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
    </div>
  );
};

export default AdminUsersPage;
