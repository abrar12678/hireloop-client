/**
 * Client-safe notification API wrappers.
 * For use in "use client" components only.
 */
import {
  protectedClientFetch,
  clientMutation,
  clientDelete,
} from "../core/client";

export const getNotifications = async () => {
  return protectedClientFetch("/api/notifications");
};

export const getNotificationCount = async () => {
  return protectedClientFetch("/api/notifications/count");
};

export const markAllNotificationsRead = async () => {
  return clientMutation("/api/notifications/read-all", {}, "PATCH");
};

export const clearAllNotifications = async () => {
  return clientDelete("/api/notifications");
};