"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Search, Mail, Bell } from "lucide-react";

export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-5 px-6 xl:px-8 py-4 border-b border-white/[0.06]"
      role="banner"
    >
      {/* Search Bar — Pill Shape */}
      <div className="relative max-w-[420px] flex-1">
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for opportunities..."
          aria-label="Search for opportunities"
          className="w-full h-10 bg-[#1B1B1F] border border-white/[0.08] rounded-full pl-11 pr-5 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-white/[0.16] transition-colors duration-200 font-[family-name:var(--font-inter)]"
        />
      </div>

      {/* Right Side — Action Icons */}
      <div className="flex items-center gap-5">
        {/* Mail */}
        <button
          aria-label="Messages"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:opacity-80 transition-all duration-200"
        >
          <Mail size={20} aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:opacity-80 transition-all duration-200"
        >
          <Bell size={20} aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full" />
        </button>

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