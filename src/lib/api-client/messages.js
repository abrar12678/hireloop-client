/**
 * Client-safe messaging API wrappers.
 * For use in "use client" components only.
 */
import {
  protectedClientFetch,
  clientMutation,
} from "../core/client";

export const getConversations = async () => {
  return protectedClientFetch("/api/messages/conversations");
};

export const getMessages = async (partnerId) => {
  return protectedClientFetch(`/api/messages/${partnerId}`);
};

export const sendMessage = async (receiverId, message, jobId) => {
  const payload = { receiverId, message };
  if (jobId) payload.jobId = jobId;
  return clientMutation("/api/messages", payload, "POST");
};