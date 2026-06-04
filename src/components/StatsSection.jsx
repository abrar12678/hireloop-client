"use client";

import { useEffect, useRef } from "react";
import Briefcase from "@gravity-ui/icons/Briefcase";
import { Persons } from "@gravity-ui/icons";
import SquareDashed from "@gravity-ui/icons/SquareDashed";
import Star from "@gravity-ui/icons/Star";
import Image from "next/image";

/* ─── sparkle generator (reused) ─── */
function Sparkles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.5 + 0.1,
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

const STATS = [
  {
    number: "50K",
    label: "Active Jobs",
    icon: Briefcase,
  },
  {
    number: "12K",
    label: "Companies",
    icon: SquareDashed,
  },
  {
    number: "2M",
    label: "Job Seekers",
    icon: Persons,
  },
  {
    number: "97%",
    label: "Satisfaction Rate",
    icon: Star,
  },
];

export default function StatsSection() {
  return (
    <section className="relative bg-[#08080f] py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Sparkles */}
      <Sparkles />

      {/* Purple-blue glow (subtle) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6200EE]/[0.05] rounded-full blur-[180px]" />
      </div>

      {/* ─── BG IMAGE PLACEHOLDER ─── */}
      {/* Add your background image here. Example: */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/globe.png"
          alt=""
          fill
          className="object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-4 leading-tight">
            Assisting over{" "}
            <span className="bg-gradient-to-r from-[#6200EE] to-[#8B5CF6] bg-clip-text text-transparent">
              15,000+
            </span>{" "}
            job seekers find their dream positions.
          </h2>
          <p className="text-[#888888] text-[15px] sm:text-[16px] leading-relaxed">
            We are the bridge between talented professionals and the
            world&apos;s most innovative companies.
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative bg-gradient-to-b from-[#010102] to-[#313131] border border-white/10 rounded-2xl shadow-2xl p-7 lg:p-8 transition-all duration-300 hover:bg-[#10101a]"
              >
                {/* Icon - small white line icon at top-left */}
                <div className="mb-6">
                  <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Number - large bold white */}
                <div className="text-4xl sm:text-[40px] lg:text-[44px] font-bold text-white tracking-tight mb-2">
                  {stat.number}
                </div>

                {/* Label - smaller regular white */}
                <div className="text-white/60 text-[14px] sm:text-[15px] font-normal">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
