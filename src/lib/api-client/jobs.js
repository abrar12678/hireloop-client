/**
 * Client-safe job API wrappers.
 * For use in "use client" components only.
 */
import {
  protectedClientFetch,
  clientMutation,
  clientDelete,
} from "../core/client";

export const getRecruiterJobs = async () => {
  return protectedClientFetch("/api/jobs?recruiter=true");
};

export const getRecommendedJobs = async () => {
  return protectedClientFetch("/api/jobs/recommended");
};

export const getJobById = async (jobId) => {
  return protectedClientFetch(`/api/jobs/${jobId}`);
};

export const createJob = async (jobData) => {
  return clientMutation("/api/jobs", jobData, "POST");
};

export const updateJob = async (jobId, jobData) => {
  return clientMutation(`/api/jobs/${jobId}`, jobData, "PUT");
};

export const deleteJob = async (jobId) => {
  return clientDelete(`/api/jobs/${jobId}`);
};

export const toggleJobStatus = async (jobId, status) => {
  return clientMutation(`/api/jobs/${jobId}/status`, { status }, "PATCH");
};
