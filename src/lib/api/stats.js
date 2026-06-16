import { protectedFetch } from "../core/server";

export const getAdminStats = async () => {
  return protectedFetch("/api/admin/stats");
};

export const getSeekerStats = async () => {
  return protectedFetch("/api/seeker/stats");
};

export const getRecruiterStats = async () => {
  return protectedFetch("/api/recruiter/stats");
};