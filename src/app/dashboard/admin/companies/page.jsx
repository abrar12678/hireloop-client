"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Building2,
  Clock,
  ShieldCheck,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Timer,
  Percent,
  BarChart3,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_COMPANIES = [
  {
    id: "1",
    name: "TechFlow Inc.",
    email: "recruiter@techflow.io",
    industry: "Technology",
    status: "Pending",
    dateSubmitted: "2025-01-12",
  },
  {
    id: "2",
    name: "FinGrid",
    email: "hiring@fingrid.com",
    industry: "Fintech",
    status: "Approved",
    dateSubmitted: "2025-01-08",
  },
  {
    id: "3",
    name: "CloudApps",
    email: "jobs@cloudapps.dev",
    industry: "SaaS",
    status: "Approved",
    dateSubmitted: "2024-12-30",
  },
  {
    id: "4",
    name: "DataSync",
    email: "careers@datasync.ai",
    industry: "Data Analytics",
    status: "Pending",
    dateSubmitted: "2025-01-14",
  },
  {
    id: "5",
    name: "NeuralPath",
    email: "talent@neuralpath.com",
    industry: "AI/ML",
    status: "Rejected",
    dateSubmitted: "2025-01-05",
  },
  {
    id: "6",
    name: "DesignLab",
    email: "hr@designlab.co",
    industry: "Design",
    status: "Approved",
    dateSubmitted: "2024-12-22",
  },
  {
    id: "7",
    name: "ScaleUp",
    email: "people@scaleup.io",
    industry: "Startup",
    status: "Pending",
    dateSubmitted: "2025-01-15",
  },
  {
    id: "8",
    name: "Quantum Labs",
    email: "recruit@quantumlabs.org",
    industry: "Research",
    status: "Rejected",
    dateSubmitted: "2024-12-18",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: get initials from a company name                            */
/* ------------------------------------------------------------------ */

function getInitials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  1. KpiStatCard                                                     */
/* ------------------------------------------------------------------ */

function KpiStatCard({ icon: Icon, label, value, change, trend }) {
  const trendColor =
    trend === "up"
      ? "text-[#22C55E]"
      : trend === "down"
        ? "text-[#EF4444]"
        : "text-[#71717A]";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] h-[90px] flex items-center gap-4 px-5"
      aria-label={`${label}: ${value}`}
    >
      <div className="w-10 h-10 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
        <Icon size={20} className="text-[#A1A1AA]" />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-white text-xl font-semibold tracking-tight leading-none">
          {value}
        </span>
        <span className="text-[#71717A] text-xs mt-1 truncate">{label}</span>
        <span className={`text-[11px] mt-0.5 flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={12} />
          {change}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. StatusDot                                                       */
/* ------------------------------------------------------------------ */

function StatusDot({ status }) {
  const colorMap = {
    Approved: "bg-[#22C55E]",
    Pending: "bg-[#F59E0B]",
    Rejected: "bg-[#EF4444]",
  };
  return (
    <span
      className={`inline-block w-[6px] h-[6px] rounded-full ${colorMap[status] || "bg-[#71717A]"}`}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. StatusBadge                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const styles = {
    Approved:
      "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
    Pending:
      "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    Rejected:
      "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-[3px] rounded-full border ${styles[status] || ""}`}
    >
      <StatusDot status={status} />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  4. IndustryPill                                                    */
/* ------------------------------------------------------------------ */

function IndustryPill({ industry }) {
  return (
    <span className="bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-full capitalize">
      {industry}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  5. CompanyAvatar                                                   */
/* ------------------------------------------------------------------ */

function CompanyAvatar({ name }) {
  return (
    <div
      className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center text-white text-xs font-semibold shrink-0"
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  6. FilterTabBar                                                    */
/* ------------------------------------------------------------------ */

function FilterTabBar({ active, onChange, counts }) {
  const tabs = [
    { key: "All", label: "All" },
    { key: "Pending", label: "Pending" },
    { key: "Approved", label: "Approved" },
    { key: "Rejected", label: "Rejected" },
  ];

  return (
    <nav
      className="flex items-center gap-1"
      role="tablist"
      aria-label="Filter companies by status"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3.5 py-2 text-sm font-medium rounded-[10px] transition-colors ${
            active === tab.key
              ? "bg-[#3A3A40] text-white"
              : "text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-xs text-[#71717A]">
            {counts[tab.key] ?? 0}
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  7. SearchInput                                                     */
/* ------------------------------------------------------------------ */

function SearchInput({ value, onChange }) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none"
      />
      <label htmlFor="company-search" className="sr-only">
        Search companies
      </label>
      <input
        id="company-search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search companies…"
        className="bg-[#0E0E11] border border-white/[0.08] rounded-full text-white text-sm pl-10 pr-4 py-2 outline-none placeholder-[#71717A] w-full sm:w-64 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] transition-colors"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  10. ActionBadge                                                    */
/* ------------------------------------------------------------------ */

function ActionBadge({ status }) {
  return (
    <div className="flex items-center gap-2">
      {(status === "Pending" || status === "Rejected") && (
        <button
          className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          aria-label="Approve company"
        >
          <Check size={13} />
          Approve
        </button>
      )}
      {(status === "Pending" || status === "Approved") && (
        <button
          className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          aria-label="Reject company"
        >
          <X size={13} />
          Reject
        </button>
      )}
      {status === "Rejected" && (
        <span className="text-[12px] text-[#71717A]">No actions</span>
      )}
      {status === "Approved" && (
        <span className="text-[12px] text-[#22C55E]">Active</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  8. CompanyRow  (desktop table row)                                 */
/* ------------------------------------------------------------------ */

function CompanyRow({ company }) {
  return (
    <tr className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
      {/* Company */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} />
          <span className="text-white text-sm font-medium">
            {company.name}
          </span>
        </div>
      </td>
      {/* Recruiter Email */}
      <td className="py-3.5 px-5 text-[#A1A1AA] text-sm">
        {company.email}
      </td>
      {/* Industry */}
      <td className="py-3.5 px-5">
        <IndustryPill industry={company.industry} />
      </td>
      {/* Status */}
      <td className="py-3.5 px-5">
        <StatusBadge status={company.status} />
      </td>
      {/* Date Submitted */}
      <td className="py-3.5 px-5 text-[#71717A] text-sm whitespace-nowrap">
        {formatDate(company.dateSubmitted)}
      </td>
      {/* Actions */}
      <td className="py-3.5 px-5">
        <ActionBadge status={company.status} />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  9. CompanyCard  (mobile card fallback)                             */
/* ------------------------------------------------------------------ */

function CompanyCard({ company }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-4 space-y-3">
      {/* Top row: avatar + name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} />
          <div>
            <p className="text-white text-sm font-medium">{company.name}</p>
            <p className="text-[#71717A] text-xs">{company.email}</p>
          </div>
        </div>
        <StatusBadge status={company.status} />
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <IndustryPill industry={company.industry} />
        <span className="text-[#71717A] text-xs">
          {formatDate(company.dateSubmitted)}
        </span>
      </div>
      {/* Actions */}
      <div className="pt-1">
        <ActionBadge status={company.status} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom KPI card                                                    */
/* ------------------------------------------------------------------ */

function BottomKpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
        <Icon size={20} className="text-[#A1A1AA]" />
      </div>
      <div>
        <p className="text-white text-lg font-semibold leading-tight">
          {value}
        </p>
        <p className="text-[#71717A] text-xs mt-0.5">{label}</p>
        {sub && (
          <p className="text-[#22C55E] text-[11px] mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Spinner                                                    */
/* ------------------------------------------------------------------ */

function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center py-32"
      role="status"
      aria-label="Loading companies"
    >
      <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ================================================================== */
/*  Main Page Component                                                */
/* ================================================================== */

const AdminCompaniesPage = () => {
  const { data: session, isPending } = useSession();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ------ Derived data ------ */

  const filteredCompanies = useMemo(() => {
    let list = MOCK_COMPANIES;

    if (activeFilter !== "All") {
      list = list.filter((c) => c.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const all = MOCK_COMPANIES.length;
    const pending = MOCK_COMPANIES.filter((c) => c.status === "Pending").length;
    const approved = MOCK_COMPANIES.filter((c) => c.status === "Approved").length;
    const rejected = MOCK_COMPANIES.filter((c) => c.status === "Rejected").length;
    return { All: all, Pending: pending, Approved: approved, Rejected: rejected };
  }, []);

  /* ------ Loading state ------ */

  if (isPending) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <LoadingSpinner />
      </div>
    );
  }

  /* ------ Render ------ */

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ============== HEADER ============== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight text-white leading-none">
            Manage Companies
          </h1>
          <p className="text-[#A1A1AA] text-sm mt-2">
            Review and manage corporate entity registrations and access requests.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="inline-flex items-center gap-2 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] text-sm font-medium px-4 py-2.5 rounded-[10px] hover:bg-[#222228] hover:border-white/[0.08] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            aria-label="Filter companies"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>
          <button
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2.5 rounded-[10px] hover:bg-zinc-200 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            aria-label="Register new company"
          >
            <Plus size={16} />
            Register New
          </button>
        </div>
      </div>

      {/* ============== KPI ROW ============== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiStatCard
          icon={Clock}
          label="Pending Review"
          value="28"
          change="+12% vs last week"
          trend="up"
        />
        <KpiStatCard
          icon={ShieldCheck}
          label="Approved Partners"
          value="314"
          change="+5% vs last week"
          trend="up"
        />
        <KpiStatCard
          icon={XCircle}
          label="Total Rejected"
          value="45"
          change="Stable"
          trend="stable"
        />
      </div>

      {/* ============== FILTERS ============== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FilterTabBar
          active={activeFilter}
          onChange={(key) => {
            setActiveFilter(key);
            setCurrentPage(1);
          }}
          counts={counts}
        />
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* ============== COMPANIES TABLE / CARDS ============== */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Desktop table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className="w-full text-sm"
            aria-label="Companies list"
          >
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Recruiter Email
                </th>
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Industry
                </th>
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-[#71717A] text-sm"
                  >
                    No companies found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <CompanyRow key={company.id} company={company} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout (hidden on desktop) */}
        <div className="md:hidden p-4 space-y-3">
          {filteredCompanies.length === 0 ? (
            <p className="py-12 text-center text-[#71717A] text-sm">
              No companies found matching your criteria.
            </p>
          ) : (
            filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
          <p className="text-xs text-[#71717A]">
            Showing{" "}
            <span className="text-[#A1A1AA]">
              {filteredCompanies.length}
            </span>{" "}
            of{" "}
            <span className="text-[#A1A1AA]">
              {MOCK_COMPANIES.length}
            </span>{" "}
            companies
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-[#3A3A40] text-white text-sm font-medium"
              aria-current="page"
              aria-label="Page 1"
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ============== BOTTOM KPI ROW ============== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BottomKpiCard
          icon={Timer}
          label="Average Review Time"
          value="2.4 days"
          sub="−0.3 days vs last month"
        />
        <BottomKpiCard
          icon={Percent}
          label="Approval Rate"
          value="87%"
          sub="+2% vs last month"
        />
        <BottomKpiCard
          icon={BarChart3}
          label="Monthly Registrations"
          value="+18%"
          sub="Trending upward"
        />
      </div>
    </div>
  );
};

export default AdminCompaniesPage;