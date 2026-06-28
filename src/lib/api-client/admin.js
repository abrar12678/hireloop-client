import { protectedClientFetch } from "../core/client";

export const getAdminStats = async () => {
  return protectedClientFetch("/admin/stats");
};