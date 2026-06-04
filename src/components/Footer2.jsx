"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import LogoFacebook from "@gravity-ui/icons/LogoFacebook";

import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";
import Compass from "@gravity-ui/icons/Compass";
import Globe from "@gravity-ui/icons/Globe";
import { motion, useInView } from "motion/react";

const PinterestIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 0 5.396 0 12.017c0 5.077 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.993 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
  </svg>
);

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

const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    icon: LogoFacebook,
    href: "#",
    label: "Facebook",
    bg: "bg-[#1877F2]",
    glow: "rgba(24,119,242,0.5)",
  },
  {
    icon: PinterestIcon,
    href: "#",
    label: "Pinterest",
    bg: "bg-[#E60023]",
    glow: "rgba(230,0,35,0.5)",
  },
  {
    icon: InstagramIcon,
    href: "#",
    label: "Instagram",
    bg: "bg-[#E4405F]",
    glow: "rgba(228,64,95,0.5)",
  },
];

const SECTION_ICONS = {
  Product: Globe,
  Navigations: Compass,
  Resources: ArrowUpRight,
};

const Footer2 = () => {
  const ctaRef = useRef(null);
  const footerRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });
  const footerInView = useInView(footerRef, { once: true, margin: "-60px" });

  return (
    <footer className="relative bg-black overflow-hidden">
      {/* ─── CTA SECTION ─── */}
      <div ref={ctaRef} className="relative overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a3a6e]/70 via-[#0f1f3d]/50 to-transparent">
          <Image
            src="/images/cta-bg.png"
            alt="CTA Background"
            width={1920}
            height={1080}
            className="w-full h-auto"
          />
        </div>

        {/* CTA Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-20 sm:py-28 lg:py-36 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white leading-tight mb-5"
          >
            Your next role is already
            <br />
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
              looking for you
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[#CCCCCC] text-base sm:text-[17px] leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.button
              className="w-full sm:w-auto bg-white text-[#333333] text-[15px] font-medium px-8 py-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 28px rgba(139,92,246,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              Create a free account
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>

            <motion.button
              className="w-full sm:w-auto bg-[#1F2937] text-white text-[15px] font-medium px-8 py-4 rounded-lg cursor-pointer"
              whileHover={{
                scale: 1.04,
                backgroundColor: "#2a3544",
                boxShadow: "0 0 16px rgba(255,255,255,0.06)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              View pricing
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ─── MAIN FOOTER CONTENT ─── */}
      <div
        ref={footerRef}
        className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 sm:pt-16 pb-10"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-12 lg:gap-8">
          {/* Brand */}
          <motion.div
            className="lg:max-w-[280px] xl:max-w-[320px] flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={footerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="mb-5"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                src="/images/logo.png"
                alt="HireLoop"
                width={140}
                height={36}
                className="object-contain"
              />
            </motion.div>
            <p className="text-[#9CA3AF] text-[14px] leading-[1.7] max-w-[260px]">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>
          </motion.div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-14">
            {NAV_SECTIONS.map((section, si) => {
              const SectionIcon = SECTION_ICONS[section.title];
              return (
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
                  <div className="flex items-center gap-2 mb-5">
                    {SectionIcon && (
                      <SectionIcon className="w-4 h-4 text-[#4361EE]" />
                    )}
                    <h3 className="text-[#4361EE] text-[14px] font-semibold tracking-wide uppercase">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
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
                        <motion.a
                          href={link.href}
                          className="group text-[#9CA3AF] hover:text-white text-[14px] inline-flex items-center gap-1 cursor-pointer"
                          whileHover={{ x: 3 }}
                          transition={{ type: "tween", duration: 0.15 }}
                        >
                          <span>{link.label}</span>
                          <motion.span
                            className="opacity-0 -translate-y-0.5 inline-flex"
                            whileHover={{
                              opacity: 0.5,
                              y: 0,
                            }}
                            transition={{
                              type: "tween",
                              duration: 0.15,
                            }}
                          >
                            <ArrowUpRight className="w-3 h-3" />
                          </motion.span>
                        </motion.a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          className="h-px bg-white/[0.06] origin-left"
          initial={{ scaleX: 0 }}
          animate={footerInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
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
            {SOCIAL_LINKS.map((social, i) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 ${social.bg} rounded-lg flex items-center justify-center text-white cursor-pointer relative`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={footerInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    delay: 0.55 + i * 0.07,
                    type: "spring",
                    stiffness: 400,
                    damping: 18,
                  }}
                  whileHover={{
                    scale: 1.18,
                    y: -5,
                    boxShadow: `0 8px 24px ${social.glow}`,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Copyright + Legal */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[13px] text-[#6B7280]"
            initial={{ opacity: 0 }}
            animate={footerInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span>Copyright 2024 — Programming Hero</span>
            <span className="hidden sm:inline text-[#3a3a3a]">|</span>
            <div className="flex items-center gap-3">
              <motion.a
                href="#"
                className="hover:text-[#9CA3AF] cursor-pointer"
                whileHover={{ x: 2 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                Terms &amp; Policy
              </motion.a>
              <motion.a
                href="#"
                className="hover:text-[#9CA3AF] cursor-pointer"
                whileHover={{ x: 2 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                Privacy Guideline
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
