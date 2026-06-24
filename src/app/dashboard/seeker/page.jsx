"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch } from "@/lib/core/client";
import {
  Bookmark,
  FileText,
  CalendarCheck,
  CircleCheck,
  RefreshCw,
  Plus,
  User,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

function formatRelativeTime(dateString) {
  if (!dateString) return "just now";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

const STATUS_COLOR_MAP = {
  applied: "#ffffff",
  "under review": "#F59E0B",
  review: "#F59E0B",
  shortlisted: "#3B82F6",
  rejected: "#EF4444",
  offered: "#22C55E",
};

function getStatusColor(status) {
  if (!status) return "#ffffff";
  return STATUS_COLOR_MAP[status.toLowerCase()] || "#ffffff";
}

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Statistic Card ─── */
function StatisticCard({ title, value, Icon, color, index }) {
  return (
    <div
      className="group bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[90px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-[#222228] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#A1A1AA]">{title}</span>
        <Icon size={16} aria-hidden="true" style={{ color }} />
      </div>
      <span className="text-[36px] font-bold text-white leading-none tracking-tight">
        {value}
      </span>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ label, value, color, maxValue }) {
  const pct = Math.round((value / maxValue) * 100);
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: "14px" }}>
      <span className="text-[14px] text-[#A1A1AA] w-[100px] shrink-0">{label}</span>
      <div className="flex-1 h-[6px] bg-[#3A3A40] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] text-white w-5 text-right font-medium">{value}</span>
    </div>
  );
}

/* ─── Profile Card ─── */
function ProfileCard({ user }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[220px] flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="w-16 h-16 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-lg font-semibold mb-3 overflow-hidden">
        {user?.image ? (
          <img src={user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={28} aria-hidden="true" className="text-[#71717A]" />
        )}
      </div>
      <h3 className="text-[24px] font-semibold text-white leading-tight">
        {user?.name || "Alex Rivera"}
      </h3>
      <p className="text-[#71717A] text-[14px] mt-1">
        {user?.email || "alex.rivera@example.com"}
      </p>
      <a
        href="/dashboard/seeker/settings"
        aria-label="Edit Profile"
        className="mt-4 w-full h-10 rounded-[10px] border border-[#3A3A40] text-white text-[14px] font-medium hover:bg-[#222228] transition-colors duration-200 flex items-center justify-center"
      >
        Edit Profile
      </a>
    </div>
  );
}

