"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Magnifier from "@gravity-ui/icons/Magnifier";
import { Briefcase } from "@gravity-ui/icons";

function Sparkles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.6 + 0.15,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now();
      dots.forEach((d) => {
        const flicker = Math.sin(t * d.speed + d.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a * flicker})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

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

export default function Hero() {
  return (
    <section className="relative bg-black overflow-hidden">
      {/* Purple-blue radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#6200EE]/[0.08] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#3B82F6]/[0.06] rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#1a1a2e] border border-white/[0.1] rounded-full px-4 py-2 mb-8">
            <div className="w-6 h-6 rounded-full bg-[#FF5722] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white text-[13px] font-medium tracking-wide">
              <strong className="font-bold">50,000+</strong>{" "}
              <span className="text-[#CCCCCC] text-[11px] uppercase tracking-widest">
                New Jobs This Month
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-6">
            Find Your Dream Job Today
          </h1>

          {/* Subtext */}
          <p className="text-[#CCCCCC] text-[16px] sm:text-[17px] leading-relaxed max-w-2xl mx-auto mb-10">
            HireLoop connects top talent with world-class companies. Browse
            thousands of curated opportunities and land your next role — faster.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            {/* Desktop: horizontal layout */}
            <div className="hidden sm:flex items-stretch bg-[#111118]/80 border border-white/[0.12] rounded-xl overflow-visible backdrop-blur-md shadow-2xl shadow-black/40 p-1.5">
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
              <button className="w-11 h-11 bg-[#6200EE] hover:bg-[#5200C8] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-[0.93] shadow-lg shadow-purple-600/30 my-1 flex-shrink-0">
                <Magnifier className="w-[18px] h-[18px] text-white" />
              </button>
            </div>

            {/* Mobile: stacked layout */}
            <div className="sm:hidden flex flex-col gap-2">
              <div className="flex items-center bg-[#111118]/80 border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md">
                <Magnifier className="w-[18px] h-[18px] text-[#888888] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  className="bg-transparent text-white placeholder-[#888888] text-[14px] w-full outline-none"
                />
              </div>
              <div className="flex items-center bg-[#111118]/80 border border-white/[0.12] rounded-xl px-4 py-3 backdrop-blur-md">
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
            </div>

            {/* Trending Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-[#888888] text-[13px] font-medium mr-1">
                Trending:
              </span>
              {[
                "Trending Position",
                "Product Designer",
                "AI Engineering",
                "Dev-ops Engineer",
              ].map((tag) => (
                <button
                  key={tag}
                  className="bg-white/[0.04] border border-white/[0.08] hover:border-[#6200EE]/50 hover:bg-[#6200EE]/10 text-[#CCCCCC] hover:text-white text-[12px] px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
