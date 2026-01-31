/**
 * Pure SolidJS state for agents feature
 * 
 * This module exports signals directly (not wrapped in atoms).
 * Use: import { selectedAgentChatId, setSelectedAgentChatId } from "./state"
 *      In JSX: {selectedAgentChatId()}
 *      To update: setSelectedAgentChatId("new-id")
 */

import { createSignal, batch } from "solid-js"
import { ReactiveSet } from "@solid-primitives/set"
import { 
  createStoredState, 
  createWindowState,
  createKeyedStateFamily,
  createStoredKeyedStateFamily,
} from "../../lib/state/signals"

// ============================================
// Types
// ============================================

export type AgentMode = "agent" | "plan"
export type AgentsMobileViewMode = "chats" | "chat" | "preview" | "diff" | "terminal"
export type DiffViewDisplayMode = "side-peek" | "center-peek" | "full-page"

export interface SavedRepo {
  id: string
  name: string
  full_name: string
  sandbox_status?: "not_setup" | "in_progress" | "ready" | "error"
  installation_id?: string
  isPublicImport?: boolean
}

export interface SelectedProject {
  id: string
  name: string
  path: string
  gitRemoteUrl?: string | null
  gitProvider?: "github" | "gitlab" | "bitbucket" | null
  gitOwner?: string | null
  gitRepo?: string | null
}

export interface SubChatFileChange {
  filePath: string
  displayPath: string
  additions: number
  deletions: number
}

export interface AgentsDebugMode {
  enabled: boolean
  simulateNoTeams: boolean
  simulateNoRepos: boolean
  simulateNoReadyRepos: boolean
  resetOnboarding: boolean
  bypassConnections: boolean
  forceStep: "workspace" | "profile" | "claude-code" | "github" | "discord" | null
  simulateCompleted: boolean
}

export interface TodoItem {
  content: string
  status: "pending" | "in_progress" | "completed"
  activeForm?: string
}

export interface TodoState {
  todos: TodoItem[]
  creationToolCallId: string | null
}

export type SelectedCommit = {
  hash: string
  shortHash: string
  message: string
  description?: string
  author?: string
  date?: Date
} | null

// ============================================
// Constants
// ============================================

export const AGENT_MODES: AgentMode[] = ["agent", "plan"]

export function getNextMode(current: AgentMode): AgentMode {
  const idx = AGENT_MODES.indexOf(current)
  return AGENT_MODES[(idx + 1) % AGENT_MODES.length]
}

export const MODEL_ID_MAP: Record<string, string> = {
  opus: "opus",
  sonnet: "sonnet",
  haiku: "haiku",
}

// ============================================
// Chat State
// ============================================

/** Selected agent chat ID - null means "new chat" view */
export const [selectedAgentChatId, setSelectedAgentChatId] = createWindowState<string | null>(
  "agents:selectedChatId",
  null,
)

/** Whether the selected chat is a remote (sandbox) chat */
export const [selectedChatIsRemote, setSelectedChatIsRemote] = createWindowState<boolean>(
  "agents:selectedChatIsRemote",
  false,
)

/** Previous agent chat ID - used to navigate back after archiving */
export const [previousAgentChatId, setPreviousAgentChatId] = createSignal<string | null>(null)

/** Selected draft ID - for restoring draft text in NewChatForm */
export const [selectedDraftId, setSelectedDraftId] = createSignal<string | null>(null)

/** Show new chat form explicitly */
export const [showNewChatForm, setShowNewChatForm] = createSignal<boolean>(true)

// ============================================
// Loading State
// ============================================

/** Loading sub-chats: Map<subChatId, parentChatId> */
export const [loadingSubChats, setLoadingSubChats] = createSignal<Map<string, string>>(new Map())

/** Helper to set loading state */
export function setLoadingSubChat(subChatId: string, parentChatId: string) {
  setLoadingSubChats(prev => {
    if (prev.get(subChatId) === parentChatId) return prev
    const next = new Map(prev)
    next.set(subChatId, parentChatId)
    return next
  })
}

