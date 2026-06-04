"use client";

import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import CrownDiamond from "@gravity-ui/icons/CrownDiamond";
import ChartMixed from "@gravity-ui/icons/ChartMixed";
import Thunderbolt from "@gravity-ui/icons/Thunderbolt";
import { motion, useInView, AnimatePresence } from "motion/react";

const PLANS = [
  {
    name: "Starter",
    icon: CrownDiamond,
    monthlyPrice: 0,
    yearlyPrice: 0,
    subheading: "Start building your insights hub:",
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
    highlighted: false,
    accent: "#8B5CF6",
  },
  {
    name: "Growth",
    icon: ChartMixed,
    monthlyPrice: 17,
    yearlyPrice: 13,
    subheading: "Start building your insights hub:",
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
    highlighted: true,
    accent: "#F7C2FF",
  },
  {
    name: "Premium",
    icon: Thunderbolt,
    monthlyPrice: 99,
    yearlyPrice: 74,
    subheading: "Start building your insights hub:",
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
    highlighted: false,
    accent: "#6366F1",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
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

const featureVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.4 + i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function AnimatedPrice({ value, isInView }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-white text-[40px] font-bold leading-none"
      >
        ${value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function CTASection() {
  const [isYearly, setIsYearly] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#000000] py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Purple ambient glow — static */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#8B5CF6]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-3 text-[13px] sm:text-[14px] font-medium tracking-[0.15em] uppercase mb-5">
              <motion.span
                className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              Pricing
              <motion.span
                className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white leading-[1.2] mb-8"
          >
            Pay for the leverage, not the listings
          </motion.h2>

          {/* Monthly / Yearly Toggle */}
          <motion.div
            className="inline-flex items-center bg-[#1F2937] rounded-full p-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.button
              onClick={() => setIsYearly(false)}
              className={`relative px-5 py-2 rounded-full text-[14px] font-medium cursor-pointer ${
                !isYearly
                  ? "bg-white text-black shadow-lg shadow-purple-500/20"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
              whileTap={{ scale: 0.96 }}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setIsYearly(true)}
              className={`relative px-5 py-2 rounded-full text-[14px] font-medium cursor-pointer ${
                isYearly
                  ? "bg-white text-black shadow-lg shadow-purple-500/20"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
              whileTap={{ scale: 0.96 }}
            >
              Yearly
              <span className="absolute -top-1.5 -right-2.5 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                25%
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {PLANS.map((plan, i) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{
                  y: -8,
                  transition: { type: "tween", duration: 0.2 },
                }}
                className={`relative rounded-xl p-7 lg:p-8 ${
                  plan.highlighted
                    ? "bg-[#595959]/20 border border-[#595959]/20"
                    : "bg-[#000000] border border-white/[0.08]"
                }`}
              >
                {/* Hover glow for highlighted card */}
                {plan.highlighted && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none bg-gradient-to-b from-[#8B5CF6]/5 to-transparent" />
                )}

                {/* Popular badge for highlighted */}
                {plan.highlighted && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6200EE] to-[#8B5CF6] text-white text-[11px] font-bold px-4 py-1 rounded-full tracking-wide uppercase"
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      delay: 0.35,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Most Popular
                  </motion.div>
                )}

                {/* Plan Icon + Name */}
                <div className="mb-6">
                  <motion.div
                    className="border border-white/[0.08] bg-gradient-to-b from-[#010102] to-[#313131] rounded-xl p-4 inline-flex"
                    whileHover={{
                      scale: 1.08,
                      borderColor: `${plan.accent}40`,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                      },
                    }}
                  >
                    <Icon className="w-6 h-6 text-[#F7C2FF]" />
                  </motion.div>
                  <h3 className="text-white mt-3 text-[18px] font-medium">
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-end justify-end mb-2">
                  <AnimatedPrice value={price} isInView={isInView} />
                  <span className="text-[#9CA3AF] text-[14px] ml-1.5 mb-1">
                    /month
                  </span>
                </div>

                {/* Subheading */}
                <p className="text-[#9CA3AF] text-[14px] font-medium mb-6">
                  {plan.subheading}
                </p>

                {/* Feature List */}
                <div className="space-y-3 mb-7">
                  {plan.features.map((feature, fi) => (
                    <motion.div
                      key={feature}
                      custom={fi}
                      variants={featureVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      className="flex items-start gap-2.5"
                    >
                      <motion.span
                        className="text-[#8B5CF6] text-[16px] leading-none mt-px flex-shrink-0"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{
                          delay: 0.45 + fi * 0.06,
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                      >
                        +
                      </motion.span>
                      <span className="text-[#D1D5DB] text-[14px] leading-relaxed">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  className={`w-full py-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                    plan.highlighted
                      ? "bg-white text-black"
                      : "bg-[#595959]/20 text-white"
                  }`}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: plan.highlighted
                      ? "0 0 24px rgba(139,92,246,0.3)"
                      : "0 0 16px rgba(255,255,255,0.08)",
                    transition: { type: "tween", duration: 0.15 },
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  Choose This Plan
                  <motion.span
                    whileHover={{ x: 3 }}
                    transition={{ type: "tween", duration: 0.15 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
