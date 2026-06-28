"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  BarChart3,
  BadgeCheck,
  FolderOpen,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";

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
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  1. KpiStatCard — with colorful icon                                */
/* ------------------------------------------------------------------ */

function KpiStatCard({ icon: Icon, label, value, color = "#3B82F6" }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] h-[90px] flex items-center gap-4 px-5 hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
      aria-label={`${label}: ${value}`}
    >
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-white text-xl font-semibold tracking-tight leading-none">
          {value}
        </span>
        <span className="text-[#71717A] text-xs mt-1 truncate">{label}</span>
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
/*  8. IndustryFilter                                                  */
/* ------------------------------------------------------------------ */

function IndustryFilter({ value, onChange, industries }) {
  if (industries.length === 0) return null;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by industry"
      className="appearance-none bg-[#0E0E11] border border-white/[0.08] rounded-[10px] text-white text-sm px-4 py-2 pr-9 outline-none cursor-pointer focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] transition-colors"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23A1A1AA' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 4 3.5-4z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      <option value="">All Industries</option>
      {industries.map((ind) => (
        <option key={ind} value={ind}>{ind}</option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/*  9. ActionBadge                                                    */
/* ------------------------------------------------------------------ */

function ActionBadge({ status, onApprove, onReject }) {
  return (
    <div className="flex items-center gap-2">
      {(status === "Pending" || status === "Rejected") && (
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          aria-label="Approve company"
        >
          <Check size={13} />
          Approve
        </button>
      )}
      {(status === "Pending" || status === "Approved") && (
        <button
          onClick={onReject}
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
/*  10. CompanyRow  (desktop table row)                                */
/* ------------------------------------------------------------------ */

function CompanyRow({ company, onVerifyToggle, onApprove, onReject }) {
  return (
    <tr className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
      {/* Company */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} />
          <div className="flex items-center gap-1.5">
            <span className="text-white text-sm font-medium">
              {company.name}
            </span>
            {company.verified && (
              <BadgeCheck size={18} className="w-5 h-5 text-[#3B82F6] inline-block shrink-0" />
            )}
          </div>
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
        {formatDate(company.dateSubmitted || company.createdAt)}
      </td>
      {/* Actions */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVerifyToggle(company)}
            className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] cursor-pointer ${
              company.verified
                ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20"
                : "border-white/[0.08] bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white"
            }`}
            aria-label={company.verified ? "Unverify company" : "Verify company"}
          >
            <BadgeCheck size={13} />
            {company.verified ? "Verified" : "Verify"}
          </button>
          <ActionBadge status={company.status} onApprove={() => onApprove(company)} onReject={() => onReject(company)} />
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  11. CompanyCard  (mobile card fallback)                            */
/* ------------------------------------------------------------------ */

function CompanyCard({ company, onVerifyToggle, onApprove, onReject }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-4 space-y-3">
      {/* Top row: avatar + name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CompanyAvatar name={company.name} />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-white text-sm font-medium">{company.name}</p>
              {company.verified && (
                <BadgeCheck size={18} className="w-5 h-5 text-[#3B82F6] inline-block shrink-0" />
              )}
            </div>
            <p className="text-[#71717A] text-xs">{company.email}</p>
          </div>
        </div>
        <StatusBadge status={company.status} />
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <IndustryPill industry={company.industry} />
        <span className="text-[#71717A] text-xs">
          {formatDate(company.dateSubmitted || company.createdAt)}
        </span>
      </div>
      {/* Actions */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={() => onVerifyToggle(company)}
          className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border transition-colors cursor-pointer ${
            company.verified
              ? "border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20"
              : "border-white/[0.08] bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white"
          }`}
          aria-label={company.verified ? "Unverify company" : "Verify company"}
        >
          <BadgeCheck size={13} />
          {company.verified ? "Verified" : "Verify"}
        </button>
        <ActionBadge status={company.status} onApprove={() => onApprove(company)} onReject={() => onReject(company)} />
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
  const { isPending } = useSession();
  const [activeFilter, setActiveFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;

  /* ------ Fetch companies ------ */
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await protectedClientFetch("/api/companies");
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending) fetchCompanies();
  }, [isPending, fetchCompanies]);

  /* ------ Derived data ------ */
  const uniqueIndustries = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set).sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let list = companies;

    if (activeFilter !== "All") {
      list = list.filter((c) => c.status === activeFilter);
    }

    if (industryFilter) {
      list = list.filter((c) => (c.industry || "").toLowerCase() === industryFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.industry || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, industryFilter, searchQuery, companies]);

  /* ------ Pagination ------ */
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filteredCompanies.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const counts = useMemo(() => {
    const all = companies.length;
    const pending = companies.filter((c) => c.status === "Pending").length;
    const approved = companies.filter((c) => c.status === "Approved").length;
    const rejected = companies.filter((c) => c.status === "Rejected").length;
    return { All: all, Pending: pending, Approved: approved, Rejected: rejected };
  }, [companies]);

  /* ------ KPI values from real data ------ */
  const monthlyRegistrations = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return companies.filter((c) => {
      const d = new Date(c.createdAt || c.dateSubmitted);
      return d >= monthStart;
    }).length;
  }, [companies]);

  const approvalRate = useMemo(() => {
    const total = counts.All;
    if (total === 0) return "0";
    return ((counts.Approved / total) * 100).toFixed(0);
  }, [counts]);

  /* ------ Actions ------ */

  const handleVerifyToggle = async (company) => {
    const companyId = company._id?.$oid || company._id;
    try {
      await clientMutation(`/api/companies/${companyId}/verify`, { verified: !company.verified }, "PATCH");
      setCompanies((prev) =>
        prev.map((c) =>
          (c._id?.$oid || c._id) === companyId
            ? { ...c, verified: !c.verified }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to update verification:", err);
    }
  };

  const handleApprove = async (company) => {
    const companyId = company._id?.$oid || company._id;
    try {
      await clientMutation(`/api/companies/${companyId}`, { status: "Approved" }, "PATCH");
      fetchCompanies();
    } catch (err) {
      console.error("Failed to approve company:", err);
    }
  };

  const handleReject = async (company) => {
    const companyId = company._id?.$oid || company._id;
    try {
      await clientMutation(`/api/companies/${companyId}`, { status: "Rejected" }, "PATCH");
      fetchCompanies();
    } catch (err) {
      console.error("Failed to reject company:", err);
    }
  };

  /* ------ Loading state ------ */

  if (isPending || loading) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiStatCard
          icon={Building2}
          label="Total Companies"
          value={counts.All}
          color="#3B82F6"
        />
        <KpiStatCard
          icon={Clock}
          label="Pending Review"
          value={counts.Pending}
          color="#F59E0B"
        />
        <KpiStatCard
          icon={ShieldCheck}
          label="Approved Partners"
          value={counts.Approved}
          color="#22C55E"
        />
        <KpiStatCard
          icon={XCircle}
          label="Total Rejected"
          value={counts.Rejected}
          color="#EF4444"
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
        <div className="flex items-center gap-3">
          <IndustryFilter
            value={industryFilter}
            onChange={(v) => {
              setIndustryFilter(v);
              setCurrentPage(1);
            }}
            industries={uniqueIndustries}
          />
          <SearchInput value={searchQuery} onChange={(v) => {
            setSearchQuery(v);
            setCurrentPage(1);
          }} />
        </div>
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
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-[#71717A] text-sm"
                  >
                    No companies found matching your criteria.
                  </td>
                </tr>
              ) : (
                pageData.map((company) => (
                  <CompanyRow key={company._id?.$oid || company._id} company={company} onVerifyToggle={handleVerifyToggle} onApprove={handleApprove} onReject={handleReject} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout (hidden on desktop) */}
        <div className="md:hidden p-4 space-y-3">
          {pageData.length === 0 ? (
            <p className="py-12 text-center text-[#71717A] text-sm">
              No companies found matching your criteria.
            </p>
          ) : (
            pageData.map((company) => (
              <CompanyCard key={company._id?.$oid || company._id} company={company} onVerifyToggle={handleVerifyToggle} onApprove={handleApprove} onReject={handleReject} />
            ))
          )}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-xs text-[#71717A]">
              Showing{" "}
              <span className="text-[#A1A1AA]">
                {pageData.length}
              </span>{" "}
              of{" "}
              <span className="text-[#A1A1AA]">
                {filteredCompanies.length}
              </span>{" "}
              companies
            </p>
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-white text-black"
                      : "text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* ============== BOTTOM KPI ROW ============== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiStatCard
          icon={FolderOpen}
          label="Total Industries"
          value={uniqueIndustries.length}
          color="#8B5CF6"
        />
        <KpiStatCard
          icon={BarChart3}
          label="Approval Rate"
          value={`${approvalRate}%`}
          color="#3B82F6"
        />
        <KpiStatCard
          icon={TrendingUp}
          label="This Month Registrations"
          value={monthlyRegistrations}
          color="#22C55E"
        />
      </div>
    </div>
  );
};

export default AdminCompaniesPage;