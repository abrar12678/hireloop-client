"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { getPaymentHistory } from "@/lib/api-client/subscriptions";
import {
  Check, FileDown, CreditCard, Shield, Headphones,
  ChevronUp, ChevronDown, X, ExternalLink, Crown, Zap, Rocket,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 24) return diffInHours <= 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const PLAN_FEATURES = {
  Free: ["Browse & save up to 10 jobs", "Apply to up to 3 jobs per month", "Basic profile page", "Standard email alerts"],
  Pro: ["Apply to up to 30 jobs per month", "Unlimited saved jobs", "Advanced application tracking", "Comprehensive salary insights"],
  Premium: ["Everything in Pro + Unlimited apps", "Profile boost to recruiter feeds", "Early access to new jobs", "24/7 Priority support"],
};

const UPGRADE_MAP = {
  Free: "seeker_pro",
  Pro: "seeker_premium",
};

const PLAN_META = {
  Free: { icon: Shield, color: "#A1A1AA", label: "Free" },
  Pro: { icon: Zap, color: "#3B82F6", label: "Pro" },
  Premium: { icon: Crown, color: "#FACC15", label: "Premium" },
  seeker_pro: { icon: Zap, color: "#3B82F6", label: "Pro", tier: "Pro", price: "$19.99/mo" },
  seeker_premium: { icon: Crown, color: "#FACC15", label: "Premium", tier: "Premium", price: "$39.99/mo" },
};

/* ═══════════════════════════════════════════════════
   MANAGE PLAN MODAL
   ═══════════════════════════════════════════════════ */

