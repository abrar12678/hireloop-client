"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import LogoFacebook from "@gravity-ui/icons/LogoFacebook";
import LogoLinkedin from "@gravity-ui/icons/LogoLinkedin";
import ArrowUpRight from "@gravity-ui/icons/ArrowUpRight";
import Compass from "@gravity-ui/icons/Compass";
import Globe from "@gravity-ui/icons/Globe";

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

const SOCIAL_LINKS = [
  { icon: LogoFacebook, href: "#", label: "Facebook", bg: "bg-[#1877F2]" },
  { icon: PinterestIcon, href: "#", label: "Pinterest", bg: "bg-[#E60023]" },
  { icon: LogoLinkedin, href: "#", label: "LinkedIn", bg: "bg-[#0A66C2]" },
];

const SECTION_ICONS = {
  Product: Globe,
  Navigations: Compass,
  Resources: ArrowUpRight,
};

const Footer2 = () => {
  return (
    <footer className="relative bg-black">
      {/* ─── CTA SECTION WITH BG IMAGE ─── */}
      <div className="relative overflow-hidden">
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
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white leading-tight mb-5">
            Your next role is already
            <br />
            looking for you
          </h2>
          <p className="text-[#CCCCCC] text-base sm:text-[17px] leading-relaxed mb-10 max-w-xl mx-auto">
            Build a profile in three minutes. The matches start arriving
            tomorrow morning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-white text-[#333333] text-[15px] font-medium px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2">
              Create a free account
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto bg-[#1F2937] text-white text-[15px] font-medium px-8 py-4 rounded-lg hover:bg-[#2a3544] transition-colors duration-200 cursor-pointer">
              View pricing
            </button>
          </div>
        </div>
      </div>

      {/* Top separator */}
      {/* <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" /> */}

      {/* ─── MAIN FOOTER CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 sm:pt-16 pb-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:max-w-[280px] xl:max-w-[320px] flex-shrink-0">
            <div className="mb-5">
              <Image
                src="/images/logo.png"
                alt="HireLoop"
                width={140}
                height={36}
                className="object-contain"
              />
            </div>
            <p className="text-[#9CA3AF] text-[14px] leading-[1.7] max-w-[260px]">
              The AI-native career platform. Built for people who take their
              work seriously.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-14">
            {NAV_SECTIONS.map((section) => {
              const SectionIcon = SECTION_ICONS[section.title];
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-5">
                    {SectionIcon && (
                      <SectionIcon className="w-4 h-4 text-[#4361EE]" />
                    )}
                    <h3 className="text-[#4361EE] text-[14px] font-semibold tracking-wide uppercase">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="group text-[#9CA3AF] hover:text-white text-[14px] transition-colors duration-200 inline-flex items-center gap-1"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-50 group-hover:translate-y-0 transition-all duration-200" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 ${social.bg} rounded-lg flex items-center justify-center text-white hover:opacity-80 hover:scale-105 transition-all duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Copyright + Legal */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[13px] text-[#6B7280]">
            <span>Copyright 2024 — Programming Hero</span>
            <span className="hidden sm:inline text-[#3a3a3a]">|</span>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="hover:text-[#9CA3AF] transition-colors duration-200"
              >
                Terms &amp; Policy
              </a>
              <a
                href="#"
                className="hover:text-[#9CA3AF] transition-colors duration-200"
              >
                Privacy Guideline
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
