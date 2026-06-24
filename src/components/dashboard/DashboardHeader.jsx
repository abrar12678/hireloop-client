"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientMutation, clientDelete } from "@/lib/core/client";
import { Search, Mail, Bell, X, Check, Bookmark, FileText, Briefcase, CreditCard, Settings, LayoutDashboard, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════
   NAVIGATION SEARCH CONFIG
   ═══════════════════════════════════════════════════ */
const SEARCHABLE_PAGES = [
  { keywords: ["dashboard", "home", "overview"], href: "/dashboard/seeker", label: "Dashboard", icon: LayoutDashboard },
  { keywords: ["job", "jobs", "search", "browse", "find", "work", "position", "career", "opportunity"], href: "/dashboard/seeker/jobs", label: "Jobs", icon: Briefcase },
  { keywords: ["saved", "bookmark", "bookmarked", "favorite"], href: "/dashboard/seeker/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { keywords: ["application", "applications", "applied", "apply", "tracking", "status"], href: "/dashboard/seeker/applications", label: "Applications", icon: FileText },
  { keywords: ["billing", "payment", "subscription", "plan", "pricing", "invoice", "upgrade"], href: "/dashboard/seeker/billing", label: "Billing", icon: CreditCard },
  { keywords: ["setting", "settings", "profile", "account", "edit", "update", "preference"], href: "/dashboard/seeker/settings", label: "Settings", icon: Settings },
];

const NOTIFICATION_ICONS = {
  welcome: Sparkles,
  "job_applied": FileText,
  "application_status": FileText,
  "saved_company": Bookmark,
  "new_job_post": Briefcase,
  "subscription": CreditCard,
  "login": Sparkles,
};

const NOTIFICATION_COLORS = {
  welcome: "#6B63FF",
  "job_applied": "#3B82F6",
  "application_status": "#F59E0B",
  "saved_company": "#22C55E",
  "new_job_post": "#3B82F6",
  "subscription": "#22C55E",
  "login": "#6B63FF",
};

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

function formatNotifTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(typeof dateInput === "object" && dateInput.$date ? dateInput.$date : dateInput);
  if (isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ═══════════════════════════════════════════════════
   DASHBOARD HEADER
   ═══════════════════════════════════════════════════ */
export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();

  // ─── Search State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);

  // ─── Notification State ───
  const [notifications, setNotifications] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);
  const notifRef = useRef(null);
  const hasRequestedPermission = useRef(false);

  // ─── Role-based search pages ───
  const role = user?.role || "seeker";
  const roleSearchPages = SEARCHABLE_PAGES.map(p => ({
    ...p,
    href: p.href.replace("/dashboard/seeker", `/dashboard/${role}`),
  }));

  // ─── Search Logic ───
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = roleSearchPages.filter(page =>
      page.keywords.some(kw => kw.includes(q) || q.includes(kw))
    );
    setSearchResults(matches.length > 0 ? matches : "no_results");
  }, [searchQuery, role]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchSelect = (href) => {
    setSearchQuery("");
    setSearchFocused(false);
    setSearchResults([]);
    setHighlightedIndex(-1);
    router.push(href);
  };

  // ─── Keyboard Navigation for Search ───
  const resultItems = useMemo(() => (Array.isArray(searchResults) ? searchResults : []), [searchResults]);

  const handleSearchKeyDown = (e) => {
    if (!searchFocused || !resultItems.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % resultItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + resultItems.length) % resultItems.length);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSearchSelect(resultItems[highlightedIndex].href);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setHighlightedIndex(-1);
    }
  };

  // ─── Notification Permission ───
  useEffect(() => {
    if (hasRequestedPermission.current || !user) return;
    hasRequestedPermission.current = true;

    // Request browser notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Create welcome notification ONLY once per login session
    (async () => {
      try {
        const welcomed = sessionStorage.getItem("hireloop_welcomed");
        if (!welcomed) {
          // First time this session — create welcome and set flag
          await clientMutation("/notifications", {
            type: "welcome",
            title: "Welcome back!",
            message: `Hi ${user.name || "there"}, welcome to HireLoop! Explore jobs and build your career.`,
          });
          sessionStorage.setItem("hireloop_welcomed", "true");
        }
        // Always fetch recent notifications (max 5)
        const notifs = await protectedClientFetch("/notifications");
        if (Array.isArray(notifs)) {
          setNotifications(notifs.slice(0, 5));
          setHasNewNotifs(notifs.length > 0);
        }
      } catch (err) {
        console.error("Failed to init notifications:", err);
      }
    })();
  }, [user]);

  // ─── Fetch notifications periodically ───
  const fetchNotifications = useCallback(async () => {
    try {
      const notifs = await protectedClientFetch("/notifications");
      if (Array.isArray(notifs)) {
        setNotifications(notifs.slice(0, 5));
        setHasNewNotifs(notifs.length > 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // ─── Mark all as read / clear all ───
  const handleMarkAllRead = async () => {
    try {
      await clientDelete("/notifications");
      setNotifications([]);
      setHasNewNotifs(false);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-5 px-6 xl:px-8 py-4 border-b border-white/[0.06] bg-[#0E0E11]"
      role="banner"
    >
      {/* Search Bar */}
      <div className="relative max-w-[420px] flex-1" ref={searchRef}>
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search for services"
          aria-label="Search for services"
          className="w-full h-10 bg-[#1B1B1F] border border-white/[0.08] rounded-full pl-11 pr-5 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-white/[0.16] transition-colors duration-200 font-[family-name:var(--font-inter)]"
        />

        {/* Search Results Dropdown */}
        {searchFocused && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B1B1F] border border-white/[0.08] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden z-50">
            {searchResults === "no_results" ? (
              <div className="px-5 py-4 text-center">
                <p className="text-[14px] text-[#A1A1AA] font-medium">No service found</p>
                <p className="text-[12px] text-[#71717A] mt-1">Try &quot;Jobs&quot;, &quot;Applications&quot;, &quot;Settings&quot;</p>
              </div>
            ) : (
              searchResults.map((page, idx) => {
                const IconComp = page.icon;
                return (
                  <button
                    key={page.href}
                    onClick={() => handleSearchSelect(page.href)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors duration-150 cursor-pointer ${
                      idx === highlightedIndex ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                    } ${
                      pathname === page.href || pathname.startsWith(page.href + "/") ? "bg-white/[0.04]" : ""
                    }`}
                  >
                    <IconComp size={16} className="text-[#71717A] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-[14px] text-white font-medium">{page.label}</p>
                      <p className="text-[12px] text-[#71717A]">{page.href.split("/").pop()}</p>
                    </div>
                    {pathname === page.href && (
                      <Check size={14} className="text-[#22C55E] ml-auto shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right Side — Action Icons */}
      <div className="flex items-center gap-3">
        {/* Messages */}
        <button
          onClick={() => router.push('/dashboard/seeker/applications')}
          aria-label="Messages"
          title="View your application messages"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
        >
          <Mail size={20} aria-hidden="true" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifPanelOpen(!notifPanelOpen)}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
          >
            <Bell size={20} aria-hidden="true" />
            {hasNewNotifs && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse" />
            )}
          </button>

          {/* Notification Panel */}
          {notifPanelOpen && (
            <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-[#1B1B1F] border border-white/[0.08] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <h3 className="text-[15px] font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-[#3B82F6] hover:text-[#5B9BF6] transition-colors duration-150 cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell size={32} className="text-[#3A3A40] mb-3" aria-hidden="true" />
                    <p className="text-[14px] text-[#71717A]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => {
                    const IconComp = NOTIFICATION_ICONS[notif.type] || Bell;
                    const iconColor = NOTIFICATION_COLORS[notif.type] || "#3B82F6";
                    return (
                      <div
                        key={notif._id || idx}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors duration-150 border-b border-white/[0.03] last:border-b-0"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${iconColor}20` }}
                        >
                          <IconComp size={14} style={{ color: iconColor }} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white font-medium leading-snug">{notif.title}</p>
                          <p className="text-[12px] text-[#71717A] mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                          <p className="text-[11px] text-[#3A3A40] mt-1.5">{formatNotifTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-sm font-medium cursor-pointer overflow-hidden"
          role="img"
          aria-label={`Profile of ${user?.name || "User"}`}
        >
          {user?.image ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </div>
      </div>
    </header>
  );
}