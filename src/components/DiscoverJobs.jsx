"use client";

import Pin from "@gravity-ui/icons/Pin";
import Display from "@gravity-ui/icons/Display";
import Tag from "@gravity-ui/icons/Tag";
import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";

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

export default function DiscoverJobs() {
  return (
    <section className="relative bg-black py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[#6366F1] text-[13px] sm:text-[14px] font-semibold tracking-[0.15em] uppercase mb-4">
            Smart Job Discovery
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-medium text-white leading-tight">
            The roles you&apos;d never find by searching
          </h2>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {JOBS.map((job) => (
            <div
              key={job.title}
              className="group bg-[#151516] rounded-xl p-6 transition-all duration-300 hover:bg-[#1e1e2a]"
            >
              {/* Job Title */}
              <h3 className="text-white text-[18px] sm:text-[19px] font-medium mb-2 leading-snug">
                {job.title}
              </h3>

              {/* Job Description */}
              <p className="text-[#D1D5DB] text-[13px] sm:text-[14px] leading-relaxed mb-5 line-clamp-2">
                {job.description}
              </p>

              {/* Meta Info */}
              <div className="space-y-2 mb-5">
                {/* Location */}
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.location}
                  </span>
                </div>
                {/* Work Type */}
                <div className="flex items-center gap-2">
                  <Display className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.type}
                  </span>
                </div>
                {/* Salary */}
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                  <span className="text-[#9CA3AF] text-[12px] sm:text-[13px]">
                    {job.salary}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.08] mb-4" />

              {/* Apply Now */}
              <button className="flex items-center gap-1.5 text-white text-[14px] font-medium group-hover:gap-2.5 transition-all duration-300">
                Apply Now
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 lg:mt-12">
          <button className="inline-flex items-center gap-2 bg-white text-[#0a0a0f] text-[14px] font-semibold px-7 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            View all job openings
          </button>
        </div>
      </div>
    </section>
  );
}
