"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Download,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

const PER_PAGE = 10;

/* ─────────────────────────── HELPERS ─────────────────────────── */

/** Format a number as USD currency */
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Safely extract an ObjectId string from possibly nested $oid */
function extractId(id) {
  if (!id) return "—";
  if (typeof id === "string") return id;
  if (id?.$oid) return id.$oid;
  return String(id);
}

/** Safely get user email from subscription — may be nested, may be missing */
function extractEmail(sub) {
  // Direct userEmail field
  if (sub.userEmail) return sub.userEmail;
  // Nested user object
  if (sub.user?.email) return sub.user.email;
  // Nested userId with email
  if (sub.userId?.email) return sub.userId.email;
  // Fallback to userId string
  return extractId(sub.userId);
}

/** Get a display name for the user (for avatar initials) */
function extractName(sub) {
  if (sub.userName) return sub.userName;
  if (sub.user?.name) return sub.user.name;
  if (sub.userId?.name) return sub.userId?.name;
  return extractEmail(sub);
}

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

/** 1. KPI stat card with colorful icon, label, large value */
function KpiStatCard({ icon: Icon, label, value, color = "#3B82F6" }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 h-[90px] flex items-center gap-4 hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
      aria-label={`${label}: ${value}`}
    >
      <div
        className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <p className="text-white text-xl font-semibold tracking-tight leading-none">{value}</p>
        <p className="text-[#71717A] text-xs mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

/** 2. Status badge — Active / Pending / Failed / Cancelled */
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
    cancelled: {
      cls: "bg-[#71717A]/15 text-[#71717A] border-[#71717A]/30",
      label: "Cancelled",
    },
    expired: {
      cls: "bg-[#71717A]/15 text-[#71717A] border-[#71717A]/30",
      label: "Expired",
    },
  };
  const cfg = map[s] || { cls: "bg-[#71717A]/15 text-[#71717A] border-[#71717A]/30", label: s || "Unknown" };
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

/** 6. Search input */
function SearchInput({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by email or plan…"
        aria-label="Search transactions"
        className="bg-[#0E0E11] border border-white/[0.08] rounded-full text-white text-sm pl-10 pr-4 py-2 outline-none placeholder-[#71717A] w-full sm:w-64 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] transition-colors"
      />
    </div>
  );
}

