"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Magnifier, Bell } from "@gravity-ui/icons";

export function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState("");

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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md px-6 py-3.5">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Magnifier className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search jobs, candidates, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-[#00D4AA]/40 focus:ring-1 focus:ring-[#00D4AA]/20 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <Bell className="size-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#00D4AA] to-[#6366F1] flex items-center justify-center text-white font-semibold text-sm cursor-pointer ring-2 ring-transparent hover:ring-[#00D4AA]/30 transition-all">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
      </div>
    </header>
  );
}