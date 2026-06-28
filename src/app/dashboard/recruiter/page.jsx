"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Zap,
  CircleCheckBig,
  ArrowRight,
  Plus,
  Building2,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import Recharts to avoid SSR issues
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false },
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
import { getRecruiterStats } from "@/lib/api-client/stats";
import { getRecruiterApplications } from "@/lib/api-client/applications";
import { getLoggedInRecruiterCompany } from "@/lib/api-client/companies";

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  interviewing: { label: "Interviewing", bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  screening: { label: "Screening", bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  new: { label: "New", bg: "bg-white/[0.06]", text: "text-[#A1A1AA]", border: "border-white/[0.08]" },
  reviewing: { label: "Reviewing", bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  rejected: { label: "Rejected", bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  applied: { label: "Applied", bg: "bg-[#3B82F6]/15", text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  hired: { label: "Hired", bg: "bg-[#A855F7]/15", text: "text-[#A855F7]", border: "border-[#A855F7]/30" },
  offered: { label: "Offered", bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30" },
  "under review": { label: "Under Review", bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
};

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── KPI Stat Card ─── */
function KpiStatCard({ label, value, Icon, color, index }) {
  return (
    <div
      className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-white/[0.08] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={22} aria-hidden="true" style={{ color }} />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[12px] text-[#71717A] uppercase tracking-wide font-medium leading-none">
          {label}
        </span>
        <span className="text-[28px] font-bold text-white leading-tight tracking-tight mt-1">
          {value}
        </span>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const key = (status || "new").toLowerCase();
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.new;
  return (
    <span
      className={`inline-flex items-center h-[26px] px-3 rounded-full text-[12px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Candidate Avatar ─── */
function CandidateAvatar({ name, image }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/* ─── Format Date ─── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Applications Table ─── */
function ApplicationsTable({ applications }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5">
        <h3 className="text-[18px] font-medium text-white">Recent Applications</h3>
        <Link
          href="/dashboard/recruiter/applications"
          className="text-[14px] text-[#71717A] hover:text-white transition-colors duration-150"
        >
          View all
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Users size={32} className="text-[#3A3A40] mx-auto mb-3" aria-hidden="true" />
          <p className="text-[#A1A1AA] text-[14px]">No applications yet</p>
          <p className="text-[#71717A] text-[12px] mt-1">Applications will appear here once candidates apply to your jobs.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" role="table" aria-label="Recent applications">
              <thead>
                <tr className="h-12 border-t border-b border-white/[0.05]">
                  <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Candidate</th>
                  <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Role</th>
                  <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Experience</th>
                  <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden xl:table-cell">Applied</th>
                  <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => {
                  const name = app.applicant?.name || app.applicantDetails?.name || "Unknown";
                  const email = app.applicant?.email || app.applicantDetails?.email || "";
                  const image = app.applicant?.image || app.applicantDetails?.image || null;
                  const role = app.jobTitle || app.jobDetails?.jobTitle || "—";
                  const experience = app.experience || app.applicantDetails?.experience || "—";
                  const date = formatDate(app.createdAt);
                  return (
                    <tr
                      key={app._id || idx}
                      className="h-16 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
                    >
                      <td className="px-6" role="cell">
                        <div className="flex items-center gap-3">
                          <CandidateAvatar name={name} image={image} />
                          <div className="min-w-0">
                            <span className="text-[14px] font-medium text-white block truncate">{name}</span>
                            <span className="text-[11px] text-[#71717A]">{email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 text-[14px] text-[#A1A1AA]" role="cell">{role}</td>
                      <td className="px-6 text-[13px] text-[#71717A] hidden lg:table-cell" role="cell">{experience}</td>
                      <td className="px-6 text-[13px] text-[#71717A] hidden xl:table-cell" role="cell">{date}</td>
                      <td className="px-6 text-right" role="cell">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-white/[0.05]">
            {applications.map((app, idx) => {
              const name = app.applicant?.name || app.applicantDetails?.name || "Unknown";
              const image = app.applicant?.image || app.applicantDetails?.image || null;
              const role = app.jobTitle || app.jobDetails?.jobTitle || "—";
              const experience = app.experience || app.applicantDetails?.experience || "—";
              const date = formatDate(app.createdAt);
              return (
                <div key={app._id || idx} className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CandidateAvatar name={name} image={image} />
                      <span className="text-[14px] font-medium text-white">{name}</span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-[13px] text-[#A1A1AA]">{role}</p>
                  <div className="flex items-center gap-4 text-[12px] text-[#71717A]">
                    <span>{experience}</span>
                    <span>{date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── My Company Card ─── */
function MyCompanyCard({ company }) {
  if (!company) return null;
  const letter = (company.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const statusColor = company.status === "Approved" ? "#22C55E" : company.status === "Pending" ? "#F59E0B" : "#71717A";
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[18px] font-medium text-white">My Company</h3>
        <Link
          href="/dashboard/recruiter/company"
          className="text-[14px] text-[#71717A] hover:text-white transition-colors duration-150"
        >
          View all
        </Link>
      </div>
      <Link href="/dashboard/recruiter/company" className="block group">
        <div className="flex items-center gap-4 mb-4">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-[12px] object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-[12px] bg-[#3A3A40] flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-white text-[14px] font-bold">{letter}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-white truncate group-hover:text-[#E4E4E7] transition-colors">{company.name || "Unnamed"}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-[13px] text-[#A1A1AA]">{company.status || "Active"}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {company.industry && (
            <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
              <Briefcase size={14} aria-hidden="true" className="text-[#A1A1AA]" />
              <span>{company.industry}</span>
            </div>
          )}
          {company.location && (
            <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
              <MapPin size={14} aria-hidden="true" className="text-[#A1A1AA]" />
              <span>{company.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
            <Users size={14} aria-hidden="true" className="text-[#A1A1AA]" />
            <span>{company.employeeCount || "—"} employees</span>
          </div>
        </div>
      </Link>
      <Link
        href="/dashboard/recruiter/company"
        className="block w-full mt-5 h-10 border border-white/[0.06] rounded-[10px] text-[14px] text-[#A1A1AA] hover:bg-[#222228] hover:text-white transition-all duration-150 text-center leading-10 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
      >
        View Company Profile
      </Link>
    </div>
  );
}

/* ─── Floating Action Button with Tooltip ─── */
function FloatingActionButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="fixed bottom-8 right-8 z-40 flex items-end gap-3">
      <div
        className={`relative bg-white text-black rounded-[12px] px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.30)] flex items-center gap-2 whitespace-nowrap transition-all duration-200 origin-right ${
          showTooltip ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="text-[14px] font-medium">Post a new job</span>
        <div
          className="w-3 h-3 bg-white rotate-45 absolute -right-1.5 top-1/2 -translate-y-1/2"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
        />
      </div>
      <Link
        href="/dashboard/recruiter/jobs/new"
        aria-label="Post a new job"
        className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.30)] hover:scale-105 transition-transform duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Plus size={24} aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RECRUITER DASHBOARD PAGE
   ═══════════════════════════════════════════════════ */
export default function RecruiterDashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending || !user) return;
    const fetchData = async () => {
      try {
        const [statsData, companyData, appsData] = await Promise.all([
          getRecruiterStats(),
          getLoggedInRecruiterCompany(),
          getRecruiterApplications(),
        ]);
        // handleResponse returns [] on 500 — normalise to object or null
        setStats(statsData && !Array.isArray(statsData) ? statsData : null);
        // Company API may return an array — take the first element
        const companyObj = Array.isArray(companyData)
          ? companyData[0]
          : companyData;
        setCompany(companyObj && companyObj._id ? companyObj : null);
        // Take the most recent 10 with full details from the applications API
        const apps = Array.isArray(appsData) ? appsData : [];
        setRecentApps(apps.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch recruiter dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isPending]);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading dashboard">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const KPI_DATA = [
    { label: "Total Job Posts", value: String(stats?.totalJobPosts || 0), Icon: Briefcase, color: "#ffffff" },
    { label: "Total Applicants", value: String(stats?.totalApplicants || 0), Icon: Users, color: "#3B82F6" },
    { label: "Active Jobs", value: String(stats?.activeJobs || 0), Icon: Zap, color: "#FACC15" },
    { label: "Jobs Closed", value: String(stats?.closedJobs || 0), Icon: CircleCheckBig, color: "#22C55E" },
  ];

  // recentApps now comes from the dedicated applications API fetch (top 10)

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Welcome back, {user?.name || "Recruiter"}
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Here&apos;s an overview of your recruiting activity.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KpiStatCard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* ── Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Applications per Job */}
        <div className="lg:col-span-2 bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          <h3 className="text-[16px] font-medium text-white mb-4">Applicants per Job</h3>
          {stats?.applicantsPerJob?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.applicantsPerJob.slice(0, 7)} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="jobTitle" tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#222228", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 13 }}
                  labelStyle={{ color: "#A1A1AA" }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[260px] text-center">
              <Briefcase size={32} className="text-[#3A3A40] mb-3" />
              <p className="text-[#A1A1AA] text-[14px]">No application data yet</p>
              <p className="text-[#71717A] text-[12px] mt-1">Post a job and receive applications to see the chart.</p>
            </div>
          )}
        </div>

        {/* Donut: Hiring Funnel */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
          <h3 className="text-[16px] font-medium text-white mb-4">Hiring Funnel</h3>
          {(stats?.totalApplicants > 0 || (stats?.activeJobs || 0) > 0 || (stats?.closedJobs || 0) > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active Jobs", value: stats.activeJobs || 0 },
                      { name: "Closed Jobs", value: stats.closedJobs || 0 },
                      { name: "Total Applicants", value: stats.totalApplicants || 0 },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                    <Cell fill="#FACC15" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#222228", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 13 }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3B82F6]" /><span className="text-[12px] text-[#71717A]">Active</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22C55E]" /><span className="text-[12px] text-[#71717A]">Closed</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FACC15]" /><span className="text-[12px] text-[#71717A]">Applicants</span></div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Zap size={32} className="text-[#3A3A40] mb-3" />
              <p className="text-[#A1A1AA] text-[14px]">No data yet</p>
              <p className="text-[#71717A] text-[12px] mt-1">Start posting jobs to see your hiring funnel.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly Trends Line Chart ── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <h3 className="text-[16px] font-medium text-white mb-4">Weekly Application Trends</h3>
        {stats?.weeklyTrends?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.weeklyTrends} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717A", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#222228", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: "#A1A1AA" }}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "rgba(59,130,246,0.3)" }}
              />
              <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3B82F6", stroke: "#1B1B1F", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#3B82F6" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[240px] text-center">
            <ArrowRight size={32} className="text-[#3A3A40] mb-3" />
            <p className="text-[#A1A1AA] text-[14px]">No weekly trends yet</p>
            <p className="text-[#71717A] text-[12px] mt-1">Application trends will appear as you receive applications.</p>
          </div>
        )}
      </div>

      {/* ── Content Grid: Applications (2 col) + Companies (1 col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApplicationsTable applications={recentApps} />
        </div>
        <div>
          <MyCompanyCard company={company} />
        </div>
      </div>

      {/* ── FAB ── */}
      <FloatingActionButton />
    </div>
  );
}
