import { createMemo, createSignal } from "solid-js"
import { ReactiveSet } from "@solid-primitives/set"
import { createStoredSignal } from "../state/signal-storage"

type SignalPair<T> = readonly [() => T, (value: T | ((prev: T) => T)) => void]

const noopSetter = () => {}

function createDerivedSignalPair<T>(get: () => T): SignalPair<T> {
  return [get, noopSetter as SignalPair<T>[1]]
}

function createActionSignalPair<T>(action: (value: T) => void): SignalPair<T> {
  return [(() => undefined as T), action as SignalPair<T>[1]]
}

// ============================================
// RE-EXPORT FROM FEATURES/AGENTS/ATOMS (source of truth)
// ============================================

export {
  // Chat atoms
  selectedAgentChatIdAtom,
  subChatModeAtomFamily,
  lastSelectedModelIdAtom,
  lastSelectedAgentIdAtom,
  lastSelectedRepoAtom,
  selectedProjectAtom,
  agentsUnseenChangesAtom,
  agentsSubChatUnseenChangesAtom,
  loadingSubChatsAtom,
  setLoading,
  clearLoading,
  MODEL_ID_MAP,
  lastChatModesAtom,

  // Sidebar atoms
  agentsSidebarOpenAtom,
  agentsSidebarWidthAtom,
  agentsSubChatsSidebarModeAtom,
  agentsSubChatsSidebarWidthAtom,

  // Preview atoms
  previewPathAtomFamily,
  viewportModeAtomFamily,
  previewScaleAtomFamily,
  mobileDeviceAtomFamily,
  agentsPreviewSidebarWidthAtom,
  agentsPreviewSidebarOpenAtom,

  // Diff atoms
  agentsDiffSidebarWidthAtom,
  agentsChangesPanelWidthAtom,
  agentsDiffSidebarOpenAtom,
  agentsFocusedDiffFileAtom,
  filteredDiffFilesAtom,
  subChatFilesAtom,

  // Archive atoms
  archivePopoverOpenAtom,
  archiveSearchQueryAtom,
  archiveRepositoryFilterAtom,

  // UI state
  agentsMobileViewModeAtom,

  // Debug mode
  agentsDebugModeAtom,

  // Todos
  currentTodosAtomFamily,

  // AskUserQuestion
  pendingUserQuestionsAtom,

  // Types
  type SavedRepo,
  type SelectedProject,
  type AgentsMobileViewMode,
  type AgentsDebugMode,
  type SubChatFileChange,
  type AgentMode,

  // Mode utilities
  AGENT_MODES,
  getNextMode,
} from "../../features/agents/atoms"

// ============================================
// TEAM ATOMS (unique to lib/atoms)
// ============================================

export const selectedTeamIdAtom = createStoredSignal<string | null>(
  "agents:selectedTeamId",
  null,
)

export const createTeamDialogOpenAtom = createSignal<boolean>(false)

// ============================================
// MULTI-SELECT ATOMS - Chats (unique to lib/atoms)
// ============================================

export const selectedAgentChatIdsAtom = createSignal(new ReactiveSet<string>())

export const isAgentMultiSelectModeAtom = createDerivedSignalPair(() => {
  return selectedAgentChatIdsAtom[0]().size > 0
})

export const selectedAgentChatsCountAtom = createDerivedSignalPair(() => {
  return selectedAgentChatIdsAtom[0]().size
})

export const toggleAgentChatSelectionAtom = createActionSignalPair<string>((chatId) => {
  const currentSet = selectedAgentChatIdsAtom[0]()
  if (currentSet.has(chatId)) {
    currentSet.delete(chatId)
  } else {
    currentSet.add(chatId)
  }
})

export const selectAllAgentChatsAtom = createActionSignalPair<string[]>((chatIds) => {
  selectedAgentChatIdsAtom[1](new ReactiveSet(chatIds))
})

export const clearAgentChatSelectionAtom = createActionSignalPair<void>(() => {
  selectedAgentChatIdsAtom[1](new ReactiveSet())
})

// ============================================
// MULTI-SELECT ATOMS - Sub-Chats (unique to lib/atoms)
// ============================================

export const selectedSubChatIdsAtom = createSignal(new ReactiveSet<string>())

export const isSubChatMultiSelectModeAtom = createDerivedSignalPair(() => {
  return selectedSubChatIdsAtom[0]().size > 0
})

export const selectedSubChatsCountAtom = createDerivedSignalPair(() => {
  return selectedSubChatIdsAtom[0]().size
})

export const toggleSubChatSelectionAtom = createActionSignalPair<string>((subChatId) => {
  const currentSet = selectedSubChatIdsAtom[0]()
  if (currentSet.has(subChatId)) {
    currentSet.delete(subChatId)
  } else {
    currentSet.add(subChatId)
  }
})

export const selectAllSubChatsAtom = createActionSignalPair<string[]>((subChatIds) => {
  selectedSubChatIdsAtom[1](new ReactiveSet(subChatIds))
})

export const clearSubChatSelectionAtom = createActionSignalPair<void>(() => {
  selectedSubChatIdsAtom[1](new ReactiveSet())
})

// ============================================
// DIALOG ATOMS (unique to lib/atoms)
// ============================================

// Settings dialog
export type SettingsTab =
  | "profile"
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

export type CustomClaudeConfig = {
  model: string
  token: string
  baseUrl: string
}

// Model profile system - support multiple configs
export type ModelProfile = {
  id: string
  name: string
  config: CustomClaudeConfig
  isOffline?: boolean // Mark as offline/Ollama profile
}

// Selected Ollama model for offline mode
export const selectedOllamaModelAtom = createStoredSignal<string | null>(
  "agents:selected-ollama-model",
  null, // null = use recommended model
  undefined,
  { getOnInit: true },
)

// Helper to get offline profile with selected model
export const getOfflineProfile = (modelName?: string | null): ModelProfile => ({
  id: 'offline-ollama',
  name: 'Offline (Ollama)',
  isOffline: true,
  config: {
    model: modelName || 'qwen2.5-coder:7b',
    token: 'ollama',
    baseUrl: 'http://localhost:11434',
  },
})

// Predefined offline profile for Ollama (legacy, uses default model)
export const OFFLINE_PROFILE: ModelProfile = {
  id: 'offline-ollama',
  name: 'Offline (Ollama)',
  isOffline: true,
  config: {
    model: 'qwen2.5-coder:7b',
    token: 'ollama',
    baseUrl: 'http://localhost:11434',
  },
}

// Legacy single config (deprecated, kept for backwards compatibility)
export const customClaudeConfigAtom = createStoredSignal<CustomClaudeConfig>(
  "agents:claude-custom-config",
  {
    model: "",
    token: "",
    baseUrl: "",
  },
  undefined,
  { getOnInit: true },
)

// OpenAI API key for voice transcription (for users without paid subscription)
export const openaiApiKeyAtom = createStoredSignal<string>(
  "agents:openai-api-key",
  "",
  undefined,
  { getOnInit: true },
)

// New: Model profiles storage
export const modelProfilesAtom = createStoredSignal<ModelProfile[]>(
  "agents:model-profiles",
  [OFFLINE_PROFILE], // Start with offline profile
  undefined,
  { getOnInit: true },
)

// Active profile ID (null = use Claude Code default)
export const activeProfileIdAtom = createStoredSignal<string | null>(
  "agents:active-profile-id",
  null,
  undefined,
  { getOnInit: true },
)

// Auto-fallback to offline mode when internet is unavailable
export const autoOfflineModeAtom = createStoredSignal<boolean>(
  "agents:auto-offline-mode",
  true, // Enabled by default
  undefined,
  { getOnInit: true },
)

// Simulate offline mode for testing (debug feature)
export const simulateOfflineAtom = createStoredSignal<boolean>(
  "agents:simulate-offline",
  false, // Disabled by default
  undefined,
  { getOnInit: true },
)

// Show offline mode UI (debug feature - enables offline functionality visibility)
export const showOfflineModeFeaturesAtom = createStoredSignal<boolean>(
  "agents:show-offline-mode-features",
  false, // Hidden by default
  undefined,
  { getOnInit: true },
)

// Network status (updated from main process)
export const networkOnlineAtom = createSignal<boolean>(true)

export function normalizeCustomClaudeConfig(
  config: CustomClaudeConfig,
): CustomClaudeConfig | undefined {
  const model = config.model.trim()
  const token = config.token.trim()
  const baseUrl = config.baseUrl.trim()

  if (!model || !token || !baseUrl) return undefined

  return { model, token, baseUrl }
}

