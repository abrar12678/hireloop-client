"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, DollarSign, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.12 + i * 0.1,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function CompanyAvatar({ name, logo }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-[44px] h-[44px] rounded-lg object-cover flex-shrink-0"
      />
    );
  }
  const initial = (name || "C").charAt(0).toUpperCase();
  return (
    <div className="w-[44px] h-[44px] rounded-lg bg-[#2A2A2A] border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-semibold text-base">{initial}</span>
    </div>
  );
}

export default function DiscoverJobs() {
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentJobs() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch("/api/backend/jobs?perPage=3", {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("[DiscoverJobs]", err.message);
        setJobs([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchRecentJobs();
  }, []);

  const formatSalary = (amount) => {
    if (!amount) return "0";
    const num = parseInt(amount, 10);
    return num >= 1000 ? `$${num / 1000}k` : `$${num}`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Subtle ambient purple glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-[#8B5CF6]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-2.5 font-[family-name:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] uppercase text-white/80 mb-4">
              <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
              Smart Job Discovery
              <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-[family-name:var(--font-manrope)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white mb-10"
          >
            The roles you&apos;d never
            <br />
            find by searching
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[#888888] text-[15px] sm:text-[16px] max-w-xl mx-auto"
          >
            Discover hidden opportunities curated from top companies worldwide
          </motion.p>
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="bg-[#151516] border border-zinc-800/50 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[44px] h-[44px] rounded-lg bg-zinc-700/40" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-700/40 rounded w-2/3" />
                    <div className="h-3 bg-zinc-700/40 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-zinc-700/40 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-700/40 rounded w-3/4 mb-4" />
                <div className="flex gap-3">
                  <div className="h-3 bg-zinc-700/40 rounded w-20" />
                  <div className="h-3 bg-zinc-700/40 rounded w-16" />
                  <div className="h-3 bg-zinc-700/40 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {jobs.map((job, i) => {
              const jobId = job._id?.$oid || job._id;
              const salaryRange =
                job.minSalary && job.maxSalary
                  ? `${formatSalary(job.minSalary)} – ${formatSalary(job.maxSalary)} / yr`
                  : job.minSalary
                    ? `${formatSalary(job.minSalary)} / yr`
                    : "Negotiable";

              return (
                <a
                  key={jobId}
                  href={`/jobs/${jobId}`}
                  className="block"
                >
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  whileHover={{
                    y: -6,
                    backgroundColor: "#1e1e2a",
                    borderColor: "rgba(99,102,241,0.3)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  className="group bg-[#151516] rounded-xl border border-zinc-800/50 p-6 cursor-pointer relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="block">
                    <div className="flex items-start gap-3 mb-3">
                      <CompanyAvatar
                        name={job.companyName}
                        logo={job.companyLogo}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-[18px] sm:text-[19px] font-medium leading-snug truncate group-hover:text-white transition-colors">
                          {job.jobTitle}
                        </h3>
                        <p className="text-[#9CA3AF] text-[13px] mt-0.5 truncate">
                          {job.companyName || "Confidential"}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#D1D5DB] text-[13px] sm:text-[14px] leading-relaxed mb-5 line-clamp-2 group-hover:text-white/90 transition-colors duration-300">
                      {job.description ||
                        `${job.jobTitle} position at ${job.companyName || "a leading company"}. Apply now to join their team and grow your career.`}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {job.location && (
                        <span className="inline-flex items-center gap-1.5 bg-[#1c1c1e] rounded-full px-3 py-1.5 text-xs font-medium text-white">
                          <MapPin size={12} className="text-[#d4a5ff]" />
                          {job.location}
                          {job.isRemote && " · Remote"}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 bg-[#1c1c1e] rounded-full px-3 py-1.5 text-xs font-medium text-white">
                        <Briefcase size={12} className="text-[#d4a5ff]" />
                        {job.jobType
                          ? job.jobType.replace("-", " ")
                          : "Full-time"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-[#1c1c1e] rounded-full px-3 py-1.5 text-xs font-medium text-white">
                        <DollarSign size={12} className="text-[#d4a5ff]" />
                        {salaryRange}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.08] mb-4 group-hover:bg-white/12 transition-colors duration-300" />

                  <span className="flex items-center gap-1.5 text-white text-[14px] font-medium">
                    View Details
                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#6366F1] transition-colors duration-300" />
                  </span>
                </motion.div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-lg">
              No jobs available right now.
            </p>
            <p className="text-zinc-600 text-sm mt-2">
              Check back soon for new opportunities!
            </p>
          </div>
        )}

        {/* View All Button */}
        {jobs.length > 0 && (
          <motion.div
            className="text-center mt-10 lg:mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.button
              onClick={() => router.push("/jobs")}
              className="inline-flex items-center gap-2 bg-white text-[#0a0a0f] text-[14px] font-semibold px-7 py-3 rounded-lg cursor-pointer"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 24px rgba(99,102,241,0.25)",
                backgroundColor: "#f0f0f5",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              View all job openings
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
