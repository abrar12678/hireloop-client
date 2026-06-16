"use server";
import { serverMutation } from "../core/server";

export const submitApplication = async (applicationData) => {
  return serverMutation("/api/applications", applicationData);
};

export const updateApplicationStatus = async (applicationId, status) => {
  return serverMutation(`/api/applications/${applicationId}/status`, { status }, "PATCH");
};