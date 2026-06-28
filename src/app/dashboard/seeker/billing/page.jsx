"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getActiveSubscription,
  getBillingHistory,
  payBill,
  cancelSubscription,
} from "@/lib/api-client/subscriptions";
import {
  Check, CreditCard, Shield, Headphones,
  ChevronUp, ChevronDown, X, Crown, Zap, Rocket,
  AlertTriangle, CalendarClock, ArrowRight, RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount, cycle) => {
  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return `$${num.toFixed(2)}`;
};

const PLAN_FEATURES = {
  Free: [
    "Browse & save up to 10 jobs",
    "Apply to up to 3 jobs per month",
    "Basic profile page",
    "Standard email alerts",
  ],
  Pro: [
    "Apply to up to 30 jobs per month",
    "Unlimited saved jobs",
    "Advanced application tracking",
    "Comprehensive salary insights",
  ],
  Premium: [
    "Everything in Pro + Unlimited apps",
    "Profile boost to recruiter feeds",
    "Early access to new jobs",
    "24/7 Priority support",
  ],
};

const PLAN_META = {
  Free: { icon: Shield, color: "#A1A1AA" },
  Pro: { icon: Zap, color: "#556EFF" },
  Premium: { icon: Crown, color: "#FACC15" },
};

/* ═══════════════════════════════════════════════════
   STATUS BADGES
   ═══════════════════════════════════════════════════ */