function ManagePlanModal({ isOpen, onClose, currentPlan }) {
  const [expanded, setExpanded] = useState(null);

  if (!isOpen) return null;

  const planInfo = PLAN_META[currentPlan] || PLAN_META.Free;
  const PlanIcon = planInfo.icon;

  const sections = [
    {
      title: "Current Plan Details",
      content: `You are currently on the ${planInfo.label} plan. ${currentPlan === "Free" ? "Upgrade to unlock more features and increase your job application limits." : `Your subscription is active. You have access to all ${planInfo.label} features.`}`,
    },
    {
      title: "Billing Cycle",
      content: `Your plan ${currentPlan === "Free" ? "is free forever with limited features." : "renews monthly. You can cancel anytime from your Stripe customer portal."}`,
    },
    {
      title: "Need Help?",
      content: "If you have questions about your plan or need assistance with billing, please contact our support team.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-[#1B1B1F] border border-white/[0.08] rounded-[16px] shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${planInfo.color}15` }}>
              <PlanIcon size={20} style={{ color: planInfo.color }} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-white">Manage Plan</h3>
              <p className="text-[13px] text-[#71717A]">Current: {planInfo.label} Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Accordion Content */}
        <div className="px-6 py-4 space-y-2 max-h-[400px] overflow-y-auto">
          {sections.map((section, i) => (
            <div key={i} className="border border-white/[0.05] rounded-[10px] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span className="text-[14px] font-medium text-white">{section.title}</span>
                {expanded === i ? <ChevronUp size={16} className="text-[#71717A]" /> : <ChevronDown size={16} className="text-[#71717A]" />}
              </button>
              {expanded === i && (
                <div className="px-4 pb-3">
                  <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.05] flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-[#3A3A40] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#4A4A52] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BILLING COMPONENTS
   ═══════════════════════════════════════════════════ */

function CurrentPlanCard({ subscription, onManagePlan }) {
  const planName = subscription?.planName || subscription?.plan || "Free";
  const planTier = planName.charAt(0).toUpperCase() + planName.slice(1);
  const nextPlanId = UPGRADE_MAP[planTier];
  const nextPlanInfo = nextPlanId ? PLAN_META[nextPlanId] : null;
  const priceMap = { Free: "$0", Pro: "$19.99", Premium: "$39.99" };
  const price = subscription?.amount ? `$${subscription.amount}` : priceMap[planTier] || "$0";
  const features = PLAN_FEATURES[planTier] || PLAN_FEATURES.Pro;

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="mb-4">
        <span className="inline-flex items-center text-[11px] uppercase tracking-wide font-medium px-2.5 py-1 bg-[#3A3A40] rounded-md text-[#A1A1AA]">Current Plan</span>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[20px] font-semibold text-white leading-tight">{planTier === "Free" ? "Free Plan" : `${planTier} Plan`}</h3>
          <p className="text-[14px] text-[#71717A] mt-1">{planTier === "Free" ? "Essential features for getting started" : `Your ${planTier} subscription is active`}</p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className="text-[28px] font-bold text-white leading-none">{price}</span>
          {planTier !== "Free" && <span className="text-[14px] text-[#71717A]">/mo</span>}
          <p className="text-[12px] text-[#71717A] mt-1">{planTier === "Free" ? "Free forever" : "Renews monthly"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-6">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <Check size={16} className="text-[#22C55E] shrink-0" />
            <span className="text-[13px] text-[#A1A1AA]">{feature}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        {nextPlanId && (
          <form action="/api/checkout_sessions" method="POST">
            <input type="hidden" name="plan_id" value={nextPlanId} />
            <button type="submit" className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer inline-flex items-center gap-2">
              Upgrade to {nextPlanInfo?.label} <ExternalLink size={14} />
            </button>
          </form>
        )}
        <button onClick={onManagePlan} className="h-10 px-4 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 ease-in-out cursor-pointer">
          Manage Plan
        </button>
      </div>
    </div>
  );
}

function PaymentMethodCard() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex justify-between items-center">
        <h3 className="text-[18px] font-medium text-white">Payment Method</h3>
        <span className="inline-flex items-center text-[10px] uppercase tracking-wide font-medium px-2 py-1 bg-[#3A3A40] rounded-md text-[#71717A]">Secure by Stripe</span>
      </div>
      <div className="mt-4 bg-gradient-to-br from-[#3A3A40] to-[#1B1B1F] rounded-[12px] p-4 border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
        <div className="flex justify-end mb-8"><CreditCard size={28} className="text-[#71717A]" /></div>
        <p className="text-[18px] text-white font-medium tracking-[0.2em] text-center mb-8">&bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; 4242</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] text-[#71717A] uppercase tracking-wide">Card Holder</p>
            <p className="text-[14px] text-[#A1A1AA] mt-0.5">Connected via Stripe</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#71717A] uppercase tracking-wide">Expires</p>
            <p className="text-[14px] text-[#A1A1AA] mt-0.5">12/28</p>
          </div>
        </div>
      </div>
      <form action="/api/checkout_sessions" method="POST">
        <input type="hidden" name="plan_id" value="seeker_pro" />
        <button type="submit" className="flex items-center justify-center gap-2 w-full text-[14px] text-[#71717A] mt-4 hover:text-white transition-colors duration-150 cursor-pointer h-9 rounded-lg hover:bg-white/[0.04]">
          <Rocket size={15} /> Add Payment Method
        </button>
      </form>
    </div>
  );
}

function PaidBadge() {
  return <span className="inline-flex items-center px-2.5 py-0.5 text-[12px] font-medium rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">Paid</span>;
}

function BillingTable({ payments }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <table className="w-full" role="table" aria-label="Billing history">
        <thead>
          <tr className="h-12 border-b border-white/[0.05]">
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Date</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">Plan</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden md:table-cell">Amount</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Transaction ID</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? payments.map((payment, idx) => (
            <tr key={payment._id?.$oid || payment._id || idx} className="h-14 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150">
              <td className="px-6 text-[14px] text-[#A1A1AA]">{formatDate(payment.createdAt?.$date || payment.createdAt || payment.date)}</td>
              <td className="px-6 text-[14px] text-[#A1A1AA] capitalize hidden sm:table-cell">{payment.planName || payment.plan || "N/A"}</td>
              <td className="px-6 text-[14px] text-[#A1A1AA] hidden md:table-cell">${payment.amount ?? "0.00"}</td>
              <td className="px-6 text-[12px] text-[#71717A] font-mono hidden lg:table-cell">{payment.transactionId || payment.stripeSubscriptionId || "N/A"}</td>
              <td className="px-6 text-right"><PaidBadge /></td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5}>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard size={40} className="text-[#3A3A40] mb-4" />
                  <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">No payment history yet</p>
                  <p className="text-[#71717A] text-[14px]">Your billing transactions will appear here.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SupportCTA() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h4 className="text-[15px] font-medium text-white">Need help with billing?</h4>
        <p className="text-[13px] text-[#71717A] mt-1">Our support team is available to assist you with any payment or subscription questions.</p>
      </div>
      <button className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer inline-flex items-center gap-2">
        <Headphones size={15} /> Contact Support
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BILLING PAGE
   ═══════════════════════════════════════════════════ */
export default function SeekerBillingPage() {
  const { data: session, isPending } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPaymentHistory();
        const list = Array.isArray(data) ? data : data?.subscriptions || data?.payments || [];
        setPayments(list);
        if (list.length > 0) setSubscription(list[0]);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Subscription &amp; Billing</h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">Manage your subscription plan, payment methods, and view billing history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard subscription={subscription} onManagePlan={() => setShowManageModal(true)} />
        <PaymentMethodCard />
      </div>

      <section aria-label="Billing history">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-medium text-white">Billing History</h3>
          <button className="flex items-center gap-2 text-[14px] text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer">
            <FileDown size={15} /> Export PDF
          </button>
        </div>
        <div className="mt-4"><BillingTable payments={payments} /></div>
      </section>

      <SupportCTA />

      <ManagePlanModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        currentPlan={subscription?.planName || subscription?.plan || "Free"}
      />
    </div>
  );
}