"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import JobListingContainer from "@/components/jobs/JobListingContainer";
import { clientFetch, protectedClientFetch } from "@/lib/core/client";

export default function SeekerJobsPage() {
  // null = not loaded yet (show spinner). Once loaded (even empty []), never show spinner again.
  const [jobs, setJobs] = useState(null);
  const [total, setTotal] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const mountedRef = useRef(true);

  // Fetch jobs AND saved jobs ONCE on mount — never re-fetch
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        const [jobsData, savedData] = await Promise.all([
          clientFetch("/jobs"),
          protectedClientFetch("/saved-jobs"),
        ]);

        if (!mountedRef.current) return;

        setJobs(jobsData?.jobs || []);
        setTotal(jobsData?.total || 0);

        // Build a Set of saved job ID strings for fast lookup
        if (Array.isArray(savedData)) {
          const ids = new Set();
          savedData.forEach((s) => {
            const id = s.jobId?.$oid || (typeof s.jobId === "object" ? String(s.jobId) : s.jobId);
            if (id) ids.add(String(id));
          });
          setSavedJobIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        if (mountedRef.current) {
          setJobs([]);
          setTotal(0);
        }
      }
    })();

    return () => { mountedRef.current = false; };
  }, []);

  // Callback: when a job card toggles save, update the Set without re-fetching
  const handleSavedChange = useCallback((jobIdStr, isNowSaved) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isNowSaved) {
        next.add(jobIdStr);
      } else {
        next.delete(jobIdStr);
      }
      return next;
    });
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

      {jobs === null ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <JobListingContainer
          jobs={jobs}
          total={total}
          basePath="/dashboard/seeker/jobs"
          savedJobIds={savedJobIds}
          onSavedChange={handleSavedChange}
        />
      )}
    </div>
  );
}