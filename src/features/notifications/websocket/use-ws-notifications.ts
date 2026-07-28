"use client";

/**
 * useWsNotifications — consume the NotificationsContext.
 */

import { useNotificationsContext } from "./NotificationsProvider";

export function useWsNotifications() {
  return useNotificationsContext();
}
