"use strict";
/**
 * Pure SolidJS state for agents feature
 *
 * This module exports signals directly (not wrapped in atoms).
 * Use: import { selectedAgentChatId, setSelectedAgentChatId } from "./state"
 *      In JSX: {selectedAgentChatId()}
 *      To update: setSelectedAgentChatId("new-id")
 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentsFocusedDiffFile = exports.setAgentsDiffSidebarOpen = exports.agentsDiffSidebarOpen = exports.setDiffViewDisplayMode = exports.diffViewDisplayMode = exports.setAgentsChangesPanelCollapsed = exports.agentsChangesPanelCollapsed = exports.setAgentsChangesPanelWidth = exports.agentsChangesPanelWidth = exports.setAgentsDiffSidebarWidth = exports.agentsDiffSidebarWidth = exports.setAgentsPreviewSidebarOpen = exports.agentsPreviewSidebarOpen = exports.setAgentsPreviewSidebarWidth = exports.agentsPreviewSidebarWidth = exports.mobileDeviceFamily = exports.previewScaleFamily = exports.viewportModeFamily = exports.previewPathFamily = exports.setAgentsSubChatsSidebarWidth = exports.agentsSubChatsSidebarWidth = exports.setAgentsSubChatsSidebarMode = exports.agentsSubChatsSidebarMode = exports.setAgentsSidebarWidth = exports.agentsSidebarWidth = exports.setAgentsSidebarOpen = exports.agentsSidebarOpen = exports.subChatModeFamily = exports.setLastSelectedModelId = exports.lastSelectedModelId = exports.setLastSelectedAgentId = exports.lastSelectedAgentId = exports.setSelectedProject = exports.selectedProject = exports.setLastSelectedRepo = exports.lastSelectedRepo = exports.setLoadingSubChats = exports.loadingSubChats = exports.setShowNewChatForm = exports.showNewChatForm = exports.setSelectedDraftId = exports.selectedDraftId = exports.setPreviousAgentChatId = exports.previousAgentChatId = exports.setSelectedChatIsRemote = exports.selectedChatIsRemote = exports.setSelectedAgentChatId = exports.selectedAgentChatId = exports.MODEL_ID_MAP = exports.AGENT_MODES = void 0;
exports.setLastChatModes = exports.lastChatModes = exports.diffFilesCollapsedFamily = exports.setPendingAuthRetryMessage = exports.pendingAuthRetryMessage = exports.setPendingConflictResolutionMessage = exports.pendingConflictResolutionMessage = exports.setPendingReviewMessage = exports.pendingReviewMessage = exports.setPendingPrMessage = exports.pendingPrMessage = exports.setSelectedCommit = exports.selectedCommit = exports.setFilteredSubChatId = exports.filteredSubChatId = exports.setIsCreatingPr = exports.isCreatingPr = exports.setSelectedDiffFilePath = exports.selectedDiffFilePath = exports.setFilteredDiffFiles = exports.filteredDiffFiles = exports.setSubChatToChatMap = exports.subChatToChatMap = exports.setSubChatFiles = exports.subChatFiles = exports.setAgentsDebugMode = exports.agentsDebugMode = exports.setAgentsMobileViewMode = exports.agentsMobileViewMode = exports.setArchiveRepositoryFilter = exports.archiveRepositoryFilter = exports.setArchiveSearchQuery = exports.archiveSearchQuery = exports.setArchivePopoverOpen = exports.archivePopoverOpen = exports.currentTodosFamily = exports.setAgentsSubChatUnseenChanges = exports.agentsSubChatUnseenChanges = exports.setAgentsUnseenChanges = exports.agentsUnseenChanges = exports.setAgentsFocusedDiffFile = void 0;
exports.getNextMode = getNextMode;
exports.setLoadingSubChat = setLoadingSubChat;
exports.clearLoadingSubChat = clearLoadingSubChat;
exports.getSubChatMode = getSubChatMode;
exports.setSubChatMode = setSubChatMode;
exports.getDiffSidebarOpen = getDiffSidebarOpen;
exports.setDiffSidebarOpen = setDiffSidebarOpen;
exports.markChatAsSeen = markChatAsSeen;
exports.markChatAsUnseen = markChatAsUnseen;
exports.setLastChatMode = setLastChatMode;
var solid_js_1 = require("solid-js");
var set_1 = require("@solid-primitives/set");
var signals_1 = require("../../lib/state/signals");
// ============================================
// Constants
// ============================================
exports.AGENT_MODES = ["agent", "plan"];
function getNextMode(current) {
    var idx = exports.AGENT_MODES.indexOf(current);
    return exports.AGENT_MODES[(idx + 1) % exports.AGENT_MODES.length];
}
exports.MODEL_ID_MAP = {
    opus: "opus",
    sonnet: "sonnet",
    haiku: "haiku",
};
// ============================================
// Chat State
// ============================================
/** Selected agent chat ID - null means "new chat" view */
exports.selectedAgentChatId = (_a = (0, signals_1.createWindowState)("agents:selectedChatId", null, { getOnInit: true }), _a[0]), exports.setSelectedAgentChatId = _a[1];
/** Whether the selected chat is a remote (sandbox) chat */
exports.selectedChatIsRemote = (_b = (0, signals_1.createWindowState)("agents:selectedChatIsRemote", false, { getOnInit: true }), _b[0]), exports.setSelectedChatIsRemote = _b[1];
/** Previous agent chat ID - used to navigate back after archiving */
exports.previousAgentChatId = (_c = (0, solid_js_1.createSignal)(null), _c[0]), exports.setPreviousAgentChatId = _c[1];
/** Selected draft ID - for restoring draft text in NewChatForm */
exports.selectedDraftId = (_d = (0, solid_js_1.createSignal)(null), _d[0]), exports.setSelectedDraftId = _d[1];
/** Show new chat form explicitly */
exports.showNewChatForm = (_e = (0, solid_js_1.createSignal)(true), _e[0]), exports.setShowNewChatForm = _e[1];
// ============================================
// Loading State
// ============================================
/** Loading sub-chats: Map<subChatId, parentChatId> */
exports.loadingSubChats = (_f = (0, solid_js_1.createSignal)(new Map()), _f[0]), exports.setLoadingSubChats = _f[1];
/** Helper to set loading state */
function setLoadingSubChat(subChatId, parentChatId) {
    (0, exports.setLoadingSubChats)(function (prev) {
        if (prev.get(subChatId) === parentChatId)
            return prev;
        var next = new Map(prev);
        next.set(subChatId, parentChatId);
        return next;
    });
}
/** Helper to clear loading state */
function clearLoadingSubChat(subChatId) {
    (0, exports.setLoadingSubChats)(function (prev) {
        if (!prev.has(subChatId))
            return prev;
        var next = new Map(prev);
        next.delete(subChatId);
        return next;
    });
}
// ============================================
// Preferences (Persisted)
// ============================================
exports.lastSelectedRepo = (_g = (0, signals_1.createStoredState)("agents:lastSelectedRepo", null, { getOnInit: true }), _g[0]), exports.setLastSelectedRepo = _g[1];
exports.selectedProject = (_h = (0, signals_1.createWindowState)("agents:selectedProject", null, { getOnInit: true }), _h[0]), exports.setSelectedProject = _h[1];
exports.lastSelectedAgentId = (_j = (0, signals_1.createStoredState)("agents:lastSelectedAgentId", "claude-code", { getOnInit: true }), _j[0]), exports.setLastSelectedAgentId = _j[1];
exports.lastSelectedModelId = (_k = (0, signals_1.createStoredState)("agents:lastSelectedModelId", "sonnet", { getOnInit: true }), _k[0]), exports.setLastSelectedModelId = _k[1];
// ============================================
// Mode State (Per Sub-Chat)
// ============================================
var subChatModesStorage = (0, signals_1.createStoredState)("agents:subChatModes", {}, { getOnInit: true });
exports.subChatModeFamily = (0, signals_1.createKeyedStateFamily)("agent");
function getSubChatMode(subChatId) {
    var _a;
    // Check runtime state first, then storage
    var runtimeMode = exports.subChatModeFamily.getValue(subChatId)();
    if (runtimeMode !== "agent" || exports.subChatModeFamily.get(subChatId)[0]() !== "agent") {
        return runtimeMode;
    }
    // Fall back to persisted storage
    var stored = subChatModesStorage[0]();
    return (_a = stored[subChatId]) !== null && _a !== void 0 ? _a : "agent";
}
function setSubChatMode(subChatId, mode) {
    (0, solid_js_1.batch)(function () {
        var _a;
        exports.subChatModeFamily.setValue(subChatId, mode);
        var current = subChatModesStorage[0]();
        subChatModesStorage[1](__assign(__assign({}, current), (_a = {}, _a[subChatId] = mode, _a)));
    });
}
// ============================================
// Sidebar State
// ============================================
exports.agentsSidebarOpen = (_l = (0, signals_1.createWindowState)("agents-sidebar-open", true, { getOnInit: true }), _l[0]), exports.setAgentsSidebarOpen = _l[1];
exports.agentsSidebarWidth = (_m = (0, signals_1.createStoredState)("agents-sidebar-width", 224, { getOnInit: true }), _m[0]), exports.setAgentsSidebarWidth = _m[1];
exports.agentsSubChatsSidebarMode = (_o = (0, signals_1.createWindowState)("agents-subchats-mode", "tabs", { getOnInit: true }), _o[0]), exports.setAgentsSubChatsSidebarMode = _o[1];
exports.agentsSubChatsSidebarWidth = (_p = (0, signals_1.createStoredState)("agents-subchats-sidebar-width", 200, { getOnInit: true }), _p[0]), exports.setAgentsSubChatsSidebarWidth = _p[1];
// ============================================
// Preview State
// ============================================
var previewPathsStorage = (0, signals_1.createStoredState)("agents:previewPaths", {}, { getOnInit: true });
exports.previewPathFamily = {
    get: function (chatId) {
        var _a;
        var stored = previewPathsStorage[0]();
        return (_a = stored[chatId]) !== null && _a !== void 0 ? _a : "/";
    },
    set: function (chatId, path) {
        var _a;
        var current = previewPathsStorage[0]();
        previewPathsStorage[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = path, _a)));
    },
};
var viewportModesStorage = (0, signals_1.createStoredState)("agents:viewportModes", {}, { getOnInit: true });
exports.viewportModeFamily = {
    get: function (chatId) {
        var _a;
        var stored = viewportModesStorage[0]();
        return (_a = stored[chatId]) !== null && _a !== void 0 ? _a : "desktop";
    },
    set: function (chatId, mode) {
        var _a;
        var current = viewportModesStorage[0]();
        viewportModesStorage[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = mode, _a)));
    },
};
var previewScalesStorage = (0, signals_1.createStoredState)("agents:previewScales", {}, { getOnInit: true });
exports.previewScaleFamily = {
    get: function (chatId) {
        var _a;
        var stored = previewScalesStorage[0]();
        return (_a = stored[chatId]) !== null && _a !== void 0 ? _a : 100;
    },
    set: function (chatId, scale) {
        var _a;
        var current = previewScalesStorage[0]();
        previewScalesStorage[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = scale, _a)));
    },
};
var mobileDevicesStorage = (0, signals_1.createStoredState)("agents:mobileDevices", {}, { getOnInit: true });
var defaultMobileDevice = {
    width: 393,
    height: 852,
    preset: "iPhone 16",
};
exports.mobileDeviceFamily = {
    get: function (chatId) {
        var _a;
        var stored = mobileDevicesStorage[0]();
        return (_a = stored[chatId]) !== null && _a !== void 0 ? _a : defaultMobileDevice;
    },
    set: function (chatId, device) {
        var _a;
        var current = mobileDevicesStorage[0]();
        mobileDevicesStorage[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = device, _a)));
    },
};
exports.agentsPreviewSidebarWidth = (_q = (0, signals_1.createStoredState)("agents-preview-sidebar-width", 500, { getOnInit: true }), _q[0]), exports.setAgentsPreviewSidebarWidth = _q[1];
exports.agentsPreviewSidebarOpen = (_r = (0, signals_1.createWindowState)("agents-preview-sidebar-open", true, { getOnInit: true }), _r[0]), exports.setAgentsPreviewSidebarOpen = _r[1];
// ============================================
// Diff State
// ============================================
exports.agentsDiffSidebarWidth = (_s = (0, signals_1.createStoredState)("agents-diff-sidebar-width", 800, { getOnInit: true }), _s[0]), exports.setAgentsDiffSidebarWidth = _s[1];
exports.agentsChangesPanelWidth = (_t = (0, signals_1.createStoredState)("agents-changes-panel-width", 280, { getOnInit: true }), _t[0]), exports.setAgentsChangesPanelWidth = _t[1];
exports.agentsChangesPanelCollapsed = (_u = (0, signals_1.createStoredState)("agents-changes-panel-collapsed", true, { getOnInit: true }), _u[0]), exports.setAgentsChangesPanelCollapsed = _u[1];
exports.diffViewDisplayMode = (_v = (0, signals_1.createStoredState)("agents:diffViewDisplayMode", "center-peek", { getOnInit: true }), _v[0]), exports.setDiffViewDisplayMode = _v[1];
var diffSidebarOpenStorage = (0, signals_1.createWindowState)("agents:diffSidebarOpen", {}, { getOnInit: true });
var diffSidebarOpenRuntime = (0, solid_js_1.createSignal)({});
function getDiffSidebarOpen(chatId) {
    var _a;
    var runtime = diffSidebarOpenRuntime[0]();
    if (runtime[chatId] !== undefined) {
        return runtime[chatId];
    }
    if (exports.diffViewDisplayMode[0]() !== "side-peek") {
        return false;
    }
    var stored = diffSidebarOpenStorage[0]();
    return (_a = stored[chatId]) !== null && _a !== void 0 ? _a : false;
}
function setDiffSidebarOpen(chatId, isOpen) {
    var currentValue = getDiffSidebarOpen(chatId);
    var nextValue = typeof isOpen === "function" ? isOpen(currentValue) : isOpen;
    (0, solid_js_1.batch)(function () {
        var _a;
        diffSidebarOpenRuntime[1](function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[chatId] = nextValue, _a)));
        });
        var stored = diffSidebarOpenStorage[0]();
        diffSidebarOpenStorage[1](__assign(__assign({}, stored), (_a = {}, _a[chatId] = nextValue, _a)));
    });
}
/** Legacy global atom - kept for backwards compatibility */
exports.agentsDiffSidebarOpen = (_w = (0, signals_1.createWindowState)("agents-diff-sidebar-open", false, { getOnInit: true }), _w[0]), exports.setAgentsDiffSidebarOpen = _w[1];
exports.agentsFocusedDiffFile = (_x = (0, solid_js_1.createSignal)(null), _x[0]), exports.setAgentsFocusedDiffFile = _x[1];
// ============================================
// Unseen Changes Tracking
// ============================================
exports.agentsUnseenChanges = (_y = (0, solid_js_1.createSignal)(new set_1.ReactiveSet()), _y[0]), exports.setAgentsUnseenChanges = _y[1];
function markChatAsSeen(chatId) {
    (0, exports.setAgentsUnseenChanges)(function (prev) {
        if (!prev.has(chatId))
            return prev;
        var next = new set_1.ReactiveSet(prev);
        next.delete(chatId);
        return next;
    });
}
function markChatAsUnseen(chatId) {
    (0, exports.setAgentsUnseenChanges)(function (prev) {
        if (prev.has(chatId))
            return prev;
        var next = new set_1.ReactiveSet(prev);
        next.add(chatId);
        return next;
    });
}
exports.agentsSubChatUnseenChanges = (_z = (0, solid_js_1.createSignal)(new set_1.ReactiveSet()), _z[0]), exports.setAgentsSubChatUnseenChanges = _z[1];
// ============================================
// Todos
// ============================================
var allTodosStorage = (0, solid_js_1.createSignal)({});
exports.currentTodosFamily = {
    get: function (subChatId) {
        var _a;
        var stored = allTodosStorage[0]();
        return (_a = stored[subChatId]) !== null && _a !== void 0 ? _a : { todos: [], creationToolCallId: null };
    },
    set: function (subChatId, state) {
        var _a;
        var current = allTodosStorage[0]();
        allTodosStorage[1](__assign(__assign({}, current), (_a = {}, _a[subChatId] = state, _a)));
    },
    update: function (subChatId, updater) {
        var _a;
        var _b;
        var current = allTodosStorage[0]();
        var prev = (_b = current[subChatId]) !== null && _b !== void 0 ? _b : { todos: [], creationToolCallId: null };
        allTodosStorage[1](__assign(__assign({}, current), (_a = {}, _a[subChatId] = updater(prev), _a)));
    },
};
// ============================================
// Archive State
// ============================================
exports.archivePopoverOpen = (_0 = (0, solid_js_1.createSignal)(false), _0[0]), exports.setArchivePopoverOpen = _0[1];
exports.archiveSearchQuery = (_1 = (0, solid_js_1.createSignal)(""), _1[0]), exports.setArchiveSearchQuery = _1[1];
exports.archiveRepositoryFilter = (_2 = (0, solid_js_1.createSignal)(null), _2[0]), exports.setArchiveRepositoryFilter = _2[1];
// ============================================
// Mobile & Debug State
// ============================================
exports.agentsMobileViewMode = (_3 = (0, solid_js_1.createSignal)("chat"), _3[0]), exports.setAgentsMobileViewMode = _3[1];
exports.agentsDebugMode = (_4 = (0, signals_1.createStoredState)("agents:debugMode", {
    enabled: false,
    simulateNoTeams: false,
    simulateNoRepos: false,
    simulateNoReadyRepos: false,
    resetOnboarding: false,
    bypassConnections: false,
    forceStep: null,
    simulateCompleted: false,
}, { getOnInit: true }), _4[0]), exports.setAgentsDebugMode = _4[1];
// ============================================
// File Tracking
// ============================================
exports.subChatFiles = (_5 = (0, solid_js_1.createSignal)(new Map()), _5[0]), exports.setSubChatFiles = _5[1];
exports.subChatToChatMap = (_6 = (0, solid_js_1.createSignal)(new Map()), _6[0]), exports.setSubChatToChatMap = _6[1];
exports.filteredDiffFiles = (_7 = (0, solid_js_1.createSignal)(null), _7[0]), exports.setFilteredDiffFiles = _7[1];
exports.selectedDiffFilePath = (_8 = (0, solid_js_1.createSignal)(null), _8[0]), exports.setSelectedDiffFilePath = _8[1];
// ============================================
// PR & Commit State
// ============================================
exports.isCreatingPr = (_9 = (0, solid_js_1.createSignal)(false), _9[0]), exports.setIsCreatingPr = _9[1];
exports.filteredSubChatId = (_10 = (0, solid_js_1.createSignal)(null), _10[0]), exports.setFilteredSubChatId = _10[1];
exports.selectedCommit = (_11 = (0, solid_js_1.createSignal)(null), _11[0]), exports.setSelectedCommit = _11[1];
exports.pendingPrMessage = (_12 = (0, solid_js_1.createSignal)(null), _12[0]), exports.setPendingPrMessage = _12[1];
exports.pendingReviewMessage = (_13 = (0, solid_js_1.createSignal)(null), _13[0]), exports.setPendingReviewMessage = _13[1];
exports.pendingConflictResolutionMessage = (_14 = (0, solid_js_1.createSignal)(null), _14[0]), exports.setPendingConflictResolutionMessage = _14[1];
exports.pendingAuthRetryMessage = (_15 = (0, solid_js_1.createSignal)(null), _15[0]), exports.setPendingAuthRetryMessage = _15[1];
// ============================================
// Diff Files Collapsed State
// ============================================
var diffFilesCollapsedStorage = (0, solid_js_1.createSignal)({});
exports.diffFilesCollapsedFamily = {
    get: function (chatId, fileKey) {
        var _a, _b;
        var stored = diffFilesCollapsedStorage[0]();
        return (_b = (_a = stored[chatId]) === null || _a === void 0 ? void 0 : _a[fileKey]) !== null && _b !== void 0 ? _b : false;
    },
    set: function (chatId, fileKey, collapsed) {
        var _a, _b;
        var _c;
        var current = diffFilesCollapsedStorage[0]();
        var chatCollapsed = (_c = current[chatId]) !== null && _c !== void 0 ? _c : {};
        diffFilesCollapsedStorage[1](__assign(__assign({}, current), (_a = {}, _a[chatId] = __assign(__assign({}, chatCollapsed), (_b = {}, _b[fileKey] = collapsed, _b)), _a)));
    },
};
// ============================================
// Last Chat Modes
// ============================================
exports.lastChatModes = (_16 = (0, solid_js_1.createSignal)(new Map()), _16[0]), exports.setLastChatModes = _16[1];
function setLastChatMode(chatId, mode) {
    (0, exports.setLastChatModes)(function (prev) {
        if (prev.get(chatId) === mode)
            return prev;
        var next = new Map(prev);
        next.set(chatId, mode);
        return next;
    });
}
