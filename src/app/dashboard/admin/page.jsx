"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  FileText,
  Building2,
  Briefcase,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Inbox,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const KPI_DATA = [
  { id: "users", label: "Total Users", value: "24.5K", change: "+12%", up: true, icon: Users },
  { id: "applications", label: "Total Applications", value: "8.2K", change: "+4%", up: true, icon: FileText },
  { id: "companies", label: "Total Companies", value: "342", change: "+8%", up: true, icon: Building2 },
  { id: "jobs", label: "Job Posts", value: "1,247", change: "+11%", up: true, icon: Briefcase },
  { id: "revenue", label: "Platform Revenue", value: "$48.5K", change: "+18.5%", up: true, icon: DollarSign },
];

const BAR_DATA = [
  { label: "Technology", value: 42 },
  { label: "Design", value: 18 },
  { label: "Marketing", value: 24 },
  { label: "Sales", value: 31 },
  { label: "Finance", value: 15 },
  { label: "HR", value: 22 },
];

const AREA_DATA = [
  15, 18, 22, 20, 25, 28, 24, 30, 27, 32, 29, 35, 33, 38, 36,
  40, 37, 42, 39, 44, 41, 45, 43, 40, 38, 42, 44, 39, 37, 35,
];

const TRANSACTIONS = [
  {
    id: 1,
    email: "sarah.chen@techcorp.io",
    initials: "SC",
    plan: "Enterprise",
    transactionId: "TXN-8F2A4D91",
    amount: "$299.00",
    date: "Dec 18, 2024",
    status: "success",
  },
  {
    id: 2,
    email: "marcus.rivera@startup.co",
    initials: "MR",
    plan: "Pro",
    transactionId: "TXN-3B7C1E56",
    amount: "$49.00",
    date: "Dec 17, 2024",
    status: "success",
  },
  {
    id: 3,
    email: "emma.watson@design.co",
    initials: "EW",
    plan: "Pro",
    transactionId: "TXN-6D4F8A23",
    amount: "$49.00",
    date: "Dec 17, 2024",
    status: "pending",
  },
  {
    id: 4,
    email: "james.park@finance.net",
    initials: "JP",
    plan: "Free",
    transactionId: "TXN-1E9B3C74",
    amount: "$0.00",
    date: "Dec 16, 2024",
    status: "success",
  },
  {
    id: 5,
    email: "olivia.nguyen@sales.io",
    initials: "ON",
    plan: "Enterprise",
    transactionId: "TXN-5A2D7F48",
    amount: "$299.00",
    date: "Dec 16, 2024",
    status: "failed",
  },
  {
    id: 6,
    email: "david.kim@hr-solutions.com",
    initials: "DK",
    plan: "Pro",
    transactionId: "TXN-9C6E2B15",
    amount: "$49.00",
    date: "Dec 15, 2024",
    status: "success",
  },
  {
    id: 7,
    email: "lisa.thompson@marketing.co",
    initials: "LT",
    plan: "Free",
    transactionId: "TXN-4F1A8D67",
    amount: "$0.00",
    date: "Dec 15, 2024",
    status: "pending",
  },
  {
    id: 8,
    email: "alex.moreno@tech.dev",
    initials: "AM",
    plan: "Enterprise",
    transactionId: "TXN-7G3H5I92",
    amount: "$299.00",
    date: "Dec 14, 2024",
    status: "success",
  },
];

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  success: {
    label: "Success",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
    border: "border-[#22C55E]/30",
    dot: "bg-[#22C55E]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  failed: {
    label: "Failed",
    bg: "bg-[#EF4444]/15",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]/30",
    dot: "bg-[#EF4444]",
  },
};

const PLAN_CONFIG = {
  Enterprise: {
    bg: "bg-[#3B82F6]/15",
    text: "text-[#3B82F6]",
    border: "border-[#3B82F6]/30",
  },
  Pro: {
    bg: "bg-white/[0.06]",
    text: "text-[#A1A1AA]",
    border: "border-white/[0.08]",
  },
  Free: {
    bg: "bg-white/[0.06]",
    text: "text-[#71717A]",
    border: "border-white/[0.08]",
  },
};

