"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, CircleDollar, Bookmark } from "@gravity-ui/icons";

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

export default function JobCard({ job }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const jobId = job._id?.$oid || job._id;

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
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                {job.jobTitle}
              </h3>
              <p className="text-sm text-[#CCCCCC] mt-0.5 truncate">
                {job.companyName || "Confidential"}
              </p>
            </div>

            {/* Bookmark */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-zinc-700/40 transition-colors mt-0.5"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
            >
              {isBookmarked ? (
                <Bookmark className="w-5 h-5 text-purple-400 fill-purple-400" />
              ) : (
                <Bookmark className="w-5 h-5 text-zinc-500 hover:text-zinc-300 transition-colors" />
              )}
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
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 whitespace-nowrap"
          >
            Easy Apply
          </a>
        </div>
      </div>
    </motion.div>
  );
}