/**
 * Client-safe stats API wrappers.
 * For use in "use client" components only.
 */
import { protectedClientFetch } from "../core/client";

export const getRecruiterStats = async () => {
  return protectedClientFetch("/api/recruiter/stats");
};
