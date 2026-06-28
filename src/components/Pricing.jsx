"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, BarChart3, Zap, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";

const SEEKER_PLANS = [
  {
    name: "Free",
    id: "seeker_free",
    icon: "crown",
    monthlyPrice: "$0",
    period: "/forever",
    description: "Essential features for getting started",
    features: [
      "Browse & save up to 10 jobs",
      "Apply to up to 3 jobs per month",
      "Basic profile page",
      "Standard email alerts",
    ],
    popular: false,
  },
  {
    name: "Pro",
    id: "seeker_pro",
    icon: "barChart",
    monthlyPrice: "$19.99",
    period: "/month",
    description: "Accelerate your job search",
    features: [
      "Apply to up to 30 jobs per month",
      "Unlimited saved jobs",
      "Advanced application tracking dashboard",
      "Comprehensive salary insights",
    ],
    popular: true,
  },
  {
    name: "Premium",
    id: "seeker_premium",
    icon: "zap",
    monthlyPrice: "$39.99",
    period: "/month",
    description: "Uncapped potential for elite talent",
    features: [
      "Everything in Pro + Unlimited apps",
      "Profile boost to recruiter feeds",
      "Early access to new jobs",
      "24/7 Priority support",
    ],
    popular: false,
  },
];

const ICON_MAP = {
  crown: Crown,
  barChart: BarChart3,
  zap: Zap,
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function getYearlyPrice(monthlyPriceStr) {
  const num = parseFloat(monthlyPriceStr.replace("$", ""));
  if (num === 0) return "$0";
  const yearlyTotal = num * 12 * 0.75;
  return `$${yearlyTotal.toFixed(2)}`;
}

export default function Pricing() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-20 sm:py-24 lg:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="inline-flex items-center gap-2.5 font-[family-name:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] uppercase text-white/80 mb-4">
              <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
              Pricing
              <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
            </p>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-[family-name:var(--font-manrope)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white mb-10"
          >
            Pay for the leverage,
            <br />
            not the listings
          </motion.h2>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-16"
          >
            <div className="relative inline-grid grid-cols-2 bg-[#161617] rounded-full p-1 w-[260px]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className="relative z-10 flex items-center justify-center py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                <span
                  className={
                    billingCycle === "monthly" ? "text-black" : "text-slate-400"
                  }
                >
                  Monthly
                </span>
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className="relative z-10 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                <span
                  className={
                    billingCycle === "yearly" ? "text-black" : "text-slate-400"
                  }
                >
                  Yearly
                </span>
                <span className="bg-[#d946ef] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                  25%
                </span>
              </button>
              <motion.div
                layoutId="pricing-toggle"
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full"
                animate={{
                  x: billingCycle === "monthly" ? 0 : "100%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="rounded-2xl p-8 flex flex-col h-full bg-black border border-[#F6EFE1]/20"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 animate-pulse" />
                      <div className="h-5 w-16 bg-neutral-800 rounded animate-pulse" />
                    </div>
                    <div className="text-right">
                      <div className="h-8 w-20 bg-neutral-800 rounded animate-pulse mb-1 ml-auto" />
                      <div className="h-3 w-12 bg-neutral-800 rounded animate-pulse ml-auto" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-neutral-800 rounded animate-pulse mb-5" />
                  <ul className="space-y-4 mb-10">
                    {[1, 2, 3, 4].map((n) => (
                      <li key={n} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded bg-neutral-800 animate-pulse shrink-0 mt-0.5" />
                        <div className="h-3.5 w-full bg-neutral-800 rounded animate-pulse" />
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto h-11 w-full rounded-xl bg-neutral-800 animate-pulse" />
                </div>
              ))
            : SEEKER_PLANS.map((plan, i) => {
            const Icon = ICON_MAP[plan.icon];
            const isPopular = plan.popular;
            const isFree = plan.monthlyPrice === "$0";

            const displayPrice =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : getYearlyPrice(plan.monthlyPrice);

            const displayPeriod =
              billingCycle === "yearly" && !isFree ? "/year" : plan.period;

            return (
              <motion.div
                key={plan.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className={`group rounded-2xl p-8 flex flex-col justify-between h-full transition-all duration-300 ${
                  isPopular
                    ? "bg-[#151516] border border-white/20 hover:-translate-y-1"
                    : "bg-black border border-[#F6EFE1]/20 hover:-translate-y-1"
                }`}
              >
                <div>
                  {/* Header Row: Icon+Name Left, Price Right */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-neutral-900 border border-white/10 p-2">
                        <Icon className="w-4 h-4 text-[#F7C2FF]" />
                      </div>
                      <h3 className="text-xl font-medium text-white">
                        {plan.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-4xl font-bold tracking-tight text-white">
                        {displayPrice}
                      </span>
                      <span className="text-xs text-neutral-400 font-normal">
                        {displayPeriod}
                      </span>
                    </div>
                  </div>

                  {/* Description Subtitle */}
                  <p className="text-sm font-medium text-white mb-5">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <ul role="list" className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="bg-neutral-900 border border-white/10 rounded p-0.5 text-neutral-400 w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          +
                        </span>
                        <span className="text-sm font-normal leading-relaxed text-neutral-500">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => router.push("/plans")}
                  className={`group/btn w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isPopular
                      ? "bg-white text-black hover:bg-neutral-200"
                      : "bg-[#151516] text-white hover:bg-[#1e1e1f]"
                  }`}
                >
                  Choose This Plan
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* View All Pricings */}
        <motion.div
          className="text-center mt-12 lg:mt-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.button
            onClick={() => router.push("/plans")}
            className="inline-flex items-center gap-2 bg-white text-[#0a0a0f] text-[14px] font-semibold px-7 py-3 rounded-lg cursor-pointer"
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 24px rgba(99,102,241,0.25)",
              backgroundColor: "#f0f0f5",
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "tween", duration: 0.15 }}
          >
            View all pricings
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