function StatusBadge({ status }) {
  const config = {
    paid: { bg: "bg-[#22C55E]/15", text: "text-[#22C55E]", border: "border-[#22C55E]/30", label: "Paid" },
    pending: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30", label: "Pending" },
    overdue: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30", label: "Overdue" },
    failed: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30", label: "Failed" },
  };
  const c = config[status] || config.paid;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[12px] font-medium rounded-full ${c.bg} ${c.text} ${c.border} border`}>
      {c.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   MANAGE PLAN MODAL
   ═══════════════════════════════════════════════════ */

function ManagePlanModal({ isOpen, onClose, activeSub, onCancel }) {
  const [expanded, setExpanded] = useState(null);

  if (!isOpen) return null;

  const planName = activeSub?.planName || "Free";
  const info = PLAN_META[planName] || PLAN_META.Free;
  const PlanIcon = info.icon;
  const isFree = !activeSub || activeSub.billingStatus === "free";

  const sections = [
    {
      title: "Current Plan Details",
      content: isFree
        ? "You are currently on the Free plan. Upgrade to unlock more features and increase your job application limits."
        : `Your ${planName} subscription is ${activeSub.billingStatus === "past_due" ? "past due — please pay to restore full access." : "active and in good standing."} You have access to all ${planName} features.`,
    },
    {
      title: "Billing Cycle",
      content: isFree
        ? "Free plan has no billing cycle. Upgrade anytime to start a subscription."
        : `Your plan renews ${activeSub.billingCycle || "monthly"}. ${activeSub.nextBillingDate ? `Next billing date: ${formatDate(activeSub.nextBillingDate)}.` : ""}`,
    },
    {
      title: "Cancellation Policy",
      content: "You can cancel your subscription at any time. Upon cancellation, your plan will revert to Free at the end of your current billing period. No partial refunds are issued for mid-cycle cancellations.",
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
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: `${info.color}15` }}
            >
              <PlanIcon size={20} style={{ color: info.color }} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-white">Manage Plan</h3>
              <p className="text-[13px] text-[#71717A]">Current: {planName} Plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
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
                {expanded === i ? (
                  <ChevronUp size={16} className="text-[#71717A]" />
                ) : (
                  <ChevronDown size={16} className="text-[#71717A]" />
                )}
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
        <div className="px-6 py-4 border-t border-white/[0.05] flex justify-between items-center">
          {!isFree && (
            <button
              onClick={() => {
                onCancel();
                onClose();
              }}
              className="h-9 px-4 text-[13px] font-medium rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
            >
              Cancel Subscription
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="h-9 px-4 bg-[#3A3A40] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#4A4A52] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CURRENT PLAN CARD
   ═══════════════════════════════════════════════════ */

function CurrentPlanCard({ activeSub, onManagePlan }) {
  const router = useRouter();

  const planName = activeSub?.planName || "Free";
  const info = PLAN_META[planName] || PLAN_META.Free;
  const PlanIcon = info.icon;
  const isFree = !activeSub || activeSub.billingStatus === "free";
  const isPastDue = activeSub?.billingStatus === "past_due";

  const priceMap = { Free: 0, Pro: 19.99, Premium: 39.99 };
  const amount = activeSub?.amount || priceMap[planName] || 0;
  const cycle = activeSub?.billingCycle || "monthly";
  const features = PLAN_FEATURES[planName] || PLAN_FEATURES.Free;

  const canUpgrade = planName === "Free" || planName === "Pro";

  return (
    <div className={`bg-[#1B1B1F] border rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${
      isPastDue ? "border-[#EF4444]/40" : "border-white/[0.05]"
    }`}>
      {/* Past Due Warning Banner */}
      {isPastDue && (
        <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[10px] px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#EF4444] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-[#EF4444]">Payment Overdue</p>
            <p className="text-[12px] text-[#FCA5A5] mt-0.5">
              Your subscription payment is past due. Premium features are restricted until the bill is paid.
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <span
          className="inline-flex items-center text-[11px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-md"
          style={{
            backgroundColor: isPastDue ? "rgba(239,68,68,0.15)" : `${info.color}15`,
            color: isPastDue ? "#EF4444" : info.color,
          }}
        >
          {isPastDue ? "Past Due" : "Current Plan"}
        </span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[20px] font-semibold text-white leading-tight">
            {planName === "Free" ? "Free Plan" : `${planName} Plan`}
          </h3>
          <p className="text-[14px] text-[#71717A] mt-1">
            {isFree
              ? "Essential features for getting started"
              : isPastDue
                ? "Subscription active — payment required"
                : "Your subscription is active"}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className="text-[28px] font-bold text-white leading-none">
            {isFree ? "Free" : formatCurrency(amount)}
          </span>
          {!isFree && (
            <span className="text-[14px] text-[#71717A]">/{cycle === "yearly" ? "year" : "mo"}</span>
          )}
          <p className="text-[12px] text-[#71717A] mt-1">
            {isFree ? "Free forever" : `Renews ${cycle}`}
          </p>
        </div>
      </div>

      {/* Next billing date */}
      {!isFree && activeSub?.nextBillingDate && (
        <div className="flex items-center gap-2 mt-4 text-[13px] text-[#71717A]">
          <CalendarClock size={14} />
          <span>
            Next billing:{" "}
            <span className={isPastDue ? "text-[#EF4444] font-medium" : "text-[#A1A1AA]"}>
              {formatDate(activeSub.nextBillingDate)}
            </span>
            {isPastDue && " (overdue)"}
          </span>
        </div>
      )}

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-5">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <Check size={16} className="text-[#22C55E] shrink-0" />
            <span className="text-[13px] text-[#A1A1AA]">{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {canUpgrade && (
          <button
            onClick={() => router.push("/dashboard/seeker/billing/plans")}
            className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer inline-flex items-center gap-2"
          >
            Upgrade
            <ArrowRight size={14} />
          </button>
        )}
        <button
          onClick={onManagePlan}
          className="h-10 px-4 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 ease-in-out cursor-pointer"
        >
          Manage Plan
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAYMENT METHOD CARD
   ═══════════════════════════════════════════════════ */

function PaymentMethodCard() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <div className="flex justify-between items-center">
        <h3 className="text-[18px] font-medium text-white">Payment Method</h3>
        <span className="inline-flex items-center text-[10px] uppercase tracking-wide font-medium px-2 py-1 bg-[#3A3A40] rounded-md text-[#71717A]">
          Secure by Stripe
        </span>
      </div>
      <div className="mt-4 bg-gradient-to-br from-[#3A3A40] to-[#1B1B1F] rounded-[12px] p-4 border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
        <div className="flex justify-end mb-8">
          <CreditCard size={28} className="text-[#71717A]" />
        </div>
        <p className="text-[18px] text-white font-medium tracking-[0.2em] text-center mb-8">
          &bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; 4242
        </p>
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
      <button
        onClick={() => {}}
        className="flex items-center justify-center gap-2 w-full text-[14px] text-[#71717A] mt-4 transition-colors duration-150 h-9 rounded-lg hover:bg-white/[0.04]"
      >
        <Rocket size={15} /> Add Payment Method
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BILLING TABLE
   ═══════════════════════════════════════════════════ */

function BillingTable({ payments, onPayBill, payingId }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <table className="w-full" role="table" aria-label="Billing history">
        <thead>
          <tr className="h-12 border-b border-white/[0.05]">
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">
              Date
            </th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">
              Description
            </th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden md:table-cell">
              Amount
            </th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">
              Transaction ID
            </th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">
              Status
            </th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment, idx) => (
              <tr
                key={payment._id?.$oid || payment._id || idx}
                className="h-14 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
              >
                <td className="px-6 text-[14px] text-[#A1A1AA]">{formatDate(payment.date)}</td>
                <td className="px-6 text-[14px] text-[#A1A1AA] hidden sm:table-cell">
                  <div>
                    <span className="capitalize">{payment.description}</span>
                    {payment.billingCycle && (
                      <span className="ml-1.5 text-[11px] text-[#71717A]">({payment.billingCycle})</span>
                    )}
                  </div>
                </td>
                <td className="px-6 text-[14px] text-[#A1A1AA] hidden md:table-cell">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 text-[12px] text-[#71717A] font-mono hidden lg:table-cell">
                  {payment.transactionId || "N/A"}
                </td>
                <td className="px-6 text-right">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 text-right">
                  {payment.status === "overdue" && (
                    <button
                      onClick={() => onPayBill(payment._id?.$oid || payment._id?.toString())}
                      disabled={payingId === (payment._id?.$oid || payment._id?.toString())}
                      className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#556EFF] text-white text-[12px] font-medium rounded-[8px] hover:bg-[#4A5FDB] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payingId === (payment._id?.$oid || payment._id?.toString()) ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <CreditCard size={12} />
                      )}
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard size={40} className="text-[#3A3A40] mb-4" />
                  <p className="text-[#A1A1AA] text-[16px] font-medium mb-1">No billing history yet</p>
                  <p className="text-[#71717A] text-[14px]">
                    Your billing transactions will appear here once you subscribe to a plan.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUPPORT CTA
   ═══════════════════════════════════════════════════ */

function SupportCTA() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h4 className="text-[15px] font-medium text-white">Need help with billing?</h4>
        <p className="text-[13px] text-[#71717A] mt-1">
          Our support team is available to assist you with any payment or subscription questions.
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
        }}
        className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] inline-flex items-center gap-2 cursor-pointer"
      >
        <Headphones size={15} /> Contact Support
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN BILLING PAGE
   ═══════════════════════════════════════════════════ */

export default function SeekerBillingPage() {
  const { data: session, isPending } = useSession();
  const [activeSub, setActiveSub] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, historyData] = await Promise.all([
          getActiveSubscription(),
          getBillingHistory(),
        ]);
        setActiveSub(subData);
        const list = Array.isArray(historyData) ? historyData : [];
        setPayments(list);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayBill = async (subId) => {
    setPayingId(subId);
    try {
      const result = await payBill(subId);
      if (result) {
        // Refresh data
        const [subData, historyData] = await Promise.all([
          getActiveSubscription(),
          getBillingHistory(),
        ]);
        setActiveSub(subData);
        setPayments(Array.isArray(historyData) ? historyData : []);
      }
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async () => {
    if (!activeSub?._id) return;
    try {
      await cancelSubscription(activeSub._id.toString());
      // Refresh
      const subData = await getActiveSubscription();
      setActiveSub(subData);
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#556EFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Subscription &amp; Billing
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Manage your subscription plan, payment methods, and view billing history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard
          activeSub={activeSub}
          onManagePlan={() => setShowManageModal(true)}
        />
        <PaymentMethodCard />
      </div>

      <section aria-label="Billing history">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-medium text-white">Billing History</h3>
          {payments.length > 0 && (
            <span className="text-[13px] text-[#71717A]">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="mt-4">
          <BillingTable
            payments={payments}
            onPayBill={handlePayBill}
            payingId={payingId}
          />
        </div>
      </section>

      <SupportCTA />

      <ManagePlanModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        activeSub={activeSub}
        onCancel={handleCancel}
      />
    </div>
  );
}