/** Helper to clear loading state */
export function clearLoadingSubChat(subChatId: string) {
  setLoadingSubChats(prev => {
    if (!prev.has(subChatId)) return prev
    const next = new Map(prev)
    next.delete(subChatId)
    return next
  })
}

// ============================================
// Preferences (Persisted)
// ============================================

export const [lastSelectedRepo, setLastSelectedRepo] = createStoredState<SavedRepo | null>(
  "agents:lastSelectedRepo",
  null,
)

export const [selectedProject, setSelectedProject] = createWindowState<SelectedProject | null>(
  "agents:selectedProject",
  null,
)

export const [lastSelectedAgentId, setLastSelectedAgentId] = createStoredState<string>(
  "agents:lastSelectedAgentId",
  "claude-code",
)

export const [lastSelectedModelId, setLastSelectedModelId] = createStoredState<string>(
  "agents:lastSelectedModelId",
  "sonnet",
)

// ============================================
// Mode State (Per Sub-Chat)
// ============================================

const subChatModesStorage = createStoredState<Record<string, AgentMode>>(
  "agents:subChatModes",
  {},
)

export const subChatModeFamily = createKeyedStateFamily<string, AgentMode>("agent")

export function getSubChatMode(subChatId: string): AgentMode {
  // Check runtime state first, then storage
  const runtimeMode = subChatModeFamily.getValue(subChatId)()
  if (runtimeMode !== "agent" || subChatModeFamily.get(subChatId)[0]() !== "agent") {
    return runtimeMode
  }
  // Fall back to persisted storage
  const stored = subChatModesStorage[0]()
  return stored[subChatId] ?? "agent"
}

export function setSubChatMode(subChatId: string, mode: AgentMode) {
  batch(() => {
    subChatModeFamily.setValue(subChatId, mode)
    const current = subChatModesStorage[0]()
    subChatModesStorage[1]({ ...current, [subChatId]: mode })
  })
}

// ============================================
// Sidebar State
// ============================================

export const [agentsSidebarOpen, setAgentsSidebarOpen] = createWindowState<boolean>(
  "agents-sidebar-open",
  true,
)

export const [agentsSidebarWidth, setAgentsSidebarWidth] = createStoredState<number>(
  "agents-sidebar-width",
  224,
)

export const [agentsSubChatsSidebarMode, setAgentsSubChatsSidebarMode] = createWindowState<
  "tabs" | "sidebar"
>("agents-subchats-mode", "tabs")

export const [agentsSubChatsSidebarWidth, setAgentsSubChatsSidebarWidth] = createStoredState<number>(
  "agents-subchats-sidebar-width",
  200,
)

// ============================================
// Preview State
// ============================================

const previewPathsStorage = createStoredState<Record<string, string>>(
  "agents:previewPaths",
  {},
)

export const previewPathFamily = {
  get: (chatId: string) => {
    const stored = previewPathsStorage[0]()
    return stored[chatId] ?? "/"
  },
  set: (chatId: string, path: string) => {
    const current = previewPathsStorage[0]()
    previewPathsStorage[1]({ ...current, [chatId]: path })
  },
}

const viewportModesStorage = createStoredState<Record<string, "desktop" | "mobile">>(
  "agents:viewportModes",
  {},
)

export const viewportModeFamily = {
  get: (chatId: string) => {
    const stored = viewportModesStorage[0]()
    return stored[chatId] ?? "desktop"
  },
  set: (chatId: string, mode: "desktop" | "mobile") => {
    const current = viewportModesStorage[0]()
    viewportModesStorage[1]({ ...current, [chatId]: mode })
  },
}

const previewScalesStorage = createStoredState<Record<string, number>>(
  "agents:previewScales",
  {},
)

export const previewScaleFamily = {
  get: (chatId: string) => {
    const stored = previewScalesStorage[0]()
    return stored[chatId] ?? 100
  },
  set: (chatId: string, scale: number) => {
    const current = previewScalesStorage[0]()
    previewScalesStorage[1]({ ...current, [chatId]: scale })
  },
}

interface MobileDeviceSettings {
  width: number
  height: number
  preset: string
}

const mobileDevicesStorage = createStoredState<Record<string, MobileDeviceSettings>>(
  "agents:mobileDevices",
  {},
)

