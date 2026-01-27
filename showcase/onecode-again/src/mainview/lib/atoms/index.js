"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSubChatSelectionAtom = exports.selectedSubChatsCountAtom = exports.isSubChatMultiSelectModeAtom = exports.selectedSubChatIdsAtom = exports.clearAgentChatSelectionAtom = exports.selectAllAgentChatsAtom = exports.toggleAgentChatSelectionAtom = exports.selectedAgentChatsCountAtom = exports.isAgentMultiSelectModeAtom = exports.selectedAgentChatIdsAtom = exports.createTeamDialogOpenAtom = exports.selectedTeamIdAtom = exports.getNextMode = exports.AGENT_MODES = exports.pendingUserQuestionsAtom = exports.currentTodosAtomFamily = exports.agentsDebugModeAtom = exports.agentsMobileViewModeAtom = exports.archiveRepositoryFilterAtom = exports.archiveSearchQueryAtom = exports.archivePopoverOpenAtom = exports.subChatFilesAtom = exports.filteredDiffFilesAtom = exports.agentsFocusedDiffFileAtom = exports.agentsDiffSidebarOpenAtom = exports.agentsChangesPanelWidthAtom = exports.agentsDiffSidebarWidthAtom = exports.agentsPreviewSidebarOpenAtom = exports.agentsPreviewSidebarWidthAtom = exports.mobileDeviceAtomFamily = exports.previewScaleAtomFamily = exports.viewportModeAtomFamily = exports.previewPathAtomFamily = exports.agentsSubChatsSidebarWidthAtom = exports.agentsSubChatsSidebarModeAtom = exports.agentsSidebarWidthAtom = exports.agentsSidebarOpenAtom = exports.lastChatModesAtom = exports.MODEL_ID_MAP = exports.clearLoading = exports.setLoading = exports.loadingSubChatsAtom = exports.agentsSubChatUnseenChangesAtom = exports.agentsUnseenChangesAtom = exports.selectedProjectAtom = exports.lastSelectedRepoAtom = exports.lastSelectedAgentIdAtom = exports.lastSelectedModelIdAtom = exports.subChatModeAtomFamily = exports.selectedAgentChatIdAtom = void 0;
exports.isDesktopAtom = exports.updateInfoAtom = exports.justUpdatedVersionAtom = exports.justUpdatedAtom = exports.updateStateAtom = exports.subChatsQuickSwitchSelectedIndexAtom = exports.subChatsQuickSwitchOpenAtom = exports.agentsQuickSwitchSelectedIndexAtom = exports.agentsQuickSwitchOpenAtom = exports.agentsHelpPopoverOpenAtom = exports.agentsLoginModalOpenAtom = exports.recordingHotkeyForActionAtom = exports.customHotkeysAtom = exports.allFullThemesAtom = exports.importedThemesAtom = exports.fullThemeDataAtom = exports.alwaysExpandTodoListAtom = exports.showWorkspaceIconAtom = exports.systemDarkThemeIdAtom = exports.systemLightThemeIdAtom = exports.selectedFullThemeIdAtom = exports.vscodeCodeThemeDarkAtom = exports.vscodeCodeThemeLightAtom = exports.defaultAgentModeAtom = exports.autoAdvanceTargetAtom = exports.ctrlTabTargetAtom = exports.betaKanbanEnabledAtom = exports.betaGitFeaturesEnabledAtom = exports.analyticsOptOutAtom = exports.useNativeFrameAtom = exports.desktopNotificationsEnabledAtom = exports.soundNotificationsEnabledAtom = exports.historyEnabledAtom = exports.extendedThinkingEnabledAtom = exports.activeConfigAtom = exports.networkOnlineAtom = exports.showOfflineModeFeaturesAtom = exports.simulateOfflineAtom = exports.autoOfflineModeAtom = exports.activeProfileIdAtom = exports.modelProfilesAtom = exports.openaiApiKeyAtom = exports.customClaudeConfigAtom = exports.OFFLINE_PROFILE = exports.getOfflineProfile = exports.selectedOllamaModelAtom = exports.agentsSettingsDialogOpenAtom = exports.agentsSettingsDialogActiveTabAtom = exports.clearSubChatSelectionAtom = exports.selectAllSubChatsAtom = void 0;
exports.devToolsUnlockedAtom = exports.chatSourceModeAtom = exports.sessionInfoAtom = exports.apiKeyOnboardingCompletedAtom = exports.anthropicOnboardingCompletedAtom = exports.billingMethodAtom = exports.isFullscreenAtom = void 0;
exports.normalizeCustomClaudeConfig = normalizeCustomClaudeConfig;
var solid_js_1 = require("solid-js");
var set_1 = require("@solid-primitives/set");
var signal_storage_1 = require("../state/signal-storage");
var noopSetter = function () { };
function createDerivedSignalPair(get) {
    return [get, noopSetter];
}
function createActionSignalPair(action) {
    return [(function () { return undefined; }), action];
}
// ============================================
// RE-EXPORT FROM FEATURES/AGENTS/ATOMS (source of truth)
// ============================================
var atoms_1 = require("../../features/agents/atoms");
// Chat atoms
Object.defineProperty(exports, "selectedAgentChatIdAtom", { enumerable: true, get: function () { return atoms_1.selectedAgentChatIdAtom; } });
Object.defineProperty(exports, "subChatModeAtomFamily", { enumerable: true, get: function () { return atoms_1.subChatModeAtomFamily; } });
Object.defineProperty(exports, "lastSelectedModelIdAtom", { enumerable: true, get: function () { return atoms_1.lastSelectedModelIdAtom; } });
Object.defineProperty(exports, "lastSelectedAgentIdAtom", { enumerable: true, get: function () { return atoms_1.lastSelectedAgentIdAtom; } });
Object.defineProperty(exports, "lastSelectedRepoAtom", { enumerable: true, get: function () { return atoms_1.lastSelectedRepoAtom; } });
Object.defineProperty(exports, "selectedProjectAtom", { enumerable: true, get: function () { return atoms_1.selectedProjectAtom; } });
Object.defineProperty(exports, "agentsUnseenChangesAtom", { enumerable: true, get: function () { return atoms_1.agentsUnseenChangesAtom; } });
Object.defineProperty(exports, "agentsSubChatUnseenChangesAtom", { enumerable: true, get: function () { return atoms_1.agentsSubChatUnseenChangesAtom; } });
Object.defineProperty(exports, "loadingSubChatsAtom", { enumerable: true, get: function () { return atoms_1.loadingSubChatsAtom; } });
Object.defineProperty(exports, "setLoading", { enumerable: true, get: function () { return atoms_1.setLoading; } });
Object.defineProperty(exports, "clearLoading", { enumerable: true, get: function () { return atoms_1.clearLoading; } });
Object.defineProperty(exports, "MODEL_ID_MAP", { enumerable: true, get: function () { return atoms_1.MODEL_ID_MAP; } });
Object.defineProperty(exports, "lastChatModesAtom", { enumerable: true, get: function () { return atoms_1.lastChatModesAtom; } });
// Sidebar atoms
Object.defineProperty(exports, "agentsSidebarOpenAtom", { enumerable: true, get: function () { return atoms_1.agentsSidebarOpenAtom; } });
Object.defineProperty(exports, "agentsSidebarWidthAtom", { enumerable: true, get: function () { return atoms_1.agentsSidebarWidthAtom; } });
Object.defineProperty(exports, "agentsSubChatsSidebarModeAtom", { enumerable: true, get: function () { return atoms_1.agentsSubChatsSidebarModeAtom; } });
Object.defineProperty(exports, "agentsSubChatsSidebarWidthAtom", { enumerable: true, get: function () { return atoms_1.agentsSubChatsSidebarWidthAtom; } });
// Preview atoms
Object.defineProperty(exports, "previewPathAtomFamily", { enumerable: true, get: function () { return atoms_1.previewPathAtomFamily; } });
Object.defineProperty(exports, "viewportModeAtomFamily", { enumerable: true, get: function () { return atoms_1.viewportModeAtomFamily; } });
Object.defineProperty(exports, "previewScaleAtomFamily", { enumerable: true, get: function () { return atoms_1.previewScaleAtomFamily; } });
Object.defineProperty(exports, "mobileDeviceAtomFamily", { enumerable: true, get: function () { return atoms_1.mobileDeviceAtomFamily; } });
Object.defineProperty(exports, "agentsPreviewSidebarWidthAtom", { enumerable: true, get: function () { return atoms_1.agentsPreviewSidebarWidthAtom; } });
Object.defineProperty(exports, "agentsPreviewSidebarOpenAtom", { enumerable: true, get: function () { return atoms_1.agentsPreviewSidebarOpenAtom; } });
// Diff atoms
Object.defineProperty(exports, "agentsDiffSidebarWidthAtom", { enumerable: true, get: function () { return atoms_1.agentsDiffSidebarWidthAtom; } });
Object.defineProperty(exports, "agentsChangesPanelWidthAtom", { enumerable: true, get: function () { return atoms_1.agentsChangesPanelWidthAtom; } });
Object.defineProperty(exports, "agentsDiffSidebarOpenAtom", { enumerable: true, get: function () { return atoms_1.agentsDiffSidebarOpenAtom; } });
Object.defineProperty(exports, "agentsFocusedDiffFileAtom", { enumerable: true, get: function () { return atoms_1.agentsFocusedDiffFileAtom; } });
Object.defineProperty(exports, "filteredDiffFilesAtom", { enumerable: true, get: function () { return atoms_1.filteredDiffFilesAtom; } });
Object.defineProperty(exports, "subChatFilesAtom", { enumerable: true, get: function () { return atoms_1.subChatFilesAtom; } });
// Archive atoms
Object.defineProperty(exports, "archivePopoverOpenAtom", { enumerable: true, get: function () { return atoms_1.archivePopoverOpenAtom; } });
Object.defineProperty(exports, "archiveSearchQueryAtom", { enumerable: true, get: function () { return atoms_1.archiveSearchQueryAtom; } });
Object.defineProperty(exports, "archiveRepositoryFilterAtom", { enumerable: true, get: function () { return atoms_1.archiveRepositoryFilterAtom; } });
// UI state
Object.defineProperty(exports, "agentsMobileViewModeAtom", { enumerable: true, get: function () { return atoms_1.agentsMobileViewModeAtom; } });
// Debug mode
Object.defineProperty(exports, "agentsDebugModeAtom", { enumerable: true, get: function () { return atoms_1.agentsDebugModeAtom; } });
// Todos
Object.defineProperty(exports, "currentTodosAtomFamily", { enumerable: true, get: function () { return atoms_1.currentTodosAtomFamily; } });
// AskUserQuestion
Object.defineProperty(exports, "pendingUserQuestionsAtom", { enumerable: true, get: function () { return atoms_1.pendingUserQuestionsAtom; } });
// Mode utilities
Object.defineProperty(exports, "AGENT_MODES", { enumerable: true, get: function () { return atoms_1.AGENT_MODES; } });
Object.defineProperty(exports, "getNextMode", { enumerable: true, get: function () { return atoms_1.getNextMode; } });
// ============================================
// TEAM ATOMS (unique to lib/atoms)
// ============================================
exports.selectedTeamIdAtom = (0, signal_storage_1.createStoredSignal)("agents:selectedTeamId", null);
exports.createTeamDialogOpenAtom = (0, solid_js_1.createSignal)(false);
// ============================================
// MULTI-SELECT ATOMS - Chats (unique to lib/atoms)
// ============================================
exports.selectedAgentChatIdsAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
exports.isAgentMultiSelectModeAtom = createDerivedSignalPair(function () {
    return exports.selectedAgentChatIdsAtom[0]().size > 0;
});
exports.selectedAgentChatsCountAtom = createDerivedSignalPair(function () {
    return exports.selectedAgentChatIdsAtom[0]().size;
});
exports.toggleAgentChatSelectionAtom = createActionSignalPair(function (chatId) {
    var currentSet = exports.selectedAgentChatIdsAtom[0]();
    if (currentSet.has(chatId)) {
        currentSet.delete(chatId);
    }
    else {
        currentSet.add(chatId);
    }
});
exports.selectAllAgentChatsAtom = createActionSignalPair(function (chatIds) {
    exports.selectedAgentChatIdsAtom[1](new set_1.ReactiveSet(chatIds));
});
exports.clearAgentChatSelectionAtom = createActionSignalPair(function () {
    exports.selectedAgentChatIdsAtom[1](new set_1.ReactiveSet());
});
// ============================================
// MULTI-SELECT ATOMS - Sub-Chats (unique to lib/atoms)
// ============================================
exports.selectedSubChatIdsAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
exports.isSubChatMultiSelectModeAtom = createDerivedSignalPair(function () {
    return exports.selectedSubChatIdsAtom[0]().size > 0;
});
exports.selectedSubChatsCountAtom = createDerivedSignalPair(function () {
    return exports.selectedSubChatIdsAtom[0]().size;
});
exports.toggleSubChatSelectionAtom = createActionSignalPair(function (subChatId) {
    var currentSet = exports.selectedSubChatIdsAtom[0]();
    if (currentSet.has(subChatId)) {
        currentSet.delete(subChatId);
    }
    else {
        currentSet.add(subChatId);
    }
});
exports.selectAllSubChatsAtom = createActionSignalPair(function (subChatIds) {
    exports.selectedSubChatIdsAtom[1](new set_1.ReactiveSet(subChatIds));
});
exports.clearSubChatSelectionAtom = createActionSignalPair(function () {
    exports.selectedSubChatIdsAtom[1](new set_1.ReactiveSet());
});
exports.agentsSettingsDialogActiveTabAtom = (0, solid_js_1.createSignal)("profile");
exports.agentsSettingsDialogOpenAtom = (0, solid_js_1.createSignal)(false);
// Selected Ollama model for offline mode
exports.selectedOllamaModelAtom = (0, signal_storage_1.createStoredSignal)("agents:selected-ollama-model", null, // null = use recommended model
undefined, { getOnInit: true });
// Helper to get offline profile with selected model
var getOfflineProfile = function (modelName) { return ({
    id: 'offline-ollama',
    name: 'Offline (Ollama)',
    isOffline: true,
    config: {
        model: modelName || 'qwen2.5-coder:7b',
        token: 'ollama',
        baseUrl: 'http://localhost:11434',
    },
}); };
exports.getOfflineProfile = getOfflineProfile;
// Predefined offline profile for Ollama (legacy, uses default model)
exports.OFFLINE_PROFILE = {
    id: 'offline-ollama',
    name: 'Offline (Ollama)',
    isOffline: true,
    config: {
        model: 'qwen2.5-coder:7b',
        token: 'ollama',
        baseUrl: 'http://localhost:11434',
    },
};
// Legacy single config (deprecated, kept for backwards compatibility)
exports.customClaudeConfigAtom = (0, signal_storage_1.createStoredSignal)("agents:claude-custom-config", {
    model: "",
    token: "",
    baseUrl: "",
}, undefined, { getOnInit: true });
// OpenAI API key for voice transcription (for users without paid subscription)
exports.openaiApiKeyAtom = (0, signal_storage_1.createStoredSignal)("agents:openai-api-key", "", undefined, { getOnInit: true });
// New: Model profiles storage
exports.modelProfilesAtom = (0, signal_storage_1.createStoredSignal)("agents:model-profiles", [exports.OFFLINE_PROFILE], // Start with offline profile
undefined, { getOnInit: true });
// Active profile ID (null = use Claude Code default)
exports.activeProfileIdAtom = (0, signal_storage_1.createStoredSignal)("agents:active-profile-id", null, undefined, { getOnInit: true });
// Auto-fallback to offline mode when internet is unavailable
exports.autoOfflineModeAtom = (0, signal_storage_1.createStoredSignal)("agents:auto-offline-mode", true, // Enabled by default
undefined, { getOnInit: true });
// Simulate offline mode for testing (debug feature)
exports.simulateOfflineAtom = (0, signal_storage_1.createStoredSignal)("agents:simulate-offline", false, // Disabled by default
undefined, { getOnInit: true });
// Show offline mode UI (debug feature - enables offline functionality visibility)
exports.showOfflineModeFeaturesAtom = (0, signal_storage_1.createStoredSignal)("agents:show-offline-mode-features", false, // Hidden by default
undefined, { getOnInit: true });
// Network status (updated from main process)
exports.networkOnlineAtom = (0, solid_js_1.createSignal)(true);
function normalizeCustomClaudeConfig(config) {
    var model = config.model.trim();
    var token = config.token.trim();
    var baseUrl = config.baseUrl.trim();
    if (!model || !token || !baseUrl)
        return undefined;
    return { model: model, token: token, baseUrl: baseUrl };
}
// Get active config (considering network status and auto-fallback)
exports.activeConfigAtom = createDerivedSignalPair(function () {
    var activeProfileId = exports.activeProfileIdAtom[0]();
    var profiles = exports.modelProfilesAtom[0]();
    var legacyConfig = exports.customClaudeConfigAtom[0]();
    var networkOnline = exports.networkOnlineAtom[0]();
    var autoOffline = exports.autoOfflineModeAtom[0]();
    // If auto-offline enabled and no internet, use offline profile
    if (!networkOnline && autoOffline) {
        var offlineProfile = profiles.find(function (p) { return p.isOffline; });
        if (offlineProfile) {
            return offlineProfile.config;
        }
    }
    // If specific profile is selected, use it
    if (activeProfileId) {
        var profile = profiles.find(function (p) { return p.id === activeProfileId; });
        if (profile) {
            return profile.config;
        }
    }
    // Fallback to legacy config if set
    var normalized = normalizeCustomClaudeConfig(legacyConfig);
    if (normalized) {
        return normalized;
    }
    // No custom config
    return undefined;
});
// Preferences - Extended Thinking
// When enabled, Claude will use extended thinking for deeper reasoning (128K tokens)
// Note: Extended thinking disables response streaming
exports.extendedThinkingEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:extended-thinking-enabled", false, undefined, { getOnInit: true });
// Preferences - History (Rollback)
// When enabled, allow rollback to previous assistant messages
exports.historyEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:history-enabled", false, undefined, { getOnInit: true });
// Preferences - Sound Notifications
// When enabled, play a sound when agent completes work (if not viewing the chat)
exports.soundNotificationsEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:sound-notifications-enabled", true, undefined, { getOnInit: true });
// Preferences - Desktop Notifications (Windows)
// When enabled, show Windows desktop notification when agent completes work
exports.desktopNotificationsEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:desktop-notifications-enabled", true, undefined, { getOnInit: true });
// Preferences - Windows Window Frame Style
// When true, uses native frame (standard Windows title bar)
// When false, uses frameless window (dark custom title bar)
// Only applies on Windows, requires app restart to take effect
exports.useNativeFrameAtom = (0, signal_storage_1.createStoredSignal)("preferences:windows-use-native-frame", false, // Default: frameless (dark title bar)
undefined, { getOnInit: true });
// Preferences - Analytics Opt-out
// When true, user has opted out of analytics tracking
exports.analyticsOptOutAtom = (0, signal_storage_1.createStoredSignal)("preferences:analytics-opt-out", false, // Default to opt-in (false means not opted out)
undefined, { getOnInit: true });
// Beta: Enable git features in diff sidebar (commit, staging, file selection)
// When enabled, shows checkboxes for file selection and commit UI in diff sidebar
// When disabled, shows simple file list with "Create PR" button
exports.betaGitFeaturesEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:beta-git-features-enabled", false, // Default OFF
undefined, { getOnInit: true });
// Beta: Enable Kanban board view
// When enabled, shows Kanban button in sidebar to view workspaces as a board
exports.betaKanbanEnabledAtom = (0, signal_storage_1.createStoredSignal)("preferences:beta-kanban-enabled", false, // Default OFF
undefined, { getOnInit: true });
exports.ctrlTabTargetAtom = (0, signal_storage_1.createStoredSignal)("preferences:ctrl-tab-target", "workspaces", // Default: Ctrl+Tab switches workspaces, Opt+Ctrl+Tab switches agents
undefined, { getOnInit: true });
exports.autoAdvanceTargetAtom = (0, signal_storage_1.createStoredSignal)("preferences:auto-advance-target", "next", // Default: go to next workspace
undefined, { getOnInit: true });
// Migration: convert old isPlanMode boolean to new defaultAgentMode string
// This runs once when the module loads
if (typeof window !== "undefined") {
    var oldKey = "agents:isPlanMode";
    var newKey = "preferences:default-agent-mode";
    var oldValue = localStorage.getItem(oldKey);
    if (oldValue !== null && localStorage.getItem(newKey) === null) {
        // Old value was JSON boolean, new value is JSON string
        var wasInPlanMode = oldValue === "true";
        localStorage.setItem(newKey, JSON.stringify(wasInPlanMode ? "plan" : "agent"));
        localStorage.removeItem(oldKey);
        console.log("[atoms] Migrated isPlanMode to defaultAgentMode:", wasInPlanMode ? "plan" : "agent");
    }
}
exports.defaultAgentModeAtom = (0, signal_storage_1.createStoredSignal)("preferences:default-agent-mode", "agent", // Default to agent mode
undefined, { getOnInit: true });
// Preferences - VS Code Code Themes
// Selected themes for code syntax highlighting (separate for light/dark UI themes)
exports.vscodeCodeThemeLightAtom = (0, signal_storage_1.createStoredSignal)("preferences:vscode-code-theme-light", "github-light", undefined, { getOnInit: true });
exports.vscodeCodeThemeDarkAtom = (0, signal_storage_1.createStoredSignal)("preferences:vscode-code-theme-dark", "github-dark", undefined, { getOnInit: true });
/**
 * Selected full theme ID
 * When null, uses system light/dark mode with the themes specified in systemLightThemeIdAtom/systemDarkThemeIdAtom
 */
