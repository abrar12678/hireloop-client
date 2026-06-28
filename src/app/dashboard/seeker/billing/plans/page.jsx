"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, BarChart3, Zap, ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { getActiveSubscription } from "@/lib/api-client/subscriptions";

/* ═══════════════════════════════════════════════════
   PLAN DATA
   ═══════════════════════════════════════════════════ */

const SEEKER_PLANS = [
  {
    name: "Free",
    id: "seeker_free",
    icon: Crown,
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "/forever",
    description: "Essential features for getting started",
    features: [
      "Browse & save up to 10 jobs",
      "Apply to up to 3 jobs per month",
      "Basic profile page",
      "Standard email alerts",
    ],
    popular: false,
    level: 0,
  },
  {
    name: "Pro",
    id: "seeker_pro",
    icon: BarChart3,
    monthlyPrice: "$19.99",
    yearlyPrice: "$179.90",
    period: "/month",
    description: "Accelerate your job search",
    features: [
      "Apply to up to 30 jobs per month",
      "Unlimited saved jobs",
      "Advanced application tracking dashboard",
      "Comprehensive salary insights",
    ],
    popular: true,
    level: 1,
  },
  {
    name: "Premium",
    id: "seeker_premium",
    icon: Zap,
    monthlyPrice: "$39.99",
    yearlyPrice: "$359.90",
    period: "/month",
    description: "Uncapped potential for elite talent",
    features: [
      "Everything in Pro + Unlimited apps",
      "Profile boost to recruiter feeds",
      "Early access to new jobs",
      "24/7 Priority support",
    ],
    popular: false,
    level: 2,
  },
];

/* ═══════════════════════════════════════════════════
   BUTTON STATE LOGIC
   ═══════════════════════════════════════════════════ */

function getButtonState(plan, activePlan, billingCycle) {
  // No active subscription (user is on free)
  if (!activePlan || activePlan.billingStatus === "free") {
    if (plan.id === "seeker_free") {
      return { label: "Current Plan", disabled: true, variant: "disabled" };
    }
    return { label: "Choose This Plan", disabled: false, variant: plan.popular ? "primary" : "secondary" };
  }

  // User has an active paid subscription
  const activeLevel = SEEKER_PLANS.find((p) => p.id === activePlan.planId)?.level ?? 0;
  const thisLevel = plan.level;

  // This is the currently active plan
  if (plan.id === activePlan.planId) {
    return { label: "Current Plan", disabled: true, variant: "disabled" };
  }

  // Free plan when user already upgraded away
  if (plan.id === "seeker_free") {
    return { label: "No Longer Available", disabled: true, variant: "muted" };
  }

  // Lower or same level — can't downgrade
  if (thisLevel <= activeLevel) {
    return { label: "Downgrade Unavailable", disabled: true, variant: "muted" };
  }

  // Higher level — can upgrade
  return { label: "Upgrade Now", disabled: false, variant: plan.popular ? "primary" : "secondary" };
}

/* ═══════════════════════════════════════════════════
   PLAN CARD
   ═══════════════════════════════════════════════════ */