const defaultMobileDevice: MobileDeviceSettings = {
  width: 393,
  height: 852,
  preset: "iPhone 16",
}

export const mobileDeviceFamily = {
  get: (chatId: string): MobileDeviceSettings => {
    const stored = mobileDevicesStorage[0]()
    return stored[chatId] ?? defaultMobileDevice
  },
  set: (chatId: string, device: MobileDeviceSettings) => {
    const current = mobileDevicesStorage[0]()
    mobileDevicesStorage[1]({ ...current, [chatId]: device })
  },
}

export const [agentsPreviewSidebarWidth, setAgentsPreviewSidebarWidth] = createStoredState<number>(
  "agents-preview-sidebar-width",
  500,
)

export const [agentsPreviewSidebarOpen, setAgentsPreviewSidebarOpen] = createWindowState<boolean>(
  "agents-preview-sidebar-open",
  true,
)

// ============================================
// Diff State
// ============================================

export const [agentsDiffSidebarWidth, setAgentsDiffSidebarWidth] = createStoredState<number>(
  "agents-diff-sidebar-width",
  800,
)

export const [agentsChangesPanelWidth, setAgentsChangesPanelWidth] = createStoredState<number>(
  "agents-changes-panel-width",
  280,
)

export const [agentsChangesPanelCollapsed, setAgentsChangesPanelCollapsed] = createStoredState<boolean>(
  "agents-changes-panel-collapsed",
  true,
)

export const [diffViewDisplayMode, setDiffViewDisplayMode] = createStoredState<DiffViewDisplayMode>(
  "agents:diffViewDisplayMode",
  "center-peek",
)

const diffSidebarOpenStorage = createWindowState<Record<string, boolean>>(
  "agents:diffSidebarOpen",
  {},
)

const diffSidebarOpenRuntime = createSignal<Record<string, boolean>>({})

export function getDiffSidebarOpen(chatId: string): boolean {
  const runtime = diffSidebarOpenRuntime[0]()
  if (runtime[chatId] !== undefined) {
    return runtime[chatId]
  }
  if (diffViewDisplayMode[0]() !== "side-peek") {
    return false
  }
  const stored = diffSidebarOpenStorage[0]()
  return stored[chatId] ?? false
}

export function setDiffSidebarOpen(chatId: string, isOpen: boolean | ((prev: boolean) => boolean)) {
  const currentValue = getDiffSidebarOpen(chatId)
  const nextValue = typeof isOpen === "function" ? (isOpen as (prev: boolean) => boolean)(currentValue) : isOpen
  
  batch(() => {
    diffSidebarOpenRuntime[1](prev => ({ ...prev, [chatId]: nextValue }))
    const stored = diffSidebarOpenStorage[0]()
    diffSidebarOpenStorage[1]({ ...stored, [chatId]: nextValue })
  })
}

/** Legacy global atom - kept for backwards compatibility */
export const [agentsDiffSidebarOpen, setAgentsDiffSidebarOpen] = createWindowState<boolean>(
  "agents-diff-sidebar-open",
  false,
)

export const [agentsFocusedDiffFile, setAgentsFocusedDiffFile] = createSignal<string | null>(null)

// ============================================
// Unseen Changes Tracking
// ============================================

export const [agentsUnseenChanges, setAgentsUnseenChanges] = createSignal(new ReactiveSet<string>())

export function markChatAsSeen(chatId: string) {
  setAgentsUnseenChanges(prev => {
    if (!prev.has(chatId)) return prev
    const next = new ReactiveSet(prev)
    next.delete(chatId)
    return next
  })
}

export function markChatAsUnseen(chatId: string) {
  setAgentsUnseenChanges(prev => {
    if (prev.has(chatId)) return prev
    const next = new ReactiveSet(prev)
    next.add(chatId)
    return next
  })
}

export const [agentsSubChatUnseenChanges, setAgentsSubChatUnseenChanges] = createSignal(
  new ReactiveSet<string>()
)

// ============================================
// Todos
// ============================================

const allTodosStorage = createSignal<Record<string, TodoState>>({})

