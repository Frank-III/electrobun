"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_LABELS = exports.ALL_SHORTCUT_ACTIONS = void 0;
exports.getShortcutsByCategory = getShortcutsByCategory;
exports.getShortcutAction = getShortcutAction;
exports.keysToHotkeyString = keysToHotkeyString;
exports.hotkeyStringToKeys = hotkeyStringToKeys;
exports.getResolvedHotkey = getResolvedHotkey;
exports.getResolvedKeys = getResolvedKeys;
exports.isCustomHotkey = isCustomHotkey;
exports.normalizeHotkey = normalizeHotkey;
exports.detectConflicts = detectConflicts;
exports.keyToDisplay = keyToDisplay;
exports.hotkeyToDisplay = hotkeyToDisplay;
exports.keysToDisplay = keysToDisplay;
/**
 * Master registry of all configurable shortcut actions
 * This is the single source of truth for default shortcuts
 */
exports.ALL_SHORTCUT_ACTIONS = [
    // ============================================
    // GENERAL
    // ============================================
    {
        id: "show-shortcuts",
        label: "Show shortcuts",
        category: "general",
        defaultKeys: ["?"],
    },
    {
        id: "open-settings",
        label: "Settings",
        category: "general",
        defaultKeys: ["cmd", ","],
    },
    {
        id: "toggle-sidebar",
        label: "Toggle sidebar",
        category: "general",
        defaultKeys: ["cmd", "\\"],
    },
    {
        id: "undo-archive",
        label: "Undo archive",
        category: "general",
        defaultKeys: ["cmd", "Z"],
    },
    // ============================================
    // WORKSPACES
    // ============================================
    {
        id: "toggle-details",
        label: "View details",
        category: "workspaces",
        defaultKeys: ["cmd", "shift", "\\"],
    },
    {
        id: "new-workspace",
        label: "New workspace",
        category: "workspaces",
        defaultKeys: ["cmd", "N"],
    },
    {
        id: "search-workspaces",
        label: "Search workspaces",
        category: "workspaces",
        defaultKeys: ["cmd", "K"],
    },
    {
        id: "archive-workspace",
        label: "Archive current workspace",
        category: "workspaces",
        defaultKeys: ["cmd", "E"],
    },
    {
        id: "quick-switch-workspaces",
        label: "Quick switch workspaces",
        category: "workspaces",
        defaultKeys: ["ctrl", "Tab"],
        isDynamic: true,
        dynamicDescription: "Controlled by Ctrl+Tab preference",
    },
    {
        id: "open-kanban",
        label: "Open Kanban board",
        category: "workspaces",
        defaultKeys: ["cmd", "shift", "K"],
    },
    // ============================================
    // AGENTS
    // ============================================
    {
        id: "new-agent",
        label: "Create new agent",
        category: "agents",
        defaultKeys: ["cmd", "T"],
    },
    {
        id: "search-chats",
        label: "Search chats",
        category: "agents",
        defaultKeys: ["/"],
    },
    {
        id: "search-in-chat",
        label: "Search text in current chat",
        category: "agents",
        defaultKeys: ["cmd", "F"],
    },
    {
        id: "archive-agent",
        label: "Archive current agent",
        category: "agents",
        defaultKeys: ["cmd", "W"],
    },
    {
        id: "quick-switch-agents",
        label: "Quick switch agents",
        category: "agents",
        defaultKeys: ["opt", "ctrl", "Tab"],
        isDynamic: true,
        dynamicDescription: "Controlled by Ctrl+Tab preference",
    },
    {
        id: "prev-agent",
        label: "Previous agent",
        category: "agents",
        defaultKeys: ["cmd", "["],
    },
    {
        id: "next-agent",
        label: "Next agent",
        category: "agents",
        defaultKeys: ["cmd", "]"],
    },
    {
        id: "focus-input",
        label: "Focus input",
        category: "agents",
        defaultKeys: ["Enter"],
    },
    {
        id: "toggle-focus",
        label: "Toggle focus",
        category: "agents",
        defaultKeys: ["cmd", "Esc"],
    },
    {
        id: "stop-generation",
        label: "Stop generation",
        category: "agents",
        defaultKeys: ["Esc"],
        altKeys: ["ctrl", "C"],
    },
    {
        id: "switch-model",
        label: "Switch model",
        category: "agents",
        defaultKeys: ["cmd", "/"],
    },
    {
        id: "toggle-terminal",
        label: "Toggle terminal",
        category: "agents",
        defaultKeys: ["cmd", "J"],
    },
    {
        id: "open-diff",
        label: "Open diff",
        category: "agents",
        defaultKeys: ["cmd", "D"],
    },
    {
        id: "create-pr",
        label: "Create PR",
        category: "agents",
        defaultKeys: ["cmd", "P"],
    },
    {
        id: "voice-input",
        label: "Voice input (hold)",
        category: "agents",
        defaultKeys: ["ctrl", "opt"],
    },
];
/**
 * Get shortcuts grouped by category
 */
