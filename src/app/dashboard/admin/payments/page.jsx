"use client";

import React, { useEffect, useState } from "react";
import { protectedClientFetch } from "@/lib/core/client";
import { CircleDollar, ChartLineArrowUp, FileText, Person } from "@gravity-ui/icons";

const StatusPill = ({ status }) => {
  const s = (status || "").toLowerCase();
  const styles = {
    active: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    success: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
    pending: "bg-amber-950/40 text-amber-400 border-amber-800/40",
    failed: "bg-rose-950/40 text-rose-400 border-rose-800/40",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border uppercase ${styles[s] || styles.pending}`}>
      {s === "active" ? "SUCCESS" : s || "UNKNOWN"}
    </span>
  );
};

const PlanPill = ({ plan }) => {
  return (
    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium capitalize">
      {plan || "Free"}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    protectedClientFetch("/subscriptions").then((data) => {
      const list = Array.isArray(data) ? data : data?.subscriptions || data?.payments || [];
      setPayments(list);
      setLoading(false);
    });
  }, []);

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const now = new Date();
  const monthlyRevenue = payments
    .filter((p) => {
      const d = new Date(p.createdAt?.$date || p.createdAt || p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  // Count active enterprise/pro users
  const activeEnterprise = payments.filter(
    (p) => p.status === "active" && (p.planName?.toLowerCase().includes("enterprise") || p.plan?.includes("enterprise"))
  ).length;
  const activePro = payments.filter(
    (p) => p.status === "active" && (p.planName?.toLowerCase().includes("pro") || p.plan?.includes("pro") || p.plan?.includes("professional"))
  ).length;

  const statCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, change: "+12.4%", icon: CircleDollar },
    { label: "Monthly Revenue", value: `$${monthlyRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, change: "+8.1%", icon: ChartLineArrowUp },
    { label: "Active Pro Users", value: activePro.toLocaleString(), change: "+2.3%", icon: Person },
    { label: "Active Enterprise", value: activeEnterprise.toLocaleString(), change: "+15.7%", icon: FileText },
  ];

  // Plan distribution
  const planCounts = {};
  payments.forEach((p) => {
    const name = p.planName || p.plan || "Free";
    const base = name.toLowerCase().includes("enterprise") ? "Enterprise"
      : name.toLowerCase().includes("pro") || name.toLowerCase().includes("professional") ? "Professional"
      : name.toLowerCase().includes("starter") ? "Starter"
      : "Free";
    planCounts[base] = (planCounts[base] || 0) + 1;
  });
  const totalPlanCount = Object.values(planCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Payments & Subscriptions</h2>
          <p className="text-sm text-zinc-500 mt-1">Comprehensive overview of platform revenue and active subscriptions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Filter
          </button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                <card.icon width={20} height={20} />
              </div>
              <span className="text-xs font-medium text-emerald-400">{card.change}</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-xs text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200">Recent Transactions</h3>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">User Email</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Plan</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left text-zinc-500 font-medium py-3 pr-4 text-xs uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left text-zinc-500 font-medium py-3 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((p, idx) => (
                  <tr key={p._id?.$oid || p._id || idx} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                    <td className="py-3 pr-4 text-zinc-300">{p.userEmail || p.email || "N/A"}</td>
                    <td className="py-3 pr-4"><PlanPill plan={p.planName || p.plan} /></td>
                    <td className="py-3 pr-4 text-zinc-200 font-medium">${parseFloat(p.amount || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 text-xs">{formatDate(p.createdAt?.$date || p.createdAt)}</span>
                        <span className="text-zinc-600 text-xs">{formatRelativeTime(p.createdAt?.$date || p.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">
                      TRN-{String(p.transactionId || p._id?.$oid || idx).padStart(9, "0")}
                    </td>
                    <td className="py-3"><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <CircleDollar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No payment records found.</p>
          </div>
        )}

        {/* Pagination footer */}
        {payments.length > 10 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40">
            <p className="text-xs text-zinc-500">Showing 1 to 10 of {payments.length} transactions</p>
          </div>
        )}
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend (placeholder) */}
        <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Revenue Trend (Last 7 Days)</h3>
          <div className="flex items-end gap-3 h-32">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => {
              const height = 30 + Math.random() * 60;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-purple-500/60 hover:bg-purple-500 transition-colors" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-zinc-600">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-[#141419] border border-zinc-800/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Plan Distribution</h3>
          <div className="space-y-4">
            {Object.entries(planCounts).map(([plan, count]) => {
              const pct = ((count / totalPlanCount) * 100).toFixed(0);
              return (
                <div key={plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300 capitalize">{plan}</span>
                    <span className="text-sm text-zinc-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
