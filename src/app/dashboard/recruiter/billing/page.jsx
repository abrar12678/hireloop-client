"use client";

import React, { useEffect, useState } from "react";
import { Card, Button } from "@heroui/react";
import { CreditCard, ArrowUpRight, Briefcase } from "@gravity-ui/icons";
import { getPaymentHistory } from "@/lib/api-client/subscriptions";
import { getLoggedInRecruiterCompany } from "@/lib/api-client/companies";

const formatRelativeTime = (dateString) => {
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

const RecruiterBillingPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsData, companyData] = await Promise.all([
          getPaymentHistory(),
          getLoggedInRecruiterCompany(),
        ]);

        const list = Array.isArray(paymentsData) ? paymentsData : paymentsData?.subscriptions || paymentsData?.payments || [];
        setPayments(list);
        if (list.length > 0) setSubscription(list[0]);
        setCompany(companyData);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = subscription?.planName || subscription?.plan || "Free";
  const activeJobsUsed = company?.activeJobsCount ?? 0;
  const maxActiveJobs = subscription?.maxActiveJobs ?? 3;
  const usagePercent = maxActiveJobs > 0 ? Math.min((activeJobsUsed / maxActiveJobs) * 100, 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Billing & Subscription
        </h2>
        <p className="text-sm text-zinc-500">
          Manage your company subscription and view usage.
        </p>
      </div>

      {/* Current Plan & Usage */}
      <Card className="bg-[#18181b] border border-neutral-800 rounded-2xl p-0">
        <Card.Content className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
                <CreditCard width={20} height={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                <p className="text-sm text-zinc-500 capitalize">
                  {currentPlan} — {subscription?.status === "active" ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentPlan === "Free" ? (
                <form action="/api/checkout_sessions" method="POST">
                  <input type="hidden" name="plan_id" value="recruiter_growth" />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Upgrade to Growth
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              ) : currentPlan === "recruiter_growth" ? (
                <form action="/api/checkout_sessions" method="POST">
                  <input type="hidden" name="plan_id" value="recruiter_enterprise" />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Upgrade to Enterprise
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              ) : null}
            </div>
          </div>

          {/* Active Jobs Usage Indicator */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-purple-400 w-4 h-4" />
                <span className="text-sm text-zinc-400">Active Jobs Used</span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {activeJobsUsed} / {maxActiveJobs}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90
                    ? "bg-rose-500"
                    : usagePercent >= 70
                    ? "bg-amber-500"
                    : "bg-purple-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              {maxActiveJobs - activeJobsUsed > 0
                ? `${maxActiveJobs - activeJobsUsed} job${maxActiveJobs - activeJobsUsed !== 1 ? "s" : ""} remaining. Upgrade for more.`
                : "You have reached your active job limit. Upgrade your plan to post more."}
            </p>
          </div>
        </Card.Content>
      </Card>

      {/* Payment History */}
      <Card className="bg-[#18181b] border border-neutral-800 rounded-2xl p-0">
        <Card.Content className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Payment History</h3>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left text-zinc-400 font-medium py-3 pr-4">Date</th>
                    <th className="text-left text-zinc-400 font-medium py-3 pr-4">Plan</th>
                    <th className="text-left text-zinc-400 font-medium py-3 pr-4">Amount</th>
                    <th className="text-left text-zinc-400 font-medium py-3">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, idx) => (
                    <tr
                      key={payment._id?.$oid || payment._id || idx}
                      className="border-b border-zinc-800/40 last:border-none"
                    >
                      <td className="py-3 pr-4 text-zinc-300">
                        {formatRelativeTime(payment.createdAt?.$date || payment.createdAt || payment.date)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300 capitalize">
                        {payment.planName || payment.plan || "N/A"}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        ${payment.amount ?? "0.00"}
                      </td>
                      <td className="py-3 text-zinc-500 font-mono text-xs">
                        {payment.transactionId || payment.stripeSubscriptionId || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <CreditCard className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No payment history yet.</p>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default RecruiterBillingPage;