"use client";

import { useRef } from "react";
import Magnifier from "@gravity-ui/icons/Magnifier";
import ChartColumn from "@gravity-ui/icons/ChartColumn";
import Briefcase from "@gravity-ui/icons/Briefcase";
import Bookmark from "@gravity-ui/icons/Bookmark";
import Flame from "@gravity-ui/icons/Flame";
import FileText from "@gravity-ui/icons/FileText";
import Puzzle from "@gravity-ui/icons/Puzzle";
import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";
import { motion, useInView } from "motion/react";

const FEATURES = [
  {
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
    icon: Magnifier,
    accent: "#8B5CF6",
  },
  {
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
    icon: ChartColumn,
    accent: "#6366F1",
  },
  {
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
    icon: Briefcase,
    accent: "#6200EE",
  },
  {
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
    icon: Bookmark,
    accent: "#A78BFA",
  },
  {
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
    icon: Flame,
    accent: "#FF5722",
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
    icon: FileText,
    accent: "#3B82F6",
  },
  {
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: Puzzle,
    accent: "#8B5CF6",
  },
  {
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
    icon: ArrowUpRight,
    accent: "#6366F1",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.07,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Testimonials() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#121212] py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Subtle ambient purple glows — static, no animation on blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8B5CF6]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#8B5CF6]/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-3 text-[13px] sm:text-[14px] font-medium tracking-[0.15em] uppercase mb-5">
              <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
              Features Job
              <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
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
            className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-white leading-[1.2]"
          >
            Everything you need to succeed
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-x-4 lg:gap-y-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{
                  y: -5,
                  backgroundColor: "#24242e",
                  borderColor: `${feature.accent}33`,
                  transition: { type: "tween", duration: 0.2 },
                }}
                className="group rounded-xl p-5 border border-transparent flex flex-row gap-4 items-start cursor-default"
              >
                {/* Icon Container */}
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#010102] to-[#313131] flex items-center justify-center flex-shrink-0"
                  style={{
                    boxShadow: `0 0 0px ${feature.accent}00`,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: -8,
                    boxShadow: `0 0 16px ${feature.accent}30`,
                    transition: { type: "spring", stiffness: 400, damping: 18 },
                  }}
                >
                  <Icon className="w-5 h-5 text-[#F7C2FF]" />
                </motion.div>

                {/* Text Content */}
                <div className="min-w-0">
                  <h3 className="text-white text-[17px] sm:text-[18px] font-semibold mb-1.5 leading-snug transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[#9CA3AF] text-[13px] sm:text-[14px] leading-[1.5] group-hover:text-[#D1D5DB] transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle bottom accent on hover */}
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-[1px] rounded-full"
                  style={{ backgroundColor: feature.accent }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileHover={{ scaleX: 1, opacity: 0.4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
