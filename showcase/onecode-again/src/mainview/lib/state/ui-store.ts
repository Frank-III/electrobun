import { createSignal, createMemo } from "solid-js"
import { ReactiveSet } from "@solid-primitives/set"
export { widgetVisibilityAtomFamily, unifiedSidebarEnabledAtom } from "../../features/details-sidebar/atoms"

// ============================================
// TEAM UI
// ============================================

export const createTeamDialogOpenAtom = createSignal<boolean>(false)

// ============================================
// MULTI-SELECT UI - Chats
// ============================================

export const selectedAgentChatIdsAtom = createSignal(new ReactiveSet<string>())

export const isAgentMultiSelectModeAtom = createMemo(() => {
  return selectedAgentChatIdsAtom[0]().size > 0
})

export const selectedAgentChatsCountAtom = createMemo(() => {
  return selectedAgentChatIdsAtom[0]().size
})

export const toggleAgentChatSelectionAtom = (chatId: string) => {
  const currentSet = selectedAgentChatIdsAtom[0]()
  if (currentSet.has(chatId)) {
    currentSet.delete(chatId)
  } else {
    currentSet.add(chatId)
  }
}

export const selectAllAgentChatsAtom = (chatIds: string[]) => {
  selectedAgentChatIdsAtom[1](new ReactiveSet(chatIds))
}

export const clearAgentChatSelectionAtom = () => {
  selectedAgentChatIdsAtom[1](new ReactiveSet<string>())
}

// ============================================
// MULTI-SELECT UI - Sub-Chats
// ============================================

export const selectedSubChatIdsAtom = createSignal(new ReactiveSet<string>())

export const isSubChatMultiSelectModeAtom = createMemo(() => {
  return selectedSubChatIdsAtom[0]().size > 0
})

export const selectedSubChatsCountAtom = createMemo(() => {
  return selectedSubChatIdsAtom[0]().size
})

export const toggleSubChatSelectionAtom = (subChatId: string) => {
  const currentSet = selectedSubChatIdsAtom[0]()
  if (currentSet.has(subChatId)) {
    currentSet.delete(subChatId)
  } else {
    currentSet.add(subChatId)
  }
}

export const selectAllSubChatsAtom = (subChatIds: string[]) => {
  selectedSubChatIdsAtom[1](new ReactiveSet(subChatIds))
}

export const clearSubChatSelectionAtom = () => {
  selectedSubChatIdsAtom[1](new ReactiveSet<string>())
}

// ============================================
// DIALOG UI
// ============================================

// Settings dialog
export type SettingsTab =
  | "profile"
  | "account"
  | "appearance"
  | "preferences"
  | "models"
  | "skills"
  | "agents"
  | "mcp"
  | "worktrees"
  | "debug"
  | "beta"
  | "keyboard"
  | `project-${string}` // Dynamic project tabs
export const agentsSettingsDialogActiveTabAtom = createSignal<SettingsTab>("profile")
export const agentsSettingsDialogOpenAtom = createSignal<boolean>(false)

// Currently recording hotkey for action (UI state)
// null when not recording
export const recordingHotkeyForActionAtom = createSignal<string | null>(null)

// Login modal (shown when Claude Code auth fails)
export const agentsLoginModalOpenAtom = createSignal<boolean>(false)

// Help popover
export const agentsHelpPopoverOpenAtom = createSignal<boolean>(false)

// Quick switch dialog - Agents
export const agentsQuickSwitchOpenAtom = createSignal<boolean>(false)
export const agentsQuickSwitchSelectedIndexAtom = createSignal<number>(0)

// Quick switch dialog - Sub-chats
export const subChatsQuickSwitchOpenAtom = createSignal<boolean>(false)
export const subChatsQuickSwitchSelectedIndexAtom = createSignal<number>(0)

// ============================================
// UPDATE UI
// ============================================

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "error"

export type UpdateState = {
  status: UpdateStatus
  version?: string
  progress?: number // 0-100
  bytesPerSecond?: number
  transferred?: number
  total?: number
  error?: string
}

export const updateStateAtom = createSignal<UpdateState>({ status: "idle" })

// Track if app was just updated (to show "What's New" banner)
// This is set to true when app launches with a new version, reset when user dismisses
export const justUpdatedAtom = createSignal<boolean>(false)

// Store the version that triggered the "just updated" state
export const justUpdatedVersionAtom = createSignal<string | null>(null)

// Legacy atom for backwards compatibility (deprecated)
export type UpdateInfo = {
  version: string
  downloadUrl: string
  releaseNotes?: string
}

export const updateInfoAtom = createSignal<UpdateInfo | null>(null)

// ============================================
// DESKTOP/FULLSCREEN UI STATE
// ============================================

// Whether app is running in Electron desktop environment
export const isDesktopAtom = createSignal<boolean>(false)

// Fullscreen state - null means not initialized yet
// null = not yet loaded, false = not fullscreen, true = fullscreen
export const isFullscreenAtom = createSignal<boolean | null>(null)

// ============================================
// DEV TOOLS UNLOCK (Hidden feature)
// ============================================

// DevTools unlock state (hidden feature - click Beta tab 5 times to enable)
// Persisted per-session only (not in localStorage for security)
export const devToolsUnlockedAtom = createSignal<boolean>(false)