/** 7. Filter dropdown */
function FilterDropdown({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="appearance-none bg-[#0E0E11] border border-white/[0.08] rounded-[10px] text-white text-sm px-4 py-2 pr-9 outline-none cursor-pointer focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] transition-colors"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23A1A1AA' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** 8. Transaction row — desktop semantic table row */
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
        {txn.date
          ? new Date(txn.date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="py-3.5 pr-4 text-[12px] font-mono text-[#71717A]" title={txn.txnIdFull}>
        {txn.txnId}
      </td>
      <td className="py-3.5">
        <StatusBadge status={txn.status} />
      </td>
    </tr>
  );
}

/** 9. Transaction card — mobile card fallback */
function TransactionCard({ txn }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={txn.name} />
          <div className="min-w-0">
            <p className="text-[13px] text-white truncate">{txn.email}</p>
            <p className="text-[11px] font-mono text-[#71717A]" title={txn.txnIdFull}>{txn.txnId}</p>
          </div>
        </div>
        <StatusBadge status={txn.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlanPill plan={txn.plan} />
          <span className="text-[11px] text-[#71717A]">
            {txn.date
              ? new Date(txn.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
        <span className="text-[14px] font-semibold text-white">
          {txn.amount === 0 ? "Free" : `$${txn.amount.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

/** 10. Pagination */
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

/** 11. SVG bar chart — Revenue trend */
function BarChart({ data, highlightIndex }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3A3A40] mb-4">
          <TrendingUp size={24} className="text-[#71717A]" />
        </div>
        <p className="text-[14px] text-[#71717A]">No revenue data available for this period.</p>
      </div>
    );
  }

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
      aria-label="Bar chart showing revenue trend"
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

/** 12. Progress bar — plan distribution */
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

/** 13. Empty state */
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
  const { data: session, isPending: sessionPending } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Filter state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  /* ── Fetch data on mount ── */
  useEffect(() => {
    if (sessionPending || !session) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [subsRes, statsRes] = await Promise.all([
          protectedClientFetch("/api/subscriptions"),
          protectedClientFetch("/admin/stats"),
        ]);

        if (cancelled) return;

        // Subscriptions may come back as an array directly or nested
        const subs = Array.isArray(subsRes) ? subsRes : subsRes?.subscriptions || subsRes?.data || [];
        setSubscriptions(subs);

        if (statsRes && typeof statsRes === "object" && !Array.isArray(statsRes)) {
          setStats(statsRes);
        }
      } catch (err) {
        console.error("Failed to fetch payments data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [sessionPending, session]);

  /* ── CSV export ── */
  const exportCSV = useCallback(() => {
    if (!subscriptions.length) return;
    const headers = ["Email", "Plan", "Amount", "Date", "Status", "Transaction ID"];
    const rows = subscriptions.map((s) => [
      `"${(extractEmail(s) || "").replace(/"/g, '""')}"`,
      `"${(s.planName || s.planId || "Free").replace(/"/g, '""')}"`,
      s.amount ?? 0,
      `"${s.createdAt || ""}"`,
      s.status || "unknown",
      extractId(s._id),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscriptions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [subscriptions]);

  /* ── Normalize subscriptions into transaction rows ── */
  const transactions = useMemo(() => {
    return subscriptions.map((s) => {
      const id = extractId(s._id);
      const shortId = id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
      return {
        id,
        txnId: shortId,
        txnIdFull: id,
        email: extractEmail(s),
        name: extractName(s),
        plan: s.planName || s.planId || "Free",
        amount: typeof s.amount === "number" ? s.amount : 0,
        date: s.createdAt || null,
        status: s.status || "unknown",
      };
    });
  }, [subscriptions]);

  /* ── Unique plans for filter ── */
  const uniquePlans = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.plan) set.add(t.plan);
    });
    return Array.from(set).sort();
  }, [transactions]);

  /* ── Filter transactions ── */
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    if (statusFilter !== "all") {
      list = list.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (planFilter !== "all") {
      list = list.filter((t) => t.plan === planFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.email.toLowerCase().includes(q) ||
          t.plan.toLowerCase().includes(q) ||
          t.txnId.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, statusFilter, planFilter, searchQuery]);

  /* ── Client-side pagination on filtered data ── */
  const totalPages = Math.ceil(filteredTransactions.length / PER_PAGE);
  const pageStart = (currentPage - 1) * PER_PAGE;
  const pageData = filteredTransactions.slice(pageStart, pageStart + PER_PAGE);

  // Reset to page 1 if current page exceeds total after data/filter change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  /* ── Derive KPI values from stats ── */
  const kpis = useMemo(() => {
    const totalRevenue = stats?.totalRevenue ?? 0;
    const monthlyRevenue = stats?.monthlyRevenue ?? 0;
    const activeSeekerSubs = stats?.activeSeekerSubs ?? 0;
    const activeRecruiterSubs = stats?.activeRecruiterSubs ?? 0;
    const activeProUsers = activeSeekerSubs + activeRecruiterSubs;

    return [
      { icon: DollarSign, label: "Total Revenue", value: formatCurrency(totalRevenue), color: "#10B981" },
      { icon: TrendingUp, label: "Monthly Revenue", value: formatCurrency(monthlyRevenue), color: "#EC4899" },
      { icon: CalendarCheck, label: "Active Pro Users", value: String(activeProUsers), color: "#3B82F6" },
      { icon: CreditCard, label: "Total Subscriptions", value: String(subscriptions.length), color: "#F59E0B" },
    ];
  }, [stats, subscriptions.length]);

  /* ── Revenue trend: group subscriptions by day (last 7 days) ── */
  const revenueTrend = useMemo(() => {
    const now = new Date();
    const days = [];
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayKey = d.toISOString().slice(0, 10);
      days.push({
        date: dayKey,
        day: dayNames[d.getDay()],
        value: 0,
      });
    }

    subscriptions.forEach((s) => {
      if (!s.createdAt || s.amount == null) return;
      const createdDate = new Date(s.createdAt).toISOString().slice(0, 10);
      const dayEntry = days.find((d) => d.date === createdDate);
      if (dayEntry) {
        dayEntry.value += typeof s.amount === "number" ? s.amount : 0;
      }
    });

    return days;
  }, [subscriptions]);

  const maxDayIdx = useMemo(() => {
    if (revenueTrend.length === 0) return 0;
    return revenueTrend.reduce(
      (best, d, i) => (d.value > revenueTrend[best].value ? i : best),
      0
    );
  }, [revenueTrend]);

  /* ── Plan distribution from subscriptions ── */
  const planDistribution = useMemo(() => {
    if (subscriptions.length === 0) return [];
    const counts = {};
    subscriptions.forEach((s) => {
      const name = s.planName || s.planId || "Free";
      counts[name] = (counts[name] || 0) + 1;
    });
    const total = subscriptions.length;
    return Object.entries(counts)
      .map(([plan, count]) => ({
        plan,
        percentage: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [subscriptions]);

  /* ── Loading gate ── */
  if (sessionPending || loading) {
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

  /* ── Session gate ── */
  if (!session) return null;

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
        <ExportButton onClick={exportCSV} />
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiStatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} />
        </div>
        <FilterDropdown
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          label="Filter by status"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
            { value: "cancelled", label: "Cancelled" },
            { value: "expired", label: "Expired" },
          ]}
        />
        <FilterDropdown
          value={planFilter}
          onChange={(v) => { setPlanFilter(v); setCurrentPage(1); }}
          label="Filter by plan"
          options={[
            { value: "all", label: "All Plans" },
            ...uniquePlans.map((p) => ({ value: p, label: p })),
          ]}
        />
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">
            Recent Transactions
          </h2>
          <span className="text-[12px] text-[#71717A]">
            {filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState icon={Inbox} message="No transactions found matching your filters." />
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
          <BarChart data={revenueTrend} highlightIndex={maxDayIdx} />
        </div>

        {/* Plan Distribution */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 space-y-5">
          <h2 className="text-[15px] font-semibold text-white">
            Plan Distribution
          </h2>
          {planDistribution.length === 0 ? (
            <EmptyState icon={Inbox} message="No plan data available." />
          ) : (
            <div className="space-y-5">
              {planDistribution.map((p) => (
                <ProgressBar
                  key={p.plan}
                  label={p.plan}
                  percentage={p.percentage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPaymentsPage;