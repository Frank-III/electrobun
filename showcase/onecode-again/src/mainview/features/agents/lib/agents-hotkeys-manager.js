"use strict";
/**
 * Hotkeys manager for Agents
 * Centralized keyboard shortcut handling
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAgentsHotkeys = useAgentsHotkeys;
var React = require("react");
var react_1 = require("react");
var agents_actions_1 = require("./agents-actions");
var hotkeys_1 = require("../../../lib/hotkeys");
// ============================================================================
// ACTION ID MAPPING
// ============================================================================
/**
 * Maps shortcut registry IDs to agent action IDs
 * This allows the shortcut system to work with the existing action system
 */
var SHORTCUT_TO_ACTION_MAP = {
    "show-shortcuts": "open-shortcuts",
    "open-settings": "open-settings",
    "toggle-sidebar": "toggle-sidebar",
    "toggle-details": "toggle-details",
    "undo-archive": "undo-archive",
    "new-workspace": "create-new-agent",
    "search-workspaces": "search-workspaces",
    "archive-workspace": "archive-workspace",
    "quick-switch-workspaces": "quick-switch-workspaces",
    "open-kanban": "open-kanban",
    "new-agent": "create-new-agent",
    "search-chats": "search-chats",
    "search-in-chat": "toggle-chat-search",
    "archive-agent": "archive-agent",
    "quick-switch-agents": "quick-switch-agents",
    "prev-agent": "prev-agent",
    "next-agent": "next-agent",
    "focus-input": "focus-input",
    "toggle-focus": "toggle-focus",
    "stop-generation": "stop-generation",
    "switch-model": "switch-model",
    "toggle-terminal": "toggle-terminal",
    "open-diff": "open-diff",
    "create-pr": "create-pr",
    "voice-input": "voice-input", // Handled directly in chat-input-area.tsx
};
// Reverse mapping: action ID -> shortcut ID
var ACTION_TO_SHORTCUT_MAP = Object.fromEntries(Object.entries(SHORTCUT_TO_ACTION_MAP).map(function (_a) {
    var k = _a[0], v = _a[1];
    return [v, k];
}));
// ============================================================================
// HOTKEY MATCHING
// ============================================================================
/**
 * Parse a hotkey string and match against a keyboard event
 * Supports: "?", "shift+?", "cmd+k", "cmd+shift+i"
 */