exports.selectedFullThemeIdAtom = (0, signal_storage_1.createStoredSignal)("preferences:selected-full-theme-id", null, // null means use system default
undefined, { getOnInit: true });
/**
 * Theme to use when system is in light mode (only used when selectedFullThemeIdAtom is null)
 */
exports.systemLightThemeIdAtom = (0, signal_storage_1.createStoredSignal)("preferences:system-light-theme-id", "21st-light", // Default light theme
undefined, { getOnInit: true });
/**
 * Theme to use when system is in dark mode (only used when selectedFullThemeIdAtom is null)
 */
exports.systemDarkThemeIdAtom = (0, signal_storage_1.createStoredSignal)("preferences:system-dark-theme-id", "21st-dark", // Default dark theme
undefined, { getOnInit: true });
/**
 * Show workspace icon in sidebar
 * When disabled, hides the project icon and moves loader/status indicators to the right of the name
 */
exports.showWorkspaceIconAtom = (0, signal_storage_1.createStoredSignal)("preferences:show-workspace-icon", false, // Hidden by default
undefined, { getOnInit: true });
/**
 * Always expand to-do list
 * When enabled, to-do lists are always shown expanded (full list view)
 * When disabled (default), to-do lists start collapsed and can be expanded manually
 */
exports.alwaysExpandTodoListAtom = (0, signal_storage_1.createStoredSignal)("preferences:always-expand-todo-list", false, // Collapsed by default
undefined, { getOnInit: true });
/**
 * Cached full theme data for the selected theme
 * This is populated when a theme is selected and used for applying CSS variables
 */
