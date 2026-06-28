"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";

const ITEMS_PER_PAGE = 5;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/** Handle both raw ObjectId string and { $oid: "..." } extended JSON */
const getUserId = (user) => (user._id?.$oid ? user._id.$oid : user._id);

/* ------------------------------------------------------------------ */
/*  1. KpiStatCard — with colorful icon                                */
/* ------------------------------------------------------------------ */
const KpiStatCard = ({ icon: Icon, label, value, color = "#3B82F6" }) => (
  <div
    className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] h-[90px] flex items-center gap-4 px-5 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
    aria-label={`${label}: ${value}`}
  >
    <div
      className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}18` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-[22px] font-bold text-white leading-tight tracking-tight">{value}</p>
      <p className="text-[12px] text-[#71717A] truncate">{label}</p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  2. RoleBadge                                                        */
/* ------------------------------------------------------------------ */
const RoleBadge = ({ role }) => (
  <span className="bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-full font-medium capitalize">
    {role}
  </span>
);

/* ------------------------------------------------------------------ */
/*  3. StatusBadge                                                      */
/* ------------------------------------------------------------------ */
const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border capitalize ${
        isActive
          ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
          : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
      }`}
      aria-label={`Status: ${status}`}
    >
      {isActive ? <CheckCircle2 size={12} /> : <UserX size={12} />}
      {status}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  4. UserAvatar                                                       */
/* ------------------------------------------------------------------ */
const UserAvatar = ({ name }) => (
  <div
    className="w-8 h-8 rounded-full bg-[#3A3A40] flex items-center justify-center shrink-0 text-white text-[12px] font-bold"
    aria-hidden="true"
  >
    {getInitials(name)}
  </div>
);

