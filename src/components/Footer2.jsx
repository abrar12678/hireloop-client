"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";

const NAV_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Job discovery", href: "#" },
      { label: "Worker AI", href: "#" },
      { label: "Companies", href: "#" },
      { label: "Salary data", href: "#" },
    ],
  },
  {
    title: "Navigations",
    links: [
      { label: "Help center", href: "#" },
      { label: "Career library", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Brand Guideline", href: "#" },
      { label: "Newsroom", href: "#" },
    ],
  },
];

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const PinterestIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 0 5.396 0 12.017c0 5.077 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: PinterestIcon, href: "#", label: "Pinterest" },
  { icon: LinkedInIcon, href: "#", label: "LinkedIn" },
];

function WireframeDome() {
  return (
    <svg
      viewBox="-40 -40 680 360"
      fill="none"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] opacity-80 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Horizontal ellipse arcs (latitude lines) */}
      <ellipse
        cx="300"
        cy="20"
        rx="260"
        ry="35"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <ellipse
        cx="300"
        cy="60"
        rx="245"
        ry="32"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.45"
      />
      <ellipse
        cx="300"
        cy="100"
        rx="225"
        ry="28"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <ellipse
        cx="300"
        cy="140"
        rx="195"
        ry="24"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.35"
      />
      <ellipse
        cx="300"
        cy="180"
        rx="155"
        ry="18"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <ellipse
        cx="300"
        cy="215"
        rx="100"
        ry="12"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.25"
      />

      {/* Vertical converging lines (longitude lines) */}
      <line
        x1="40"
        y1="20"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="100"
        y1="15"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="160"
        y1="10"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="220"
        y1="8"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="300"
        y1="5"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <line
        x1="380"
        y1="8"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="440"
        y1="10"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="500"
        y1="15"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="560"
        y1="20"
        x2="300"
        y2="240"
        stroke="#6366F1"
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  );
}

const Footer2 = () => {
  const router = useRouter();
  const ctaRef = useRef(null);
  const footerRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });
  const footerInView = useInView(footerRef, { once: true, margin: "-60px" });

  return (
    <footer role="contentinfo" className="relative bg-black overflow-hidden">
      {/* ─── CTA BANNER SECTION ─── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden flex flex-col items-center text-center px-4 pt-24 pb-16"
      >
        {/* Wireframe Dome */}
        <WireframeDome />

        {/* Core Glow — blue type */}
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-blue-600 via-indigo-600 to-transparent opacity-60 blur-[120px] pointer-events-none" />

        {/* CTA Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight mb-6"
          >
            Your next role is
            <br />
            already looking for you
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-base md:text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </motion.p>

          <motion.div
            className="flex flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.button
              onClick={() => router.push("/signUp")}
              className="bg-white text-black text-sm font-medium px-6 py-3.5 rounded-xl cursor-pointer"
              whileHover={{ backgroundColor: "#e5e5e5" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              Create a free account
            </motion.button>

            <motion.button
              onClick={() => router.push("/plans")}
              className="bg-[#0a0a0c]/80 border border-white/10 text-white text-sm font-medium px-6 py-3.5 rounded-xl cursor-pointer"
              whileHover={{
                borderColor: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              View pricing
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN FOOTER GRID ─── */}
      <div
        ref={footerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 border-t border-zinc-900"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column — spans 2 */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={footerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-block cursor-pointer"
            >
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-sky-500">hire</span>
                <span className="text-amber-600">loop</span>
              </span>
            </motion.div>
            <p className="mt-6 text-sm text-zinc-500 max-w-sm leading-relaxed">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>
          </motion.div>

          {/* Navigation Columns — 3 columns */}
          {NAV_SECTIONS.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 18 }}
              animate={footerInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + si * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h3 className="text-indigo-400 text-sm font-semibold uppercase tracking-wide mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3 flex flex-col" role="list">
                {section.links.map((link, li) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={footerInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.2 + si * 0.08 + li * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <a
                      href={link.href}
                      className="text-sm font-normal text-zinc-500 hover:text-zinc-200 transition-colors duration-150 cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM LEGAL BAR ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600 pb-8">
          {/* Social Icons */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={footerInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-zinc-900/60 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  whileHover={{ y: -2 }}
                  transition={{ type: "tween", duration: 0.15 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Copyright + Legal */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={footerInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span>Copyright 2024 — Programming Hero</span>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Terms &amp; Policy
              </a>
              <a
                href="#"
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Privacy Guideline
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
