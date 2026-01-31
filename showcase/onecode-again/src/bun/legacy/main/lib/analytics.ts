/**
 * Analytics module - DISABLED
 * All functions are no-ops (PostHog has been removed)
 */

/** Set opt-out status (no-op) */
export function setOptOut(_optedOut: boolean): void {}

/** Set subscription plan (no-op) */
export function setSubscriptionPlan(_plan: string): void {}

/** Set connection method (no-op) */
export function setConnectionMethod(_method: string): void {}

/** Initialize analytics (no-op) */
export function initAnalytics(): void {}

/** Capture an analytics event (no-op) */
export function capture(
  _eventName: string,
  _properties?: Record<string, any>,
): void {}

/** Identify a user (no-op) */
export function identify(
  _userId: string,
  _traits?: Record<string, any>,
): void {}

/** Get current user ID (always null) */
export function getCurrentUserId(): string | null {
  return null
}

/** Reset user identification (no-op) */
export function reset(): void {}

/** Shutdown analytics (no-op) */
export async function shutdown(): Promise<void> {}

// Event helpers (all no-ops)
export function trackAppOpened(): void {}
export function trackAuthCompleted(_userId: string, _email?: string): void {}
export function trackProjectOpened(_project: { id: string; hasGitRemote: boolean }): void {}
export function trackWorkspaceCreated(_workspace: {
  id: string
  projectId: string
  useWorktree: boolean
  repository?: string
}): void {}
export function trackWorkspaceArchived(_workspaceId: string): void {}
export function trackWorkspaceDeleted(_workspaceId: string): void {}
export function trackMessageSent(_data: {
  workspaceId: string
  subChatId?: string
  mode: "plan" | "agent"
}): void {}
export function trackPRCreated(_data: {
  workspaceId: string
  prNumber: number
  repository?: string
  mode?: "worktree" | "local"
}): void {}
export function trackCommitCreated(_data: {
  workspaceId: string
  filesChanged: number
  mode: "worktree" | "local"
}): void {}
export function trackSubChatCreated(_data: {
  workspaceId: string
  subChatId: string
}): void {}
