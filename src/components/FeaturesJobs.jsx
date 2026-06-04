"use client";

import Magnifier from "@gravity-ui/icons/Magnifier";
import ChartColumn from "@gravity-ui/icons/ChartColumn";
import Briefcase from "@gravity-ui/icons/Briefcase";
import Bookmark from "@gravity-ui/icons/Bookmark";
import Flame from "@gravity-ui/icons/Flame";
import FileText from "@gravity-ui/icons/FileText";
import Puzzle from "@gravity-ui/icons/Puzzle";
import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";

const FEATURES = [
  {
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
    icon: Magnifier,
  },
  {
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
    icon: ChartColumn,
  },
  {
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
    icon: Briefcase,
  },
  {
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
    icon: Bookmark,
  },
  {
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
    icon: Flame,
  },
  {
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
    icon: FileText,
  },
  {
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
    icon: Puzzle,
  },
  {
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
    icon: ArrowUpRight,
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-[#121212] py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Subtle ambient purple glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8B5CF6]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#8B5CF6]/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Overline with dot bullets */}
          <p className="inline-flex items-center gap-3  text-[13px] sm:text-[14px] font-medium tracking-[0.15em] uppercase mb-5">
            <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
            Features Job
            <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-white leading-[1.2]">
            Everything you need to succeed
          </h2>
        </div>

        {/* Features Grid — 4 cols × 2 rows, vertical card layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-x-4 lg:gap-y-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group  rounded-xl p-5 transition-all duration-300 hover:border-[#8B5CF6]/20 hover:bg-[#24242e] flex flex-row gap-4 items-start"
              >
                {/* Circular Icon Container */}
                <div className="w-25 h-18 rounded-full bg-gradient-to-b from-[#010102] to-[#313131] flex items-center justify-center mb-4 group-hover:bg-[#8B5CF6]/25 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[#F7C2FF]" />
                </div>

                <div>
                  {/* Title */}
                  <h3 className="text-white text-[17px] sm:text-[18px] font-semibold mb-1.5 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#9CA3AF] text-[13px] sm:text-[14px] leading-[1.5]">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
