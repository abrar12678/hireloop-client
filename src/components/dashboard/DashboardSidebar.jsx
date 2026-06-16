"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  House,
  Factory,
  Briefcase,
  FileText,
  Gear,
  LayoutSideContentLeft,
  Magnifier,
  CreditCard,
  Bookmark,
} from "@gravity-ui/icons";
import { Building, Users } from "lucide-react";
import { Button, Drawer } from "@heroui/react";
import Link from "next/link";

const recruiterNavLinks = [
  { icon: House, href: "/dashboard/recruiter", label: "Dashboard" },
  { icon: Factory, href: "/dashboard/recruiter/company", label: "My Company" },
  { icon: Briefcase, href: "/dashboard/recruiter/jobs", label: "Manage Jobs" },
  { icon: FileText, href: "/dashboard/recruiter/applications", label: "Applications" },
  { icon: Gear, href: "/dashboard/recruiter/settings", label: "Settings" },
];

const seekerNavLinks = [
  { icon: House, href: "/dashboard/seeker", label: "Dashboard" },
  { icon: Magnifier, href: "/dashboard/seeker/jobs", label: "Jobs" },
  { icon: Bookmark, href: "/dashboard/seeker/saved-jobs", label: "Saved Jobs" },
  { icon: FileText, href: "/dashboard/seeker/applications", label: "Applications" },
  { icon: CreditCard, href: "/dashboard/seeker/billing", label: "Billing" },
  { icon: Gear, href: "/dashboard/seeker/settings", label: "Settings" },
];

const adminNavLinks = [
  { icon: House, href: "/dashboard/admin", label: "Dashboard" },
  { icon: Users, href: "/dashboard/admin/users", label: "Users" },
  { icon: Building, href: "/dashboard/admin/companies", label: "Companies" },
  { icon: Briefcase, href: "/dashboard/admin/jobs", label: "Jobs" },
  { icon: CreditCard, href: "/dashboard/admin/payments", label: "Payments" },
  { icon: Gear, href: "/dashboard/admin/settings", label: "Settings" },
];

const navLinksMap = {
  seeker: seekerNavLinks,
  recruiter: recruiterNavLinks,
  admin: adminNavLinks,
};

function SidebarContent({ user }) {
  const pathname = usePathname();
  const navItems = navLinksMap[user?.role] ?? seekerNavLinks;

  const isActive = (href) => {
    if (href === `/dashboard/${user?.role}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00D4AA] flex items-center justify-center">
            <span className="text-black font-bold text-sm">H</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Hire<span className="text-[#00D4AA]">Loop</span>
          </span>
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="mx-3 mb-5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#6366F1] flex items-center justify-center text-white font-bold text-lg mb-3 ring-2 ring-[#00D4AA]/20 ring-offset-2 ring-offset-[#1E1E1E]">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <h3 className="text-white font-semibold text-sm">
            {user?.name || "User"}
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5 capitalize">
            {user?.role || "Recruiter"}
          </p>
          <span className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-[10px] font-semibold uppercase tracking-wider border border-[#00D4AA]/20">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="text-[#00D4AA]"
            >
              <path
                d="M5 0L6.2 3.8L10 5L6.2 6.2L5 10L3.8 6.2L0 5L3.8 3.8L5 0Z"
                fill="currentColor"
              />
            </svg>
            Premium Account
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems?.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.06] text-white border-l-2 border-[#00D4AA] pl-[11px]"
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200 border-l-2 border-transparent pl-[11px]"
              }`}
            >
              <item.icon
                className="size-[18px] shrink-0"
                style={{ color: active ? "#00D4AA" : undefined }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 pt-4 border-t border-white/[0.06]">
        <Link
          href="/auth/signIn"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300 transition-colors border-l-2 border-transparent pl-[11px]"
        >
          <svg
            className="size-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Sign Out
        </Link>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <aside className="hidden w-[220px] shrink-0 lg:block bg-[#1E1E1E] border-r border-white/[0.06]" />
    );
  }

  const sidebarContent = <SidebarContent user={user} />;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[220px] shrink-0 lg:flex lg:flex-col bg-[#1E1E1E] border-r border-white/[0.06] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <Drawer>
        <Button className="lg:hidden fixed top-4 left-4 z-50 bg-[#1E1E1E] border border-white/[0.06] text-white" variant="secondary">
          <LayoutSideContentLeft />
          Menu
        </Button>
        <Drawer.Backdrop>
          <Drawer.Content placement="left" className="bg-[#1E1E1E]">
            <Drawer.Dialog>
              <Drawer.CloseTrigger className="text-white" />
              <Drawer.Header>
                <Drawer.Heading className="sr-only">Navigation</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>{sidebarContent}</Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}