exports.fullThemeDataAtom = (0, solid_js_1.createSignal)(null);
/**
 * Imported themes from VS Code extensions
 * Persisted in localStorage, loaded on app start
 */
exports.importedThemesAtom = (0, signal_storage_1.createStoredSignal)("preferences:imported-themes", [], undefined, { getOnInit: true });
/**
 * All available full themes (built-in + imported + discovered)
 * This is a derived atom that combines all theme sources
 */
exports.allFullThemesAtom = (0, solid_js_1.createSignal)(function (get) {
    // This will be populated by the theme provider
    // For now, return empty - will be set imperatively
    return [];
});
/**
 * Custom hotkey overrides storage
 * Maps action IDs to custom hotkey strings (or null for default)
 */
exports.customHotkeysAtom = (0, signal_storage_1.createStoredSignal)("preferences:custom-hotkeys", { version: 1, bindings: {} }, undefined, { getOnInit: true });
/**
 * Currently recording hotkey for action (UI state)
 * null when not recording
 */
exports.recordingHotkeyForActionAtom = (0, solid_js_1.createSignal)(null);
// Login modal (shown when Claude Code auth fails)
exports.agentsLoginModalOpenAtom = (0, solid_js_1.createSignal)(false);
// Help popover
exports.agentsHelpPopoverOpenAtom = (0, solid_js_1.createSignal)(false);
// Quick switch dialog - Agents
exports.agentsQuickSwitchOpenAtom = (0, solid_js_1.createSignal)(false);
exports.agentsQuickSwitchSelectedIndexAtom = (0, solid_js_1.createSignal)(0);
// Quick switch dialog - Sub-chats
exports.subChatsQuickSwitchOpenAtom = (0, solid_js_1.createSignal)(false);
exports.subChatsQuickSwitchSelectedIndexAtom = (0, solid_js_1.createSignal)(0);
exports.updateStateAtom = (0, solid_js_1.createSignal)({ status: "idle" });
// Track if app was just updated (to show "What's New" banner)
// This is set to true when app launches with a new version, reset when user dismisses
exports.justUpdatedAtom = (0, solid_js_1.createSignal)(false);
// Store the version that triggered the "just updated" state
exports.justUpdatedVersionAtom = (0, solid_js_1.createSignal)(null);
exports.updateInfoAtom = (0, solid_js_1.createSignal)(null);
// ============================================
// DESKTOP/FULLSCREEN STATE ATOMS
// ============================================
// Whether app is running in Electron desktop environment
exports.isDesktopAtom = (0, solid_js_1.createSignal)(false);
// Fullscreen state - null means not initialized yet
// null = not yet loaded, false = not fullscreen, true = fullscreen
exports.isFullscreenAtom = (0, solid_js_1.createSignal)(null);
exports.billingMethodAtom = (0, signal_storage_1.createStoredSignal)("onboarding:billing-method", null, undefined, { getOnInit: true });
// Whether user has completed Anthropic OAuth during onboarding
// This is used to show the onboarding screen after 21st.dev sign-in
// Reset on logout
exports.anthropicOnboardingCompletedAtom = (0, signal_storage_1.createStoredSignal)("onboarding:anthropic-completed", false, undefined, { getOnInit: true });
// Whether user has completed API key configuration during onboarding
// Only relevant when billingMethod is "api-key"
exports.apiKeyOnboardingCompletedAtom = (0, signal_storage_1.createStoredSignal)("onboarding:api-key-completed", false, undefined, { getOnInit: true });
// Session info from SDK init message
// Contains MCP servers, plugins, available tools, and skills
// Persisted to localStorage so MCP tools are visible after page refresh
// Updated when a new chat session starts
exports.sessionInfoAtom = (0, signal_storage_1.createStoredSignal)("21st-session-info", null, undefined, { getOnInit: true });
exports.chatSourceModeAtom = (0, signal_storage_1.createStoredSignal)("agents:chat-source-mode", "local", undefined, { getOnInit: true });
// ============================================
// DEV TOOLS UNLOCK (Hidden feature)
// ============================================
// DevTools unlock state (hidden feature - click Beta tab 5 times to enable)
// Persisted per-session only (not in localStorage for security)
exports.devToolsUnlockedAtom = (0, solid_js_1.createSignal)(false);