function getShortcutsByCategory() {
    return {
        general: exports.ALL_SHORTCUT_ACTIONS.filter(function (a) { return a.category === "general"; }),
        workspaces: exports.ALL_SHORTCUT_ACTIONS.filter(function (a) { return a.category === "workspaces"; }),
        agents: exports.ALL_SHORTCUT_ACTIONS.filter(function (a) { return a.category === "agents"; }),
    };
}
/**
 * Get a shortcut action by ID
 */
function getShortcutAction(id) {
    return exports.ALL_SHORTCUT_ACTIONS.find(function (a) { return a.id === id; });
}
/**
 * Convert keys array to hotkey string
 * e.g., ["cmd", "shift", "N"] -> "cmd+shift+n"
 */
function keysToHotkeyString(keys) {
    return keys.map(function (k) { return k.toLowerCase(); }).join("+");
}
/**
 * Convert hotkey string to keys array
 * e.g., "cmd+shift+n" -> ["cmd", "shift", "N"]
 */
function hotkeyStringToKeys(hotkey) {
    return hotkey.split("+").map(function (part) {
        var lower = part.toLowerCase();
        // Capitalize non-modifier keys
        if (!["cmd", "ctrl", "opt", "alt", "shift", "meta"].includes(lower)) {
            return part.toUpperCase();
        }
        return lower;
    });
}
/**
 * Get the resolved hotkey for an action considering custom overrides
 */
function getResolvedHotkey(actionId, config) {
    var customHotkey = config.bindings[actionId];
    // If explicitly set (including to a custom value), use it
    if (customHotkey !== undefined) {
        return customHotkey;
    }
    // Otherwise use default
    var action = getShortcutAction(actionId);
    if (!action)
        return null;
    return keysToHotkeyString(action.defaultKeys);
}
/**
 * Get the resolved keys array for an action
 */
function getResolvedKeys(actionId, config) {
    var hotkey = getResolvedHotkey(actionId, config);
    if (!hotkey)
        return null;
    return hotkeyStringToKeys(hotkey);
}
/**
 * Check if an action has a custom (non-default) hotkey
 */
function isCustomHotkey(actionId, config) {
    return config.bindings[actionId] !== undefined;
}
/**
 * Normalize a hotkey string for comparison
 * Handles modifier order and case
 */
