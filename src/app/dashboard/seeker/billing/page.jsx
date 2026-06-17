"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { getPaymentHistory } from "@/lib/api-client/subscriptions";
import {
  Check,
  FileDown,
  Plus,
  CreditCard,
  Shield,
  Headphones,
  Search,
  Mail,
  Bell,
  ChevronUp,
  ChevronDown,
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
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ─── Plan Features Config ─── */
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

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Current Plan Card ─── */
function CurrentPlanCard({ subscription, onUpgrade }) {
  const planName = subscription?.planName || subscription?.plan || "Free";
  const planTier = planName.charAt(0).toUpperCase() + planName.slice(1);

  const priceMap = { Free: "$0", Pro: "$19.99", Premium: "$39.99", Professional: "$29" };
  const price = subscription?.amount ? `$${subscription.amount}` : priceMap[planTier] || "$0";

  const features = PLAN_FEATURES[planTier] || PLAN_FEATURES.Pro;

  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:border-white/[0.08] transition-all duration-200">
      {/* Label Pill */}
      <div className="mb-4">
        <span className="inline-flex items-center text-[11px] uppercase tracking-wide font-medium px-2.5 py-1 bg-[#3A3A40] rounded-md text-[#A1A1AA]">
          Current Plan
        </span>
      </div>

      {/* Plan Info + Price */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[20px] font-semibold text-white leading-tight">
            {planTier === "Professional" ? "Professional Tier" : `${planTier} Plan`}
          </h3>
          <p className="text-[14px] text-[#71717A] mt-1">
            {planTier === "Free"
              ? "Essential features for getting started"
              : `Your ${planTier} subscription is active`}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-white leading-none">{price}</span>
            {planTier !== "Free" && <span className="text-[14px] text-[#71717A]">/mo</span>}
          </div>
          <p className="text-[12px] text-[#71717A] mt-1">
            {planTier === "Free" ? "Free forever" : "Renews monthly"}
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-6">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <Check size={16} aria-hidden="true" className="text-[#22C55E] shrink-0" />
            <span className="text-[13px] text-[#A1A1AA]">{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        {planTier !== "Premium" && (
          <form action="/api/checkout_sessions" method="POST">
            <input type="hidden" name="plan_id" value={planTier === "Free" ? "seeker_pro" : "seeker_premium"} />
            <button
              type="submit"
              aria-label="Upgrade Plan via Stripe Checkout"
              className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            >
              Upgrade Plan
            </button>
          </form>
        )}
        <button
          aria-label="Manage subscription settings"
          className="h-10 px-4 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          Manage Plan
        </button>
      </div>
    </div>
  );
}

/* ─── Payment Method Card ─── */
function PaymentMethodCard() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:border-white/[0.08] transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-[18px] font-medium text-white">Payment Method</h3>
        <span className="inline-flex items-center text-[10px] uppercase tracking-wide font-medium px-2 py-1 bg-[#3A3A40] rounded-md text-[#71717A]">
          Secure by Stripe
        </span>
      </div>

      {/* Credit Card Mock */}
      <div className="mt-4 bg-gradient-to-br from-[#3A3A40] to-[#1B1B1F] rounded-[12px] p-4 border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
        {/* Brand */}
        <div className="flex justify-end mb-8">
          <CreditCard size={28} aria-hidden="true" className="text-[#71717A]" />
        </div>

        {/* Masked Number */}
        <p className="text-[18px] text-white font-medium tracking-[0.2em] text-center mb-8">
          &bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; &bull;&bull;&bull;&bull; &nbsp; 4242
        </p>

        {/* Bottom Row */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] text-[#71717A] uppercase tracking-wide">Card Holder</p>
            <p className="text-[14px] text-[#A1A1AA] mt-0.5">Alex Rivera</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#71717A] uppercase tracking-wide">Expires</p>
            <p className="text-[14px] text-[#A1A1AA] mt-0.5">12/28</p>
          </div>
        </div>
      </div>

      {/* Add New */}
      <button
        aria-label="Add a new payment method"
        className="flex items-center justify-center gap-2 w-full text-[14px] text-[#71717A] mt-4 hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-lg"
      >
        <Plus size={15} aria-hidden="true" />
        Add New Payment Method
      </button>
    </div>
  );
}

/* ─── Status Badge (for table) ─── */
function PaidBadge() {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 text-[12px] font-medium rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
      Paid
    </span>
  );
}

/* ─── Billing Table ─── */
function BillingTable({ payments }) {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <table className="w-full" role="table" aria-label="Billing history">
        {/* Header */}
        <thead>
          <tr className="h-12 border-b border-white/[0.05]">
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6">Date</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden sm:table-cell">Plan</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden md:table-cell">Amount</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-left px-6 hidden lg:table-cell">Transaction ID</th>
            <th scope="col" className="text-[12px] font-medium text-[#71717A] tracking-wide text-right px-6">Status</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment, idx) => (
              <tr
                key={payment._id?.$oid || payment._id || idx}
                className="h-14 border-t border-white/[0.05] hover:bg-[#222228] transition-colors duration-150"
              >
                <td className="px-6 text-[14px] text-[#A1A1AA]">
                  {formatDate(payment.createdAt?.$date || payment.createdAt || payment.date)}
                </td>
                <td className="px-6 text-[14px] text-[#A1A1AA] capitalize hidden sm:table-cell">
                  {payment.planName || payment.plan || "N/A"}
                </td>
                <td className="px-6 text-[14px] text-[#A1A1AA] hidden md:table-cell">
                  ${payment.amount ?? "0.00"}
                </td>
                <td className="px-6 text-[12px] text-[#71717A] font-mono hidden lg:table-cell">
                  {payment.transactionId || payment.stripeSubscriptionId || "N/A"}
                </td>
                <td className="px-6 text-right">
                  <PaidBadge />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard size={40} aria-hidden="true" className="text-[#3A3A40] mb-4" />
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

/* ─── Support CTA ─── */
function SupportCTA() {
  return (
    <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h4 className="text-[15px] font-medium text-white">Need help with billing?</h4>
        <p className="text-[13px] text-[#71717A] mt-1">
          Our support team is available to assist you with any payment or subscription questions.
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          aria-label="Contact Support"
          className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 transition-all duration-150 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          Contact Support
        </button>
        <button
          aria-label="Read Refund Policy"
          className="text-[13px] text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-lg"
        >
          Read Refund Policy
        </button>
      </div>
    </div>
  );
}

/* ─── Billing Footer ─── */
function BillingFooter() {
  return (
    <footer className="mt-10 px-0 pb-6 flex flex-col sm:flex-row justify-between gap-2">
      <span className="text-[12px] text-[#71717A]">
        &copy; 2025 HireLoop. All rights reserved.
      </span>
      <div className="flex items-center gap-4">
        <button aria-label="Terms of Service" className="text-[12px] text-[#71717A] hover:text-[#A1A1AA] transition-colors duration-150 cursor-pointer">
          Terms of Service
        </button>
        <button aria-label="Privacy Policy" className="text-[12px] text-[#71717A] hover:text-[#A1A1AA] transition-colors duration-150 cursor-pointer">
          Privacy Policy
        </button>
      </div>
    </footer>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPaymentHistory();
        const list = Array.isArray(data) ? data : data?.subscriptions || data?.payments || [];
        setPayments(list);
        if (list.length > 0) {
          setSubscription(list[0]);
        }
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
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading billing data">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Subscription &amp; Billing
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Manage your subscription plan, payment methods, and view billing history.
        </p>
      </div>

      {/* ── Top Cards: Plan + Payment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard subscription={subscription} />
        <PaymentMethodCard />
      </div>

      {/* ── Billing History Section ── */}
      <section aria-label="Billing history">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-medium text-white">Billing History</h3>
          <button
            aria-label="Export billing history as PDF"
            className="flex items-center gap-2 text-[14px] text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] rounded-lg"
          >
            <FileDown size={15} aria-hidden="true" />
            Export PDF
          </button>
        </div>

        <div className="mt-4">
          <BillingTable payments={payments} />
        </div>
      </section>

      {/* ── Support CTA ── */}
      <SupportCTA />

      {/* ── Footer ── */}
      <BillingFooter />
    </div>
  );
}