/**
 * Sentry stub for non-Electron environments
 * In the real app, this would be @sentry/electron/renderer
 */

export function captureException(
  error: Error | unknown,
  captureContext?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
  }
): void {
  console.error("[Sentry Stub] captureException:", error, captureContext)
}

export function captureMessage(message: string): void {
  console.log("[Sentry Stub] captureMessage:", message)
}

export function setUser(user: { id: string } | null): void {
  console.log("[Sentry Stub] setUser:", user)
}

export function init(options: Record<string, unknown>): void {
  console.log("[Sentry Stub] init:", options)
}
