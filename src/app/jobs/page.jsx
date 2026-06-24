import JobListingContainer from "@/components/jobs/JobListingContainer";
import { getJobs } from "@/lib/api/jobs";

export default async function Page({ searchParams }) {
  const filters = await searchParams;
  const filterObj = {
    ...filters,
    isRemote: filters.isRemote === "true" ? true : false,
  };

  const querySearch = new URLSearchParams(filters);
  const queryString = querySearch.toString();

  // Fetched server-side on the initial request
  let jobs = [];
  let total = 0;
  try {
    const data = await getJobs(queryString);
    jobs = data?.jobs || [];
    total = data?.total || 0;
  } catch (err) {
    console.error("Failed to fetch jobs:", err.message);
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] pt-24 pb-6 px-6 md:pt-28 md:pb-12 text-white">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Browse Jobs
        </h1>
        <p className="text-zinc-500 mt-2">
          Find your next opportunity from{" "}
          {total?.toLocaleString() || "thousands of"} open positions.
        </p>
      </div>

      {/* Pass data to the Client Wrapper to handle filtering interactivity */}
      <JobListingContainer filters={filterObj} jobs={jobs} total={total} />
    </div>
  );
}
