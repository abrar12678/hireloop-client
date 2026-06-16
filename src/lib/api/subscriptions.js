import { protectedFetch } from "../core/server";

export const getPaymentHistory = async () => {
  return protectedFetch("/api/subscriptions");
};

export const getAllPayments = async () => {
  return protectedFetch("/api/subscriptions");
};