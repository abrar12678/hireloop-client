"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Download,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

/* ─────────────────────────── MOCK DATA ─────────────────────────── */

const MOCK_TRANSACTIONS = [
  { id: 1, email: "alice.morrison@gmail.com", name: "Alice Morrison", plan: "Enterprise", amount: 299, date: "2025-01-18", txnId: "TRN-000000001", status: "active" },
  { id: 2, email: "brian.chen@outlook.com", name: "Brian Chen", plan: "Professional", amount: 49, date: "2025-01-17", txnId: "TRN-000000002", status: "active" },
  { id: 3, email: "carla.diaz@yahoo.com", name: "Carla Diaz", plan: "Free", amount: 0, date: "2025-01-17", txnId: "TRN-000000003", status: "active" },
  { id: 4, email: "derek.okonkwo@proton.me", name: "Derek Okonkwo", plan: "Starter", amount: 19, date: "2025-01-16", txnId: "TRN-000000004", status: "pending" },
  { id: 5, email: "eva.kowalski@gmail.com", name: "Eva Kowalski", plan: "Professional", amount: 49, date: "2025-01-16", txnId: "TRN-000000005", status: "failed" },
  { id: 6, email: "frank.nakamura@company.io", name: "Frank Nakamura", plan: "Enterprise", amount: 299, date: "2025-01-15", txnId: "TRN-000000006", status: "active" },
  { id: 7, email: "grace.iliadis@mail.com", name: "Grace Iliadis", plan: "Starter", amount: 19, date: "2025-01-15", txnId: "TRN-000000007", status: "active" },
  { id: 8, email: "hugo.pereira@techcorp.co", name: "Hugo Pereira", plan: "Enterprise", amount: 299, date: "2025-01-14", txnId: "TRN-000000008", status: "active" },
  { id: 9, email: "iris.johansson@startup.dev", name: "Iris Johansson", plan: "Free", amount: 0, date: "2025-01-14", txnId: "TRN-000000009", status: "active" },
  { id: 10, email: "jake.ramirez@gmail.com", name: "Jake Ramirez", plan: "Professional", amount: 49, date: "2025-01-13", txnId: "TRN-000000010", status: "pending" },
];

const REVENUE_DATA = [
  { day: "MON", value: 520 },
  { day: "TUE", value: 780 },
  { day: "WED", value: 650 },
  { day: "THU", value: 1240 },
  { day: "FRI", value: 980 },
  { day: "SAT", value: 430 },
  { day: "SUN", value: 310 },
];

const PLAN_DISTRIBUTION = [
  { plan: "Free", percentage: 62 },
  { plan: "Starter", percentage: 18 },
  { plan: "Professional", percentage: 14 },
  { plan: "Enterprise", percentage: 6 },
];

const PER_PAGE = 10;

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

/** 1. KPI stat card with icon, label, large value, change % */
function KpiStatCard({ icon: Icon, label, value, change }) {
  const isPositive = change.startsWith("+");
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 h-[90px] flex flex-col justify-between"
      aria-label={`${label}: ${value}, ${change} from last period`}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-[#3A3A40]">
          <Icon size={18} className="text-[#A1A1AA]" />
        </div>
        <span
          className={`text-[12px] font-medium ${isPositive ? "text-[#22C55E]" : "text-[#EF4444]"}`}
        >
          {change}
        </span>
      </div>
      <div>
        <p className="text-[36px] font-bold leading-none text-white">{value}</p>
        <p className="text-[12px] text-[#71717A] mt-1">{label}</p>
      </div>
    </div>
  );
}

/** 2. Status badge — Success / Pending / Failed */
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    active: {
      cls: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
      label: "Active",
    },
    success: {
      cls: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
      label: "Success",
    },
    pending: {
      cls: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
      label: "Pending",
    },
    failed: {
      cls: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
      label: "Failed",
    },
  };
  const cfg = map[s] || map.pending;
  return (
    <span
      className={`inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full border capitalize ${cfg.cls}`}
      role="status"
      aria-label={cfg.label}
    >
      {cfg.label}
    </span>
  );
}

/** 3. Plan pill */
function PlanPill({ plan }) {
  return (
    <span className="bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-full capitalize">
      {plan || "Free"}
    </span>
  );
}

/** 4. User avatar — 8×8 (w-8 h-8) with initials */
function UserAvatar({ name }) {
  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#3A3A40] flex items-center justify-center text-[12px] font-bold text-[#A1A1AA] shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/** 5. Export CSV button */
function ExportButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-white text-black rounded-[10px] hover:bg-zinc-200 text-[13px] font-medium px-4 py-2 transition-colors"
      aria-label="Export transactions as CSV"
    >
      <Download size={15} />
      Export CSV
    </button>
  );
}

/** 6. Transaction row — desktop semantic table row */
function TransactionRow({ txn }) {
  return (
    <tr className="border-b border-white/[0.04] hover:bg-[#222228] transition-colors">
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={txn.name} />
          <span className="text-[13px] text-white">{txn.email}</span>
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <PlanPill plan={txn.plan} />
      </td>
      <td className="py-3.5 pr-4 text-[13px] font-medium text-white">
        {txn.amount === 0 ? "Free" : `$${txn.amount.toFixed(2)}`}
      </td>
      <td className="py-3.5 pr-4 text-[13px] text-[#A1A1AA]">
        {new Date(txn.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })}
      </td>
      <td className="py-3.5 pr-4 text-[12px] font-mono text-[#71717A]">
        {txn.txnId}
      </td>
      <td className="py-3.5">
        <StatusBadge status={txn.status} />
      </td>
    </tr>
  );
}

