"use client";

import React from "react";
import { useSession } from "@/lib/auth-client";
import { motion } from "motion/react";
import {
  Briefcase,
  Persons,
  Thunderbolt,
  CircleCheck,
  ArrowRight,
  Plus,
} from "@gravity-ui/icons";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import Link from "next/link";

/* ────────────────────────── mock data ────────────────────────── */

const recentApplications = [
  { name: "Sarah Johnson", role: "Senior Frontend Developer", date: "Jan 15, 2025", experience: "5 years", status: "Interviewing" },
  { name: "Marcus Chen", role: "Product Designer", date: "Jan 14, 2025", experience: "3 years", status: "New" },
  { name: "Emily Davis", role: "Backend Engineer", date: "Jan 13, 2025", experience: "7 years", status: "Reviewing" },
  { name: "James Wilson", role: "DevOps Engineer", date: "Jan 12, 2025", experience: "4 years", status: "Interviewing" },
  { name: "Aria Patel", role: "Data Scientist", date: "Jan 11, 2025", experience: "6 years", status: "Rejected" },
  { name: "Tom Anderson", role: "Full Stack Developer", date: "Jan 10, 2025", experience: "2 years", status: "New" },
];

const topCompanies = [
  { name: "Google Inc.", industry: "Technology", location: "Mountain View, CA", jobs: 24, color: "#4285F4", letter: "G" },
  { name: "Meta Platforms", industry: "Social Media", location: "Menlo Park, CA", jobs: 18, color: "#1877F2", letter: "M" },
  { name: "Stripe", industry: "Fintech", location: "San Francisco, CA", jobs: 12, color: "#635BFF", letter: "S" },
  { name: "Tesla", industry: "Automotive", location: "Austin, TX", jobs: 31, color: "#CC0000", letter: "T" },
];

/* ────────────────────────── status badge ────────────────────────── */

const statusStyles = {
  Interviewing: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  New: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
  Reviewing: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

/* ────────────────────────── component ────────────────────────── */

const RecruiterDashboardHomePage = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user;

  const recruiterStats = [
    { title: "Total Job Posts", value: "48", icon: Briefcase },
    { title: "Total Applicants", value: "1,284", icon: Persons },
    { title: "Active Jobs", value: "18", icon: Thunderbolt },
    { title: "Jobs Closed", value: "32", icon: CircleCheck },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Here&apos;s an overview of your recruiting activity.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DashboardStats statsData={recruiterStats} />
      </motion.div>

      {/* ──── Recent Applications Table ──── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#18181b] border border-zinc-800/60 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <h3 className="text-base font-semibold text-white">
            Recent Applications
          </h3>
          <button className="text-xs font-medium text-[#00D4AA] hover:text-[#00D4AA]/80 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/40">
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Candidate Name
                </th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Date Applied
                </th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Experience
                </th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/30 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4AA]/30 to-[#6366F1]/30 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {app.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">
                        {app.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-400">
                    {app.role}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-500">
                    {app.date}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-400">
                    {app.experience}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusStyles[app.status]
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-zinc-800/30">
          {recentApplications.map((app, i) => (
            <div key={i} className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4AA]/30 to-[#6366F1]/30 flex items-center justify-center text-white text-xs font-semibold">
                    {app.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">
                    {app.name}
                  </span>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    statusStyles[app.status]
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{app.role}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>{app.date}</span>
                <span>·</span>
                <span>{app.experience}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ──── Top Companies ──── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Top Companies</h3>
          <Link
            href="/companies"
            className="text-xs font-medium text-[#00D4AA] hover:text-[#00D4AA]/80 flex items-center gap-1 transition-colors"
          >
            View All Companies <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCompanies.map((company, i) => (
            <div
              key={i}
              className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/60 transition-all group"
            >
              {/* Company Logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: company.color + "18", color: company.color }}
              >
                {company.letter}
              </div>

              <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[#00D4AA] transition-colors">
                {company.name}
              </h4>
              <p className="text-xs text-zinc-500 mb-3">{company.industry}</p>
              <p className="text-xs text-zinc-600 mb-4">{company.location}</p>

              <div className="pt-3 border-t border-zinc-800/40">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Active Jobs
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {company.jobs}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ──── FAB (Floating Action Button) ──── */}
      <Link
        href="/dashboard/recruiter/jobs/new"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black flex items-center justify-center shadow-lg shadow-[#00D4AA]/20 hover:shadow-[#00D4AA]/30 transition-all hover:scale-105 z-40"
        aria-label="Post a new job"
      >
        <Plus className="size-6" />
      </Link>
    </div>
  );
};

export default RecruiterDashboardHomePage;