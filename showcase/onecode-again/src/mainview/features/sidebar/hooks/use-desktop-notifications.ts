import { createEffect, onCleanup } from "solid-js"
import { createPersistedSignal } from "../../../lib/state/signal-storage"
import { isDesktopApp } from "../../../lib/utils/platform"
import { desktopRpc } from "../../../lib/desktop-rpc"

// Track pending notifications count for badge
const pendingNotificationsAtom = createPersistedSignal<number>(
  "desktop-pending-notifications",
  0,
)

// Track window focus state
let isWindowFocused = true

/**
 * Generate a badge icon image for Windows taskbar overlay
 * Creates a 32x32 canvas with a red circle and white number
 */
function generateBadgeIcon(count: number): string {
  const size = 32
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  if (!ctx) return ""

  // Draw red circle background
  ctx.fillStyle = "#FF4444"
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw white border
  ctx.strokeStyle = "#FFFFFF"
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw white number text
  ctx.fillStyle = "#FFFFFF"
  ctx.font = "bold 18px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // Format count (show "9+" if > 9)
  const displayText = count > 9 ? "9+" : String(count)
  ctx.fillText(displayText, size / 2, size / 2)

  return canvas.toDataURL("image/png")
}

/**
 * Hook to manage desktop notifications and badge count
 * - Shows native notifications when window is not focused
 * - Updates dock badge with pending notification count
 * - Clears badge when window regains focus
 */
export function useDesktopNotifications() {
  const [pendingCount, setPendingCount] = pendingNotificationsAtom
  let isInitialized = false

  // Subscribe to window focus changes
  createEffect(() => {
    if (!isDesktopApp() || typeof window === "undefined") return

    // Initialize focus state
    isWindowFocused = document.hasFocus()

    const handleFocus = () => {
      isWindowFocused = true
      // Clear badge when window gains focus
      setPendingCount(0)
      desktopRpc.notifications.setBadge.mutate({ count: null })
    }

    const handleBlur = () => {
      isWindowFocused = false
    }

    // Use window focus events (Electrobun doesn't have onFocusChange API)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    isInitialized = true

    onCleanup(() => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    })
  })

  // Update badge when pending count changes
  createEffect(() => {
    if (!isDesktopApp() || typeof window === "undefined") return

    const count = pendingCount()
    desktopRpc.notifications.setBadge.mutate({ count: count > 0 ? count : null })
    // Note: Windows overlay icon not supported in Electrobun yet
  })

  /**
   * Show a notification for agent completion
   * Only shows if window is not focused (in desktop app)
   */
  const notifyAgentComplete = (agentName: string) => {
    if (!isDesktopApp() || typeof window === "undefined") return

    // Only notify if window is not focused
    if (!isWindowFocused) {
      // Increment badge count
      setPendingCount((prev) => prev + 1)

      // Show native notification via Electrobun
      desktopRpc.notifications.show.mutate({
        title: "Agent finished",
        body: `${agentName} completed the task`,
      })
    }
  }

  /**
   * Check if window is currently focused
   */
  const isAppFocused = () => {
    return isWindowFocused
  }

  return {
    notifyAgentComplete,
    isAppFocused,
    pendingCount,
    clearBadge: () => {
      setPendingCount(0)
      desktopRpc.notifications.setBadge.mutate({ count: null })
    },
  }
}

/**
 * Standalone function to show notification (for use outside React components)
 */
export function showAgentNotification(agentName: string) {
  if (!isDesktopApp() || typeof window === "undefined") return

  // Only notify if window is not focused
  if (!document.hasFocus()) {
    desktopRpc.notifications.show.mutate({
      title: "Agent finished",
      body: `${agentName} completed the task`,
    })
  }
}