/** 7. Transaction card — mobile card fallback */
function TransactionCard({ txn }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={txn.name} />
          <div className="min-w-0">
            <p className="text-[13px] text-white truncate">{txn.email}</p>
            <p className="text-[11px] font-mono text-[#71717A]">{txn.txnId}</p>
          </div>
        </div>
        <StatusBadge status={txn.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlanPill plan={txn.plan} />
          <span className="text-[11px] text-[#71717A]">
            {new Date(txn.date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        <span className="text-[14px] font-semibold text-white">
          {txn.amount === 0 ? "Free" : `$${txn.amount.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

/** 8. Pagination */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="flex items-center justify-between pt-4 border-t border-white/[0.05]"
      aria-label="Transactions pagination"
    >
      <p className="text-[12px] text-[#71717A]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-medium transition-colors ${
              p === currentPage
                ? "bg-white text-black"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40]"
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#A1A1AA] hover:text-white hover:bg-[#3A3A40] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

/** 9. SVG bar chart — Revenue trend (7 days) */
function BarChart({ data, highlightIndex }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const chartW = 100;
  const chartH = 100;
  const gap = 4;
  const barW = (chartW - gap * (barCount + 1)) / barCount;

  return (
    <div
      className="w-full"
      style={{ height: "280px" }}
      role="img"
      aria-label="Bar chart showing revenue trend for the last 7 days"
    >
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 12}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartH * 0.85;
          const x = gap + i * (barW + gap);
          const y = chartH - barH;
          const isHighlight = i === highlightIndex;
          return (
            <g key={d.day}>
              <title>{`${d.day}: $${d.value}`}</title>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                className="cursor-pointer transition-colors"
                fill={isHighlight ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"}
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3}
                className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                fill="rgba(255,255,255,0.25)"
              />
              <text
                x={x + barW / 2}
                y={chartH + 10}
                textAnchor="middle"
                fill="#71717A"
                fontSize="4.5"
                fontFamily="system-ui, sans-serif"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** 10. Progress bar — plan distribution */
function ProgressBar({ label, percentage }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-white capitalize">{label}</span>
        <span className="text-[13px] text-[#A1A1AA]">{percentage}%</span>
      </div>
      <div
        className="w-full h-[6px] rounded-full bg-[#3A3A40] overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentage}%`}
      >
        <div
          className="h-full rounded-full bg-white/[0.3] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/** 11. Empty state */
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3A3A40] mb-4">
        <Icon size={24} className="text-[#71717A]" />
      </div>
      <p className="text-[14px] text-[#71717A]">{message}</p>
    </div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

function AdminPaymentsPage() {
  const { data: session, isPending } = useSession();
  const [currentPage, setCurrentPage] = useState(1);

  /* Loading gate */
  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading payments data"
        />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  /* KPI data (static mock) */
  const kpis = [
    { icon: DollarSign, label: "Total Revenue", value: "$48,520", change: "+12.4%" },
    { icon: TrendingUp, label: "Monthly Revenue", value: "$8,240", change: "+8.1%" },
    { icon: Users, label: "Active Pro Users", value: "127", change: "+2.3%" },
    { icon: Building2, label: "Active Enterprise", value: "34", change: "+15.7%" },
  ];

  /* Pagination */
  const totalPages = Math.ceil(MOCK_TRANSACTIONS.length / PER_PAGE);
  const pageStart = (currentPage - 1) * PER_PAGE;
  const pageData = MOCK_TRANSACTIONS.slice(pageStart, pageStart + PER_PAGE);

  /* Find the highest revenue day for highlight */
  const maxDayIdx = REVENUE_DATA.reduce(
    (best, d, i) => (d.value > REVENUE_DATA[best].value ? i : best),
    0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight text-white leading-none">
            Payments &amp; Subscriptions
          </h1>
          <p className="text-[14px] text-[#71717A] mt-2">
            Monitor revenue, subscriptions, and transaction activity across the platform.
          </p>
        </div>
        <ExportButton onClick={() => {}} />
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 space-y-4">
        <h2 className="text-[15px] font-semibold text-white">
          Recent Transactions
        </h2>

        {MOCK_TRANSACTIONS.length === 0 ? (
          <EmptyState icon={Inbox} message="No transactions found." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto" role="region" aria-label="Transactions table">
              <table className="w-full text-left" aria-label="Recent transactions">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3 pr-4">
                      User / Email
                    </th>
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3 pr-4">
                      Plan
                    </th>
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3 pr-4">
                      Amount
                    </th>
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3 pr-4">
                      Date
                    </th>
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3 pr-4">
                      Transaction ID
                    </th>
                    <th className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {pageData.map((txn) => (
                <TransactionCard key={txn.id} txn={txn} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-white">
            Revenue Trend (Last 7 Days)
          </h2>
          <BarChart data={REVENUE_DATA} highlightIndex={maxDayIdx} />
        </div>

        {/* Plan Distribution */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 space-y-5">
          <h2 className="text-[15px] font-semibold text-white">
            Plan Distribution
          </h2>
          <div className="space-y-5">
            {PLAN_DISTRIBUTION.map((p) => (
              <ProgressBar
                key={p.plan}
                label={p.plan}
                percentage={p.percentage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPaymentsPage;