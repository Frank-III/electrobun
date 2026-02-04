import { createSignal, createMemo } from "solid-js"
import { createPersistedSignal } from "./signal-storage"
import type { CustomHotkeysConfig } from "../hotkeys/types"
import { type AgentMode as AgentModeType } from "./agents-store"

// ============================================
// TEAM PREFERENCES
// ============================================

export const selectedTeamIdAtom = createPersistedSignal<string | null>(
  "agents:selectedTeamId",
  null,
)

// ============================================
// MODEL CONFIGURATION
// ============================================

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
export const selectedOllamaModelAtom = createPersistedSignal<string | null>(
  "agents:selected-ollama-model",
  null, // null = use recommended model
  undefined,
)

// Helper to get offline profile with selected model
export const getOfflineProfile = (modelName?: string | null): ModelProfile => ({
  id: "offline-ollama",
  name: "Offline (Ollama)",
  isOffline: true,
  config: {
    model: modelName || "qwen2.5-coder:7b",
    token: "ollama",
    baseUrl: "http://localhost:11434",
  },
})

// Predefined offline profile for Ollama (legacy, uses default model)
export const OFFLINE_PROFILE: ModelProfile = {
  id: "offline-ollama",
  name: "Offline (Ollama)",
  isOffline: true,
  config: {
    model: "qwen2.5-coder:7b",
    token: "ollama",
    baseUrl: "http://localhost:11434",
  },
}

// Legacy single config (deprecated, kept for backwards compatibility)
export const customClaudeConfigAtom = createPersistedSignal<CustomClaudeConfig>(
  "agents:claude-custom-config",
  {
    model: "",
    token: "",
    baseUrl: "",
  },
  undefined,
)

// OpenAI API key for voice transcription (for users without paid subscription)
export const openaiApiKeyAtom = createPersistedSignal<string>(
  "agents:openai-api-key",
  "",
  undefined,
)

// New: Model profiles storage
export const modelProfilesAtom = createPersistedSignal<ModelProfile[]>(
  "agents:model-profiles",
  [OFFLINE_PROFILE], // Start with offline profile
  undefined,
)

// Active profile ID (null = use Claude Code default)
export const activeProfileIdAtom = createPersistedSignal<string | null>(
  "agents:active-profile-id",
  null,
  undefined,
)

// Auto-fallback to offline mode when internet is unavailable
export const autoOfflineModeAtom = createPersistedSignal<boolean>(
  "agents:auto-offline-mode",
  true, // Enabled by default
  undefined,
)

// Simulate offline mode for testing (debug feature)
export const simulateOfflineAtom = createPersistedSignal<boolean>(
  "agents:simulate-offline",
  false, // Disabled by default
  undefined,
)