function normalizeHotkey(hotkey) {
    var parts = hotkey.toLowerCase().split("+");
    // Define modifier order
    var modifierOrder = ["cmd", "meta", "ctrl", "opt", "alt", "shift"];
    var modifiers = parts.filter(function (p) {
        return ["cmd", "meta", "ctrl", "opt", "alt", "shift"].includes(p);
    });
    var key = parts.filter(function (p) { return !["cmd", "meta", "ctrl", "opt", "alt", "shift"].includes(p); })[0];
    // Sort modifiers
    modifiers.sort(function (a, b) { return modifierOrder.indexOf(a) - modifierOrder.indexOf(b); });
    // Normalize alt/opt
    var normalizedMods = modifiers.map(function (m) { return (m === "alt" ? "opt" : m); });
    // Normalize meta to cmd
    var finalMods = normalizedMods.map(function (m) { return (m === "meta" ? "cmd" : m); });
    return __spreadArray(__spreadArray([], finalMods, true), [key], false).join("+");
}
/**
 * Detect conflicts in hotkey configuration
 * Returns a map of actionId to array of conflicting actionIds
 */
function detectConflicts(config) {
    var conflicts = new Map();
    var hotkeyToActions = new Map();
    // Build map of normalized hotkey -> action IDs
    for (var _i = 0, ALL_SHORTCUT_ACTIONS_1 = exports.ALL_SHORTCUT_ACTIONS; _i < ALL_SHORTCUT_ACTIONS_1.length; _i++) {
        var action = ALL_SHORTCUT_ACTIONS_1[_i];
        var hotkey = getResolvedHotkey(action.id, config);
        if (!hotkey)
            continue;
        var normalized = normalizeHotkey(hotkey);
        var existing = hotkeyToActions.get(normalized) || [];
        existing.push(action.id);
        hotkeyToActions.set(normalized, existing);
        // Also check altKeys if they exist and not customized
        if (action.altKeys && !isCustomHotkey(action.id, config)) {
            var altNormalized = normalizeHotkey(keysToHotkeyString(action.altKeys));
            var altExisting = hotkeyToActions.get(altNormalized) || [];
            altExisting.push(action.id);
            hotkeyToActions.set(altNormalized, altExisting);
        }
    }
    // Find conflicts (hotkeys with multiple actions)
    for (var _a = 0, hotkeyToActions_1 = hotkeyToActions; _a < hotkeyToActions_1.length; _a++) {
        var _b = hotkeyToActions_1[_a], hotkey = _b[0], actionIds = _b[1];
        if (actionIds.length > 1) {
            var _loop_1 = function (actionId) {
                conflicts.set(actionId, {
                    actionId: actionId,
                    conflictingActionIds: actionIds.filter(function (id) { return id !== actionId; }),
                    hotkey: hotkey,
                });
            };
            for (var _c = 0, actionIds_1 = actionIds; _c < actionIds_1.length; _c++) {
                var actionId = actionIds_1[_c];
                _loop_1(actionId);
            }
        }
    }
    return conflicts;
}
/**
 * Display mapping for special keys
 */
var KEY_DISPLAY_MAP = {
    cmd: "⌘",
    meta: "⌘",
    ctrl: "⌃",
    opt: "⌥",
    alt: "⌥",
    shift: "⇧",
    enter: "↵",
    backspace: "⌫",
    delete: "⌦",
    escape: "Esc",
    esc: "Esc",
    tab: "Tab",
    space: "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
};
/**
 * Convert a key to its display format
 */
function keyToDisplay(key) {
    var lower = key.toLowerCase();
    return KEY_DISPLAY_MAP[lower] || key.toUpperCase();
}
/**
 * Convert a hotkey string to display format
 * e.g., "cmd+shift+n" -> "⌘⇧N"
 */
function hotkeyToDisplay(hotkey) {
    return hotkey
        .split("+")
        .map(function (part) { return keyToDisplay(part); })
        .join("");
}
/**
 * Convert keys array to display format
 * e.g., ["cmd", "shift", "N"] -> "⌘⇧N"
 */
function keysToDisplay(keys) {
    return keys.map(function (k) { return keyToDisplay(k); }).join("");
}
/**
 * Category labels for UI
 */
exports.CATEGORY_LABELS = {
    general: "General",
    workspaces: "Workspaces",
    agents: "Agents",
};
