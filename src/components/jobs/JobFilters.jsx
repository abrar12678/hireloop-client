"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "@gravity-ui/icons";

const JOB_TYPE_OPTIONS = [
  { id: "all", label: "All Types", count: null },
  { id: "full-time", label: "Full-time", count: null },
  { id: "contract", label: "Contract", count: null },
  { id: "part-time", label: "Part-time", count: null },
  { id: "freelance", label: "Freelance", count: null },
  { id: "internship", label: "Internship", count: null },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories", count: null },
  { id: "technology", label: "Technology", count: null },
  { id: "design", label: "Design", count: null },
  { id: "marketing", label: "Marketing", count: null },
  { id: "sales", label: "Sales", count: null },
  { id: "finance", label: "Finance", count: null },
  { id: "engineering", label: "Engineering", count: null },
  { id: "product", label: "Product", count: null },
];

const EXPERIENCE_OPTIONS = [
  { id: "all", label: "All Levels" },
  { id: "entry-level", label: "Entry Level" },
  { id: "mid-level", label: "Mid Level" },
  { id: "senior", label: "Senior" },
  { id: "lead", label: "Lead / Principal" },
  { id: "manager", label: "Manager" },
];

const SALARY_RANGES = [
  { id: "all", label: "Any Salary", min: "", max: "" },
  { id: "0-30k", label: "Under $30K", min: "0", max: "30000" },
  { id: "30-60k", label: "$30K – $60K", min: "30000", max: "60000" },
  { id: "60-100k", label: "$60K – $100K", min: "60000", max: "100000" },
  { id: "100-150k", label: "$100K – $150K", min: "100000", max: "150000" },
  { id: "150k+", label: "$150K+", min: "150000", max: "" },
];

function FilterSection({ title, options, selected, onToggle, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800/60 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3 group"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer group/option py-0.5"
                >
                  <input
                    type="radio"
                    name={title}
                    checked={selected === option.id}
                    onChange={() => onToggle(option.id)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/30 focus:ring-offset-0 cursor-pointer accent-purple-500"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      selected === option.id
                        ? "text-white font-medium"
                        : "text-zinc-400 group-hover/option:text-zinc-300"
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.count && (
                    <span className="ml-auto text-xs text-zinc-600 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JobFilters({
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  isRemoteOnly,
  setIsRemoteOnly,
  selectedExperience = "all",
  setSelectedExperience = () => {},
  selectedSalaryRange = "all",
  setSelectedSalaryRange = () => {},
}) {
  return (
    <aside className="w-full shrink-0">
      <div className="bg-[#1E1E1E] rounded-xl border border-zinc-800/60 p-5 space-y-4 sticky top-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Filters
        </h2>

        <FilterSection
          title="Job Type"
          options={JOB_TYPE_OPTIONS}
          selected={selectedType}
          onToggle={setSelectedType}
          defaultOpen={true}
        />

        <FilterSection
          title="Category"
          options={CATEGORY_OPTIONS}
          selected={selectedCategory}
          onToggle={setSelectedCategory}
          defaultOpen={true}
        />

        <FilterSection
          title="Experience Level"
          options={EXPERIENCE_OPTIONS}
          selected={selectedExperience}
          onToggle={setSelectedExperience}
          defaultOpen={false}
        />

        <FilterSection
          title="Salary Range"
          options={SALARY_RANGES}
          selected={selectedSalaryRange}
          onToggle={setSelectedSalaryRange}
          defaultOpen={false}
        />

        {/* Remote Toggle */}
        <div className="border-b border-zinc-800/60 pb-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isRemoteOnly}
              onChange={(e) => setIsRemoteOnly(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500/30 focus:ring-offset-0 cursor-pointer accent-purple-500"
            />
            <span
              className={`text-sm transition-colors ${
                isRemoteOnly
                  ? "text-white font-medium"
                  : "text-zinc-400 group-hover:text-zinc-300"
              }`}
            >
              Remote Only
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}