// Show offline mode UI (debug feature - enables offline functionality visibility)
export const showOfflineModeFeaturesAtom = createPersistedSignal<boolean>(
  "agents:show-offline-mode-features",
  false, // Hidden by default
  undefined,
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
export const activeConfigAtom = createMemo(() => {
  const activeProfileId = activeProfileIdAtom[0]()
  const profiles = modelProfilesAtom[0]()
  const legacyConfig = customClaudeConfigAtom[0]()
  const networkOnline = networkOnlineAtom[0]()
  const autoOffline = autoOfflineModeAtom[0]()

  // If auto-offline enabled and no internet, use offline profile
  if (!networkOnline && autoOffline) {
    const offlineProfile = profiles.find((p) => p.isOffline)
    if (offlineProfile) {
      return offlineProfile.config
    }
  }

  // If specific profile is selected, use it
  if (activeProfileId) {
    const profile = profiles.find((p) => p.id === activeProfileId)
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

// ============================================
// PREFERENCES
// ============================================

// Preferences - Extended Thinking
// When enabled, Claude will use extended thinking for deeper reasoning (128K tokens)
// Note: Extended thinking disables response streaming
export const extendedThinkingEnabledAtom = createPersistedSignal<boolean>(
  "preferences:extended-thinking-enabled",
  false,
  undefined,
)

// Preferences - History (Rollback)
// When enabled, allow rollback to previous assistant messages
export const historyEnabledAtom = createPersistedSignal<boolean>(
  "preferences:history-enabled",
  false,
  undefined,
)

// Preferences - Sound Notifications
// When enabled, play a sound when agent completes work (if not viewing the chat)
export const soundNotificationsEnabledAtom = createPersistedSignal<boolean>(
  "preferences:sound-notifications-enabled",
  true,
  undefined,
)

// Preferences - Desktop Notifications (Windows)
// When enabled, show Windows desktop notification when agent completes work
export const desktopNotificationsEnabledAtom = createPersistedSignal<boolean>(
  "preferences:desktop-notifications-enabled",
  true,
  undefined,
)

// Preferences - Windows Window Frame Style
// When true, uses native frame (standard Windows title bar)
// When false, uses frameless window (dark custom title bar)
// Only applies on Windows, requires app restart to take effect
export const useNativeFrameAtom = createPersistedSignal<boolean>(
  "preferences:windows-use-native-frame",
  false, // Default: frameless (dark title bar)
  undefined,
)

// Beta: Enable git features in diff sidebar (commit, staging, file selection)
// When enabled, shows checkboxes for file selection and commit UI in diff sidebar
// When disabled, shows simple file list with "Create PR" button
export const betaGitFeaturesEnabledAtom = createPersistedSignal<boolean>(
  "preferences:beta-git-features-enabled",
  false, // Default OFF
  undefined,
)

// Beta: Enable Kanban board view
// When enabled, shows Kanban button in sidebar to view workspaces as a board
export const betaKanbanEnabledAtom = createPersistedSignal<boolean>(
  "preferences:beta-kanban-enabled",
  false, // Default OFF
  undefined,
)

// Analytics opt-out preference
// When enabled, user has opted out of analytics/telemetry
export const analyticsOptOutAtom = createPersistedSignal<boolean>(
  "preferences:analytics-opt-out",
  false, // Default: opted-in (analytics enabled)
  undefined,
)

// Preferences - Ctrl+Tab Quick Switch Target
// When "workspaces" (default), Ctrl+Tab switches between workspaces, and Opt+Ctrl+Tab switches between agents
// When "agents", Ctrl+Tab switches between agents, and Opt+Ctrl+Tab switches between workspaces
export type CtrlTabTarget = "workspaces" | "agents"
export const ctrlTabTargetAtom = createPersistedSignal<CtrlTabTarget>(
  "preferences:ctrl-tab-target",
  "workspaces", // Default: Ctrl+Tab switches workspaces, Opt+Ctrl+Tab switches agents
  undefined,
)

// Preferences - Auto-advance after archive
// Controls where to navigate after archiving a workspace
export type AutoAdvanceTarget = "next" | "previous" | "close"
export const autoAdvanceTargetAtom = createPersistedSignal<AutoAdvanceTarget>(
  "preferences:auto-advance-target",
  "next", // Default: go to next workspace
  undefined,
)

// Preferences - Default Agent Mode
// Controls what mode new chats/sub-chats start in (Plan = read-only, Agent = can edit)
// Re-using AgentMode type from agents store

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
    console.log(
      "[atoms] Migrated isPlanMode to defaultAgentMode:",
      wasInPlanMode ? "plan" : "agent",
    )
  }
}

export const defaultAgentModeAtom = createPersistedSignal<AgentModeType>(
  "preferences:default-agent-mode",
  "agent", // Default to agent mode
  undefined,
)

// Preferences - VS Code Code Themes
// Selected themes for code syntax highlighting (separate for light/dark UI themes)
export const vscodeCodeThemeLightAtom = createPersistedSignal<string>(
  "preferences:vscode-code-theme-light",
  "github-light",
  undefined,
)

export const vscodeCodeThemeDarkAtom = createPersistedSignal<string>(
  "preferences:vscode-code-theme-dark",
  "github-dark",
  undefined,
)

// ============================================
// FULL VS CODE THEME PREFERENCES
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
export const selectedFullThemeIdAtom = createPersistedSignal<string | null>(
  "preferences:selected-full-theme-id",
  null, // null means use system default
  undefined,
)

/**
 * Theme to use when system is in light mode (only used when selectedFullThemeIdAtom is null)
 */
export const systemLightThemeIdAtom = createPersistedSignal<string>(
  "preferences:system-light-theme-id",
  "21st-light", // Default light theme
  undefined,
)

/**
 * Theme to use when system is in dark mode (only used when selectedFullThemeIdAtom is null)
 */
export const systemDarkThemeIdAtom = createPersistedSignal<string>(
  "preferences:system-dark-theme-id",
  "21st-dark", // Default dark theme
  undefined,
)

/**
 * Show workspace icon in sidebar
 * When disabled, hides the project icon and moves loader/status indicators to the right of the name
 */
export const showWorkspaceIconAtom = createPersistedSignal<boolean>(
  "preferences:show-workspace-icon",
  false, // Hidden by default
  undefined,
)

/**
 * Always expand to-do list
 * When enabled, to-do lists are always shown expanded (full list view)
 * When disabled (default), to-do lists start collapsed and can be expanded manually
 */
export const alwaysExpandTodoListAtom = createPersistedSignal<boolean>(
  "preferences:always-expand-todo-list",
  false, // Collapsed by default
  undefined,
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
export const importedThemesAtom = createPersistedSignal<VSCodeFullTheme[]>(
  "preferences:imported-themes",
  [],
  undefined,
)

/**
 * All available full themes (built-in + imported + discovered)
 * This is set imperatively by the theme provider
 */
export const allFullThemesAtom = createSignal<VSCodeFullTheme[]>([])

// ============================================
// CUSTOM HOTKEYS CONFIGURATION
// ============================================

export type { CustomHotkeysConfig }

/**
 * Custom hotkey overrides storage
 * Maps action IDs to custom hotkey strings (or null for default)
 */
export const customHotkeysAtom = createPersistedSignal<CustomHotkeysConfig>(
  "preferences:custom-hotkeys",
  { version: 1, bindings: {} },
  undefined,
)

// ============================================
// ONBOARDING PREFERENCES
// ============================================

// Billing method selected during onboarding
// "claude-subscription" = use Claude Pro/Max via OAuth
// "api-key" = use Anthropic API key directly
// "custom-model" = use custom base URL and model (e.g. for proxies or alternative providers)
// null = not yet selected (show billing method selection screen)
export type BillingMethod = "claude-subscription" | "api-key" | "custom-model" | null

export const billingMethodAtom = createPersistedSignal<BillingMethod>(
  "onboarding:billing-method",
  null,
  undefined,
)

// Whether user has completed Anthropic OAuth during onboarding
// This is used to show the onboarding screen after 21st.dev sign-in
// Reset on logout
export const anthropicOnboardingCompletedAtom = createPersistedSignal<boolean>(
  "onboarding:anthropic-completed",
  false,
  undefined,
)

// Whether user has completed API key configuration during onboarding
// Only relevant when billingMethod is "api-key"
export const apiKeyOnboardingCompletedAtom = createPersistedSignal<boolean>(
  "onboarding:api-key-completed",
  false,
  undefined,
)

// ============================================
// SESSION INFO PREFERENCES (MCP, Plugins, Tools)
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
export const sessionInfoAtom = createPersistedSignal<SessionInfo | null>(
  "21st-session-info",
  null,
  undefined,
)

// ============================================
// CHAT SOURCE MODE (Local vs Sandbox)
// ============================================

// Chat source toggle: "local" = worktree chats (SQLite), "sandbox" = remote sandbox chats
export type ChatSourceMode = "local" | "sandbox"

export const chatSourceModeAtom = createPersistedSignal<ChatSourceMode>(
  "agents:chat-source-mode",
  "local",
  undefined,
)
