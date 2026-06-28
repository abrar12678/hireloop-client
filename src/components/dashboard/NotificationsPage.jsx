"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Bell,
  Briefcase,
  MessageSquare,
  Users,
  RefreshCw,
  CheckCheck,
  Trash2,
  Inbox,
  Loader2,
} from "lucide-react";
import { getNotifications } from "@/lib/api-client/notifications";
import { useSocket } from "@/lib/socket";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const PAGE_SIZE = 15;

const TYPE_CONFIG = {
  job_applied: { icon: Briefcase, color: "#3B82F6" },
  application_status: { icon: RefreshCw, color: "#F59E0B" },
  new_application: { icon: Users, color: "#22C55E" },
  new_message: { icon: MessageSquare, color: "#A855F7" },
};

const DEFAULT_CONFIG = { icon: Bell, color: "#ffffff" };

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "applications", label: "Applications" },
  { key: "messages", label: "Messages" },
  { key: "system", label: "System" },
];

/* Maps filter tab key to notification type substrings */
const FILTER_TYPE_MAP = {
  applications: ["job_applied", "application_status", "new_application"],
  messages: ["new_message"],
  system: [],
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getTypeConfig(type) {
  if (type && TYPE_CONFIG[type]) return TYPE_CONFIG[type];
  // Partial match fallback
  for (const key of Object.keys(TYPE_CONFIG)) {
    if (type && type.includes(key)) return TYPE_CONFIG[key];
  }
  return DEFAULT_CONFIG;
}

function matchesFilter(notificationType, filterKey) {
  if (filterKey === "all") return true;
  const allowedTypes = FILTER_TYPE_MAP[filterKey];
  if (!allowedTypes || allowedTypes.length === 0) {
    // "system" filter: show everything not matched by other filters
    const allSpecificTypes = [
      ...FILTER_TYPE_MAP.applications,
      ...FILTER_TYPE_MAP.messages,
    ];
    return !allSpecificTypes.some((t) => notificationType && notificationType.includes(t));
  }
  return allowedTypes.some((t) => notificationType && notificationType.includes(t));
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function NotificationIcon({ type }) {
  const config = getTypeConfig(type);
  const IconComp = config.icon;

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${config.color}1a` }}
    >
      <IconComp size={18} style={{ color: config.color }} aria-hidden="true" />
    </div>
  );
}

function NotificationItem({ notification }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-[#222228] transition-colors duration-150 border-b border-white/[0.03] last:border-b-0">
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <p className="text-white text-[14px] font-medium leading-snug">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-[#A1A1AA] text-[13px] mt-1 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[#71717A] text-[12px] mt-1.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <Inbox size={24} className="text-[#3A3A40]" />
      </div>
      <p className="text-white text-[15px] font-medium">No notifications</p>
      <p className="text-[#71717A] text-[13px] mt-1 text-center max-w-[280px] leading-relaxed">
        We'll notify you when something important happens.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="text-[#3B82F6] animate-spin" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NotificationsPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const { socket } = useSocket();

  /* ─── Socket.io real-time listener ─── */
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      fetchNotifications();
    };
    window.addEventListener("realtime-notification", handler);
    return () => {
      window.removeEventListener("realtime-notification", handler);
    };
  }, [socket, fetchNotifications]);

  /* ─── Fetch notifications (last 1 week) ─── */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const all = Array.isArray(data) ? data : [];
      // Filter to last 1 week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recent = all.filter((n) => {
        if (!n.createdAt) return true;
        return new Date(n.createdAt) >= oneWeekAgo;
      });
      setNotifications(recent);
    } catch (err) {
      console.warn("[NotificationsPage] Failed to fetch:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading) {
      fetchNotifications();
    }
  }, [sessionLoading, fetchNotifications]);

  /* ─── Reset display count when filter changes ─── */
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [activeFilter]);

  /* ─── Filtered & sliced notifications ─── */
  const filtered = notifications.filter((n) =>
    matchesFilter(n.type, activeFilter)
  );
  const visible = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;

  /* ─── Handlers ─── */
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/backend/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("[NotificationsPage] Mark all read failed:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/backend/notifications", {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications([]);
    } catch (err) {
      console.warn("[NotificationsPage] Delete all failed:", err);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  };

  /* ─── Loading session ─── */
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  /* ─── Render ─── */
  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-white text-[22px] font-semibold tracking-tight">
          Notifications
        </h1>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-200 cursor-pointer"
              >
                <CheckCheck size={15} aria-hidden="true" />
                Mark All Read
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium text-[#EF4444] hover:text-red-300 hover:bg-red-500/[0.08] border border-red-500/[0.15] transition-all duration-200 cursor-pointer"
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete all notifications
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-6 border-b border-white/[0.06]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`pb-3 text-[14px] font-medium transition-colors duration-200 cursor-pointer ${
                activeFilter === tab.key
                  ? "text-white border-b-2 border-white"
                  : "text-[#71717A] hover:text-[#A1A1AA] border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── Notifications List ─── */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {visible.map((notif) => (
              <NotificationItem key={notif._id || notif.id} notification={notif} />
            ))}
          </div>
        )}
      </div>

      {/* ─── Load More ─── */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 rounded-[10px] text-[13px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-200 cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}