"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientFetch } from "@/lib/core/client";
import {
  Bell,
  X,
  Briefcase,
  RefreshCw,
  Star,
  XCircle,
  Award,
  Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "hireloop_seen_notifications";
const LOGO_ICON = "/images/logo.png";

const STATUS_CONFIG = {
  "under review": {
    icon: RefreshCw,
    color: "#3B82F6", // blue
    getMessage: (jobTitle) =>
      `Your application for ${jobTitle} is now under review`,
  },
  shortlisted: {
    icon: Star,
    color: "#22C55E", // green
    getMessage: (jobTitle) => `You've been shortlisted for ${jobTitle}!`,
  },
  rejected: {
    icon: XCircle,
    color: "#EF4444", // red
    getMessage: (jobTitle) =>
      `Your application for ${jobTitle} was not selected`,
  },
  offered: {
    icon: Award,
    color: "#EAB308", // gold
    getMessage: (_jobTitle, companyName) =>
      `You received an offer from ${companyName}!`,
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Format a date string or timestamp into a human-readable relative time.
 * Returns strings like "just now", "5m ago", "2h ago", "3d ago", "Jan 15", etc.
 */
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

  // Older than 7 days — show short date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get the list of already-seen notification IDs from localStorage.
 */
function getSeenNotificationIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist seen notification IDs to localStorage.
 */
function saveSeenNotificationIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

/**
 * Generate a stable ID for a notification derived from its data.
 */
function buildNotificationId(notif) {
  return notif.id || `${notif.type}-${notif.key}`;
}

/**
 * Map application status to notification objects.
 */
function mapApplicationsToNotifications(applications) {
  if (!Array.isArray(applications)) return [];

  return applications
    .filter((app) => app.status && STATUS_CONFIG[app.status.toLowerCase()])
    .map((app) => {
      const statusKey = app.status.toLowerCase();
      const config = STATUS_CONFIG[statusKey];
      return {
        id: `app-${app.id}-${statusKey}`,
        type: "application",
        key: `app-${app.id}-${statusKey}`,
        title: config.getMessage(app.jobTitle || "a position"),
        description: `Status updated to "${app.status}"`,
        time: app.updatedAt || app.appliedAt || app.createdAt,
        icon: config.icon,
        color: config.color,
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        status: statusKey,
      };
    });
}

/**
 * Map new jobs to notification objects.
 */
function mapJobsToNotifications(jobs) {
  if (!Array.isArray(jobs)) return [];

  return jobs.map((job) => ({
    id: `job-${job.id}`,
    type: "job",
    key: `job-${job.id}`,
    title: `New job: ${job.title || "Untitled position"} at ${job.companyName || "a company"}`,
    description: job.location || "",
    time: job.createdAt || job.postedAt,
    icon: Briefcase,
    color: "#A855F7", // purple
    companyName: job.companyName,
    jobTitle: job.title,
  }));
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function NotificationIcon({ IconComponent, color }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}1a` }} // 15% opacity hex
    >
      <IconComponent size={16} style={{ color }} aria-hidden="true" />
    </div>
  );
}

function NotificationItem({ notification, isUnread }) {
  const IconComp = notification.icon || Bell;

  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors duration-150 border-b border-white/[0.03] last:border-b-0">
      <NotificationIcon IconComponent={IconComp} color={notification.color} />
      <div className="min-w-0 flex-1">
        <p className="text-white text-[14px] font-medium leading-snug">
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-[#A1A1AA] text-[13px] mt-0.5 leading-relaxed">
            {notification.description}
          </p>
        )}
        <p className="text-[#71717A] text-[12px] mt-1">
          {formatRelativeTime(notification.time)}
        </p>
      </div>
      {isUnread && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0 mt-1.5" />
      )}
    </div>
  );
}

function EmptyState({ message, subMessage }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6">
      <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <Bell size={22} className="text-[#3A3A40]" />
      </div>
      <p className="text-white text-[14px] font-medium">{message}</p>
      {subMessage && (
        <p className="text-[#71717A] text-[13px] mt-1 text-center max-w-[240px] leading-relaxed">
          {subMessage}
        </p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-14">
      <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NotificationPanel() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;

  const panelRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ─── Browser Notification Permission ─── */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {
        // Permission denied or unavailable — silently ignore
      });
    }
  }, []);

  /* ─── Toggle panel via custom event ─── */
  useEffect(() => {
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    window.addEventListener("toggle-notifications", handleToggle);
    return () => window.removeEventListener("toggle-notifications", handleToggle);
  }, []);

  /* ─── Click outside to close ─── */
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    // Use a short delay to avoid the toggle button click closing the panel
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* ─── Dispatch unread count to header ─── */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("notification-count-update", {
        detail: { count: unreadCount },
      })
    );
  }, [unreadCount]);

  /* ─── Fetch notifications ─── */
  const fetchNotifications = useCallback(async () => {
    if (loading) return;
    if (!user?.id || user?.role !== "seeker") return;

    setLoading(true);
    try {
      const [statsResult, jobsResult] = await Promise.all([
        protectedClientFetch("/api/seeker/stats"),
        clientFetch("/api/jobs?status=active&perPage=5"),
      ]);

      const applicationNotifs = mapApplicationsToNotifications(
        statsResult?.recentApplications
      );
      const jobNotifs = mapJobsToNotifications(
        Array.isArray(jobsResult)
          ? jobsResult
          : jobsResult?.jobs || jobsResult?.data || []
      );

      // Combine and sort by time (newest first)
      const combined = [...applicationNotifs, ...jobNotifs].sort(
        (a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()
      );

      setNotifications(combined);

      // Determine unread by comparing with localStorage
      const seenIds = getSeenNotificationIds();
      const allIds = combined.map(buildNotificationId);
      const newUnreadCount = allIds.filter((id) => !seenIds.includes(id)).length;
      setUnreadCount(newUnreadCount);

      // Show browser notifications for truly new items
      allIds.forEach((id, idx) => {
        if (!seenIds.includes(id)) {
          const notif = combined[idx];
          showBrowserNotification(notif);
        }
      });
    } catch (err) {
      console.warn("[NotificationPanel] Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, loading]);

  /* ─── Fetch when panel opens ─── */
  useEffect(() => {
    if (open && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  /* ─── Mark all as seen when panel opens ─── */
  useEffect(() => {
    if (open && notifications.length > 0) {
      const allIds = notifications.map(buildNotificationId);
      saveSeenNotificationIds(allIds);
      setUnreadCount(0);
    }
  }, [open, notifications.length]);

  /* ─── Close panel ─── */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /* ─── Mark all read (explicit button) ─── */
  const handleMarkAllRead = useCallback(() => {
    const allIds = notifications.map(buildNotificationId);
    saveSeenNotificationIds(allIds);
    setUnreadCount(0);
  }, [notifications]);

  /* ─── Allow re-fetch on next open ─── */
  useEffect(() => {
    if (!open) {
      // Reset so next open triggers a fresh fetch
      hasFetchedRef.current = false;
    }
  }, [open]);

  /* ─── Non-seeker or loading session ─── */
  if (sessionLoading) return null;

  if (user?.role && user.role !== "seeker") {
    return (
      open && (
        <div
          ref={panelRef}
          className="fixed top-[72px] right-[280px] z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-[#1B1B1F] border border-white/[0.06] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-200 max-xl:right-4"
        >
          <EmptyState
            message="Notifications coming soon!"
            subMessage="We're building notification support for your role. Stay tuned!"
          />
        </div>
      )
    );
  }

  /* ─── Render Panel ─── */
  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-[72px] right-[280px] z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-[#1B1B1F] border border-white/[0.06] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-200 max-xl:right-4"
      role="dialog"
      aria-label="Notifications"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <h3 className="text-white text-[15px] font-semibold font-[family-name:var(--font-inter)]">
          Notifications
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              <Check size={13} aria-hidden="true" />
              Mark all read
            </button>
          )}
          <button
            onClick={handleClose}
            aria-label="Close notifications"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      {loading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState
          message="No notifications yet"
          subMessage="We'll notify you when something important happens."
        />
      ) : (
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {notifications.map((notif) => {
            const seenIds = getSeenNotificationIds();
            const notifId = buildNotificationId(notif);
            const isUnread = !seenIds.includes(notifId);
            return (
              <NotificationItem
                key={notifId}
                notification={notif}
                isUnread={isUnread}
              />
            );
          })}
        </div>
      )}

      {/* ─── Footer ─── */}
      {!loading && notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={handleClose}
            className="w-full text-center text-[13px] text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors duration-200"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BROWSER NOTIFICATION HELPER (module-level, not inside component)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Show a browser (OS-level) notification if permission is granted.
 */
function showBrowserNotification(notification) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    const n = new Notification(notification.title, {
      body: notification.description || "",
      icon: LOGO_ICON,
    });

    // Auto-close after 5 seconds
    setTimeout(() => n.close(), 5000);
  } catch {
    // Browser notifications may fail in some environments (e.g. iframes)
  }
}