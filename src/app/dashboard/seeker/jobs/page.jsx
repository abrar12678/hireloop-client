"use client";

import { useEffect, useState } from "react";
import JobListingContainer from "@/components/jobs/JobListingContainer";
import { clientFetch } from "@/lib/core/client";

export default function SeekerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchJobs = (queryString) => {
    setLoading(true);
    clientFetch(`/jobs?${queryString}`)
      .then((data) => {
        setJobs(data?.jobs || []);
        setTotal(data?.total || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  // Initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = {};
    for (const [key, val] of params.entries()) {
      f[key] = val;
    }
    if (f.isRemote === "true") f.isRemote = true;
    setFilters(f);

    fetchJobs(params.toString());
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Browse Jobs
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Find and apply to positions that match your skills.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <JobListingContainer
          filters={filters}
          jobs={jobs}
          total={total}
        />
      )}
    </div>
  );
}
