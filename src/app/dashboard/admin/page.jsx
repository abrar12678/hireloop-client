"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth-client";
import { getAdminStats } from "@/lib/api-client/admin";
import {
  Users, UserSearch, UserCog, Building2, Briefcase,
  FileText, DollarSign, Inbox, Zap, TrendingUp, Activity,
} from "lucide-react";

/* ─── Recharts (dynamic, SSR disabled) ─────────────────────────────── */
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });

/* ─── Helpers ──────────────────────────────────────────────────────── */
function fmt(n) { return n != null ? n.toLocaleString() : "0"; }
function fmtCur(n) { return n != null ? `$${n.toLocaleString()}` : "$0"; }
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function planLabel(id) {
  if (!id) return "—";
  const p = id.replace(/^(plan_)?/i, "").replace(/_/g, " ");
  return p.charAt(0).toUpperCase() + p.slice(1);
}
function initials(email) { return (email || "?").slice(0, 2).toUpperCase(); }

/* ─── KPI Card ─────────────────────────────────────────────────────── */
function KpiCard({ label, value, Icon, color }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200">
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-[#71717A] uppercase tracking-wide font-medium">{label}</p>
        <p className="text-[26px] font-bold text-white leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Chart Card ───────────────────────────────────────────────────── */
function ChartCard({ title, legend, legendColor, children }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        {legend && (
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${legendColor || "bg-white"}`} />
            <span className="text-[12px] text-[#71717A]">{legend}</span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────────── */
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <Inbox size={28} className="text-[#3A3A40]" aria-hidden="true" />
      <p className="text-[14px] text-[#71717A]">{message || "No data available"}</p>
    </div>
  );
}

/* ─── Shared Tooltip Style ─────────────────────────────────────────── */
const ttStyle = {
  contentStyle: { background: "#222228", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 13 },
  labelStyle: { color: "#A1A1AA" },
  itemStyle: { color: "#fff" },
};

/* ═════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═════════════════════════════════════════════════════════════════════ */
function AdminDashboardPage() {
  const { isPending } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    const load = async () => {
      try {
        const data = await getAdminStats();
        setStats(data && !Array.isArray(data) ? data : null);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isPending]);

  /* ── Loading ── */
  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading dashboard data…</span>
      </div>
    );
  }

  const s = stats || {};

  /* ── KPIs with colorful icons ── */
  const kpis = [
    { label: "Total Users", value: fmt(s.totalUsers), Icon: Users, color: "#3B82F6" },
    { label: "Seekers", value: fmt(s.totalSeekers), Icon: UserSearch, color: "#8B5CF6" },
    { label: "Recruiters", value: fmt(s.totalRecruiters), Icon: UserCog, color: "#A855F7" },
    { label: "Companies", value: fmt(s.totalCompanies), Icon: Building2, color: "#FACC15" },
    { label: "Total Jobs", value: fmt(s.totalJobs), Icon: Briefcase, color: "#22C55E" },
    { label: "Active Jobs", value: fmt(s.activeJobs), Icon: Zap, color: "#F97316" },
    { label: "Applications", value: fmt(s.totalApplications), Icon: FileText, color: "#F59E0B" },
    { label: "Total Revenue", value: fmtCur(s.totalRevenue), Icon: DollarSign, color: "#10B981" },
    { label: "Monthly Revenue", value: fmtCur(s.monthlyRevenue), Icon: TrendingUp, color: "#EC4899" },
  ];

  /* ── Chart data ── */
  const categoryData = (s.jobsByCategory || []).map((c) => ({ name: c._id, count: c.count || 0 }));
  const userData = (s.recentUsers || []).map((u) => ({ date: u._id, count: u.count || 0 }));
  const payments = s.recentPayments || [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Dashboard Overview</h1>
        <p className="text-[15px] text-[#71717A] mt-1">Monitor platform performance and recent activity</p>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar: Jobs by Category */}
        <ChartCard title="Jobs by Category" legend="Job Count" legendColor="bg-[#3B82F6]">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...ttStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No job category data yet" />
          )}
        </ChartCard>

        {/* Area: User Registrations */}
        <ChartCard title="User Registrations (30d)" legend="New Users" legendColor="bg-[#22C55E]">
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={userData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...ttStyle} />
                <Area type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} fill="url(#adminAreaGrad)" dot={false} activeDot={{ r: 5, fill: "#22C55E" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No user registration data yet" />
          )}
        </ChartCard>
      </div>

      {/* ── Recent Payments ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-white">Recent Payments</h3>
          <Link href="/dashboard/admin/payments" className="text-[13px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors">View All</Link>
        </div>

        {payments.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" aria-label="Recent payments">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Email</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Plan</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Amount</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Date</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-[#222228] transition-colors h-[56px]">
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#3A3A40] rounded-[10px] flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-semibold text-[#A1A1AA]">{initials(p.email)}</span>
                          </div>
                          <span className="text-[13px] text-white truncate max-w-[200px]">{p.email}</span>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border bg-white/[0.06] text-[#A1A1AA] border-white/[0.08]">
                          {planLabel(p.planId)}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] font-semibold text-white">{fmtCur(p.amount)}</td>
                      <td className="px-4 text-[12px] text-[#71717A]">{fmtDate(p.createdAt)}</td>
                      <td className="px-4">
                        <span className="inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {payments.map((p, i) => (
                <div key={i} className="bg-[#222228] rounded-[12px] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white truncate">{p.email}</span>
                    <span className="text-[13px] font-semibold text-white">{fmtCur(p.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#A1A1AA]">{planLabel(p.planId)}</span>
                    <span className="text-[12px] text-[#71717A]">{fmtDate(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState message="No recent payments" />
        )}
      </div>

      {/* ── Recent Users ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-white">Recent Users</h3>
          <Link href="/dashboard/admin/users" className="text-[13px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors">View All</Link>
        </div>

        {(s.recentUsersList || []).length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full" aria-label="Recent users">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Name</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Email</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Role</th>
                    <th className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(s.recentUsersList || []).map((u, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-[#222228] transition-colors h-[56px]">
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3A3A40] flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-semibold text-[#A1A1AA]">{(u.name || "U").slice(0, 2).toUpperCase()}</span>
                          </div>
                          <span className="text-[13px] text-white truncate max-w-[200px]">{u.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 text-[13px] text-[#A1A1AA]">{u.email || "—"}</td>
                      <td className="px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border bg-white/[0.06] text-[#A1A1AA] border-white/[0.08] capitalize">
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 text-[12px] text-[#71717A]">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {(s.recentUsersList || []).map((u, i) => (
                <div key={i} className="bg-[#222228] rounded-[12px] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white truncate">{u.name || "—"}</span>
                    <span className="text-[12px] text-[#A1A1AA] capitalize">{u.role || "user"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#71717A]">{u.email || "—"}</span>
                    <span className="text-[12px] text-[#71717A]">{fmtDate(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState message="No recent users" />
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;