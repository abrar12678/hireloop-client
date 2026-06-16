import React from "react";
import { getJobById } from "@/lib/api/jobs";
import {
  MapPin,
  Briefcase,
  CircleDollar,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Heart,
  CirclePlay,
  Server,
  Sun,
  CircleCheck,
  House,
  Persons,
  Globe,
} from "@gravity-ui/icons";
import Link from "next/link";

const Page = async ({ params }) => {
  const { id } = await params;
  const job = await getJobById(id);

  // Guard clause in case API fails or returns null
  if (!job) {
    return (
      <div className="w-full min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-white p-6">
        <p className="text-zinc-400 text-lg">
          Job position could not be found or is no longer active.
        </p>
      </div>
    );
  }

  // Salary string utility formatter
  const formatSalary = (amount) => {
    if (!amount) return "0";
    const numericAmount = parseInt(amount, 10);
    return numericAmount >= 1000
      ? `${(numericAmount / 1000).toLocaleString()}k`
      : amount;
  };

  // Humanize standard date formats (e.g. 2026-07-21 -> July 21, 2026)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Parse benefits text into structured items for the 2x2 grid
  const parseBenefits = (benefitsText) => {
    if (!benefitsText) return [];
    const knownBenefits = [
      { keywords: ["health", "dental", "medical", "insurance"], icon: Heart, label: "Full Health & Dental" },
      { keywords: ["401k", "401(k)", "retirement", "pension", "savings"], icon: CirclePlay, label: "Competitive 401k" },
      { keywords: ["hardware", "laptop", "equipment", "stipend", "macbook", "computer"], icon: Server, label: "Latest Hardware Stipend" },
      { keywords: ["pto", "paid time off", "vacation", "unlimited", "leave", "time off", "holiday"], icon: Sun, label: "Unlimited PTO" },
    ];

    const lower = benefitsText.toLowerCase();
    const matched = [];
    for (const benefit of knownBenefits) {
      if (benefit.keywords.some((kw) => lower.includes(kw))) {
        matched.push(benefit);
      }
    }
    return matched;
  };

  const benefitItems = parseBenefits(job.benefits);

  // Parse responsibilities into a list
  const parseResponsibilities = (text) => {
    if (!text) return [];
    const lines = text
      .split(/[\n•\-–]/)
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length > 1 ? lines : [text];
  };

  // Parse requirements into skill tags and experience bullets
  const parseRequirements = (text) => {
    if (!text) return { tags: [], bullets: [] };
    const lines = text
      .split(/[\n•\-–]/)
      .map((l) => l.trim())
      .filter(Boolean);

    // Heuristic: short phrases (<=3 words, no periods) are tags; longer ones are bullets
    const tags = [];
    const bullets = [];
    for (const line of lines) {
      if (line.split(/\s+/).length <= 4 && !line.includes(".")) {
        tags.push(line);
      } else {
        bullets.push(line);
      }
    }
    // If everything ended up as bullets, treat first 4 short ones as tags
    if (tags.length === 0 && bullets.length > 1) {
      return { tags: bullets.slice(0, 4), bullets: bullets.slice(4) };
    }
    return { tags, bullets };
  };

  const responsibilities = parseResponsibilities(job.responsibilities);
  const { tags: reqTags, bullets: reqBullets } = parseRequirements(job.requirements);

  // Fallback metadata card values
  const salaryDisplay =
    job.minSalary && job.maxSalary
      ? `$${formatSalary(job.minSalary)}–$${formatSalary(job.maxSalary)}`
      : "Competitive";

  const locationDisplay = job.isRemote
    ? `Remote${job.location ? ` (${job.location})` : " (USD)"}`
    : job.location || "Not specified";

  const typeDisplay = job.jobType || "Not specified";

  const experienceDisplay = job.experienceLevel || "Not specified";

  return (
    <main className="w-full min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-20">
        {/* ── Job Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {job.jobTitle}
            </h1>
            <div className="flex items-center gap-3">
              {job.companyLogo && (
                <img
                  src={job.companyLogo}
                  alt={`${job.companyName} Branding`}
                  className="w-8 h-8 object-contain rounded-lg"
                />
              )}
              <span className="text-lg font-medium text-zinc-300">
                {job.companyName}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Employer
              </span>
            </div>
          </div>

          <Link
            href={`/jobs/${id}/apply`}
            className="inline-flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#6366F1]/20 flex-shrink-0"
          >
            Apply Now
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── 4 Metadata Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Salary */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <CircleDollar className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Salary
              </span>
            </div>
            <p className="text-white font-semibold text-lg">{salaryDisplay}</p>
          </div>

          {/* Location */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Location
              </span>
            </div>
            <p className="text-white font-semibold text-lg">{locationDisplay}</p>
          </div>

          {/* Job Type */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Briefcase className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Job Type
              </span>
            </div>
            <p className="text-white font-semibold text-lg capitalize">
              {typeDisplay}
            </p>
          </div>

          {/* Experience */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-500">
              <Calendar className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Experience
              </span>
            </div>
            <p className="text-white font-semibold text-lg">
              {experienceDisplay}
            </p>
          </div>
        </div>

        {/* ── Content Sections ── */}
        <div className="space-y-10">
          {/* Job Description */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Job Description</h2>
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
              <p className="text-zinc-300 text-base leading-relaxed">
                {job.description ||
                  job.responsibilities ||
                  "No description provided for this listing."}
              </p>
            </div>
          </section>

          {/* Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Responsibilities</h2>
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
              <ol className="space-y-3">
                {responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-zinc-300 text-base leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Requirements */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Requirements</h2>
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 space-y-5">
              {/* Skill Tags */}
              {reqTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reqTags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Experience / additional requirement bullets */}
              {reqBullets.length > 0 && (
                <ul className="space-y-2.5">
                  {reqBullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CircleCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span className="text-zinc-300 text-base leading-relaxed">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Fallback: if we couldn't parse tags/bullets, show raw text */}
              {reqTags.length === 0 && reqBullets.length === 0 && (
                <p className="text-zinc-300 text-base leading-relaxed">
                  {job.requirements || "Standard industry standards apply."}
                </p>
              )}
            </div>
          </section>

          {/* Benefits */}
          {benefitItems.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefitItems.map((benefit, i) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={i}
                      className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-5 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-[#6366F1]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-base">
                          {benefit.label}
                        </h3>
                        <p className="text-zinc-400 text-sm mt-1">
                          Comprehensive {benefit.label.toLowerCase()} package
                          included.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : job.benefits ? (
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Benefits</h2>
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
                <p className="text-zinc-300 text-base leading-relaxed">
                  {job.benefits}
                </p>
              </div>
            </section>
          ) : null}
        </div>

        {/* ── Company Overview ── */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Company Overview</h2>
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.companyName} logo`}
                  className="w-16 h-16 object-contain bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-xl text-[#6366F1] font-bold text-2xl">
                  {job.companyName?.charAt(0) || "C"}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {job.companyName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-zinc-400">
                  {job.jobCategory && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#6366F1]" />
                      {job.jobCategory}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#6366F1]" />
                      {job.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                  <Persons className="w-4 h-4 text-[#6366F1]" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Company Size</span>
                  <span className="text-zinc-200 font-medium">250–500 Employees</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                  <House className="w-4 h-4 text-[#6366F1]" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Industry</span>
                  <span className="text-zinc-200 font-medium">
                    {job.jobCategory
                      ? `${job.jobCategory} / Technology`
                      : "Technology"}
                  </span>
                </div>
              </div>
            </div>

            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#6366F1] hover:text-[#818CF8] font-medium text-sm transition-colors"
              >
                Visit Website
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </section>

        {/* ── Deadline Info ── */}
        {job.deadline && (
          <div className="mt-8 text-center text-sm text-zinc-500">
            Applications close on{" "}
            <span className="text-zinc-300 font-medium">
              {formatDate(job.deadline)}
            </span>
          </div>
        )}
      </div>
    </main>
  );
};

export default Page;