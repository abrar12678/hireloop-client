"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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

/* ─── Sparkle canvas — 30fps ─── */

function Sparkles() {
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

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.5 + 0.15,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
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
        ctx.fillStyle = `rgba(255,255,255,${(d.a * flicker).toFixed(2)})`;
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
  "Trending Position",
  "Product Designer",
  "AI Engineering",
  "Dev-ops Engineer",
];

/* ─── Hero ─── */

export default function Hero() {
  return (
    <section className="relative bg-black overflow-x-hidden overflow-y-hidden">
      {/* Static ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6200EE]/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3B82F6]/[0.06] rounded-full blur-[100px]" />
      </div>

      <Sparkles />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* ── Badge ── */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex items-center gap-2.5 bg-[#1a1a2e] border border-white/[0.1] rounded-full px-4 py-2 mb-8"
              whileHover={{
                borderColor: "rgba(98,0,238,0.4)",
                scale: 1.04,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <div className="w-6 h-6 rounded-full bg-[#FF5722] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-[13px] font-medium tracking-wide">
                <strong className="font-bold">50,000+</strong>{" "}
                <span className="text-[#CCCCCC] text-[11px] uppercase tracking-widest">
                  New Jobs This Month
                </span>
              </span>
            </motion.div>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            variants={fadeUp}
            custom={0.12}
            initial="hidden"
            animate="visible"
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            Find Your{" "}
            <span
              className="inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #8B5CF6, #6200EE, #FF5722, #6200EE, #8B5CF6)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
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

          {/* ── Search Bar ── */}
          <motion.div
            variants={scaleIn}
            custom={0.32}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto"
          >
            {/* Desktop: horizontal layout */}
            <motion.div
              className="hidden sm:flex items-stretch bg-[#111118]/80 border border-white/[0.12] rounded-xl backdrop-blur-md shadow-2xl shadow-black/40 p-1.5"
              whileHover={{
                borderColor: "rgba(139, 92, 246, 0.3)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Job Input */}
              <div className="flex items-center flex-1 px-4 py-2.5">
                <Magnifier className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </div>
              {/* Divider */}
              <div className="w-px my-3 bg-white/10" />
              {/* Location Input */}
              <div className="flex items-center flex-1 px-4 py-2.5">
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
                  placeholder="Location or Remote"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </div>
              {/* Circular Search Button */}
              <motion.button
                className="w-11 h-11 bg-[#6200EE] rounded-full flex items-center justify-center shadow-lg shadow-purple-600/30 my-1 flex-shrink-0 cursor-pointer"
                whileHover={{
                  scale: 1.12,
                  boxShadow: "0 0 28px rgba(98,0,238,0.5)",
                  backgroundColor: "#7C3AED",
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
                className="flex items-center bg-[#111118]/80 border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md"
                whileTap={{ scale: 0.98 }}
              >
                <Magnifier className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </motion.div>
              <motion.div
                className="flex items-center bg-[#111118]/80 border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md"
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
                  placeholder="Location or Remote"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* ── Trending Tags ── */}
          <motion.div
            variants={fadeUp}
            custom={0.44}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl mx-auto"
          >
            <span className="text-[#888888] text-[13px] font-medium mr-1 shrink-0">
              Trending:
            </span>
            {TRENDING_TAGS.map((tag, i) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.55 + i * 0.07,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgba(98,0,238,0.5)",
                  backgroundColor: "rgba(98,0,238,0.12)",
                  color: "#ffffff",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "tween",
                  duration: 0.15,
                  ease: "easeOut",
                }}
                className="bg-white/[0.04] border border-white/[0.08] text-[#CCCCCC] text-[12px] px-3.5 py-1.5 rounded-full cursor-pointer shrink-0"
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