export const currentTodosFamily = {
  get: (subChatId: string): TodoState => {
    const stored = allTodosStorage[0]()
    return stored[subChatId] ?? { todos: [], creationToolCallId: null }
  },
  set: (subChatId: string, state: TodoState) => {
    const current = allTodosStorage[0]()
    allTodosStorage[1]({ ...current, [subChatId]: state })
  },
  update: (subChatId: string, updater: (prev: TodoState) => TodoState) => {
    const current = allTodosStorage[0]()
    const prev = current[subChatId] ?? { todos: [], creationToolCallId: null }
    allTodosStorage[1]({ ...current, [subChatId]: updater(prev) })
  },
}

// ============================================
// Archive State
// ============================================

export const [archivePopoverOpen, setArchivePopoverOpen] = createSignal<boolean>(false)

export const [archiveSearchQuery, setArchiveSearchQuery] = createSignal<string>("")

export const [archiveRepositoryFilter, setArchiveRepositoryFilter] = createSignal<string | null>(null)

// ============================================
// Mobile & Debug State
// ============================================

export const [agentsMobileViewMode, setAgentsMobileViewMode] = createSignal<AgentsMobileViewMode>("chat")

export const [agentsDebugMode, setAgentsDebugMode] = createStoredState<AgentsDebugMode>(
  "agents:debugMode",
  {
    enabled: false,
    simulateNoTeams: false,
    simulateNoRepos: false,
    simulateNoReadyRepos: false,
    resetOnboarding: false,
    bypassConnections: false,
    forceStep: null,
    simulateCompleted: false,
  },
)

// ============================================
// File Tracking
// ============================================

export const [subChatFiles, setSubChatFiles] = createSignal<Map<string, SubChatFileChange[]>>(new Map())

export const [subChatToChatMap, setSubChatToChatMap] = createSignal<Map<string, string>>(new Map())

export const [filteredDiffFiles, setFilteredDiffFiles] = createSignal<string[] | null>(null)

export const [selectedDiffFilePath, setSelectedDiffFilePath] = createSignal<string | null>(null)

// ============================================
// PR & Commit State
// ============================================

export const [isCreatingPr, setIsCreatingPr] = createSignal<boolean>(false)

export const [filteredSubChatId, setFilteredSubChatId] = createSignal<string | null>(null)

export const [selectedCommit, setSelectedCommit] = createSignal<SelectedCommit>(null)

export const [pendingPrMessage, setPendingPrMessage] = createSignal<string | null>(null)

export const [pendingReviewMessage, setPendingReviewMessage] = createSignal<string | null>(null)

export const [pendingConflictResolutionMessage, setPendingConflictResolutionMessage] = createSignal<string | null>(null)

export interface PendingAuthRetryMessage {
  subChatId: string
  messages: any[]
}

export const [pendingAuthRetryMessage, setPendingAuthRetryMessage] = createSignal<PendingAuthRetryMessage | null>(null)

// ============================================
// Diff Files Collapsed State
// ============================================

const diffFilesCollapsedStorage = createSignal<Record<string, Record<string, boolean>>>({})

export const diffFilesCollapsedFamily = {
  get: (chatId: string, fileKey: string): boolean => {
    const stored = diffFilesCollapsedStorage[0]()
    return stored[chatId]?.[fileKey] ?? false
  },
  set: (chatId: string, fileKey: string, collapsed: boolean) => {
    const current = diffFilesCollapsedStorage[0]()
    const chatCollapsed = current[chatId] ?? {}
    diffFilesCollapsedStorage[1]({
      ...current,
      [chatId]: { ...chatCollapsed, [fileKey]: collapsed },
    })
  },
}

// ============================================
// Last Chat Modes
// ============================================

export const [lastChatModes, setLastChatModes] = createSignal<Map<string, AgentMode>>(
  new Map<string, AgentMode>()
)

export function setLastChatMode(chatId: string, mode: AgentMode) {
  setLastChatModes(prev => {
    if (prev.get(chatId) === mode) return prev
    const next = new Map(prev)
    next.set(chatId, mode)
    return next
  })
}
