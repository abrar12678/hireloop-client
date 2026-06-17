"use client";

import React from "react";
import { useSession } from "@/lib/auth-client";
import {
  Bookmark,
  FileText,
  CalendarCheck,
  CircleCheck,
  RefreshCw,
  Bell,
  Mail,
  Plus,
  ArrowRight,
  User,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const STATS = [
  { id: "saved", title: "Saved Jobs", value: 12, Icon: Bookmark, color: "#3B82F6" },
  { id: "applied", title: "Applications Submitted", value: 24, Icon: FileText, color: "#ffffff" },
  { id: "interviews", title: "Interviews Scheduled", value: 3, Icon: CalendarCheck, color: "#FACC15" },
  { id: "offers", title: "Offers Received", value: 1, Icon: CircleCheck, color: "#22C55E" },
];

const STATUS_BARS = [
  { label: "Applied", value: 10, color: "#ffffff" },
  { label: "Under Review", value: 6, color: "#F59E0B" },
  { label: "Shortlisted", value: 5, color: "#3B82F6" },
  { label: "Rejected", value: 2, color: "#EF4444" },
  { label: "Offered", value: 1, color: "#22C55E" },
];

const ACTIVITIES = [
  {
    id: 1,
    Icon: RefreshCw,
    iconBg: "#3B82F6",
    text: (
      <>
        Application for Senior Product Designer at TechFlow updated to{" "}
        <span className="text-[#F59E0B] font-medium cursor-pointer hover:underline">Under Review</span>
      </>
    ),
    time: "2 hours ago",
  },
  {
    id: 2,
    Icon: Bell,
    iconBg: "#3A3A40",
    text: "New Job Alert: Lead Frontend Engineer at FinGrid matches your profile.",
    time: "5 hours ago",
  },
  {
    id: 3,
    Icon: Mail,
    iconBg: "#22C55E",
    text: "You have a new message from Sarah Jenkins (Hiring Manager at CloudApps).",
    time: "1 day ago",
  },
];

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
      <button
        aria-label="Edit Profile"
        className="mt-4 w-full h-10 rounded-[10px] border border-[#3A3A40] text-white text-[14px] font-medium hover:bg-[#222228] transition-colors duration-200"
      >
        Edit Profile
      </button>
    </div>
  );
}

/* ─── Application Status Card ─── */
function ApplicationStatusCard() {
  const maxValue = Math.max(...STATUS_BARS.map((s) => s.value));

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[220px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <h4 className="text-[16px] font-semibold text-white mb-3">Application Status</h4>
      <div className="flex-1 flex flex-col justify-center">
        {STATUS_BARS.map((bar) => (
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
function RecentActivitySection() {
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
        {ACTIVITIES.map((act) => (
          <ActivityItem key={act.id} {...act} />
        ))}
      </div>
    </section>
  );
}

/* ─── Floating Action Button ─── */
function FloatingActionButton() {
  return (
    <button
      aria-label="Quick action"
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.30)] hover:scale-105 transition-transform duration-200 z-40 cursor-pointer"
    >
      <Plus size={24} aria-hidden="true" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   SEEKER DASHBOARD PAGE
   ═══════════════════════════════════════════════════ */
export default function SeekerDashboard() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading dashboard">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistic Cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <StatisticCard key={stat.id} {...stat} index={i} />
        ))}
      </div>

      {/* Profile + Application Status — 2 equal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProfileCard user={user} />
        <ApplicationStatusCard />
      </div>

      {/* Recent Activity */}
      <RecentActivitySection />

      {/* FAB */}
      <FloatingActionButton />
    </div>
  );
}