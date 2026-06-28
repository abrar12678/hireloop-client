"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, BarChart3, Zap, ArrowRight, Briefcase, User } from "lucide-react";
import { motion } from "motion/react";
import {
  Check,
  CircleQuestion,
  ChevronDown,
} from "@gravity-ui/icons";
import { useSession } from "@/lib/auth-client";

/* ─── Plan Data ─── */
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

const RECRUITER_PLANS = [
  {
    name: "Free",
    id: "recruiter_free",
    icon: "crown",
    monthlyPrice: "$0",
    period: "/forever",
    description: "Ideal baseline for startup hiring",
    features: [
      "Up to 3 active job posts simultaneously",
      "Basic applicant management pipeline",
      "Standard organic listing search visibility",
      "Great for a company's first year of hiring",
    ],
    popular: false,
  },
  {
    name: "Growth",
    id: "recruiter_growth",
    icon: "barChart",
    monthlyPrice: "$49.99",
    period: "/month",
    description: "Built for expanding companies",
    features: [
      "Up to 10 active job posts simultaneously",
      "Full automated applicant tracking workflow",
      "Basic listing performance metrics & analytics",
      "Dedicated email support desk response",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    id: "recruiter_enterprise",
    icon: "zap",
    monthlyPrice: "$149.99",
    period: "/month",
    description: "Large-scale talent acquisition",
    features: [
      "Up to 50 active job posts simultaneously",
      "Advanced interactive analytics dashboard",
      "Premium featured job listing styling boosts",
      "Multi-user team collaboration seats",
      "Custom corporate branding options",
      "Dedicated account manager + priority support",
    ],
    popular: false,
  },
];

const ICON_MAP = { crown: Crown, barChart: BarChart3, zap: Zap };

function getYearlyPrice(monthlyPriceStr) {
  const num = parseFloat(monthlyPriceStr.replace("$", ""));
  if (num === 0) return "$0";
  const yearlyTotal = num * 12 * 0.75;
  return `$${yearlyTotal.toFixed(2)}`;
}

const faqs = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, absolutely. All our premium tiers operate on flexible, non-binding month-to-month subscription structures. You can easily modify, downgrade, or cancel your renewal configurations through your profile billing dashboard settings at any time with no penalties.",
  },
  {
    question: "How do refunds work if I change my mind?",
    answer:
      "We maintain a 14-day satisfaction policy. If you determine the premium features aren't a proper fit for your current search or hiring sequence within your initial two weeks of service, reach out to support for a complete refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support all major international credit/debit networks including Visa, Mastercard, American Express, and Discover. Enterprise-grade recruiters also have options to establish monthly or annual invoicing arrangements via bank wire transfers.",
  },
  {
    question: "What happens if I decide to switch plans mid-month?",
    answer:
      "If you upgrade your plan tier mid-cycle, the transition occurs immediately, and your remaining days on the old tier are applied as a pro-rated credit toward your updated invoice. Downgrades take effect starting with your subsequent billing date.",
  },
];

/* ─── Component ─── */
const PricingPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [billingTarget, setBillingTarget] = useState("seeker");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const activePlans = billingTarget === "seeker" ? SEEKER_PLANS : RECRUITER_PLANS;

  const handleChoosePlan = (planId) => {
    if (!user) {
      const billingPath = billingTarget === "seeker"
        ? "/dashboard/seeker/billing/plans"
        : "/dashboard/recruiter/billing/plans";
      router.push(`/auth/signIn?redirect=${encodeURIComponent(billingPath)}`);
      return;
    }
    // Logged in — submit to checkout
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/checkout_sessions";
    const p = document.createElement("input");
    p.type = "hidden"; p.name = "plan_id"; p.value = planId;
    const c = document.createElement("input");
    c.type = "hidden"; c.name = "billing_cycle"; c.value = billingCycle;
    form.appendChild(p); form.appendChild(c);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* ── Header ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 sm:pt-28 sm:pb-10">
        <div className="text-center flex flex-col items-center">
          {/* Kicker */}
          <p className="inline-flex items-center gap-2.5 font-[family-name:var(--font-space-mono)] text-xs font-semibold tracking-[0.25em] uppercase text-white/80 mb-4">
            <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
            Transparent Pricing
            <span className="inline-block w-[7px] h-[7px] bg-[#2563eb] rounded-sm" />
          </p>

          {/* Heading */}
          <h1 className="font-[family-name:var(--font-manrope)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white mb-4">
            Pay for the leverage,
            <br />
            not the listings
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Whether you are an ambitious job seeker hunting for your next
            milestone or an expanding operation tracking down pristine talent,
            we have got you covered.
          </p>
        </div>
      </div>

      {/* ── Toggles Row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6 mb-14">
        {/* Seeker / Recruiter Tab */}
        <div className="relative inline-grid grid-cols-2 bg-[#161617] rounded-full p-1 w-[280px]">
          <button
            onClick={() => setBillingTarget("seeker")}
            className="relative z-10 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            <User className="w-4 h-4" />
            <span className={billingTarget === "seeker" ? "text-black" : "text-slate-400"}>
              Job Seekers
            </span>
          </button>
          <button
            onClick={() => setBillingTarget("recruiter")}
            className="relative z-10 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            <Briefcase className="w-4 h-4" />
            <span className={billingTarget === "recruiter" ? "text-black" : "text-slate-400"}>
              Recruiters
            </span>
          </button>
          <motion.div
            layoutId="target-toggle"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full"
            animate={{ x: billingTarget === "seeker" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="relative inline-grid grid-cols-2 bg-[#161617] rounded-full p-1 w-[260px]">
          <button
            onClick={() => setBillingCycle("monthly")}
            className="relative z-10 flex items-center justify-center py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            <span className={billingCycle === "monthly" ? "text-black" : "text-slate-400"}>
              Monthly
            </span>
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className="relative z-10 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            <span className={billingCycle === "yearly" ? "text-black" : "text-slate-400"}>
              Yearly
            </span>
            <span className="bg-[#d946ef] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
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

      {/* ── Pricing Cards Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
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
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`group rounded-2xl p-8 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "bg-[#151516] border border-white/20"
                    : "bg-black border border-[#F6EFE1]/20"
                }`}
              >
                <div>
                  {/* Header: Icon+Name Left, Price Right */}
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

                  {/* Description */}
                  <p className="text-sm font-medium text-white mb-5">
                    {plan.description}
                  </p>

                  {/* Features */}
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

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => handleChoosePlan(plan.id)}
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
      </div>

      {/* ── FAQ Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-16 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 mb-3">
              <CircleQuestion className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Have concerns regarding billing? Find answers below.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#151516] border border-white/10 rounded-xl overflow-hidden transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left p-4 gap-4 text-white hover:text-white/80 transition cursor-pointer"
                  >
                    <span className="text-sm font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-40 border-t border-white/10" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 text-xs text-neutral-500 leading-relaxed bg-[#151516]/50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;