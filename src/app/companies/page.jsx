"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Magnifier, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const CompanyCard = ({ company, index }) => {
  const companyId = company._id?.$oid || company._id;

  // Build tags from available data
  const tags = [];
  if (company.industry) tags.push(company.industry);
  if (company.location) tags.push(company.location);
  if (company.openJobsCount !== undefined && company.openJobsCount !== null) {
    tags.push(`${company.openJobsCount} Active Jobs`);
  }

  return (
    <motion.div
      custom={index * 0.06}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-[#1E1E1E] border border-zinc-800/60 rounded-xl p-6 h-full flex flex-col hover:border-[#6366F1]/30 transition-all duration-300">
        {/* Top: Logo + Name + Verified */}
        <div className="flex items-start gap-4 mb-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-12 h-12 object-contain bg-zinc-800 border border-zinc-700 p-2 rounded-xl flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 font-bold text-lg flex-shrink-0">
              {company.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate">
                {company.name}
              </h3>
              {company.verified ? (
                <BadgeCheck className="w-5 h-5 text-[#3B82F6] inline-block shrink-0" />
              ) : company.isVerified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {company.description}
          </p>
        )}

        {/* Tags Row */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-zinc-800/80 text-zinc-400 text-xs font-medium px-3 py-1.5 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer to push link to bottom */}
        <div className="mt-auto">
          <Link
            href={`/companies/${companyId}`}
            className="group inline-flex items-center gap-1.5 text-[#6366F1] hover:text-[#818CF8] font-semibold text-sm transition-colors"
          >
            View Openings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimer = useRef(null);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const res = await fetch(`${baseUrl}/api/public/companies`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Debounce search — 150ms for instant feel
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 150);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  // Filter companies by search query (word-level matching)
  const filteredCompanies = useMemo(() => {
    if (!debouncedSearch.trim()) return companies;
    const words = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
    return companies.filter((c) => {
      const haystack = [c.name, c.industry, c.location, c.description]
        .join(" ")
        .toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [companies, debouncedSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCompanies = filteredCompanies.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );



  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6366F1]/[0.06] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16">
          <motion.h1
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-center"
          >
            Browse Companies
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            animate="visible"
            className="text-zinc-400 text-base sm:text-lg text-center max-w-2xl mx-auto mt-4 mb-8"
          >
            Discover the world&apos;s leading technology and creative
            organizations. Explore their cultures, values, and open positions.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={fadeUp}
            custom={0.2}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-stretch bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden">
              <div className="flex items-center flex-1 px-4 py-3.5">
                <Magnifier className="w-[18px] h-[18px] text-zinc-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, industry, or location..."
                  className="bg-transparent text-white placeholder-zinc-500 text-sm w-full outline-none"
                />
              </div>
              <button
                type="button"
                className="flex-shrink-0 border-l border-zinc-800 bg-gradient-to-r from-[#6B63FF] to-[#5A54F5] hover:shadow-lg hover:shadow-[#6B63FF]/25 text-white font-medium text-sm px-6 py-3.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Find Companies
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Companies Grid ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-20">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredCompanies.length > 0 && (
          <p className="text-zinc-500 text-sm mb-6">
            Showing{" "}
            <span className="text-zinc-300 font-medium">
              {(safePage - 1) * ITEMS_PER_PAGE + 1}
              –
              {Math.min(safePage * ITEMS_PER_PAGE, filteredCompanies.length)}
            </span>{" "}
            of{" "}
            <span className="text-zinc-300 font-medium">
              {filteredCompanies.length}
            </span>{" "}
            companies
          </p>
        )}

        {/* Grid */}
        {!loading && paginatedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCompanies.map((company, i) => (
              <CompanyCard
                key={company._id?.$oid || company._id}
                company={company}
                index={i}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 text-lg">
                {debouncedSearch
                  ? `No companies found matching "${debouncedSearch}".`
                  : "No companies found."}
              </p>
            </div>
          )
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {/* Previous */}
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="px-2 py-2 text-zinc-500 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    page === safePage
                      ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}