// Get active config (considering network status and auto-fallback)
export const activeConfigAtom = createDerivedSignalPair(() => {
  const activeProfileId = activeProfileIdAtom[0]()
  const profiles = modelProfilesAtom[0]()
  const legacyConfig = customClaudeConfigAtom[0]()
  const networkOnline = networkOnlineAtom[0]()
  const autoOffline = autoOfflineModeAtom[0]()

  // If auto-offline enabled and no internet, use offline profile
  if (!networkOnline && autoOffline) {
    const offlineProfile = profiles.find(p => p.isOffline)
    if (offlineProfile) {
      return offlineProfile.config
    }
  }

  // If specific profile is selected, use it
  if (activeProfileId) {
    const profile = profiles.find(p => p.id === activeProfileId)
    if (profile) {
      return profile.config
    }
  }

  // Fallback to legacy config if set
  const normalized = normalizeCustomClaudeConfig(legacyConfig)
  if (normalized) {
    return normalized
  }

  // No custom config
  return undefined
})

// Preferences - Extended Thinking
// When enabled, Claude will use extended thinking for deeper reasoning (128K tokens)
// Note: Extended thinking disables response streaming
export const extendedThinkingEnabledAtom = createStoredSignal<boolean>(
  "preferences:extended-thinking-enabled",
  false,
  undefined,
  { getOnInit: true },
)

// Preferences - History (Rollback)
// When enabled, allow rollback to previous assistant messages
export const historyEnabledAtom = createStoredSignal<boolean>(
  "preferences:history-enabled",
  false,
  undefined,
  { getOnInit: true },
)

// Preferences - Sound Notifications
// When enabled, play a sound when agent completes work (if not viewing the chat)
export const soundNotificationsEnabledAtom = createStoredSignal<boolean>(
  "preferences:sound-notifications-enabled",
  true,
  undefined,
  { getOnInit: true },
)

// Preferences - Desktop Notifications (Windows)
// When enabled, show Windows desktop notification when agent completes work
export const desktopNotificationsEnabledAtom = createStoredSignal<boolean>(
  "preferences:desktop-notifications-enabled",
  true,
  undefined,
  { getOnInit: true },
)

// Preferences - Windows Window Frame Style
// When true, uses native frame (standard Windows title bar)
// When false, uses frameless window (dark custom title bar)
// Only applies on Windows, requires app restart to take effect
export const useNativeFrameAtom = createStoredSignal<boolean>(
  "preferences:windows-use-native-frame",
  false, // Default: frameless (dark title bar)
  undefined,
  { getOnInit: true },
)

// Preferences - Analytics Opt-out
// When true, user has opted out of analytics tracking
export const analyticsOptOutAtom = createStoredSignal<boolean>(
  "preferences:analytics-opt-out",
  false, // Default to opt-in (false means not opted out)
  undefined,
  { getOnInit: true },
)

// Beta: Enable git features in diff sidebar (commit, staging, file selection)
// When enabled, shows checkboxes for file selection and commit UI in diff sidebar
// When disabled, shows simple file list with "Create PR" button
export const betaGitFeaturesEnabledAtom = createStoredSignal<boolean>(
  "preferences:beta-git-features-enabled",
  false, // Default OFF
  undefined,
  { getOnInit: true },
)

// Beta: Enable Kanban board view
// When enabled, shows Kanban button in sidebar to view workspaces as a board
export const betaKanbanEnabledAtom = createStoredSignal<boolean>(
  "preferences:beta-kanban-enabled",
  false, // Default OFF
  undefined,
  { getOnInit: true },
)

// Preferences - Ctrl+Tab Quick Switch Target
// When "workspaces" (default), Ctrl+Tab switches between workspaces, and Opt+Ctrl+Tab switches between agents
// When "agents", Ctrl+Tab switches between agents, and Opt+Ctrl+Tab switches between workspaces
export type CtrlTabTarget = "workspaces" | "agents"
export const ctrlTabTargetAtom = createStoredSignal<CtrlTabTarget>(
  "preferences:ctrl-tab-target",
  "workspaces", // Default: Ctrl+Tab switches workspaces, Opt+Ctrl+Tab switches agents
  undefined,
  { getOnInit: true },
)