/* ─── Application Status Card ─── */
function ApplicationStatusCard({ statusBars }) {
  const maxValue = Math.max(...statusBars.map((s) => s.value), 1);

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[220px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <h4 className="text-[16px] font-semibold text-white mb-3">Application Status</h4>
      <div className="flex-1 flex flex-col justify-center">
        {statusBars.map((bar) => (
          <ProgressBar
            key={bar.label}
            label={bar.label}
            value={bar.value}
            color={bar.color}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Activity Item ─── */
function ActivityItem({ Icon, iconBg, text, time }) {
  return (
    <div className="flex items-center gap-4 h-[58px] bg-[#1B1B1F] border border-white/[0.05] rounded-[12px] px-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:bg-[#222228] transition-colors duration-200">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={14} aria-hidden="true" className="text-white" />
      </div>
      <p className="flex-1 text-[14px] text-[#A1A1AA] font-normal leading-snug truncate min-w-0">
        {text}
      </p>
      <span className="text-[12px] text-[#71717A] shrink-0">{time}</span>
    </div>
  );
}

/* ─── Recent Activity Section ─── */
function RecentActivitySection({ activities }) {
  return (
    <section aria-label="Recent Activity">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[16px] font-semibold text-white">Recent Activity</h4>
        <button
          aria-label="View all activity"
          className="text-[14px] text-[#A1A1AA] hover:underline underline-offset-2 transition-colors duration-200"
        >
          View All Activity
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {activities.length > 0 ? (
          activities.map((act) => (
            <ActivityItem key={act.id} {...act} />
          ))
        ) : (
          <p className="text-[14px] text-[#71717A]">No recent activity</p>
        )}
      </div>
    </section>
  );
}

/* ─── Floating Action Button ─── */
function FloatingActionButton({ onNavigate }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex items-end gap-3">
      {/* Tooltip Sidebar */}
      <div
        className={`relative bg-white text-black rounded-[12px] px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.30)] flex items-center gap-2 whitespace-nowrap transition-all duration-200 origin-right ${
          showTooltip ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="text-[14px] font-medium">Apply for a job</span>
        <div
          className="w-3 h-3 bg-white rotate-45 absolute -right-1.5 top-1/2 -translate-y-1/2"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
        />
      </div>
      <button
        aria-label="Apply for a job"
        className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.30)] hover:scale-105 transition-transform duration-200 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onNavigate}
      >
        <Plus size={24} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SEEKER DASHBOARD PAGE
   ═══════════════════════════════════════════════════ */
export default function SeekerDashboard() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [dataLoading, setDataLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setDataLoading(true);
      try {
        const [savedRes, appsRes] = await Promise.all([
          protectedClientFetch("/saved-jobs"),
          protectedClientFetch("/applications"),
        ]);
        if (!cancelled) {
          setSavedJobs(Array.isArray(savedRes) ? savedRes : []);
          setApplications(Array.isArray(appsRes) ? appsRes : []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    // Only fetch once session is ready
    if (!sessionPending) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [sessionPending]);

  const isLoading = sessionPending || dataLoading;

  /* ─── Derived: STATS ─── */
  const stats = [
    {
      id: "saved",
      title: "Saved Jobs",
      value: savedJobs.length,
      Icon: Bookmark,
      color: "#3B82F6",
    },
    {
      id: "applied",
      title: "Applications Submitted",
      value: applications.length,
      Icon: FileText,
      color: "#ffffff",
    },
    {
      id: "interviews",
      title: "Interviews Scheduled",
      value: applications.filter(
        (a) =>
          a.status?.toLowerCase() === "shortlisted" ||
          a.status?.toLowerCase() === "under review"
      ).length,
      Icon: CalendarCheck,
      color: "#FACC15",
    },
    {
      id: "offers",
      title: "Offers Received",
      value: applications.filter(
        (a) => a.status?.toLowerCase() === "offered"
      ).length,
      Icon: CircleCheck,
      color: "#22C55E",
    },
  ];

  /* ─── Derived: STATUS_BARS ─── */
  const countByStatus = (matchStatuses) =>
    applications.filter((a) =>
      matchStatuses.some(
        (s) => a.status?.toLowerCase() === s.toLowerCase()
      )
    ).length;

  const statusBars = [
    { label: "Applied", value: countByStatus(["applied"]), color: "#ffffff" },
    { label: "Under Review", value: countByStatus(["under review", "review"]), color: "#F59E0B" },
    { label: "Shortlisted", value: countByStatus(["shortlisted"]), color: "#3B82F6" },
    { label: "Rejected", value: countByStatus(["rejected"]), color: "#EF4444" },
    { label: "Offered", value: countByStatus(["offered"]), color: "#22C55E" },
  ];

  /* ─── Derived: ACTIVITIES (recent applications within 1 week) ─── */
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const recentApps = [...applications]
    .filter((a) => {
      const created = new Date(a.createdAt || 0).getTime();
      return (now - created) <= ONE_WEEK_MS;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  const activities = recentApps.map((app, idx) => {
    const jobTitle =
      app.jobDetails?.title ||
      app.job?.title ||
      "a position";
    const companyName =
      app.jobDetails?.companyName ||
      app.jobDetails?.company?.name ||
      app.job?.companyName ||
      app.job?.company?.name ||
      "a company";
    const status = app.status || "applied";
    const statusColor = getStatusColor(status);

    return {
      id: app._id || idx,
      Icon: RefreshCw,
      iconBg: "#3B82F6",
      text: (
        <>
          Application for {jobTitle} at {companyName} is{" "}
          <span
            className="font-medium cursor-pointer hover:underline"
            style={{ color: statusColor }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </>
      ),
      time: formatRelativeTime(app.createdAt),
    };
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading dashboard">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistic Cards — 4 columns, first card "Saved Jobs" wider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr] gap-4">
        {stats.map((stat, i) => (
          <StatisticCard key={stat.id} {...stat} index={i} />
        ))}
      </div>

      {/* Profile + Application Status — 2 equal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProfileCard user={user} />
        <ApplicationStatusCard statusBars={statusBars} />
      </div>

      {/* Recent Activity */}
      <RecentActivitySection activities={activities} />

      {/* FAB */}
      <FloatingActionButton onNavigate={() => router.push("/dashboard/seeker/jobs")} />
    </div>
  );
}