/* ------------------------------------------------------------------ */
/*  5. FilterDropdown                                                   */
/* ------------------------------------------------------------------ */
const FilterDropdown = ({ value, onChange, options, label }) => (
  <select
    value={value}
    onChange={onChange}
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

/* ------------------------------------------------------------------ */
/*  6. SearchInput                                                      */
/* ------------------------------------------------------------------ */
const SearchInput = ({ value, onChange }) => (
  <div className="relative">
    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Search users by name or email..."
      aria-label="Search users"
      className="w-full bg-[#1B1B1F] border border-white/[0.06] rounded-full text-white text-sm pl-10 pr-4 py-2.5 outline-none placeholder:text-[#71717A] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] transition-colors"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  7. UserRow (desktop)                                                */
/* ------------------------------------------------------------------ */
const UserRow = ({ user, onRoleChange, onStatusToggle }) => {
  const roleActionLabel = user.role === "seeker" ? "Make Recruiter" : user.role === "recruiter" ? "Make Seeker" : null;
  const roleActionTarget = user.role === "seeker" ? "recruiter" : user.role === "recruiter" ? "seeker" : null;
  const isActive = user.status === "active";

  return (
    <tr className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />
          <span className="text-white font-medium text-sm">{user.name}</span>
        </div>
      </td>
      <td className="py-3.5 px-5 text-[#A1A1AA] text-sm">{user.email}</td>
      <td className="py-3.5 px-5">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-3.5 px-5 text-[#71717A] text-sm">{formatDate(user.joinDate)}</td>
      <td className="py-3.5 px-5">
        <StatusBadge status={user.status} />
      </td>
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2">
          {roleActionLabel && (
            <button
              onClick={() => onRoleChange(user.id, roleActionTarget)}
              aria-label={`${roleActionLabel} for ${user.name}`}
              className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] bg-[#3A3A40] text-[#A1A1AA] hover:bg-[#222228] border border-white/[0.06] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            >
              <UserCog size={12} />
              {roleActionLabel}
            </button>
          )}
          <button
            onClick={() => onStatusToggle(user.id)}
            aria-label={`${isActive ? "Suspend" : "Activate"} ${user.name}`}
            className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
              isActive
                ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/25"
                : "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 hover:bg-[#22C55E]/25"
            }`}
          >
            {isActive ? <Ban size={12} /> : <CheckCircle2 size={12} />}
            {isActive ? "Suspend" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ------------------------------------------------------------------ */
/*  8. UserCard (mobile)                                                */
/* ------------------------------------------------------------------ */
const UserCard = ({ user, onRoleChange, onStatusToggle }) => {
  const roleActionLabel = user.role === "seeker" ? "Make Recruiter" : user.role === "recruiter" ? "Make Seeker" : null;
  const roleActionTarget = user.role === "seeker" ? "recruiter" : user.role === "recruiter" ? "seeker" : null;
  const isActive = user.status === "active";

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-4 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />
          <div>
            <p className="text-white font-medium text-sm">{user.name}</p>
            <p className="text-[#71717A] text-[12px]">{user.email}</p>
          </div>
        </div>
        <StatusBadge status={user.status} />
      </div>
      <div className="flex items-center gap-2 text-[12px] text-[#71717A]">
        <RoleBadge role={user.role} />
        <span>·</span>
        <span>{formatDate(user.joinDate)}</span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        {roleActionLabel && (
          <button
            onClick={() => onRoleChange(user.id, roleActionTarget)}
            aria-label={`${roleActionLabel} for ${user.name}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] bg-[#3A3A40] text-[#A1A1AA] hover:bg-[#222228] border border-white/[0.06] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          >
            <UserCog size={12} />
            {roleActionLabel}
          </button>
        )}
        <button
          onClick={() => onStatusToggle(user.id)}
          aria-label={`${isActive ? "Suspend" : "Activate"} ${user.name}`}
          className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
            isActive
              ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/25"
              : "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 hover:bg-[#22C55E]/25"
          }`}
        >
          {isActive ? <Ban size={12} /> : <CheckCircle2 size={12} />}
          {isActive ? "Suspend" : "Activate"}
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  9. Pagination                                                       */
/* ------------------------------------------------------------------ */
const Pagination = ({ currentPage, totalPages, totalItems, paginatedItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const pages = [];
  const maxVisible = 5;
  let startP = Math.max(1, currentPage - 2);
  const endP = Math.min(totalPages, startP + maxVisible - 1);
  if (endP - startP < maxVisible - 1) startP = Math.max(1, endP - maxVisible + 1);

  for (let i = startP; i <= endP; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
      <p className="text-[12px] text-[#71717A]">
        Showing {start}–{end} of {totalItems} users
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:text-white hover:bg-[#222228] disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-[10px] text-sm font-medium transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
              p === currentPage
                ? "bg-white text-black"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#222228]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] text-[#A1A1AA] hover:text-white hover:bg-[#222228] disabled:opacity-30 transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  10. EmptyState                                                      */
/* ------------------------------------------------------------------ */
const EmptyState = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3">
    <div className="w-14 h-14 rounded-full bg-[#3A3A40] flex items-center justify-center">
      <Users size={24} className="text-[#71717A]" />
    </div>
    <p className="text-[#A1A1AA] text-sm font-medium">No users found</p>
    <p className="text-[#71717A] text-[12px]">Try adjusting your search or filter criteria.</p>
  </div>
);

/* ------------------------------------------------------------------ */
/*  LOADING SPINNER                                                     */
/* ------------------------------------------------------------------ */
const LoadingOverlay = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */
const TABS = [
  { value: "all",       label: "All" },
  { value: "seeker",    label: "Seekers" },
  { value: "recruiter", label: "Recruiters" },
  { value: "admin",     label: "Admins" },
];

const AdminUsersPage = () => {
  const { isPending } = useSession();

  /* ---------- state ---------- */
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ---------- KPI counts ---------- */
  const [kpiData, setKpiData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newThisMonth: 0,
  });

  /* ---------- debounce search (400ms) ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ---------- fetch paginated user list ---------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      perPage: String(ITEMS_PER_PAGE),
      role: activeFilter,
      search: debouncedSearch,
    });
    const data = await protectedClientFetch(`/api/users?${params}`);
    if (data) {
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } else {
      setUsers([]);
      setTotal(0);
    }
    setLoading(false);
  }, [currentPage, activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ---------- fetch KPI counts (lightweight: limit=1, only total field) ---------- */
  const fetchKpiCounts = useCallback(async () => {
    const [allRes, activeRes, suspendedRes] = await Promise.all([
      protectedClientFetch("/api/users?page=1&perPage=1&role=all&search="),
      protectedClientFetch("/api/users?page=1&perPage=1&role=all&search=&status=active"),
      protectedClientFetch("/api/users?page=1&perPage=1&role=all&search=&status=suspended"),
    ]);
    const totalUsers = allRes?.total || 0;
    const activeUsers = activeRes?.total || 0;
    const suspendedUsers = suspendedRes?.total || 0;
    setKpiData({
      totalUsers,
      activeUsers: activeUsers > 0 ? activeUsers : totalUsers,
      suspendedUsers,
      newThisMonth: "—",
    });
  }, []);

  useEffect(() => {
    fetchKpiCounts();
  }, [fetchKpiCounts]);

  /* ---------- role change (API) ---------- */
  const handleRoleChange = async (userId, newRole) => {
    await clientMutation(`/api/users/${userId}/role`, { role: newRole }, "PATCH");
    fetchUsers();
    fetchKpiCounts();
  };

  /* ---------- status toggle (API) ---------- */
  const handleStatusToggle = async (userId) => {
    const user = users.find((u) => getUserId(u) === userId);
    if (!user) return;
    const newStatus = user.status === "active" ? "suspended" : "active";
    await clientMutation(`/api/users/${userId}/status`, { status: newStatus }, "PATCH");
    fetchUsers();
    fetchKpiCounts();
  };

  /* ---------- filter / search handlers ---------- */
  const handleTabChange = (tab) => {
    setActiveFilter(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /* ---------- normalize API users for sub-components ---------- */
  const displayUsers = users.map((u) => ({
    ...u,
    id: getUserId(u),
    joinDate: u.createdAt,
  }));

  /* ---------- server-side pagination totals ---------- */
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  /* ---------- KPI cards (derived from real data) ---------- */
  const kpis = [
    {
      icon: Users,
      label: "Total Users",
      value: kpiData.totalUsers.toLocaleString(),
      color: "#3B82F6",
    },
    {
      icon: UserCheck,
      label: "Active Users",
      value: kpiData.activeUsers.toLocaleString(),
      color: "#22C55E",
    },
    {
      icon: UserX,
      label: "Suspended Users",
      value: kpiData.suspendedUsers.toLocaleString(),
      color: "#EF4444",
    },
    {
      icon: UserPlus,
      label: "New This Month",
      value: typeof kpiData.newThisMonth === "number" ? kpiData.newThisMonth.toLocaleString() : kpiData.newThisMonth,
      color: "#A855F7",
    },
  ];

  /* ---------- session loading ---------- */
  if (isPending) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ============================================================ */}
      {/*  1. HEADER                                                    */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-none tracking-tight">
            User Management
          </h1>
          <p className="text-[#A1A1AA] text-sm mt-2">
            Review, filter, and manage platform access for all registered users.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <FilterDropdown
            label="Filter by role"
            value={activeFilter}
            onChange={(e) => handleTabChange(e.target.value)}
            options={[
              { value: "all",       label: "All Roles" },
              { value: "seeker",    label: "Seekers" },
              { value: "recruiter", label: "Recruiters" },
              { value: "admin",     label: "Admins" },
            ]}
          />
          <button
            aria-label="Export user list"
            className="inline-flex items-center gap-2 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] hover:bg-[#222228] text-sm font-medium px-4 py-2.5 rounded-[10px] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          >
            <Download size={15} />
            Export List
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  2. KPI ROW                                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiStatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* ============================================================ */}
      {/*  3. TAB BAR + SEARCH                                          */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Tab bar */}
        <div
          className="inline-flex items-center bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-1 gap-1"
          role="tablist"
          aria-label="Filter users by role"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeFilter === tab.value}
              aria-label={`Show ${tab.label}`}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-[10px] transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
                activeFilter === tab.value
                  ? "bg-[#3A3A40] text-white"
                  : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#222228]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm ml-auto">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
        </div>
      </div>

      {/* ============================================================ */}
      {/*  4. USERS TABLE                                               */}
      {/* ============================================================ */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* --- Desktop table (hidden on mobile) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" aria-label="Users list">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="text-left text-[#71717A] font-medium py-3.5 px-5 text-[12px] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <LoadingOverlay />
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onStatusToggle={handleStatusToggle}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Mobile cards (hidden on md+) --- */}
        <div className="md:hidden p-3 space-y-3">
          {loading ? (
            <LoadingOverlay />
          ) : displayUsers.length === 0 ? (
            <EmptyState />
          ) : (
            displayUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onRoleChange={handleRoleChange}
                onStatusToggle={handleStatusToggle}
              />
            ))
          )}
        </div>

        {/* --- Pagination --- */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          paginatedItems={displayUsers.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;