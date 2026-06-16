"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/companies" },
  { label: "Pricing", href: "/plans" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const dashboardLinks = {
    seeker: "/dashboard/seeker",
    recruiter: "/dashboard/recruiter",
    admin: "/dashboard/admin",
  };

  const navLinks = [
    ...NAV_LINKS,
    ...(user?.email
      ? [
          {
            label: "Dashboard",
            href: dashboardLinks[user?.role || "seeker"],
          },
        ]
      : []),
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4"
    >
      <div
        className={`w-full max-w-5xl rounded-[18px] transition-all duration-300 border ${
          scrolled
            ? "bg-white/[0.06] backdrop-blur-[20px] shadow-lg shadow-black/20 border-white/[0.12]"
            : "bg-white/[0.03] backdrop-blur-[16px] border-white/[0.08]"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 sm:px-6">
          {/* Logo */}
          <Image
            src="/images/logo.png"
            alt="logo-icon"
            width={120}
            height={50}
          />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
              >
                <Link
                  href={link.href}
                  className="relative text-[#CCCCCC] text-[14px] font-medium hover:text-white transition-colors duration-200 py-1"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-[2px] bg-[#6B63FF] w-0 hover:w-full transition-all duration-250" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <span className="text-[#CCCCCC] text-[14px] font-medium">
                  Welcome, {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Link
                    href="/auth/signIn"
                    className="text-[#665CFF] text-[14px] font-medium hover:text-[#7B73FF] transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.45,
                    duration: 0.35,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 0 24px rgba(107,99,255,0.35)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link
                      href="/auth/signUp"
                      className="block bg-gradient-to-r from-[#6B63FF] to-[#5A54F5] text-white font-medium text-[14px] px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-[#6B63FF]/25 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
                </motion.svg>
              ) : (
                <motion.svg
                  key="hamburger"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25, delay: 0.05 },
              }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="px-5 pt-3 pb-5 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-[#CCCCCC] hover:text-white text-[15px] font-medium px-3 py-3 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-white/[0.06] my-2" />

                {user ? (
                  <div className="flex items-center gap-3 px-3 py-3">
                    <span className="text-[#CCCCCC] text-[14px] font-medium">
                      Welcome, {user.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3 pt-1">
                    <Link
                      href="/auth/signIn"
                      onClick={() => setMobileOpen(false)}
                      className="block text-[#665CFF] text-[15px] font-medium py-3 text-center border border-[#665CFF]/30 rounded-lg hover:bg-[#665CFF]/10 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signUp"
                      onClick={() => setMobileOpen(false)}
                      className="block bg-gradient-to-r from-[#6B63FF] to-[#5A54F5] text-white font-medium text-[15px] px-6 py-3 rounded-lg text-center"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
