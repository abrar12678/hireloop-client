"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { useRouter } from "next/navigation";
import {
  Magnifier,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "@gravity-ui/icons";

const SORT_OPTIONS = [
  { id: "recent", label: "Most Recent" },
  { id: "salary-desc", label: "Highest Salary" },
  { id: "salary-asc", label: "Lowest Salary" },
  { id: "alpha", label: "A\u2013Z" },
];

const ITEMS_PER_PAGE = 6;

export default function JobListingContainer({ jobs, total, basePath = "/jobs", savedJobIds, onSavedChange }) {
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sortRef = useRef(null);
  const router = useRouter();

  // ── Debounce timers for real-time search ──
  const searchTimer = useRef(null);
  const locationTimer = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 150);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  useEffect(() => {
    clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(() => {
      setDebouncedLocation(locationInput);
      setPage(1);
    }, 150);
    return () => clearTimeout(locationTimer.current);
  }, [locationInput]);

  // ── Client-side filtering (real-time) ──
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter — match any word in job title, company, description, category
    if (debouncedSearch.trim()) {
      const words = debouncedSearch
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      result = result.filter((job) => {
        const haystack = [
          job.jobTitle,
          job.companyName,
          job.description,
          job.jobCategory,
          job.responsibilities,
          job.requirements,
        ]
          .join(" ")
          .toLowerCase();
        return words.every((w) => haystack.includes(w));
      });
    }

    // Location filter — match any word in location
    if (debouncedLocation.trim()) {
      const locWords = debouncedLocation
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      result = result.filter((job) => {
        const loc = (job.location || "").toLowerCase();
        return locWords.every((w) => loc.includes(w));
      });
    }

    // Remote filter
    if (isRemoteOnly) {
      result = result.filter((job) => job.isRemote);
    }

    // Job type filter
    if (selectedType !== "all") {
      result = result.filter(
        (job) => job.jobType?.toLowerCase() === selectedType.toLowerCase(),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (job) =>
          job.jobCategory?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Sorting
    if (sortBy === "salary-desc") {
      result.sort(
        (a, b) =>
          (parseInt(b.maxSalary) || 0) - (parseInt(a.maxSalary) || 0),
      );
    } else if (sortBy === "salary-asc") {
      result.sort(
        (a, b) =>
          (parseInt(a.minSalary) || 0) - (parseInt(b.minSalary) || 0),
      );
    } else if (sortBy === "alpha") {
      result.sort((a, b) =>
        (a.jobTitle || "").localeCompare(b.jobTitle || ""),
      );
    }
    // "recent" — keep original order from server

    return result;
  }, [
    jobs,
    debouncedSearch,
    debouncedLocation,
    isRemoteOnly,
    selectedType,
    selectedCategory,
    sortBy,
  ]);

  // ── Pagination on filtered results ──
  const totalItems = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // Reset page if filters change and page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);
    if (safePage > 3) {
      pages.push("ellipsis-start");
    }
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) {
      pages.push("ellipsis-end");
    }
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Sync URL with debounce (for shareable links) ──
  const urlTimer = useRef(null);
  useEffect(() => {
    clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const sp = new URLSearchParams();
      if (debouncedSearch) sp.set("search", debouncedSearch);
      if (debouncedLocation) sp.set("location", debouncedLocation);
      if (selectedType !== "all") sp.set("jobType", selectedType);
      if (selectedCategory !== "all") sp.set("jobCategory", selectedCategory);
      if (isRemoteOnly) sp.set("isRemote", "true");
      if (safePage > 1) sp.set("page", String(safePage));
      const qs = sp.toString();
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    }, 500);
    return () => clearTimeout(urlTimer.current);
  }, [
    router,
    debouncedSearch,
    debouncedLocation,
    selectedType,
    selectedCategory,
    isRemoteOnly,
    safePage,
  ]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Most Recent";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Full-width Search Bar + Location */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Magnifier className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by job title, keywords..."
            className="w-full bg-[#1E1E1E] border border-zinc-800/60 focus:border-[#6B63FF]/50 rounded-xl text-white placeholder-zinc-500 text-sm py-3 pl-12 pr-4 outline-none transition-colors duration-200"
          />
        </div>
        <div className="relative sm:w-[220px]">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Location..."
            className="w-full bg-[#1E1E1E] border border-zinc-800/60 focus:border-[#6B63FF]/50 rounded-xl text-white placeholder-zinc-500 text-sm py-3 pl-10 pr-4 outline-none transition-colors duration-200"
          />
        </div>
        <button
          onClick={() => {
            setDebouncedSearch(searchInput);
            setDebouncedLocation(locationInput);
            setPage(1);
          }}
          className="bg-gradient-to-r from-[#6B63FF] to-[#5A54F5] hover:shadow-lg hover:shadow-[#6B63FF]/25 text-white text-sm font-medium px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap"
        >
          Search Jobs
        </button>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden bg-[#1E1E1E] border border-zinc-800/60 text-zinc-300 text-sm font-medium px-4 py-3 rounded-xl transition-colors"
        >
          {sidebarOpen ? "Hide" : "Filters"}
        </button>
      </div>

      {/* Two-column layout: Sidebar + Listings */}
      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden md:block w-[25%] min-w-[220px] max-w-[280px]">
          <JobFilters
            selectedType={selectedType}
            setSelectedType={(val) => {
              setSelectedType(val);
              setPage(1);
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            isRemoteOnly={isRemoteOnly}
            setIsRemoteOnly={(val) => {
              setIsRemoteOnly(val);
              setPage(1);
            }}
          />
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden w-full"
            >
              <JobFilters
                selectedType={selectedType}
                setSelectedType={(val) => {
                  setSelectedType(val);
                  setPage(1);
                }}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
                isRemoteOnly={isRemoteOnly}
                setIsRemoteOnly={(val) => {
                  setIsRemoteOnly(val);
                  setPage(1);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Job Listings */}
        <div className="flex-1 min-w-0">
          {/* Header: result count + sort */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#888888]">
              Found{" "}
              <span className="text-white font-semibold">
                {totalItems.toLocaleString()}
              </span>{" "}
              Professional Jobs
            </p>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-sm text-[#CCCCCC] hover:text-white bg-[#1E1E1E] border border-zinc-800/60 hover:border-zinc-700/60 rounded-lg px-3.5 py-2 transition-colors"
              >
                <span className="text-zinc-500">Sort by:</span>
                <span className="font-medium">{activeSortLabel}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 bg-[#252525] border border-zinc-700/60 rounded-xl shadow-xl z-50 py-1 min-w-[180px] overflow-hidden"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === option.id
                            ? "text-white bg-purple-500/10 font-medium"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-700/30"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Job Cards List */}
          {paginatedJobs.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {paginatedJobs.map((jobItem, idx) => (
                  <JobCard
                    key={jobItem._id?.$oid || jobItem._id}
                    job={jobItem}
                    basePath={basePath}
                    savedJobIds={savedJobIds}
                    onSavedChange={onSavedChange}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8 mb-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((p, i) =>
                    p === "ellipsis-start" || p === "ellipsis-end" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="w-9 h-9 flex items-center justify-center text-zinc-500 text-sm select-none"
                      >
                        --
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === safePage
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-lg">
                No positions match your search criteria.
              </p>
              <p className="text-zinc-600 text-sm mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}