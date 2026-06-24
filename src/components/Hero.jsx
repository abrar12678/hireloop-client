"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Magnifier from "@gravity-ui/icons/Magnifier";
import { Briefcase } from "@gravity-ui/icons";
import { motion } from "motion/react";

/* ─── Animation variants ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Canvas Particles — 50 blue/purple dots, 30fps ─── */

function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let lastFrame = 0;
    const interval = 1000 / 30;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.45 + 0.1,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? [100, 100, 255] : [160, 100, 255],
    }));

    const draw = (timestamp) => {
      animId = requestAnimationFrame(draw);
      const delta = timestamp - lastFrame;
      if (delta < interval) return;
      lastFrame = timestamp - (delta % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const flicker = Math.sin(t * d.speed + d.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.color[0]},${d.color[1]},${d.color[2]},${(
          d.a * flicker
        ).toFixed(2)})`;
        ctx.fill();
      }
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ─── Trending tags ─── */

const TRENDING_TAGS = [
  "Product Designer",
  "AI Engineering",
  "Dev-ops Engineer",
];

/* ─── Hero ─── */

export default function Hero() {
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  /* Inject gradient keyframe on client only — avoids styled-jsx hydration mismatch */
  useEffect(() => {
    const id = "hero-gradient-keyframe";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `@keyframes gradientShift { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }`;
    document.head.appendChild(style);
  }, []);

  const LOCATIONS = [
    "New York, NY",
    "San Francisco, CA",
    "Los Angeles, CA",
    "Chicago, IL",
    "Austin, TX",
    "Seattle, WA",
    "Remote",
  ];

  /* Navigate to /jobs with search + location filters */
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    }
    if (selectedLocation && selectedLocation !== "Remote") {
      params.set("location", selectedLocation);
    }
    if (selectedLocation === "Remote") {
      params.set("isRemote", "true");
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /* Navigate to /jobs with trending tag as search */
  const handleTagClick = (tag) => {
    const params = new URLSearchParams();
    params.set("search", tag);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen bg-[#050505] overflow-x-hidden overflow-y-hidden">
      {/* Radial gradient background — dark purple center fading to black edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(98,0,238,0.12) 0%, rgba(0,149,255,0.06) 30%, transparent 70%)",
          }}
        />
      </div>

      <Particles />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-36 lg:pt-44 pb-16 sm:pb-20 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* ── Badge with LEFT and RIGHT glowing lines ── */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-3 mb-8"
          >
            {/* Left glowing line */}
            <div
              className="hidden sm:block"
              style={{
                width: "40px",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, rgba(85,110,255,0.6))",
                boxShadow:
                  "0 0 8px rgba(85,110,255,0.45), 0 0 20px rgba(85,110,255,0.20)",
              }}
            />
            {/* Badge pill */}
            <motion.div
              className="inline-flex items-center gap-2.5 bg-[#1a1a2e] border border-white/[0.08] rounded-full px-5 py-2.5"
              whileHover={{
                borderColor: "rgba(85,110,255,0.4)",
                scale: 1.04,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <div className="w-7 h-7 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-[13px] font-bold tracking-wide font-[family-name:var(--font-space-mono)]">
                50,000+{" "}
                <span className="text-[#CCCCCC] text-[11px] font-normal uppercase tracking-widest">
                  New Jobs This Month
                </span>
              </span>
            </motion.div>
            {/* Right glowing line */}
            <div
              className="hidden sm:block"
              style={{
                width: "40px",
                height: "2px",
                background:
                  "linear-gradient(90deg, rgba(85,110,255,0.6), transparent)",
                boxShadow:
                  "0 0 8px rgba(85,110,255,0.45), 0 0 20px rgba(85,110,255,0.20)",
              }}
            />
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            variants={fadeUp}
            custom={0.12}
            initial="hidden"
            animate="visible"
            className="text-[36px] sm:text-[44px] lg:text-[56px] font-extrabold text-white leading-[1.1] tracking-tight mb-6 font-[family-name:var(--font-manrope)]"
          >
            Find Your{" "}
            <span
              className="inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #556EFF, #0095FF, #6366F1, #0095FF, #556EFF)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s linear infinite",
                filter:
                  "drop-shadow(0 0 18px rgba(85,110,255,0.5)) drop-shadow(0 0 40px rgba(85,110,255,0.25))",
              }}
            >
              Dream Job
            </span>{" "}
            Today
          </motion.h1>

          {/* ── Subtext ── */}
          <motion.p
            variants={fadeUp}
            custom={0.22}
            initial="hidden"
            animate="visible"
            className="text-[#CCCCCC] text-[16px] sm:text-[17px] leading-relaxed max-w-2xl mx-auto mb-10"
          >
            HireLoop connects top talent with world-class companies. Browse
            thousands of curated opportunities and land your next role — faster.
          </motion.p>

          {/* ── Search Bar — functional: redirects to /jobs with search params ── */}
          <motion.div
            variants={scaleIn}
            custom={0.32}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto"
          >
            {/* Desktop: horizontal layout */}
            <motion.div
              className="hidden sm:flex items-stretch bg-[#1a1a2e] border border-white/[0.12] rounded-xl backdrop-blur-md shadow-2xl shadow-black/40 p-1.5"
              whileHover={{
                borderColor: "rgba(85,110,255,0.3)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Job Input */}
              <div className="flex items-center flex-1 px-4 py-2.5">
                <Magnifier className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Job title, skill or company"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </div>
              {/* Divider */}
              <div className="w-px my-3 bg-white/10" />
              {/* Location Dropdown */}
              <div className="relative flex items-center flex-1 px-4 py-2.5">
                <svg
                  className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0"
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
                <button
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="bg-transparent text-[14px] w-full outline-none text-left cursor-pointer flex items-center justify-between"
                >
                  <span
                    className={
                      selectedLocation ? "text-white" : "text-[#888888]"
                    }
                  >
                    {selectedLocation || "Location or Remote"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#888888] transition-transform duration-200 ${
                      locationOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {locationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/[0.12] rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50"
                  >
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocationOpen(false);
                        }}
                        className="block w-full text-left text-[14px] text-[#CCCCCC] hover:text-white hover:bg-white/[0.06] px-4 py-2.5 transition-colors cursor-pointer"
                      >
                        {loc}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              {/* Search Button */}
              <motion.button
                onClick={handleSearch}
                className="w-11 h-11 bg-[#556EFF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 my-1 flex-shrink-0 cursor-pointer"
                whileHover={{
                  scale: 1.12,
                  boxShadow: "0 0 28px rgba(85,110,255,0.5)",
                  backgroundColor: "#4460EE",
                }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Magnifier className="w-[18px] h-[18px] text-white" />
              </motion.button>
            </motion.div>

            {/* Mobile: stacked layout */}
            <div className="sm:hidden flex flex-col gap-2">
              <motion.div
                className="flex items-center bg-[#1a1a2e] border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md"
                whileTap={{ scale: 0.98 }}
              >
                <Magnifier className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Job title, skill or company"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </motion.div>
              <motion.div
                className="flex items-center bg-[#1a1a2e] border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md"
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0"
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
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Location or Remote"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </motion.div>
              <motion.button
                onClick={handleSearch}
                className="w-full bg-[#556EFF] text-white font-medium text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                whileHover={{ scale: 1.02, backgroundColor: "#4460EE" }}
                whileTap={{ scale: 0.98 }}
              >
                <Magnifier className="w-[18px] h-[18px] text-white" />
                Search Jobs
              </motion.button>
            </div>
          </motion.div>

          {/* ── Trending Tags — clickable, redirects to /jobs with search ── */}
          <motion.div
            variants={fadeUp}
            custom={0.44}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto"
          >
            <span className="text-[#888888] text-[13px] font-medium mr-1 shrink-0">
              Trending:
            </span>
            {TRENDING_TAGS.map((tag, i) => (
              <motion.button
                key={tag}
                onClick={() => handleTagClick(tag)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.55 + i * 0.07,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgba(85,110,255,0.5)",
                  backgroundColor: "rgba(85,110,255,0.12)",
                  color: "#ffffff",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1a1a2e] border border-white/[0.08] text-[#CCCCCC] text-[12px] px-3.5 py-1.5 rounded-full cursor-pointer shrink-0"
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
