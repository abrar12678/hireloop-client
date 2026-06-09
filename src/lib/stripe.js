import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PLAN_PRICE_ID = {
  seeker_pro: "price_1Tg80J2SegJGxKgGE1UJdPuB",
  seeker_premium: "price_1Tg8382SegJGxKgGIs6u00tl",
  recruiter_growth: "price_1Tg85w2SegJGxKgGl49tj0pS",
  recruiter_enterprise: "price_1Tg88Y2SegJGxKgGJ718QMxf",
};
