"use client";

import React from "react";

/* ═══════════════════════════════════════════════════
   PROFESSIONAL SKELETON LOADING COMPONENTS
   Mimics the layout of real content for perceived performance.
   ═══════════════════════════════════════════════════ */

const pulse = "animate-pulse bg-white/[0.06]";

/* ─── Tiny shared shimmer bar ─── */
function Shimmer({ className = "" }) {
  return <div className={`${pulse} rounded-md ${className}`} />;
}

/* ═══════════════════════════════════════════════════
   STAT / KPI CARD SKELETON
   ═══════════════════════════════════════════════════ */

export function StatCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[90px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Shimmer className="w-24 h-3.5" />
            <Shimmer className="w-4 h-4 rounded-full" />
          </div>
          <Shimmer className="w-16 h-9" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   JOB CARD SKELETON (saved-jobs & browse-jobs)
   ═══════════════════════════════════════════════════ */

export function JobCardSkeleton({ count = 3 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Shimmer className="w-12 h-12 rounded-[12px] shrink-0" />
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <Shimmer className="w-3/4 h-5" />
              <div className="flex items-center gap-2">
                <Shimmer className="w-20 h-6 rounded-full" />
                <Shimmer className="w-24 h-6 rounded-full" />
                <Shimmer className="w-16 h-6 rounded-full" />
              </div>
            </div>
            {/* Right side */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <Shimmer className="w-14 h-3" />
              <div className="flex items-center gap-2">
                <Shimmer className="w-9 h-9 rounded-full" />
                <Shimmer className="w-20 h-9 rounded-[10px]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TABLE ROW SKELETON (applications page)
   ═══════════════════════════════════════════════════ */

export function TableRowSkeleton({ count = 5 }) {
  return (
    <div>
      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="w-20 h-[34px] rounded-full" />
        ))}
      </div>
      {/* Header row */}
      <div className="flex items-center h-12 px-6 border-y border-white/[0.05]">
        <Shimmer className="w-20 h-3 flex-[2]" />
        <Shimmer className="w-16 h-3 flex-1 hidden md:block" />
        <Shimmer className="w-14 h-3 w-28 hidden sm:block" />
        <Shimmer className="w-14 h-3 w-32" />
        <Shimmer className="w-10 h-3 w-24 ml-auto" />
      </div>
      {/* Body rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center h-[72px] px-6 border-t border-white/[0.05]"
        >
          <div className="flex-[2] flex items-center gap-4 min-w-0">
            <Shimmer className="w-9 h-9 rounded-[10px] shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <Shimmer className="w-48 h-4" />
              <Shimmer className="w-28 h-3" />
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <Shimmer className="w-24 h-4" />
          </div>
          <div className="w-28 hidden sm:block">
            <Shimmer className="w-16 h-3" />
          </div>
          <div className="w-32">
            <Shimmer className="w-20 h-[26px] rounded-full" />
          </div>
          <div className="w-24 text-right">
            <Shimmer className="w-10 h-3 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROFILE CARD SKELETON (dashboard)
   ═══════════════════════════════════════════════════ */

export function ProfileCardSkeleton() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[220px] flex flex-col items-center justify-center text-center">
      <Shimmer className="w-16 h-16 rounded-full mb-3" />
      <Shimmer className="w-32 h-5 mb-2" />
      <Shimmer className="w-44 h-3.5 mb-4" />
      <Shimmer className="w-full h-10 rounded-[10px] max-w-[160px]" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STATUS CARD SKELETON (dashboard)
   ═══════════════════════════════════════════════════ */

export function StatusCardSkeleton() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-5 h-[220px] flex flex-col">
      <Shimmer className="w-36 h-4 mb-4" />
      <div className="flex-1 flex flex-col justify-center gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="w-20 h-3" />
            <div className="flex-1 h-[6px] bg-[#3A3A40] rounded-full overflow-hidden">
              <Shimmer className="w-full h-full rounded-full" />
            </div>
            <Shimmer className="w-4 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACTIVITY ITEM SKELETON (dashboard)
   ═══════════════════════════════════════════════════ */

export function ActivityItemSkeleton({ count = 5 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 h-[58px] bg-[#1B1B1F] border border-white/[0.05] rounded-[12px] px-[18px]"
        >
          <Shimmer className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-1">
            <Shimmer className="w-4/5 h-3.5" />
          </div>
          <Shimmer className="w-12 h-3 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SETTINGS PAGE SKELETON
   ═══════════════════════════════════════════════════ */

export function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Shimmer className="w-48 h-10 mb-2" />
        <Shimmer className="w-72 h-4" />
      </div>

      {/* Profile + Resume grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 col-span-1 lg:col-span-2 space-y-6">
          <Shimmer className="w-40 h-4.5" />
          <div className="flex items-center gap-5">
            <Shimmer className="w-16 h-16 rounded-full shrink-0" />
            <div className="space-y-2">
              <Shimmer className="w-28 h-8 rounded-md" />
              <Shimmer className="w-36 h-3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Shimmer className="w-16 h-3" />
              <Shimmer className="w-full h-10 rounded-[10px]" />
            </div>
            <div className="space-y-2">
              <Shimmer className="w-24 h-3" />
              <Shimmer className="w-full h-10 rounded-[10px]" />
            </div>
          </div>
          <div className="border-t border-white/[0.05] my-2" />
          <Shimmer className="w-32 h-10 rounded-[10px]" />
        </div>

        {/* Resume card */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 space-y-4">
          <Shimmer className="w-16 h-4.5" />
          <Shimmer className="w-52 h-3" />
          <div className="border border-dashed border-white/[0.1] rounded-[12px] p-6 text-center space-y-3">
            <Shimmer className="w-8 h-8 rounded mx-auto" />
            <Shimmer className="w-32 h-3.5 mx-auto" />
            <Shimmer className="w-24 h-8 rounded-md mx-auto" />
          </div>
        </div>
      </div>

      {/* Professional details */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 space-y-6">
        <Shimmer className="w-44 h-4.5" />
        <div className="space-y-2">
          <Shimmer className="w-16 h-3" />
          <Shimmer className="w-full h-10 rounded-[10px]" />
        </div>
        <div className="space-y-2">
          <Shimmer className="w-10 h-3" />
          <Shimmer className="w-full h-[120px] rounded-[10px]" />
        </div>
        <div className="space-y-2">
          <Shimmer className="w-12 h-3" />
          <Shimmer className="w-full h-[44px] rounded-[10px]" />
        </div>
        <Shimmer className="w-32 h-10 rounded-[10px]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SAVED JOBS PAGE SKELETON (full page)
   ═══════════════════════════════════════════════════ */

export function SavedJobsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Shimmer className="w-40 h-10 mb-2" />
          <Shimmer className="w-72 h-4" />
        </div>
        <div className="flex gap-3">
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[12px] p-4 h-[76px] w-[160px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Shimmer className="w-20 h-3" />
              <Shimmer className="w-4 h-4 rounded-full" />
            </div>
            <Shimmer className="w-10 h-7" />
          </div>
          <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[12px] p-4 h-[76px] w-[160px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Shimmer className="w-16 h-3" />
              <Shimmer className="w-4 h-4 rounded-full" />
            </div>
            <Shimmer className="w-8 h-7" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] h-[60px] flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="w-20 h-9 rounded-full" />
          ))}
        </div>
        <Shimmer className="w-32 h-5" />
      </div>

      {/* Job cards */}
      <JobCardSkeleton count={4} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BROWSE JOBS PAGE SKELETON (full page)
   ═══════════════════════════════════════════════════ */

export function JobsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Shimmer className="w-48 h-8 mb-2" />
        <Shimmer className="w-80 h-4" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] h-[56px] flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <Shimmer className="w-48 h-10 rounded-[10px]" />
          <Shimmer className="w-32 h-10 rounded-[10px]" />
          <Shimmer className="w-28 h-10 rounded-[10px] hidden sm:block" />
        </div>
        <Shimmer className="w-24 h-10 rounded-[10px]" />
      </div>

      {/* Job cards */}
      <JobCardSkeleton count={6} />

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="w-9 h-9 rounded-md" />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BILLING PAGE SKELETON (full page)
   ═══════════════════════════════════════════════════ */

export function BillingPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Shimmer className="w-64 h-10 mb-2" />
        <Shimmer className="w-96 h-4" />
      </div>

      {/* Plan + Payment grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan card */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 space-y-5">
          <Shimmer className="w-20 h-6 rounded-md" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Shimmer className="w-28 h-6" />
              <Shimmer className="w-52 h-4" />
            </div>
            <div className="space-y-1 text-right">
              <Shimmer className="w-20 h-8" />
              <Shimmer className="w-28 h-3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shimmer className="w-4 h-4 rounded-full shrink-0" />
                <Shimmer className="w-36 h-3" />
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-1">
            <Shimmer className="w-32 h-10 rounded-[10px]" />
            <Shimmer className="w-28 h-10 rounded-[10px]" />
          </div>
        </div>

        {/* Payment card */}
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Shimmer className="w-32 h-4.5" />
            <Shimmer className="w-28 h-6 rounded-md" />
          </div>
          <div className="bg-gradient-to-br from-[#2A2A2E] to-[#1B1B1F] rounded-[12px] p-5 border border-white/[0.06] space-y-6">
            <div className="flex justify-end">
              <Shimmer className="w-7 h-7 rounded" />
            </div>
            <div className="space-y-1">
              <Shimmer className="w-48 h-5 mx-auto" />
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <Shimmer className="w-20 h-3" />
                <Shimmer className="w-28 h-4" />
              </div>
              <div className="space-y-1 text-right">
                <Shimmer className="w-14 h-3" />
                <Shimmer className="w-12 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Shimmer className="w-36 h-4.5" />
          <Shimmer className="w-24 h-4" />
        </div>
        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden">
          {/* Table header */}
          <div className="flex items-center h-12 border-b border-white/[0.05] px-6">
            <Shimmer className="w-12 h-3 flex-1" />
            <Shimmer className="w-12 h-3 flex-1 hidden sm:block" />
            <Shimmer className="w-12 h-3 flex-1 hidden md:block" />
            <Shimmer className="w-16 h-3 flex-1 hidden lg:block" />
            <Shimmer className="w-10 h-3 w-24 ml-auto" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center h-14 border-t border-white/[0.05] px-6"
            >
              <Shimmer className="w-20 h-4 flex-1" />
              <Shimmer className="w-24 h-4 flex-1 hidden sm:block" />
              <Shimmer className="w-16 h-4 flex-1 hidden md:block" />
              <Shimmer className="w-28 h-3 flex-1 font-mono hidden lg:block" />
              <Shimmer className="w-12 h-[22px] rounded-full w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Support CTA */}
      <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Shimmer className="w-48 h-4" />
          <Shimmer className="w-80 h-3" />
        </div>
        <div className="flex items-center gap-4">
          <Shimmer className="w-36 h-10 rounded-[10px]" />
          <Shimmer className="w-28 h-4" />
        </div>
      </div>
    </div>
  );
}