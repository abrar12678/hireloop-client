"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = ["Browse Jobs", "Company", "Pricing"];

const navVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 26, delay: 0.1 },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const mobileMenuVariants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.25, delay: 0.05 },
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.15 },
    },
  },
};

const mobileItemVariants = {
  closed: { opacity: 0, x: -12 },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const pathname = usePathname();

  const user = session?.user;

  // Refetch session on every route change
  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      {/* Left-bottom white gradient glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-48 h-24 bg-gradient-to-tr from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none rounded-br-2xl"
      />
      {/* Right-bottom white gradient glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute bottom-0 right-0 w-48 h-24 bg-gradient-to-tl from-white/[0.06] via-white/[0.02] to-transparent pointer-events-none rounded-bl-2xl"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Image
              src="/images/logo.png"
              alt="HireLoop"
              width={150}
              height={36}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Desktop Nav Links + Auth Buttons */}
          <div className="hidden py-2 px-4 md:flex items-center gap-7">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link}
                href="#"
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -2, color: "#ffffff" }}
                whileTap={{ y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative text-[#CCCCCC] text-[14px] font-medium cursor-pointer py-1"
              >
                {link}
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-[2px] bg-[#8B5CF6]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </motion.a>
            ))}

            {/* Vertical Divider */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="w-px h-5 bg-white/20 origin-center"
            />

            {user ? (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <motion.span
                  className="text-[#CCCCCC] text-[14px] font-medium"
                  whileHover={{ color: "#ffffff" }}
                >
                  Welcome, {user.name}
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link
                      href="/auth/signIn"
                      className="text-[#5C53FE] text-[14px] font-medium transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  </motion.div>
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
                    className="relative overflow-hidden rounded-md"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {/* Shimmer / shine sweep */}
                    <motion.span
                      className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none z-10"
                      whileHover={{
                        left: "150%",
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <Link
                      href="/auth/signUp"
                      className="block bg-white text-black font-medium text-[14px] px-5 py-2 rounded-md transition-all duration-200 cursor-pointer"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#CCCCCC] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="md:hidden overflow-hidden bg-[#0a0a0f] border-t border-white/[0.06]"
          >
            <div className="px-5 pt-3 pb-5 space-y-1">
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  variants={mobileItemVariants}
                  onClick={() => setMobileOpen(false)}
                  whileHover={{
                    x: 4,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="block text-[#CCCCCC] hover:text-white text-[15px] font-medium px-3 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  {link}
                </motion.a>
              ))}

              <motion.div
                variants={mobileItemVariants}
                className="border-t border-white/[0.06] my-2"
              />

              {user ? (
                <motion.div
                  variants={mobileItemVariants}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <span className="text-[#CCCCCC] text-[14px] font-medium">
                    Welcome, {user.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </motion.div>
              ) : (
                <motion.div variants={mobileItemVariants} className="space-y-1">
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/auth/signIn"
                      onClick={() => setMobileOpen(false)}
                      className="block text-[#5C53FE] text-[15px] font-medium px-3 py-3 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link
                      href="/auth/signUp"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full bg-white text-black font-medium text-[15px] px-6 py-3 rounded-md text-center transition-all"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
