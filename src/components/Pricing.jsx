"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CrownDiamond from "@gravity-ui/icons/CrownDiamond";
import ChartMixed from "@gravity-ui/icons/ChartMixed";
import Thunderbolt from "@gravity-ui/icons/Thunderbolt";

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
  },
];

export default function CTASection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="relative bg-[#000000] py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Subtle purple ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#8B5CF6]/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Overline with dots */}
          <p className="inline-flex items-center gap-3  text-[13px] sm:text-[14px] font-medium tracking-[0.15em] uppercase mb-5">
            <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
            Pricing
            <span className="inline-block w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white leading-[1.2] mb-8">
            Pay for the leverage, not the listings
          </h2>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center bg-[#1F2937] rounded-full p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-300 cursor-pointer ${
                !isYearly
                  ? "bg-white text-black shadow-lg shadow-purple-500/20"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-300 cursor-pointer ${
                isYearly
                  ? "bg-white text-black shadow-lg shadow-purple-500/20"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              Yearly
              <span className="absolute -top-1.5 -right-2.5 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl p-7 lg:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#595959]/20 border border-[#595959]/20"
                    : "bg-[#000000] border border-white/[0.08]"
                }`}
              >
                {/* Plan Icon + Name */}
                <div className="mb-6">
                  <span className="border border-white/[0.08] bg-gradient-to-b from-[#010102] to-[#313131] rounded-xl p-4 mb-2 inline-flex">
                    <Icon className="w-6 h-6 text-[#F7C2FF]" />
                  </span>
                  <h3 className="text-white mt-2 text-[18px] font-medium">
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-end justify-end mb-2">
                  <span className="text-white text-[40px] font-bold leading-none">
                    ${price}
                  </span>
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
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <span className="text-white text-[14px] leading-none mt-0.5 flex-shrink-0">
                        +
                      </span>
                      <span className="text-[#D1D5DB] text-[14px] leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg text-[14px] font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? "bg-white text-black hover:bg-gray-100 border border-white/[0.1]"
                      : "bg-[#595959]/20 text-white hover:bg-[#6b6b6b]"
                  }`}
                >
                  Choose This Plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
