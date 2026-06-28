/**
 * Client-safe subscription & billing API wrappers.
 * For use in "use client" components only.
 */
import { protectedClientFetch, clientMutation } from "../core/client";

export const getPaymentHistory = async () => {
  return protectedClientFetch("/api/subscriptions");
};

export const getAllPayments = async () => {
  return protectedClientFetch("/api/subscriptions");
};

export const getActiveSubscription = async () => {
  return protectedClientFetch("/api/seeker/active-subscription");
};

export const getBillingHistory = async () => {
  return protectedClientFetch("/api/seeker/billing-history");
};

export const getBillingStatus = async () => {
  return protectedClientFetch("/api/seeker/billing-status");
};

export const payBill = async (subscriptionId) => {
  return clientMutation("/api/seeker/subscription/pay-bill", { subscriptionId });
};

export const cancelSubscription = async (subscriptionId) => {
  return clientMutation("/api/seeker/subscription/cancel", { subscriptionId });
};