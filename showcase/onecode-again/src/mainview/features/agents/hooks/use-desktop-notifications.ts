/**
 * Desktop notifications hook - provides native OS notifications for agent events.
 * Uses Electron's Notification API via the IPC bridge in desktopApi.
 */

import { createEffect, onCleanup } from "solid-js"
import { isDesktopApp } from "../../../lib/utils/platform"
import { desktopNotificationsEnabledAtom } from "../../../lib/atoms"

// throttle interval to prevent notification spam (ms)
const NOTIFICATION_THROTTLE_MS = 3000

// priority levels for notifications (higher = more important)
const NOTIFICATION_PRIORITY = {
  error: 3,
  input: 2,
  plan: 1,
  complete: 0,
} as const

type NotificationPriority = keyof typeof NOTIFICATION_PRIORITY

export interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
  priority?: NotificationPriority
}

export function useDesktopNotifications() {
  const notificationsEnabled = desktopNotificationsEnabledAtom[0]

  // track last notification time to throttle rapid-fire notifications
  let lastNotificationTime = 0
  let pendingNotification: NotificationOptions | null = null
  let throttleTimer: ReturnType<typeof setTimeout> | null = null

  // Cleanup timer on unmount to prevent memory leak
  createEffect(() => {
    onCleanup(() => {
      if (throttleTimer) {
        clearTimeout(throttleTimer)
        throttleTimer = null
      }
    })
  })

  const showNotification = (title: string, body: string, options?: { silent?: boolean; priority?: NotificationPriority }) => {
    // Check if notifications are enabled
    if (!notificationsEnabled()) {
      return
    }

    if (!isDesktopApp()) {
      // fallback for web - use browser Notification API if available
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, silent: options?.silent })
      }
      return
    }

    const now = Date.now()
    const timeSinceLastNotification = now - lastNotificationTime
    const currentPriority = options?.priority ? NOTIFICATION_PRIORITY[options.priority] : 0

    // if we're within throttle window, check priority
    if (timeSinceLastNotification < NOTIFICATION_THROTTLE_MS) {
      const pendingPriority = pendingNotification?.priority
        ? NOTIFICATION_PRIORITY[pendingNotification.priority]
        : 0

      // Only queue if higher or equal priority than pending
      if (currentPriority >= pendingPriority) {
        pendingNotification = { title, body, silent: options?.silent, priority: options?.priority }
      }

      // set up a timer to show the pending notification after throttle period
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null
          if (pendingNotification) {
            const pending = pendingNotification
            pendingNotification = null
            // Directly send notification without recursive call to avoid re-throttling
            lastNotificationTime = Date.now()
            window.desktopApi?.showNotification({ title: pending.title, body: pending.body })
          }
        }, NOTIFICATION_THROTTLE_MS - timeSinceLastNotification)
      }
      return
    }

    lastNotificationTime = now

    // use the IPC bridge to show native notification
    window.desktopApi?.showNotification({ title, body })
  }

  const notifyAgentComplete = (chatName: string) => {
    // don't notify if window is focused - user is already watching
    if (document.hasFocus()) {
      return
    }

    const title = "Agent Complete"
    const body = chatName ? `Finished working on "${chatName}"` : "Agent has completed its task"
    showNotification(title, body, { priority: "complete" })
  }

  const notifyAgentError = (errorMessage: string) => {
    // always notify on errors, even if window is focused
    const title = "Agent Error"
    const body = errorMessage.length > 100 ? errorMessage.slice(0, 100) + "..." : errorMessage
    showNotification(title, body, { priority: "error" })
  }

  const notifyAgentNeedsInput = (chatName: string) => {
    // don't notify if window is focused
    if (document.hasFocus()) {
      return
    }

    const title = "Input Required"
    const body = chatName ? `"${chatName}" is waiting for your input` : "Agent is waiting for your input"
    showNotification(title, body, { priority: "input" })
  }

  const notifyPlanReady = (chatName: string) => {
    // don't notify if window is focused
    if (document.hasFocus()) {
      return
    }

    const title = "Plan Ready"
    const body = chatName ? `"${chatName}" has a plan ready for approval` : "A plan is ready for your approval"
    showNotification(title, body, { priority: "plan" })
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (isDesktopApp()) {
      // desktop apps don't need explicit permission for notifications
      return "granted"
    }

    // for web, request browser permission
    if ("Notification" in window) {
      return await Notification.requestPermission()
    }

    return "denied"
  }

  return {
    showNotification,
    notifyAgentComplete,
    notifyAgentError,
    notifyAgentNeedsInput,
    notifyPlanReady,
    requestPermission,
  }
}
