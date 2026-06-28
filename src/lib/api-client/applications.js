/**
 * Client-safe application API wrappers.
 * For use in "use client" components only.
 */
import {
  protectedClientFetch,
  clientMutation,
} from "../core/client";

export const getRecruiterApplications = async () => {
  return protectedClientFetch("/api/applications");
};

export const updateApplicationStatus = async (applicationId, status) => {
  return clientMutation(`/api/applications/${applicationId}/status`, { status }, "PATCH");
};
