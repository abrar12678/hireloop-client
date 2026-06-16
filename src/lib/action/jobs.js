"use server";
import { serverMutation } from "../core/server";

export const createJob = async (newJobData) => {
  return serverMutation("/api/jobs", newJobData);
};

export const updateJob = async (jobId, jobData) => {
  return serverMutation(`/api/jobs/${jobId}`, jobData, "PUT");
};

export const deleteJob = async (jobId) => {
  return serverMutation(`/api/jobs/${jobId}`, {}, "DELETE");
};