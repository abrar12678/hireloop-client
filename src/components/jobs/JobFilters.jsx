"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "@gravity-ui/icons";

const JOB_TYPE_OPTIONS = [
  { id: "all", label: "All Types", count: null },
  { id: "full-time", label: "Full-time", count: "1.2k" },
  { id: "contract", label: "Contract", count: "432" },
  { id: "part-time", label: "Part-time", count: null },
  { id: "freelance", label: "Freelance", count: "158" },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories", count: null },
  { id: "engineering", label: "Engineering", count: "486" },
  { id: "design", label: "Design", count: "215" },
  { id: "product", label: "Product", count: "172" },
  { id: "marketing", label: "Marketing", count: "98" },
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