function matchesHotkey(e, hotkey) {
    var parts = hotkey.toLowerCase().split("+");
    var key = parts[parts.length - 1];
    var modifiers = parts.slice(0, -1);
    var needsMeta = modifiers.includes("cmd") || modifiers.includes("meta");
    var needsAlt = modifiers.includes("opt") || modifiers.includes("alt");
    var needsCtrl = modifiers.includes("ctrl");
    var needsShift = modifiers.includes("shift");
    // "?" requires shift implicitly
    if (key === "?" && !modifiers.includes("shift")) {
        needsShift = true;
    }
    if (needsMeta !== e.metaKey)
        return false;
    if (needsAlt !== e.altKey)
        return false;
    if (needsCtrl !== e.ctrlKey)
        return false;
    if (needsShift !== e.shiftKey)
        return false;
    var eventKey = e.key.toLowerCase();
    var eventCode = e.code.toLowerCase();
    if (eventKey === key)
        return true;
    if (key === "?" && eventKey === "?")
        return true;
    if (key === "/" && (eventKey === "/" || eventCode === "slash"))
        return true;
    if (key === "\\" && (eventKey === "\\" || eventCode === "backslash"))
        return true;
    if (key === "," && (eventKey === "," || eventCode === "comma"))
        return true;
    if (key.length === 1 && eventCode === "key".concat(key))
        return true;
    return false;
}
// Hotkeys that work even in inputs
var GLOBAL_HOTKEYS = new Set(["open-shortcuts"]);
// ============================================================================
// HOTKEYS MANAGER HOOK
// ============================================================================
function useAgentsHotkeys(config, options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var _a = options.enabled, enabled = _a === void 0 ? true : _a, _b = options.preventDefault, preventDefault = _b === void 0 ? true : _b;
    var createActionContext = (0, react_1.useCallback)(function () { return ({
        setSelectedChatId: config.setSelectedChatId,
        setSelectedDraftId: config.setSelectedDraftId,
        setShowNewChatForm: config.setShowNewChatForm,
        setSidebarOpen: config.setSidebarOpen,
        setSettingsDialogOpen: config.setSettingsDialogOpen,
        setSettingsActiveTab: config.setSettingsActiveTab,
        toggleChatSearch: config.toggleChatSearch,
        selectedChatId: config.selectedChatId,
    }); }, [
        config.setSelectedChatId,
        config.setSelectedDraftId,
        config.setShowNewChatForm,
        config.setSidebarOpen,
        config.setSettingsDialogOpen,
        config.setSettingsActiveTab,
        config.toggleChatSearch,
        config.selectedChatId,
    ]);
    var handleHotkeyAction = (0, react_1.useCallback)(function (actionId) { return __awaiter(_this, void 0, void 0, function () {
        var context, availableActions, action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = createActionContext();
                    availableActions = (0, agents_actions_1.getAvailableAgentActions)(context);
                    action = availableActions.find(function (a) { return a.id === actionId; });
                    if (!action)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, agents_actions_1.executeAgentAction)(actionId, context, "hotkey")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [createActionContext]);
    // Listen for Cmd+N via IPC from main process (menu accelerator)
    React.useEffect(function () {
        var _a;
        if (!enabled)
            return;
        if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.onShortcutNewAgent))
            return;
        var cleanup = window.desktopApi.onShortcutNewAgent(function () {
            console.log("[Hotkey] Cmd+N received via IPC, executing create-new-agent");
            handleHotkeyAction("create-new-agent");
        });
        return cleanup;
    }, [enabled, handleHotkeyAction]);
    // Get the resolved hotkey for a shortcut, respecting custom bindings
    var getHotkeyForAction = (0, react_1.useCallback)(function (shortcutId) {
        var customConfig = config.customHotkeysConfig || { version: 1, bindings: {} };
        return (0, hotkeys_1.getResolvedHotkey)(shortcutId, customConfig);
    }, [config.customHotkeysConfig]);
    // Unified hotkey listener that respects custom configurations
    React.useEffect(function () {
        if (!enabled)
            return;
        var handleKeyDown = function (e) {
            var activeElement = document.activeElement;
            var isInputFocused = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute("contenteditable")) === "true" ||
                (activeElement === null || activeElement === void 0 ? void 0 : activeElement.closest('[contenteditable="true"]'));
            // Check toggle-sidebar hotkey
            var toggleSidebarHotkey = getHotkeyForAction("toggle-sidebar");
            if (toggleSidebarHotkey && matchesHotkey(e, toggleSidebarHotkey)) {
                e.preventDefault();
                e.stopPropagation();
                handleHotkeyAction("toggle-sidebar");
                return;
            }
            // Check show-shortcuts hotkey (only when not in input)
            if (!isInputFocused) {
                var showShortcutsHotkey = getHotkeyForAction("show-shortcuts");
                if (showShortcutsHotkey && matchesHotkey(e, showShortcutsHotkey)) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleHotkeyAction("open-shortcuts");
                    return;
                }
            }
            // Check open-settings hotkey
            var openSettingsHotkey = getHotkeyForAction("open-settings");
            if (openSettingsHotkey && matchesHotkey(e, openSettingsHotkey)) {
                e.preventDefault();
                e.stopPropagation();
                handleHotkeyAction("open-settings");
                return;
            }
            // Check search-in-chat hotkey
            var searchInChatHotkey = getHotkeyForAction("search-in-chat");
            if (searchInChatHotkey && matchesHotkey(e, searchInChatHotkey)) {
                e.preventDefault();
                e.stopPropagation();
                handleHotkeyAction("toggle-chat-search");
                return;
            }
            // Check open-kanban hotkey (only if feature is enabled)
            if (config.betaKanbanEnabled) {
                var openKanbanHotkey = getHotkeyForAction("open-kanban");
                if (openKanbanHotkey && matchesHotkey(e, openKanbanHotkey)) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleHotkeyAction("open-kanban");
                    return;
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    }, [enabled, handleHotkeyAction, getHotkeyForAction, config.betaKanbanEnabled]);
    // General hotkey handler for remaining actions
    var actionsWithHotkeys = (0, react_1.useMemo)(function () {
        return Object.values(agents_actions_1.AGENT_ACTIONS).filter(function (action) {
            return action.hotkey !== undefined &&
                action.id !== "create-new-agent" &&
                action.id !== "toggle-sidebar" &&
                action.id !== "open-shortcuts" &&
                action.id !== "open-settings" &&
                action.id !== "toggle-chat-search";
        });
    }, []);
    var hotkeyMappings = (0, react_1.useMemo)(function () {
        var mappings = [];
        for (var _i = 0, actionsWithHotkeys_1 = actionsWithHotkeys; _i < actionsWithHotkeys_1.length; _i++) {
            var action = actionsWithHotkeys_1[_i];
            if (!action.hotkey)
                continue;
            var hotkeys = Array.isArray(action.hotkey)
                ? action.hotkey
                : [action.hotkey];
            var isGlobal = GLOBAL_HOTKEYS.has(action.id);
            mappings.push({
                actionId: action.id,
                hotkeys: hotkeys.filter(Boolean),
                isGlobal: isGlobal,
            });
        }
        return mappings;
    }, [actionsWithHotkeys]);
    React.useEffect(function () {
        if (!enabled)
            return;
        var handleKeyDown = function (e) {
            var target = e.target;
            var isInInput = target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;
            for (var _i = 0, hotkeyMappings_1 = hotkeyMappings; _i < hotkeyMappings_1.length; _i++) {
                var mapping = hotkeyMappings_1[_i];
                if (isInInput && !mapping.isGlobal)
                    continue;
                for (var _a = 0, _b = mapping.hotkeys; _a < _b.length; _a++) {
                    var hotkey = _b[_a];
                    if (matchesHotkey(e, hotkey)) {
                        if (preventDefault) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        handleHotkeyAction(mapping.actionId);
                        return;
                    }
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    }, [enabled, preventDefault, hotkeyMappings, handleHotkeyAction]);
    return {
        executeAction: handleHotkeyAction,
        getAvailableActions: function () { return (0, agents_actions_1.getAvailableAgentActions)(createActionContext()); },
        createActionContext: createActionContext,
    };
}
