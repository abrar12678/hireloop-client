"use client";

import { useEffect, useRef, useState } from "react";
import Briefcase from "@gravity-ui/icons/Briefcase";
import { Persons } from "@gravity-ui/icons";
import SquareDashed from "@gravity-ui/icons/SquareDashed";
import Star from "@gravity-ui/icons/Star";
import Image from "next/image";
import { motion, useInView } from "motion/react";

/* ─── Sparkle canvas — 30fps capped ─── */

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

    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.4 + 0.1,
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

/* ─── Animated counter component ─── */

function AnimatedCounter({ value, suffix, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseFloat(value.replace(/[^0-9.]/g, ""));
    const step = end / (duration * 60);
    let current = start;

    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  const formatNumber = (num) => {
    if (suffix === "M") return `${Math.floor(num)}M`;
    if (suffix === "K") return `${Math.floor(num)}K`;
    if (suffix === "%") return `${Math.floor(num)}%`;
    return Math.floor(num).toString();
  };

  return <span ref={ref}>{formatNumber(count)}</span>;
}

/* ─── Data ─── */

const STATS = [
  {
    number: "50",
    displayValue: "50K",
    label: "Active Jobs",
    icon: Briefcase,
    suffix: "K",
    color: "#6200EE",
  },
  {
    number: "12",
    displayValue: "12K",
    label: "Companies",
    icon: SquareDashed,
    suffix: "K",
    color: "#3B82F6",
  },
  {
    number: "2",
    displayValue: "2M",
    label: "Job Seekers",
    icon: Persons,
    suffix: "M",
    color: "#8B5CF6",
  },
  {
    number: "97",
    displayValue: "97%",
    label: "Satisfaction Rate",
    icon: Star,
    suffix: "%",
    color: "#FF5722",
  },
];

/* ─── Card animation variants ─── */

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─── StatsSection ─── */

export default function StatsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#08080f] py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <Sparkles />

      {/* Purple glow — static (no animation on blur = no lag) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6200EE]/[0.05] rounded-full blur-[120px]" />
      </div>

      {/* Background image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-4 leading-tight"
          >
            Assisting over{" "}
            <span className="bg-gradient-to-r from-[#6200EE] to-[#8B5CF6] bg-clip-text text-transparent">
              15,000+
            </span>{" "}
            job seekers find their dream positions.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[#888888] text-[15px] sm:text-[16px] leading-relaxed"
          >
            We are the bridge between talented professionals and the
            world&apos;s most innovative companies.
          </motion.p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{
                  y: -6,
                  borderColor: `rgba(${stat.color === "#6200EE" ? "98,0,238" : stat.color === "#3B82F6" ? "59,130,246" : stat.color === "#8B5CF6" ? "139,92,246" : "255,87,34"},0.35)`,
                  transition: { type: "tween", duration: 0.2 },
                }}
                className="group relative bg-gradient-to-b from-[#010102] to-[#313131] border border-white/10 rounded-2xl shadow-2xl p-7 lg:p-8 cursor-default"
              >
                {/* Hover glow orb */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="mb-6 relative"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: `${stat.color}18` }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: `${stat.color}CC` }}
                    />
                  </div>
                </motion.div>

                {/* Number */}
                <div className="text-4xl sm:text-[40px] lg:text-[44px] font-bold text-white tracking-tight mb-2">
                  <AnimatedCounter value={stat.number} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="text-white/60 text-[14px] sm:text-[15px] font-normal group-hover:text-white/80 transition-colors duration-300">
                  {stat.label}
                </div>

                {/* Bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0, opacity: 0 }}
                  whileHover={{ width: "60%", opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
