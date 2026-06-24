"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  CreditCard,
  Settings,
  Building2,
  Briefcase,
  Users,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

/* ─── Navigation Config ─── */
const seekerNavLinks = [
  { icon: LayoutDashboard, href: "/dashboard/seeker", label: "Dashboard" },
  { icon: Search, href: "/dashboard/seeker/jobs", label: "Jobs" },
  { icon: Bookmark, href: "/dashboard/seeker/saved-jobs", label: "Saved Jobs" },
  { icon: FileText, href: "/dashboard/seeker/applications", label: "Applications" },
  { icon: CreditCard, href: "/dashboard/seeker/billing", label: "Billing" },
  { icon: Settings, href: "/dashboard/seeker/settings", label: "Settings" },
];

const recruiterNavLinks = [
  { icon: LayoutDashboard, href: "/dashboard/recruiter", label: "Dashboard" },
  { icon: Building2, href: "/dashboard/recruiter/company", label: "My Company" },
  { icon: Briefcase, href: "/dashboard/recruiter/jobs", label: "Manage Jobs" },
  { icon: FileText, href: "/dashboard/recruiter/applications", label: "Applications" },
  { icon: Settings, href: "/dashboard/recruiter/settings", label: "Settings" },
];

const adminNavLinks = [
  { icon: LayoutDashboard, href: "/dashboard/admin", label: "Dashboard" },
  { icon: Users, href: "/dashboard/admin/users", label: "Users" },
  { icon: Building2, href: "/dashboard/admin/companies", label: "Companies" },
  { icon: Briefcase, href: "/dashboard/admin/jobs", label: "Jobs" },
  { icon: CreditCard, href: "/dashboard/admin/payments", label: "Payments" },
  { icon: Settings, href: "/dashboard/admin/settings", label: "Settings" },
];

const navLinksMap = {
  seeker: seekerNavLinks,
  recruiter: recruiterNavLinks,
  admin: adminNavLinks,
};

/* ─── Helpers ─── */
const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

/* ─── Sidebar Navigation Item ─── */
function SidebarNavItem({ icon: Icon, href, label, active }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 h-10 px-3.5 rounded-[10px] text-[15px] font-medium transition-colors duration-200 ${
        active
          ? "bg-[#3A3A40] text-white"
          : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-[#E4E4E7]"
      }`}
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={active ? "text-white" : "text-[#A1A1AA]"}
      />
      <span>{label}</span>
    </Link>
  );
}

/* ─── User Profile Summary ─── */
function UserProfileSummary({ user }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className="w-10 h-10 rounded-full bg-[#3A3A40] flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {user?.image ? (
          <img src={user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          getInitials(user?.name)
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white text-[15px] font-medium truncate">
          {user?.name || "User"}
        </p>
        <p className="text-[#71717A] text-[13px] capitalize truncate">
          {user?.role === "seeker" ? "Seeker Portal" : `${user?.role || "Seeker"} Portal`}
        </p>
      </div>
    </div>
  );
}

/* ─── Sidebar Content (shared between desktop & mobile) ─── */
function SidebarContent({ user, onNavClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navLinksMap[user?.role] ?? seekerNavLinks;

  const isActive = (href) => {
    if (href === `/dashboard/${user?.role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      // Clear notifications from DB and session flag
      try {
        const res = await fetch("/api/backend/notifications", {
          method: "DELETE",
          credentials: "include",
        });
        await res.json();
      } catch {}
      sessionStorage.removeItem("hireloop_welcomed");
      await signOut();
    } catch {}
    // Small delay ensures the session cookie is fully cleared before navigation
    setTimeout(() => window.location.replace("/"), 150);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <Link href="/" className="block">
          <span className="text-white font-bold text-2xl tracking-tight">HireLoop</span>
          {user?.role === "admin" && (
            <span className="block text-[11px] text-[#71717A] mt-0.5 font-medium tracking-wide">ADMIN CONSOLE</span>
          )}
        </Link>
      </div>

      {/* User Card — Horizontal */}
      <div className="px-6 pb-6">
        <UserProfileSummary user={user} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-1" aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.label}
            {...item}
            active={isActive(item.href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 pt-4 border-t border-white/[0.06] mt-2">
        {/* Role-specific CTA: Post Resume (Seeker) / Profile (Recruiter/Admin) */}
        {user?.role === "seeker" ? (
          <button
            onClick={() => router.push("/dashboard/seeker/settings")}
            aria-label="Post Resume"
            className="w-full h-11 bg-white text-black text-[15px] font-medium rounded-[10px] hover:bg-zinc-200 transition-colors duration-200 mb-2 cursor-pointer"
          >
            Post Resume
          </button>
        ) : (
          <Link
            href={`/dashboard/${user?.role || "recruiter"}/settings`}
            aria-label="Go to settings"
            className="w-full flex items-center gap-3 h-11 px-3.5 rounded-[10px] text-[15px] font-medium text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors duration-200 mb-2"
          >
            <User size={18} aria-hidden="true" />
            <span className="truncate">{user?.name || "Recruiter"}</span>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          aria-label="Logout"
          className="flex items-center gap-3 h-10 px-3.5 rounded-[10px] text-[15px] font-medium text-[#71717A] hover:bg-white/[0.04] hover:text-[#A1A1AA] transition-colors duration-200 w-full"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   EXPORTED SIDEBAR COMPONENT
   ═══════════════════════════════════════════ */
export function DashboardSidebar() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isPending) {
    return (
      <aside
        className="hidden xl:block bg-[#090909] border-r border-white/[0.06] h-screen sticky top-0"
        aria-label="Sidebar loading"
      />
    );
  }

  const sidebarContent = <SidebarContent user={user} onNavClick={() => setMobileOpen(false)} />;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden xl:flex xl:flex-col bg-[#090909] border-r border-white/[0.06] h-screen sticky top-0 overflow-y-auto w-[240px] shrink-0"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="xl:hidden fixed top-5 left-5 z-50 w-11 h-11 rounded-[10px] bg-[#1B1B1F] border border-white/[0.06] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors duration-200"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div
            className="xl:hidden fixed inset-0 bg-black/60 z-50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="xl:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#090909] border-r border-white/[0.06] overflow-y-auto flex flex-col"
            aria-label="Mobile sidebar navigation"
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-5 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors duration-200"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}