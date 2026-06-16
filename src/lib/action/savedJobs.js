"use server";

import { protectedFetch, serverMutation } from "../core/server";

export const saveJob = async (jobData) => {
  return serverMutation("/api/saved-jobs", jobData);
};

export const getSavedJobs = async () => {
  return protectedFetch("/api/saved-jobs");
};

export const removeSavedJob = async (id) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const { authHeader } = await import("../core/server");
  const headers = await authHeader();
  const res = await fetch(`${baseUrl}/api/saved-jobs/${id}`, {
    method: "DELETE",
    headers,
  });
  return res.json();
};