// ─── 1. KpiStatCard ──────────────────────────────────────────────────────────

function KpiStatCard({ icon: Icon, label, value, change, up }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.18)] h-[90px]"
    >
      <div className="w-9 h-9 bg-[#3A3A40] rounded-[10px] flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#A1A1AA]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#71717A] uppercase tracking-wide truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[36px] font-bold text-white leading-none">
            {value}
          </span>
        </div>
      </div>
      <div
        className={`flex items-center gap-0.5 text-[12px] font-medium shrink-0 ${
          up ? "text-[#22C55E]" : "text-[#EF4444]"
        }`}
      >
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
  );
}

// ─── 2. StatusBadge ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.success;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── 3. StatusDot ────────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.success;
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[12px] font-medium ${cfg.text}`}>{cfg.label}</span>
    </span>
  );
}

// ─── 4. ChartCard ────────────────────────────────────────────────────────────

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

// ─── 5. BarChart ─────────────────────────────────────────────────────────────

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartH = 200;
  const barW = 32;
  const gap = (400 - data.length * barW) / (data.length + 1);
  const topPad = 10;

  return (
    <svg
      viewBox="0 0 400 260"
      className="w-full"
      role="img"
      aria-label="Bar chart of job posts by category"
    >
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = topPad + (1 - pct) * chartH;
        return (
          <line
            key={pct}
            x1={0}
            y1={y}
            x2={400}
            y2={y}
            stroke="white"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = gap + i * (barW + gap);
        const barH = Math.max((d.value / max) * chartH, 4);
        const y = topPad + chartH - barH;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill="white"
              fillOpacity={i === 0 ? 0.9 : 0.15}
              className="transition-all duration-200"
            />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="text-[10px]"
              fill="#A1A1AA"
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={topPad + chartH + 18}
              textAnchor="middle"
              className="text-[10px]"
              fill="#71717A"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 6. AreaChart ────────────────────────────────────────────────────────────

function AreaChart({ data }) {
  const max = Math.max(...data, 1);
  const w = 400;
  const h = 200;
  const padX = 0;
  const padTop = 10;
  const step = (w - padX * 2) / (data.length - 1);

  const points = data.map((v, i) => ({
    x: padX + i * step,
    y: padTop + h - (v / max) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padTop + h} L${points[0].x},${padTop + h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} 260`}
      className="w-full"
      role="img"
      aria-label="Area chart of new users over 30 days"
    >
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.12} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padTop + (1 - pct) * h;
        return (
          <line
            key={pct}
            x1={0}
            y1={y}
            x2={w}
            y2={y}
            stroke="white"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        );
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGradient)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot highlight */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill="white" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={7} fill="white" fillOpacity={0.15} />
      {/* X-axis labels */}
      {["Day 1", "Day 10", "Day 20", "Day 30"].map((label, i) => {
        const idx = i * 9;
        const safeIdx = Math.min(idx, data.length - 1);
        const x = padX + safeIdx * step;
        return (
          <text
            key={label}
            x={x}
            y={padTop + h + 18}
            textAnchor="middle"
            className="text-[10px]"
            fill="#71717A"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── 7. TransactionRow ───────────────────────────────────────────────────────

function TransactionRow({ tx }) {
  const planCfg = PLAN_CONFIG[tx.plan] || PLAN_CONFIG.Free;
  return (
    <tr className="border-b border-white/[0.04] hover:bg-[#222228] transition-colors h-[60px]">
      <th scope="row" className="text-left py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3A3A40] rounded-[10px] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-[#A1A1AA]">{tx.initials}</span>
          </div>
          <span className="text-[13px] text-white truncate max-w-[180px]">{tx.email}</span>
        </div>
      </th>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${planCfg.bg} ${planCfg.text} ${planCfg.border}`}
        >
          {tx.plan}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-[12px] text-[#71717A] font-mono">{tx.transactionId}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-[13px] font-semibold text-white">{tx.amount}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-[12px] text-[#71717A]">{tx.date}</span>
      </td>
      <td className="py-3 px-4">
        <StatusDot status={tx.status} />
      </td>
    </tr>
  );
}

// ─── 8. TransactionCard ──────────────────────────────────────────────────────

function TransactionCard({ tx }) {
  const planCfg = PLAN_CONFIG[tx.plan] || PLAN_CONFIG.Free;
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3A3A40] rounded-[10px] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-[#A1A1AA]">{tx.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-white truncate">{tx.email}</p>
            <p className="text-[12px] text-[#71717A] font-mono">{tx.transactionId}</p>
          </div>
        </div>
        <span className="text-[13px] font-semibold text-white">{tx.amount}</span>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${planCfg.bg} ${planCfg.text} ${planCfg.border}`}
        >
          {tx.plan}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#71717A]">{tx.date}</span>
          <StatusBadge status={tx.status} />
        </div>
      </div>
    </div>
  );
}

// ─── 9. Pagination ───────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav
      className="flex items-center justify-between pt-4"
      aria-label="Transaction pagination"
    >
      <p className="text-[12px] text-[#71717A]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-white/[0.06] bg-[#1B1B1F] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-[12px] font-medium transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
              page === currentPage
                ? "bg-white text-black"
                : "border border-white/[0.06] bg-[#1B1B1F] text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-white/[0.06] bg-[#1B1B1F] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

// ─── 10. EmptyState ──────────────────────────────────────────────────────────

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 bg-[#3A3A40] rounded-[10px] flex items-center justify-center">
        <Inbox size={22} className="text-[#71717A]" />
      </div>
      <p className="text-[14px] text-[#71717A]">{message || "No data available"}</p>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div role="status">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading dashboard data…</span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function AdminDashboardPage() {
  const { isPending } = useSession();

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[15px] text-[#71717A] mt-1">
            Monitor platform performance and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] hover:bg-[#222228] hover:text-white transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            aria-label="Select time range"
          >
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-white text-black rounded-[10px] hover:bg-zinc-200 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            aria-label="Export report"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {KPI_DATA.map((kpi) => (
          <KpiStatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* ── Charts Section ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Job Posts by Category" legend="Active Listings" legendColor="bg-white">
          <BarChart data={BAR_DATA} />
        </ChartCard>
        <ChartCard title="New Users (30d)" legend="User Growth" legendColor="bg-white">
          <AreaChart data={AREA_DATA} />
        </ChartCard>
      </div>

      {/* ── Recent Transactions ─────────────────────────────────────── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-white">Recent Transactions</h3>
          <Link
            href="/dashboard/admin/payments"
            className="text-[13px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-[10px] outline-none"
          >
            View All
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {TRANSACTIONS.length > 0 ? (
            <table
              className="w-full"
              role="table"
              aria-label="Recent subscription transactions"
            >
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    User / Recruiter
                  </th>
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    Plan Type
                  </th>
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    Transaction ID
                  </th>
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    Amount
                  </th>
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    Date
                  </th>
                  <th scope="col" className="text-left text-[11px] text-[#71717A] font-medium uppercase tracking-wide py-3 px-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState message="No recent transactions" />
          )}
        </div>

        {/* Mobile Card Fallback */}
        <div className="md:hidden space-y-3">
          {TRANSACTIONS.length > 0 ? (
            TRANSACTIONS.map((tx) => <TransactionCard key={tx.id} tx={tx} />)
          ) : (
            <EmptyState message="No recent transactions" />
          )}
        </div>

        {/* Pagination */}
        <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
      </div>
    </div>
  );
}

export default AdminDashboardPage;