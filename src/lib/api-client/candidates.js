/**
 * Client-safe candidate search API wrappers.
 */
import { protectedClientFetch } from "../core/client";

export const searchCandidates = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return protectedClientFetch(`/api/recruiter/candidates/search?${qs}`);
};