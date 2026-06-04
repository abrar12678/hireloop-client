"use client";

import { useRef } from "react";
import Pin from "@gravity-ui/icons/Pin";
import Display from "@gravity-ui/icons/Display";
import Tag from "@gravity-ui/icons/Tag";
import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";
import { motion, useInView } from "motion/react";

const JOBS = [
  {
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "£25-£40/hour",
  },
  {
    title: "UI/UX Designer",
    description:
      "Create intuitive and visually compelling interfaces that drive user engagement",
    location: "London, UK",
    type: "Remote",
    salary: "£30-£45/hour",
  },
  {
    title: "Backend Engineer",
    description:
      "Build scalable APIs and microservices that power mission-critical applications",
    location: "San Francisco, USA",
    type: "On-site",
    salary: "£35-£55/hour",
  },
  {
    title: "Product Manager",
    description:
      "Lead cross-functional teams to deliver impactful products that customers love",
    location: "Berlin, Germany",
    type: "Hybrid",
    salary: "£28-£50/hour",
  },
  {
    title: "Data Scientist",
    description:
      "Transform raw data into actionable insights using machine learning and analytics",
    location: "Toronto, Canada",
    type: "Remote",
    salary: "£32-£48/hour",
  },
  {
    title: "DevOps Engineer",
    description:
      "Automate infrastructure, streamline CI/CD pipelines and ensure system reliability",
    location: "Amsterdam, Netherlands",
    type: "Hybrid",
    salary: "£30-£52/hour",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.12 + i * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function DiscoverJobs() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#6366F1] text-[13px] sm:text-[14px] font-semibold tracking-[0.15em] uppercase mb-4"
          >
            Smart Job Discovery
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-2xl sm:text-3xl lg:text-[32px] font-medium text-white leading-tight"
          >
            The roles you&apos;d never find by searching
          </motion.h2>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {JOBS.map((job, i) => (
            <motion.div
              key={job.title}
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
              className="group bg-[#151516] rounded-xl border border-transparent p-6 cursor-default"
            >
              {/* Hover top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Job Title */}
              <h3 className="text-white text-[18px] sm:text-[19px] font-medium mb-2 leading-snug group-hover:text-white transition-colors">
                {job.title}
              </h3>

              {/* Job Description */}
              <p className="text-[#D1D5DB] text-[13px] sm:text-[14px] leading-relaxed mb-5 line-clamp-2 group-hover:text-white/90 transition-colors duration-300">
                {job.description}
              </p>

              {/* Meta Info */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Display className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.salary}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.08] mb-4 group-hover:bg-white/12 transition-colors duration-300" />

              {/* Apply Now */}
              <motion.button
                className="flex items-center gap-1.5 text-white text-[14px] font-medium cursor-pointer"
                whileTap={{ scale: 0.96 }}
              >
                Apply Now
                <motion.span
                  className="inline-flex"
                  whileHover={{ x: 3, y: -3 }}
                  transition={{ type: "tween", duration: 0.2 }}
                >
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#6366F1] transition-colors duration-300" />
                </motion.span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
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
      </div>
    </section>
  );
}
