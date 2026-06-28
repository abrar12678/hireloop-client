/**
 * Client-safe reports API wrappers.
 * For use in "use client" components only.
 */
import { protectedClientFetch, clientMutation } from "../core/client";

export const createReport = async (data) => clientMutation("/api/reports", data, "POST");

export const getReports = async (params = "") => {
  const qs = params ? `?${params}` : "";
  return protectedClientFetch(`/api/reports${qs}`);
};

export const updateReport = async (id, data) => clientMutation(`/api/reports/${id}`, data, "PATCH");