function PlanCard({ plan, billingCycle, activePlan }) {
  const PlanIcon = plan.icon;
  const isPopular = plan.popular;
  const isFree = plan.id === "seeker_free";

  const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const displayPeriod = billingCycle === "yearly" && !isFree ? "/year" : (isFree ? "/forever" : "/month");

  const btn = getButtonState(plan, activePlan, billingCycle);
  const isActive = btn.variant === "disabled" && btn.label === "Current Plan";

  const borderClass = isActive
    ? "border-2 border-[#556EFF]"
    : isPopular
      ? "border-2 border-white/20"
      : "border border-white/[0.05] hover:border-white/[0.08]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group rounded-[14px] p-8 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 ${borderClass} ${
        isActive ? "bg-[#1B1B1F] shadow-[0_0_30px_rgba(85,110,255,0.08)]" : "bg-[#1B1B1F]"
      }`}
    >
      <div>
        {/* Header Row */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isActive ? "bg-[#556EFF]/15 border border-[#556EFF]/30" : "bg-[#3A3A40] border border-white/[0.06]"}`}>
              <PlanIcon size={18} className={isActive ? "text-[#556EFF]" : "text-[#A1A1AA]"} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white">{plan.name}</h3>
              {isPopular && !isActive && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 bg-[#3B82F6]/20 rounded-md text-[#3B82F6] mt-0.5">
                  Popular
                </span>
              )}
              {isActive && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 bg-[#556EFF]/15 rounded-md text-[#556EFF] mt-0.5">
                  Active
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="block text-3xl font-bold tracking-tight text-white">
              {displayPrice}
            </span>
            <span className="text-xs text-[#71717A] font-normal">{displayPeriod}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-[#A1A1AA] mb-5">{plan.description}</p>

        {/* Features List */}
        <ul role="list" className="space-y-3 mb-10">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="bg-[#3A3A40] border border-white/[0.06] rounded p-0.5 w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                <Check size={10} className="text-[#22C55E]" />
              </span>
              <span className="text-sm font-normal leading-relaxed text-[#A1A1AA]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      {btn.disabled ? (
        <button
          disabled
          className={`w-full h-11 px-4 rounded-[10px] flex items-center justify-center gap-2 text-[14px] font-medium transition-all duration-200 cursor-not-allowed ${
            btn.variant === "muted"
              ? "bg-[#1A1A1F] text-[#52525B] border border-white/[0.04]"
              : "bg-[#3A3A40] text-[#71717A]"
          }`}
        >
          {btn.label}
        </button>
      ) : (
        <form action="/api/checkout_sessions" method="POST">
          <input type="hidden" name="plan_id" value={plan.id} />
          <input type="hidden" name="billing_cycle" value={billingCycle} />
          <button
            type="submit"
            className={`group/btn w-full h-11 px-4 rounded-[10px] flex items-center justify-center gap-2 text-[14px] font-medium transition-all duration-200 cursor-pointer ${
              btn.variant === "primary"
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-[#3A3A40] text-white hover:bg-[#4A4A52]"
            }`}
          >
            {btn.label}
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </form>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

export default function BillingPlansPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const data = await getActiveSubscription();
        setActivePlan(data);
      } catch (err) {
        console.error("Failed to fetch active plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#556EFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/seeker/billing")}
        className="inline-flex items-center gap-2 text-[14px] text-[#A1A1AA] hover:text-white transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Billing
      </button>

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
            Choose a Plan
          </h1>
          <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
            Select the plan that best fits your job search needs.
          </p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="relative inline-grid grid-cols-2 bg-[#0E0E11] rounded-full p-1 w-[260px] shrink-0">
          <button
            onClick={() => setBillingCycle("monthly")}
            className="relative z-10 flex items-center justify-center py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            <span className={billingCycle === "monthly" ? "text-black" : "text-[#A1A1AA]"}>
              Monthly
            </span>
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className="relative z-10 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            <span className={billingCycle === "yearly" ? "text-black" : "text-[#A1A1AA]"}>
              Yearly
            </span>
            <span className="bg-[#6366F1] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
              25%
            </span>
          </button>
          <motion.div
            layoutId="cycle-toggle"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full"
            animate={{ x: billingCycle === "monthly" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>
      </div>

      {/* Active plan info bar */}
      {activePlan && activePlan.billingStatus !== "free" && (
        <div className="bg-[#0E0E11] border border-[#556EFF]/20 rounded-[12px] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[14px] text-[#A1A1AA]">
              Currently on <span className="text-white font-medium">{activePlan.planName || activePlan.planId} Plan</span>
              {activePlan.billingCycle && (
                <span className="text-[#71717A]"> ({activePlan.billingCycle})</span>
              )}
              {activePlan.billingStatus === "past_due" && (
                <span className="ml-2 text-[#EF4444] font-medium">— Payment Overdue</span>
              )}
            </span>
          </div>
          {activePlan.nextBillingDate && (
            <span className="text-[13px] text-[#71717A]">
              Next billing:{" "}
              <span className="text-[#A1A1AA]">
                {new Date(activePlan.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEEKER_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            activePlan={activePlan}
          />
        ))}
      </div>
    </div>
  );
}