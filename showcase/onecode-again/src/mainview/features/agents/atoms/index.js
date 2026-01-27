"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingPrMessageAtom = exports.selectedCommitAtom = exports.filteredSubChatIdAtom = exports.isCreatingPrAtom = exports.selectedDiffFilePathAtom = exports.filteredDiffFilesAtom = exports.subChatToChatMapAtom = exports.subChatFilesAtom = exports.agentsDebugModeAtom = exports.agentsMobileViewModeAtom = exports.lastChatModesAtom = exports.archiveRepositoryFilterAtom = exports.archiveSearchQueryAtom = exports.archivePopoverOpenAtom = exports.agentsSubChatUnseenChangesAtom = exports.currentTodosAtomFamily = exports.agentsUnseenChangesAtom = exports.agentsSubChatsSidebarWidthAtom = exports.agentsSubChatsSidebarModeAtom = exports.diffFilesCollapsedAtomFamily = exports.agentsFocusedDiffFileAtom = exports.agentsDiffSidebarOpenAtom = exports.diffSidebarOpenAtomFamily = exports.diffViewDisplayModeAtom = exports.agentsChangesPanelCollapsedAtom = exports.agentsChangesPanelWidthAtom = exports.agentsDiffSidebarWidthAtom = exports.agentsPreviewSidebarOpenAtom = exports.agentsPreviewSidebarWidthAtom = exports.agentsSidebarWidthAtom = exports.agentsSidebarOpenAtom = exports.MODEL_ID_MAP = exports.subChatModeAtomFamily = exports.lastSelectedModelIdAtom = exports.lastSelectedAgentIdAtom = exports.selectedProjectAtom = exports.lastSelectedRepoAtom = exports.clearLoading = exports.setLoading = exports.loadingSubChatsAtom = exports.mobileDeviceAtomFamily = exports.previewScaleAtomFamily = exports.viewportModeAtomFamily = exports.previewPathAtomFamily = exports.showNewChatFormAtom = exports.selectedDraftIdAtom = exports.previousAgentChatIdAtom = exports.selectedChatIsRemoteAtom = exports.selectedAgentChatIdAtom = exports.AGENT_MODES = void 0;
exports.workspaceDiffCacheAtomFamily = exports.planEditRefetchTriggerAtomFamily = exports.currentPlanPathAtomFamily = exports.planSidebarOpenAtomFamily = exports.agentsPlanSidebarWidthAtom = exports.openLocallyChatIdAtom = exports.viewedFilesAtomFamily = exports.undoStackAtom = exports.askUserQuestionResultsAtom = exports.pendingBuildPlanSubChatIdAtom = exports.pendingPlanApprovalsAtom = exports.pendingUserQuestionsAtom = exports.QUESTIONS_TIMED_OUT_MESSAGE = exports.QUESTIONS_SKIPPED_MESSAGE = exports.justCreatedIdsAtom = exports.compactingSubChatsAtom = exports.lastSelectedBranchesAtom = exports.lastSelectedWorkModeAtom = exports.pendingAuthRetryMessageAtom = exports.pendingConflictResolutionMessageAtom = exports.pendingReviewMessageAtom = void 0;
exports.getNextMode = getNextMode;
var solid_js_1 = require("solid-js");
var set_1 = require("@solid-primitives/set");
var signal_storage_1 = require("../../../lib/state/signal-storage");
var signal_map_1 = require("../../../lib/state/signal-map");
var window_storage_1 = require("../../../lib/window-storage");
// Ordered list of modes - Shift+Tab cycles through these
exports.AGENT_MODES = ["agent", "plan"];
// Get next mode in cycle (for Shift+Tab toggle)
function getNextMode(current) {
    var idx = exports.AGENT_MODES.indexOf(current);
    return exports.AGENT_MODES[(idx + 1) % exports.AGENT_MODES.length];
}
// Selected agent chat ID - null means "new chat" view (persisted to restore on reload)
// Uses window-scoped storage so each Electron window can have its own selected chat
exports.selectedAgentChatIdAtom = (0, window_storage_1.atomWithWindowStorage)("agents:selectedChatId", null, { getOnInit: true });
// Whether the selected chat is a remote (sandbox) chat
// This is needed because remote and local chats may have the same ID
exports.selectedChatIsRemoteAtom = (0, window_storage_1.atomWithWindowStorage)("agents:selectedChatIsRemote", false, { getOnInit: true });
// Previous agent chat ID - used to navigate back after archiving current chat
// Not persisted - only tracks within current session
exports.previousAgentChatIdAtom = (0, solid_js_1.createSignal)(null);
// Selected draft ID - when user clicks on a draft in sidebar, this is set
// NewChatForm uses this to restore the draft text
// Reset to null when "New Workspace" is clicked or chat is created
exports.selectedDraftIdAtom = (0, solid_js_1.createSignal)(null);
// Show new chat form explicitly - true by default so new users see the form, not kanban
// Set to false when kanban is explicitly opened (via hotkey or button)
// Set to true when "New Workspace" is clicked
exports.showNewChatFormAtom = (0, solid_js_1.createSignal)(true);
// Preview paths storage - stores all preview paths keyed by chatId
var previewPathsStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:previewPaths", {}, undefined, { getOnInit: true });
// atomFamily to get/set preview path per chatId
exports.previewPathAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(previewPathsStorageAtom, "/");
// Preview viewport modes storage - stores viewport mode per chatId
var viewportModesStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:viewportModes", {}, undefined, { getOnInit: true });
// atomFamily to get/set viewport mode per chatId
exports.viewportModeAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(viewportModesStorageAtom, "desktop");
// Preview scales storage - stores scale per chatId
var previewScalesStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:previewScales", {}, undefined, { getOnInit: true });
// atomFamily to get/set preview scale per chatId
exports.previewScaleAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(previewScalesStorageAtom, 100);
var mobileDevicesStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:mobileDevices", {}, undefined, { getOnInit: true });
// atomFamily to get/set mobile device settings per chatId
exports.mobileDeviceAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(mobileDevicesStorageAtom, {
    width: 393,
    height: 852,
    preset: "iPhone 16",
});
// Loading sub-chats: Map<subChatId, parentChatId>
// Used to show loading indicators on tabs and sidebar
// Set when generation starts, cleared when onFinish fires
exports.loadingSubChatsAtom = (0, solid_js_1.createSignal)(new Map());
// Helper to set loading state
var setLoading = function (setter, subChatId, parentChatId) {
    setter(function (prev) {
        // Only create new Map if value actually changed
        // This prevents unnecessary re-renders
        if (prev.get(subChatId) === parentChatId)
            return prev;
        var next = new Map(prev);
        next.set(subChatId, parentChatId);
        return next;
    });
};
exports.setLoading = setLoading;
// Helper to clear loading state
var clearLoading = function (setter, subChatId) {
    setter(function (prev) {
        // Only create new Map if subChatId was actually in loading state
        // This prevents unnecessary re-renders when switching between non-loading sub-chats
        if (!prev.has(subChatId))
            return prev;
        var next = new Map(prev);
        next.delete(subChatId);
        return next;
    });
};
exports.clearLoading = clearLoading;
exports.lastSelectedRepoAtom = (0, signal_storage_1.createStoredSignal)("agents:lastSelectedRepo", null, undefined, { getOnInit: true });
// Selected local project - uses window-scoped storage so each window can work with different projects
exports.selectedProjectAtom = (0, window_storage_1.atomWithWindowStorage)("agents:selectedProject", null, { getOnInit: true });
exports.lastSelectedAgentIdAtom = (0, signal_storage_1.createStoredSignal)("agents:lastSelectedAgentId", "claude-code", undefined, { getOnInit: true });
exports.lastSelectedModelIdAtom = (0, signal_storage_1.createStoredSignal)("agents:lastSelectedModelId", "sonnet", undefined, { getOnInit: true });
// Storage for all sub-chat modes (persisted per subChatId)
var subChatModesStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:subChatModes", {}, undefined, { getOnInit: true });
// atomFamily to get/set mode per subChatId
exports.subChatModeAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(subChatModesStorageAtom, "agent");
// Model ID to full Claude model string mapping
exports.MODEL_ID_MAP = {
    opus: "opus",
    sonnet: "sonnet",
    haiku: "haiku",
};
// Sidebar state - window-scoped so each window has independent sidebar visibility
exports.agentsSidebarOpenAtom = (0, window_storage_1.atomWithWindowStorage)("agents-sidebar-open", true, { getOnInit: true });
// Sidebar width with localStorage persistence
exports.agentsSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-sidebar-width", 224, undefined, { getOnInit: true });
// Preview sidebar (right) width and open state
exports.agentsPreviewSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-preview-sidebar-width", 500, undefined, { getOnInit: true });
// Preview sidebar open state - window-scoped
exports.agentsPreviewSidebarOpenAtom = (0, window_storage_1.atomWithWindowStorage)("agents-preview-sidebar-open", true, { getOnInit: true });
// Diff sidebar (right) width (global - same width for all chats)
exports.agentsDiffSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-diff-sidebar-width", 800, undefined, { getOnInit: true });
// Changes panel (file list) width within the diff sidebar
exports.agentsChangesPanelWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-changes-panel-width", 280, undefined, { getOnInit: true });
// Changes panel collapsed state in narrow view (collapsed by default)
exports.agentsChangesPanelCollapsedAtom = (0, signal_storage_1.createStoredSignal)("agents-changes-panel-collapsed", true, // collapsed by default
undefined, { getOnInit: true });
exports.diffViewDisplayModeAtom = (0, signal_storage_1.createStoredSignal)("agents:diffViewDisplayMode", "center-peek", // default to dialog for new users
undefined, { getOnInit: true });
// Diff sidebar open state storage - window-scoped, stores per chatId
var diffSidebarOpenStorageAtom = (0, window_storage_1.atomWithWindowStorage)("agents:diffSidebarOpen", {}, { getOnInit: true });
// Runtime open state - not persisted, used for dialog/fullscreen modes
var diffSidebarOpenRuntimeAtom = (0, solid_js_1.createSignal)({});
// atomFamily to get/set diff sidebar open state per chatId
// Only restores persisted state when display mode is "side-peek" (sidebar mode)
// For dialog/fullscreen modes, we use runtime state only (not auto-restored on page load)
exports.diffSidebarOpenAtomFamily = (0, signal_map_1.createSignalMap)(function (chatId) {
    var get = function () {
        var _a;
        var displayMode = exports.diffViewDisplayModeAtom[0]();
        var runtimeOpen = diffSidebarOpenRuntimeAtom[0]()[chatId];
        if (runtimeOpen !== undefined) {
            return runtimeOpen;
        }
        if (displayMode !== "side-peek") {
            return false;
        }
        return (_a = diffSidebarOpenStorageAtom[0]()[chatId]) !== null && _a !== void 0 ? _a : false;
    };
    var set = function (value) {
        var _a, _b;
        var currentValue = get();
        var isOpen = typeof value === "function" ? value(currentValue) : value;
        var currentRuntime = diffSidebarOpenRuntimeAtom[0]();
        diffSidebarOpenRuntimeAtom[1](__assign(__assign({}, currentRuntime), (_a = {}, _a[chatId] = isOpen, _a)));
        var current = diffSidebarOpenStorageAtom[0]();
        diffSidebarOpenStorageAtom[1](__assign(__assign({}, current), (_b = {}, _b[chatId] = isOpen, _b)));
    };
    return [get, set];
});
// Legacy global atom - kept for backwards compatibility, maps to empty string key
// TODO: Remove after migration
exports.agentsDiffSidebarOpenAtom = (0, window_storage_1.atomWithWindowStorage)("agents-diff-sidebar-open", false, { getOnInit: true });
// Focused file path in diff sidebar (for scroll-to-file feature)
// Set by AgentEditTool on click, consumed by AgentDiffView
exports.agentsFocusedDiffFileAtom = (0, solid_js_1.createSignal)(null);
// Collapsed state for diff files per chat - preserved across narrow/wide layout changes
// Map<fileKey, isCollapsed>
var diffFilesCollapsedStorageAtom = (0, solid_js_1.createSignal)({});
exports.diffFilesCollapsedAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(diffFilesCollapsedStorageAtom, {});
// Sub-chats display mode - tabs (horizontal) or sidebar (vertical list)
// Window-scoped so each window can have its own layout preference
exports.agentsSubChatsSidebarModeAtom = (0, window_storage_1.atomWithWindowStorage)("agents-subchats-mode", "tabs", { getOnInit: true });
// Sub-chats sidebar width (left side of chat area)
exports.agentsSubChatsSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-subchats-sidebar-width", 200, undefined, { getOnInit: true });
// Track chats with unseen changes (finished streaming but user hasn't opened them)
// Updated by onFinish callback in Chat instances
exports.agentsUnseenChangesAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
var allTodosStorageAtom = (0, solid_js_1.createSignal)({});
// atomFamily to get/set todos per subChatId
exports.currentTodosAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(allTodosStorageAtom, { todos: [], creationToolCallId: null });
// Track sub-chats with unseen changes (finished streaming but user hasn't viewed them)
// Updated by onFinish callback in Chat instances
exports.agentsSubChatUnseenChangesAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
// Archive popover open state
exports.archivePopoverOpenAtom = (0, solid_js_1.createSignal)(false);
// Search query for archive
exports.archiveSearchQueryAtom = (0, solid_js_1.createSignal)("");
// Repository filter for archive (null = all repositories)
exports.archiveRepositoryFilterAtom = (0, solid_js_1.createSignal)(null);
// Track last used mode (plan/agent) per chat
// Map<chatId, "plan" | "agent">
exports.lastChatModesAtom = (0, solid_js_1.createSignal)(new Map());
exports.agentsMobileViewModeAtom = (0, solid_js_1.createSignal)("chat");
exports.agentsDebugModeAtom = (0, signal_storage_1.createStoredSignal)("agents:debugMode", {
    enabled: false,
    simulateNoTeams: false,
    simulateNoRepos: false,
    simulateNoReadyRepos: false,
    resetOnboarding: false,
    bypassConnections: false,
    forceStep: null,
    simulateCompleted: false,
}, undefined, { getOnInit: true });
exports.subChatFilesAtom = (0, solid_js_1.createSignal)(new Map());
// Mapping from subChatId to chatId (workspace ID) for aggregating stats
// Map<subChatId, chatId>
exports.subChatToChatMapAtom = (0, solid_js_1.createSignal)(new Map());
// Filter files for diff sidebar (null = show all files)
// When set, AgentDiffView will only show files matching these paths
exports.filteredDiffFilesAtom = (0, solid_js_1.createSignal)(null);
// Selected file path in diff sidebar (for highlighting in file list and showing in diff view)
// Using atom instead of useState to prevent re-renders of unrelated components
exports.selectedDiffFilePathAtom = (0, solid_js_1.createSignal)(null);
// PR creation loading state - atom to allow ChatViewInner to reset it after sending message
exports.isCreatingPrAtom = (0, solid_js_1.createSignal)(false);
// Filter by subchat ID for diff sidebar and changes panel (null = show all)
// When set by Review button, both diff view and file list filter to this subchat's files
exports.filteredSubChatIdAtom = (0, solid_js_1.createSignal)(null);
exports.selectedCommitAtom = (0, solid_js_1.createSignal)(null);
// Pending PR message to send to chat
// Set by ChatView when "Create PR" is clicked, consumed by ChatViewInner
exports.pendingPrMessageAtom = (0, solid_js_1.createSignal)(null);
// Pending Review message to send to chat
// Set by ChatView when "Review" is clicked, consumed by ChatViewInner
exports.pendingReviewMessageAtom = (0, solid_js_1.createSignal)(null);
// Pending merge conflict resolution message to send to chat
// Set when user clicks "Fix Conflicts" button, consumed by ChatViewInner
exports.pendingConflictResolutionMessageAtom = (0, solid_js_1.createSignal)(null);
exports.pendingAuthRetryMessageAtom = (0, solid_js_1.createSignal)(null);
exports.lastSelectedWorkModeAtom = (0, signal_storage_1.createStoredSignal)("agents:lastSelectedWorkMode", "worktree", // default to worktree for current behavior
undefined, { getOnInit: true });
// Last selected branch per project (persisted)
// Maps projectId -> { name: string, type: "local" | "remote" }
// Custom storage with migration from old string format
var lastSelectedBranchesStorage = {
    getItem: function (key, initialValue) {
        var storedValue = localStorage.getItem(key);
        if (!storedValue)
            return initialValue;
        try {
            var parsed = JSON.parse(storedValue);
            // Migrate old format: Record<string, string> -> Record<string, { name, type }>
            var migrated = {};
            for (var _i = 0, _a = Object.entries(parsed); _i < _a.length; _i++) {
                var _b = _a[_i], projectId = _b[0], value = _b[1];
                if (typeof value === "string") {
                    // Old format: string branch name -> assume "local" type
                    migrated[projectId] = { name: value, type: "local" };
                }
                else if (value && typeof value === "object" && "name" in value && "type" in value) {
                    // New format: already migrated
                    migrated[projectId] = value;
                }
            }
            // Save migrated data back to localStorage
            if (Object.keys(migrated).length > 0) {
                localStorage.setItem(key, JSON.stringify(migrated));
            }
            return migrated;
        }
        catch (_c) {
            return initialValue;
        }
    },
    setItem: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: function (key) {
        localStorage.removeItem(key);
    },
};
exports.lastSelectedBranchesAtom = (0, signal_storage_1.createStoredSignal)("agents:lastSelectedBranches", {}, lastSelectedBranchesStorage, { getOnInit: true });
// Compacting status per sub-chat
// Set<subChatId> - subChats currently being compacted
exports.compactingSubChatsAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
// Track IDs of chats/subchats created in this browser session (NOT persisted - resets on reload)
// Used to determine whether to show placeholder + typewriter effect
exports.justCreatedIdsAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
// Pending user questions from AskUserQuestion tool
// Set when Claude requests user input, cleared when answered or skipped
exports.QUESTIONS_SKIPPED_MESSAGE = "User skipped questions - proceed with defaults";
exports.QUESTIONS_TIMED_OUT_MESSAGE = "Timed out";
// Map<subChatId, PendingUserQuestion> - supports multiple pending questions across workspaces
exports.pendingUserQuestionsAtom = (0, solid_js_1.createSignal)(new Map());
// Track sub-chats with pending plan approval (plan ready but not yet implemented)
// Map<subChatId, parentChatId> - allows filtering by workspace
exports.pendingPlanApprovalsAtom = (0, solid_js_1.createSignal)(new Map());
// Pending "Build plan" trigger - set by ChatView sidebar, consumed by ChatViewInner
// Contains subChatId to approve, null when no pending approval
exports.pendingBuildPlanSubChatIdAtom = (0, solid_js_1.createSignal)(null);
// Store AskUserQuestion results by toolUseId for real-time updates
// Map<toolUseId, result>
exports.askUserQuestionResultsAtom = (0, solid_js_1.createSignal)(new Map());
exports.undoStackAtom = (0, solid_js_1.createSignal)([]);
// Storage atom for viewed files per chat
// Structure: { [chatId]: { [fileKey]: ViewedFileState } }
var viewedFilesStorageAtom = (0, signal_storage_1.createStoredSignal)("agents:viewedFiles", {}, undefined, { getOnInit: true });
// atomFamily to get/set viewed files per chatId
exports.viewedFilesAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(viewedFilesStorageAtom, {});
// Open Locally dialog trigger - set to chatId to open dialog for that chat
exports.openLocallyChatIdAtom = (0, solid_js_1.createSignal)(null);
// Plan sidebar state atoms
// Plan sidebar width (global, persisted)
exports.agentsPlanSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("agents-plan-sidebar-width", 500, undefined, { getOnInit: true });
// Plan sidebar open state storage - stores per chatId (persisted)
// Uses window-scoped storage so each window can have independent plan sidebar states
var planSidebarOpenStorageAtom = (0, window_storage_1.atomWithWindowStorage)("agents:planSidebarOpen", {}, { getOnInit: true });
// atomFamily to get/set plan sidebar open state per chatId
exports.planSidebarOpenAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(planSidebarOpenStorageAtom, false);
// Current plan path storage - stores per chatId (runtime only, not persisted)
var currentPlanPathStorageAtom = (0, solid_js_1.createSignal)({});
// atomFamily to get/set current plan path per chatId
exports.currentPlanPathAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(currentPlanPathStorageAtom, null);
// Per-chat plan edit refetch trigger - incremented when an Edit on a plan file completes
// Used to trigger sidebar refetch when plan content changes
var planEditRefetchTriggerStorageAtom = (0, solid_js_1.createSignal)({});
exports.planEditRefetchTriggerAtomFamily = (0, signal_map_1.createSignalMap)(function (chatId) {
    var get = function () { var _a; return (_a = planEditRefetchTriggerStorageAtom[0]()[chatId]) !== null && _a !== void 0 ? _a : 0; };
    var set = function (value) {
        var _a;
        var _b;
        var current = planEditRefetchTriggerStorageAtom[0]();
        var prev = (_b = current[chatId]) !== null && _b !== void 0 ? _b : 0;
        var next = value === undefined
            ? prev + 1
            : typeof value === "function"
                ? value(prev)
                : value;
        planEditRefetchTriggerStorageAtom[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = next, _a)));
    };
    return [get, set];
});
// Default stats for loading state
var DEFAULT_DIFF_STATS = {
    fileCount: 0,
    additions: 0,
    deletions: 0,
    isLoading: true,
    hasChanges: false,
};
// Runtime cache for diff data per workspace (not persisted)
var workspaceDiffCacheStorageAtom = (0, solid_js_1.createSignal)({});
// Default cache value
var DEFAULT_DIFF_CACHE = {
    parsedFileDiffs: null,
    diffStats: DEFAULT_DIFF_STATS,
    prefetchedFileContents: {},
    diffContent: null,
};
exports.workspaceDiffCacheAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(workspaceDiffCacheStorageAtom, DEFAULT_DIFF_CACHE);