// Preferences - Auto-advance after archive
// Controls where to navigate after archiving a workspace
export type AutoAdvanceTarget = "next" | "previous" | "close"
export const autoAdvanceTargetAtom = createStoredSignal<AutoAdvanceTarget>(
  "preferences:auto-advance-target",
  "next", // Default: go to next workspace
  undefined,
  { getOnInit: true },
)

// Preferences - Default Agent Mode
// Controls what mode new chats/sub-chats start in (Plan = read-only, Agent = can edit)
// Re-using AgentMode type from features/agents/atoms
import { type AgentMode as AgentModeType } from "../../features/agents/atoms"

// Migration: convert old isPlanMode boolean to new defaultAgentMode string
// This runs once when the module loads
if (typeof window !== "undefined") {
  const oldKey = "agents:isPlanMode"
  const newKey = "preferences:default-agent-mode"
  const oldValue = localStorage.getItem(oldKey)
  if (oldValue !== null && localStorage.getItem(newKey) === null) {
    // Old value was JSON boolean, new value is JSON string
    const wasInPlanMode = oldValue === "true"
    localStorage.setItem(newKey, JSON.stringify(wasInPlanMode ? "plan" : "agent"))
    localStorage.removeItem(oldKey)
    console.log("[atoms] Migrated isPlanMode to defaultAgentMode:", wasInPlanMode ? "plan" : "agent")
  }
}

export const defaultAgentModeAtom = createStoredSignal<AgentModeType>(
  "preferences:default-agent-mode",
  "agent", // Default to agent mode
  undefined,
  { getOnInit: true },
)

// Preferences - VS Code Code Themes
// Selected themes for code syntax highlighting (separate for light/dark UI themes)
export const vscodeCodeThemeLightAtom = createStoredSignal<string>(
  "preferences:vscode-code-theme-light",
  "github-light",
  undefined,
  { getOnInit: true },
)

export const vscodeCodeThemeDarkAtom = createStoredSignal<string>(
  "preferences:vscode-code-theme-dark",
  "github-dark",
  undefined,
  { getOnInit: true },
)

// ============================================
// FULL VS CODE THEME ATOMS
// ============================================

/**
 * Full VS Code theme data type
 * Contains colors for UI, terminal, and tokenColors for syntax highlighting
 */
export type VSCodeFullTheme = {
  id: string
  name: string
  type: "light" | "dark"
  colors: Record<string, string> // UI and terminal colors
  tokenColors?: any[] // Syntax highlighting rules
  semanticHighlighting?: boolean // Enable semantic highlighting
  semanticTokenColors?: Record<string, any> // Semantic token color overrides
  source: "builtin" | "imported" | "discovered"
  path?: string // File path for imported/discovered themes
}

/**
 * Selected full theme ID
 * When null, uses system light/dark mode with the themes specified in systemLightThemeIdAtom/systemDarkThemeIdAtom
 */
export const selectedFullThemeIdAtom = createStoredSignal<string | null>(
  "preferences:selected-full-theme-id",
  null, // null means use system default
  undefined,
  { getOnInit: true },
)

/**
 * Theme to use when system is in light mode (only used when selectedFullThemeIdAtom is null)
 */
export const systemLightThemeIdAtom = createStoredSignal<string>(
  "preferences:system-light-theme-id",
  "21st-light", // Default light theme
  undefined,
  { getOnInit: true },
)

/**
 * Theme to use when system is in dark mode (only used when selectedFullThemeIdAtom is null)
 */
export const systemDarkThemeIdAtom = createStoredSignal<string>(
  "preferences:system-dark-theme-id",
  "21st-dark", // Default dark theme
  undefined,
  { getOnInit: true },
)

/**
 * Show workspace icon in sidebar
 * When disabled, hides the project icon and moves loader/status indicators to the right of the name
 */
export const showWorkspaceIconAtom = createStoredSignal<boolean>(
  "preferences:show-workspace-icon",
  false, // Hidden by default
  undefined,
  { getOnInit: true },
)

/**
 * Always expand to-do list
 * When enabled, to-do lists are always shown expanded (full list view)
 * When disabled (default), to-do lists start collapsed and can be expanded manually
 */
export const alwaysExpandTodoListAtom = createStoredSignal<boolean>(
  "preferences:always-expand-todo-list",
  false, // Collapsed by default
  undefined,
  { getOnInit: true },
)

/**
 * Cached full theme data for the selected theme
 * This is populated when a theme is selected and used for applying CSS variables
 */
