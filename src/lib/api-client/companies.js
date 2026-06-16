/**
 * Client-safe company API wrappers.
 * For use in "use client" components only.
 * Import this instead of @/lib/api/companies in client components.
 */
import { protectedClientFetch } from "../core/client";

export const getLoggedInRecruiterCompany = async () => {
  return protectedClientFetch("/api/my/companies");
};
