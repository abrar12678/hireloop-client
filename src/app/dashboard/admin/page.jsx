"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
import {
  FileText,
  Briefcase,
  CircleDollar,
  ArrowUpRight,
  ArrowDownRight,
  Person,
  House,
} from "@gravity-ui/icons";

const formatCurrency = (n) => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n}`;
};

const formatNumber = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return diffInHours <= 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

const StatusDot = ({ status }) => {
  const colors = {
    success: "bg-emerald-500",
    pending: "bg-amber-500",
    failed: "bg-rose-500",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-zinc-500"}`} />
  );
};

const AdminDashboard = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    protectedClientFetch("/admin/stats").then((data) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, []);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      id: "users",
      label: "Total Users",
      value: formatNumber(stats?.totalUsers || 0),
      change: "+12%",
      up: true,
      icon: Person,
    },
    {
      id: "applications",
      label: "Total Applications",
      value: formatNumber(stats?.totalApplications || 0),
      change: "+4%",
      up: true,
      icon: FileText,
    },
    {
      id: "companies",
      label: "Total Companies",
      value: formatNumber(stats?.totalCompanies || 0),
      change: "-6%",
      up: false,
      icon: House,
    },
    {
      id: "jobs",
      label: "Job Posts",
      value: formatNumber(stats?.totalJobs || 0),
      change: "+11%",
      up: true,
      icon: Briefcase,
    },
    {
      id: "revenue",
      label: "Platform Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      change: "+18.5%",
      up: true,
      icon: CircleDollar,
    },
  ];

  const categoryData = stats?.jobsByCategory || [];
  const recentPayments = stats?.recentPayments || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Dashboard - Overview
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Last 30 Days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[#08080f] bg-white rounded-xl hover:bg-zinc-200 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                <card.icon width={20} height={20} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.up ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {card.up ? (
                  <ArrowUpRight width={14} height={14} />
                ) : (
                  <ArrowDownRight width={14} height={14} />
                )}
                {card.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Posts by Category — Bar Chart */}
        <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Job Posts by Category</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs text-zinc-500">Active Listings</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {categoryData.length > 0 ? (
              categoryData.slice(0, 6).map((cat, idx) => {
                const maxCount = Math.max(...categoryData.map((c) => c.count), 1);
                const height = Math.max((cat.count / maxCount) * 100, 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">{cat.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-purple-500/80 hover:bg-purple-500 transition-colors"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-zinc-600 text-center truncate w-full">
                      {cat._id || "Other"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-600 text-sm">No category data</p>
              </div>
            )}
          </div>
        </div>

        {/* New Users (30d) — Area chart placeholder */}
        <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">New Users (30d)</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">User Growth</span>
            </div>
          </div>
          <div className="h-40 flex items-end">
            {(stats?.recentUsers || []).length > 0 ? (
              <div className="flex-1 w-full">
                <svg className="w-full h-40" viewBox="0 0 300 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const users = stats.recentUsers;
                    const maxU = Math.max(...users.map((u) => u.count), 1);
                    const points = users.map((u, i) => {
                      const x = (i / Math.max(users.length - 1, 1)) * 300;
                      const y = 110 - (u.count / maxU) * 100;
                      return `${x},${y}`;
                    });
                    const linePath = `M${points.join(" L")}`;
                    const areaPath = `${linePath} L300,120 L0,120 Z`;
                    return (
                      <>
                        <path d={areaPath} fill="url(#areaGrad)" />
                        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" />
                        {users.map((u, i) => {
                          const x = (i / Math.max(users.length - 1, 1)) * 300;
                          const y = 110 - (u.count / maxU) * 100;
                          return <circle key={i} cx={x} cy={y} r="2.5" fill="#10b981" />;
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-600 text-sm">No user growth data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Subscription Transactions */}
      <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">
            Recent Subscription Transactions
          </h3>
          <a href="/dashboard/admin/payments" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            View All Activity
          </a>
        </div>

        {recentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">User / Recruiter</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Plan Type</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left text-zinc-500 font-medium py-3 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, idx) => {
                  const statusKey = (p.status || "").toLowerCase() === "active" ? "success"
                    : (p.status || "").toLowerCase() === "pending" ? "pending" : "failed";
                  return (
                    <tr key={p._id?.$oid || p._id || idx} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                            {(p.email || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-zinc-200 text-sm">{p.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium">
                          {p.planName || p.plan || "Free"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">
                        #{p.transactionId || p._id?.$oid?.slice(-8) || "N/A"}
                      </td>
                      <td className="py-3 pr-4 text-zinc-200 font-medium">
                        ${p.amount ?? "0.00"}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">
                        {formatRelativeTime(p.createdAt?.$date || p.createdAt)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <StatusDot status={statusKey} />
                          <span className={`text-xs font-medium capitalize ${
                            statusKey === "success" ? "text-emerald-400"
                              : statusKey === "pending" ? "text-amber-400"
                              : "text-rose-400"
                          }`}>
                            {statusKey}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-zinc-600 text-sm">No recent transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