export const fullThemeDataAtom = createSignal<VSCodeFullTheme | null>(null)

/**
 * Imported themes from VS Code extensions
 * Persisted in localStorage, loaded on app start
 */
export const importedThemesAtom = createStoredSignal<VSCodeFullTheme[]>(
  "preferences:imported-themes",
  [],
  undefined,
  { getOnInit: true },
)

/**
 * All available full themes (built-in + imported + discovered)
 * This is a derived atom that combines all theme sources
 */
export const allFullThemesAtom = createSignal<VSCodeFullTheme[]>((get) => {
  // This will be populated by the theme provider
  // For now, return empty - will be set imperatively
  return []
})

// ============================================
// CUSTOM HOTKEYS CONFIGURATION
// ============================================

import type { CustomHotkeysConfig } from "../hotkeys/types"
export type { CustomHotkeysConfig }

/**
 * Custom hotkey overrides storage
 * Maps action IDs to custom hotkey strings (or null for default)
 */
export const customHotkeysAtom = createStoredSignal<CustomHotkeysConfig>(
  "preferences:custom-hotkeys",
  { version: 1, bindings: {} },
  undefined,
  { getOnInit: true },
)

/**
 * Currently recording hotkey for action (UI state)
 * null when not recording
 */
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
// UPDATE ATOMS
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
// DESKTOP/FULLSCREEN STATE ATOMS
// ============================================

// Whether app is running in Electron desktop environment
export const isDesktopAtom = createSignal<boolean>(false)

// Fullscreen state - null means not initialized yet
// null = not yet loaded, false = not fullscreen, true = fullscreen
export const isFullscreenAtom = createSignal<boolean | null>(null)

// ============================================
// ONBOARDING ATOMS
// ============================================

// Billing method selected during onboarding
// "claude-subscription" = use Claude Pro/Max via OAuth
// "api-key" = use Anthropic API key directly
// "custom-model" = use custom base URL and model (e.g. for proxies or alternative providers)
// null = not yet selected (show billing method selection screen)
export type BillingMethod = "claude-subscription" | "api-key" | "custom-model" | null

export const billingMethodAtom = createStoredSignal<BillingMethod>(
  "onboarding:billing-method",
  null,
  undefined,
  { getOnInit: true },
)

// Whether user has completed Anthropic OAuth during onboarding
// This is used to show the onboarding screen after 21st.dev sign-in
// Reset on logout
export const anthropicOnboardingCompletedAtom = createStoredSignal<boolean>(
  "onboarding:anthropic-completed",
  false,
  undefined,
  { getOnInit: true },
)

// Whether user has completed API key configuration during onboarding
// Only relevant when billingMethod is "api-key"
export const apiKeyOnboardingCompletedAtom = createStoredSignal<boolean>(
  "onboarding:api-key-completed",
  false,
  undefined,
  { getOnInit: true },
)

// ============================================
// SESSION INFO ATOMS (MCP, Plugins, Tools)
// ============================================

export type MCPServerStatus = "connected" | "failed" | "pending" | "needs-auth"

export type MCPServer = {
  name: string
  status: MCPServerStatus
  serverInfo?: {
    name: string
    version: string
  }
  error?: string
}

export type SessionInfo = {
  tools: string[]
  mcpServers: MCPServer[]
  plugins: { name: string; path: string }[]
  skills: string[]
}

// Session info from SDK init message
// Contains MCP servers, plugins, available tools, and skills
// Persisted to localStorage so MCP tools are visible after page refresh
// Updated when a new chat session starts
export const sessionInfoAtom = createStoredSignal<SessionInfo | null>(
  "21st-session-info",
  null,
  undefined,
  { getOnInit: true },
)

// ============================================
// CHAT SOURCE MODE (Local vs Sandbox)
// ============================================

// Chat source toggle: "local" = worktree chats (SQLite), "sandbox" = remote sandbox chats
export type ChatSourceMode = "local" | "sandbox"

export const chatSourceModeAtom = createStoredSignal<ChatSourceMode>(
  "agents:chat-source-mode",
  "local",
  undefined,
  { getOnInit: true },
)

// ============================================
// DEV TOOLS UNLOCK (Hidden feature)
// ============================================

// DevTools unlock state (hidden feature - click Beta tab 5 times to enable)
// Persisted per-session only (not in localStorage for security)
export const devToolsUnlockedAtom = createSignal<boolean>(false)
