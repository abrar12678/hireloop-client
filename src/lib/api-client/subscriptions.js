/**
 * Client-safe subscription API wrappers.
 * For use in "use client" components only.
 * Import this instead of @/lib/api/subscriptions in client components.
 */
import { protectedClientFetch } from "../core/client";

export const getPaymentHistory = async () => {
  return protectedClientFetch("/api/subscriptions");
};

export const getAllPayments = async () => {
  return protectedClientFetch("/api/subscriptions");
};
