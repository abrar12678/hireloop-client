"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_LINKS = ["Browse Jobs", "Company", "Pricing"];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Left-bottom white gradient glow */}
      <div className="absolute bottom-0 left-0 w-48 h-24 bg-gradient-to-tr from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none rounded-br-2xl" />
      {/* Right-bottom white gradient glow */}
      <div className="absolute bottom-0 right-0 w-48 h-24 bg-gradient-to-tl from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none rounded-bl-2xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="HireLoop"
              width={150}
              height={36}
              className="object-contain"
              priority
            />
          </div>

          {/* Desktop: Nav Links pushed RIGHT + Divider + Auth Buttons */}
          <div className="hidden py-2 px-4 md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="relative text-[#CCCCCC] hover:text-white text-[14px] font-medium transition-colors duration-200 group py-1"
              >
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#8B5CF6] group-hover:w-full transition-all duration-300" />
              </a>
            ))}

            {/* Vertical Divider */}
            <div className="w-px h-5 bg-white/20" />

            {/* Sign In */}
            <a
              href="#"
              className="text-[#5C53FE] text-[14px] font-medium transition-colors duration-200"
            >
              Sign In
            </a>

            {/* Get Started */}
            <button className="bg-white text-black font-medium text-[14px] px-5 py-2 rounded-md transition-all duration-200 cursor-pointer active:scale-[0.97]">
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#CCCCCC] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0a0a0f] border-t border-white/[0.06] px-5 pt-3 pb-5 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => setMobileOpen(false)}
              className="block text-[#CCCCCC] hover:text-white hover:bg-white/5 text-[15px] font-medium px-3 py-3 rounded-lg transition-colors"
            >
              {link}
            </a>
          ))}
          <div className="border-t border-white/[0.06] my-2" />
          <a
            href="#"
            className="block text-[#5C53FE] text-[15px] font-medium px-3 py-3 rounded-lg transition-colors"
          >
            Sign In
          </a>
          <button className="w-full bg-white text-black font-medium text-[15px] px-6 py-3 rounded-md transition-all cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
