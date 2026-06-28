import React from "react";
import Link from "next/link";
import { getJobById } from "@/lib/api/jobs";
import { getCompanyJobs } from "@/lib/api/jobs";
import { MapPin, Briefcase, ArrowRight, CircleDollar, Persons } from "@gravity-ui/icons";
import { BadgeCheck } from "lucide-react";
import { Chip, Card } from "@heroui/react";

const Page = async ({ params }) => {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  let company = null;
  let jobs = [];
  try {
    const res = await fetch(`${baseUrl}/api/companies/${id}`);
    if (res.ok) company = await res.json();
  } catch (err) {
    console.error("Failed to fetch company:", err);
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/jobs?companyId=${id}&status=active`
    );
    if (res.ok) {
      const data = await res.json();
      jobs = data?.jobs || data || [];
    }
  } catch (err) {
    console.error("Failed to fetch company jobs:", err);
  }

  if (!company) {
    return (
      <div className="w-full min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-white p-6">
        <p className="text-zinc-400 text-lg">
          Company could not be found.
        </p>
      </div>
    );
  }

  const formatSalary = (amount) => {
    if (!amount) return "0";
    const numericAmount = parseInt(amount, 10);
    return numericAmount >= 1000 ? `${(numericAmount / 1000).toLocaleString()}k` : amount;
  };

  return (
    <main className="w-full min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-6 px-6 md:pt-28 md:pb-12 lg:pt-32 lg:pb-16">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Company Header */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-20 h-20 object-contain bg-zinc-800 border border-zinc-700 p-3 rounded-2xl"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-2xl text-purple-400 font-bold text-3xl">
                {company.name?.charAt(0) || "C"}
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {company.name}
                {company.verified && (
                  <BadgeCheck className="w-5 h-5 text-[#3B82F6] inline-block ml-2 -mt-1" />
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                {company.industry && (
                  <Chip size="sm" variant="flat" className="bg-zinc-800 text-zinc-300">
                    {company.industry}
                  </Chip>
                )}
                {company.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="text-purple-400 w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.employeeCount && (
                  <div className="flex items-center gap-1.5">
                    <Persons className="text-purple-400 w-4 h-4" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-zinc-300 text-base leading-relaxed border-t border-zinc-800/60 pt-6">
              {company.description}
            </p>
          )}
        </div>

        {/* Open Positions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Open Positions
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {jobs.length} position{jobs.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => {
                const jobId = job._id?.$oid || job._id;
                return (
                  <Card
                    key={jobId}
                    className="p-6 border-none bg-zinc-900 text-zinc-100 rounded-2xl shadow-lg"
                  >
                    <Card.Content className="flex flex-col gap-4 p-0">
                      <div className="flex items-center gap-3">
                        {job.companyLogo && (
                          <img
                            src={job.companyLogo}
                            alt={`${job.companyName} logo`}
                            className="w-8 h-8 object-contain rounded-md"
                          />
                        )}
                        <h3 className="text-xl font-semibold text-white">
                          {job.jobTitle}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.location && (
                          <div className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-800 text-sm text-zinc-200">
                            <MapPin className="text-purple-400 w-3.5 h-3.5" />
                            {job.location} {job.isRemote && "(Remote)"}
                          </div>
                        )}
                        {job.jobType && (
                          <div className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-800 text-sm text-zinc-200">
                            <Briefcase className="text-purple-400 w-3.5 h-3.5" />
                            <span className="capitalize">{job.jobType}</span>
                          </div>
                        )}
                        {job.minSalary && job.maxSalary && (
                          <div className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-800 text-sm text-zinc-200">
                            <CircleDollar className="text-purple-400 w-3.5 h-3.5" />
                            ${formatSalary(job.minSalary)}–${formatSalary(job.maxSalary)} / yr
                          </div>
                        )}
                      </div>

                      {job.responsibilities && (
                        <p className="text-xs text-zinc-500 line-clamp-2">
                          {job.responsibilities}
                        </p>
                      )}

                      <Link
                        href={`/jobs/${jobId}`}
                        className="group flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Apply Now
                        <ArrowRight className="group-hover:translate-x-1 w-4 h-4 transition-transform duration-200" />
                      </Link>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 text-lg">
                No open positions at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Page;