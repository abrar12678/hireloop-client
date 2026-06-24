"use client";

import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { MapPin, CircleDollar } from "@gravity-ui/icons";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { clientMutation, clientDelete } from "@/lib/core/client";

const JOB_TYPE_STYLES = {
  "full-time": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  contract: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  "part-time": "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  freelance: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

function CompanyAvatar({ name, logo }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-[50px] h-[50px] rounded-lg object-cover flex-shrink-0"
      />
    );
  }

  const initial = (name || "C").charAt(0).toUpperCase();

  return (
    <div className="w-[50px] h-[50px] rounded-lg bg-[#2A2A2A] border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-semibold text-lg">{initial}</span>
    </div>
  );
}

export default function JobCard({ job, basePath = "/jobs", savedJobIds, onSavedChange }) {
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const jobId = job._id?.$oid || job._id;
  const jobIdStr = String(jobId || "");

  // Determine bookmark state from parent's Set — no individual API calls
  const isBookmarked = savedJobIds ? savedJobIds.has(jobIdStr) : false;

  const handleBookmarkToggle = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (bookmarkLoading) return;

      // If not logged in, redirect to sign-in with return URL
      if (!isLoggedIn) {
        router.push("/auth/signIn?redirect=/jobs");
        return;
      }

      setBookmarkLoading(true);

      try {
        if (isBookmarked) {
          // Unsave: find the saved-job document and delete it
          const { protectedClientFetch } = await import("@/lib/core/client");
          const saved = await protectedClientFetch("/saved-jobs");
          if (Array.isArray(saved)) {
            const target = saved.find((s) => {
              const sid =
                s.jobId?.$oid ||
                (typeof s.jobId === "object" ? String(s.jobId) : s.jobId);
              return String(sid || "") === jobIdStr;
            });
            if (target) {
              const docId = target._id?.$oid || target._id;
              await clientDelete(`/saved-jobs/${docId}`);
            }
          }
          onSavedChange?.(jobIdStr, false);
        } else {
          // Save
          await clientMutation("/saved-jobs", {
            jobId: jobIdStr,
            jobTitle: job?.jobTitle,
            companyName: job?.companyName,
            companyLogo: job?.companyLogo,
            location: job?.location,
          });
          onSavedChange?.(jobIdStr, true);
        }
      } catch (err) {
        console.error("Failed to toggle bookmark:", err);
      } finally {
        setBookmarkLoading(false);
      }
    },
    [
      isBookmarked,
      jobIdStr,
      job,
      bookmarkLoading,
      onSavedChange,
      isLoggedIn,
      router,
    ],
  );

  if (!job) return null;

  const formatSalary = (amount) => {
    if (!amount) return "0";
    const numericAmount = parseInt(amount, 10);
    return numericAmount >= 1000
      ? `$${numericAmount / 1000}k`
      : `$${numericAmount}`;
  };

  const salaryRange =
    job.minSalary && job.maxSalary
      ? `${formatSalary(job.minSalary)} – ${formatSalary(job.maxSalary)} / yr`
      : job.minSalary
        ? `${formatSalary(job.minSalary)} / yr`
        : "Negotiable";

  const isHot = job.isFeatured || job.isHot;
  const isSenior =
    job.jobTitle?.toLowerCase().includes("senior") ||
    job.jobTitle?.toLowerCase().includes("lead") ||
    job.jobTitle?.toLowerCase().includes("principal") ||
    job.jobTitle?.toLowerCase().includes("staff");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-[#1E1E1E] hover:bg-[#252525] border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl p-5 transition-colors duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Company Avatar */}
        <CompanyAvatar name={job.companyName} logo={job.companyLogo} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-3">
            <Link href={`${basePath}/${jobIdStr}`} className="min-w-0">
              <h3 className="text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                {job.jobTitle}
              </h3>
              <p className="text-sm text-[#CCCCCC] mt-0.5 truncate">
                {job.companyName || "Confidential"}
              </p>
            </Link>

            {/* Bookmark — Lucide icon supports fill prop natively */}
            <button
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-zinc-700/40 transition-colors mt-0.5 cursor-pointer disabled:opacity-50"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
            >
              <Bookmark
                size={20}
                className={
                  isBookmarked
                    ? "text-[#3B82F6]"
                    : "text-zinc-500 hover:text-zinc-300 transition-colors"
                }
                fill={isBookmarked ? "#3B82F6" : "none"}
              />
            </button>
          </div>

          {/* Location & Salary */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
            {job.location && (
              <span className="flex items-center gap-1.5 text-sm text-[#888888]">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {job.location}
                  {job.isRemote && " · Remote"}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-[#888888]">
              <CircleDollar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{salaryRange}</span>
            </span>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {job.jobType && (
              <span
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border capitalize ${
                  JOB_TYPE_STYLES[job.jobType] ||
                  "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
                }`}
              >
                {job.jobType.replace("-", " ")}
              </span>
            )}
            {isSenior && (
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/20">
                Senior
              </span>
            )}
            {isHot && (
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/20">
                🔥 Hot Job
              </span>
            )}
          </div>
        </div>

        {/* Easy Apply Button */}
        <div className="flex-shrink-0 flex items-center self-center">
          <a
            href={`${basePath}/${jobId}`}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6B63FF] to-[#5A54F5] hover:shadow-lg hover:shadow-[#6B63FF]/25 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Easy Apply
          </a>
        </div>
      </div>
    </motion.div>
  );
}
