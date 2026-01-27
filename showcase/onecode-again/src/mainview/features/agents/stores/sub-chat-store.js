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
exports.useAgentSubChatStore = exports.OPEN_SUB_CHATS_CHANGE_EVENT = void 0;
var zustand_1 = require("zustand");
var message_queue_store_1 = require("./message-queue-store");
var streaming_status_store_1 = require("./streaming-status-store");
var agent_chat_store_1 = require("./agent-chat-store");
var WindowContext_1 = require("../../../contexts/WindowContext");
// localStorage helpers - store open tabs, active tab, and pinned tabs
// Prefixed with windowId to isolate state per Electron window
var getStorageKey = function (chatId, type) {
    return "".concat((0, WindowContext_1.getWindowId)(), ":agent-").concat(type, "-sub-chats-").concat(chatId);
};
var getLegacyStorageKey = function (chatId, type) {
    return "agent-".concat(type, "-sub-chats-").concat(chatId);
};
// Custom event for notifying other components when open sub-chats change
exports.OPEN_SUB_CHATS_CHANGE_EVENT = "open-sub-chats-change";
// Debounce timer to avoid rapid-fire events
var openSubChatsChangeTimer = null;
var saveToLS = function (chatId, type, value) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(getStorageKey(chatId, type), JSON.stringify(value));
    // Dispatch debounced event when open sub-chats change so sidebar can update
    if (type === "open") {
        if (openSubChatsChangeTimer)
            clearTimeout(openSubChatsChangeTimer);
        openSubChatsChangeTimer = setTimeout(function () {
            window.dispatchEvent(new CustomEvent(exports.OPEN_SUB_CHATS_CHANGE_EVENT));
            openSubChatsChangeTimer = null;
        }, 50);
    }
};
// Find data from old numeric window IDs (e.g., "1:agent-open-sub-chats-xxx")
var findNumericWindowIdValue = function (legacyKey, targetKey) {
    // Only migrate for "main" window
    if (!targetKey.startsWith("main:"))
        return null;
    for (var i = 0; i < localStorage.length; i++) {
        var storageKey = localStorage.key(i);
        if (!storageKey)
            continue;
        // Check if this key matches pattern: <number>:<legacyKey>
        var match = storageKey.match(/^(\d+):(.+)$/);
        if (match && match[2] === legacyKey) {
            var value = localStorage.getItem(storageKey);
            if (value !== null) {
                console.log("[SubChatStore] Migrated from numeric ID: ".concat(storageKey, " to ").concat(targetKey));
                return value;
            }
        }
    }
    return null;
};
var loadFromLS = function (chatId, type, fallback) {
    if (typeof window === "undefined")
        return fallback;
    try {
        var key = getStorageKey(chatId, type);
        var stored = localStorage.getItem(key);
        // Migration 1: check for old numeric window ID keys
        if (stored === null) {
            var legacyKey = getLegacyStorageKey(chatId, type);
            var numericValue = findNumericWindowIdValue(legacyKey, key);
            if (numericValue !== null) {
                localStorage.setItem(key, numericValue);
                stored = numericValue;
            }
        }
        // Migration 2: check legacy key if window-scoped key doesn't exist
        if (stored === null) {
            var legacyKey = getLegacyStorageKey(chatId, type);
            var legacyStored = localStorage.getItem(legacyKey);
            if (legacyStored !== null) {
                // Migrate to window-scoped key
                localStorage.setItem(key, legacyStored);
                stored = legacyStored;
                console.log("[SubChatStore] Migrated ".concat(legacyKey, " to ").concat(key));
            }
        }
        return stored ? JSON.parse(stored) : fallback;
    }
    catch (_a) {
        return fallback;
    }
};
exports.useAgentSubChatStore = (0, zustand_1.create)(function (set, get) { return ({
    chatId: null,
    activeSubChatId: null,
    openSubChatIds: [],
    pinnedSubChatIds: [],
    allSubChats: [],
    setChatId: function (chatId) {
        if (!chatId) {
            set({
                chatId: null,
                activeSubChatId: null,
                openSubChatIds: [],
                pinnedSubChatIds: [],
                allSubChats: [],
            });
            return;
        }
        // Load open/active/pinned IDs from localStorage
        // allSubChats will be populated from DB + placeholders in init effect
        var openSubChatIds = loadFromLS(chatId, "open", []);
        var activeSubChatId = loadFromLS(chatId, "active", null);
        var pinnedSubChatIds = loadFromLS(chatId, "pinned", []);
        set({ chatId: chatId, openSubChatIds: openSubChatIds, activeSubChatId: activeSubChatId, pinnedSubChatIds: pinnedSubChatIds, allSubChats: [] });
    },
    setActiveSubChat: function (subChatId) {
        var chatId = get().chatId;
        set({ activeSubChatId: subChatId });
        if (chatId)
            saveToLS(chatId, "active", subChatId);
    },
    setOpenSubChats: function (subChatIds) {
        var chatId = get().chatId;
        set({ openSubChatIds: subChatIds });
        if (chatId)
            saveToLS(chatId, "open", subChatIds);
    },
    addToOpenSubChats: function (subChatId) {
        var _a = get(), openSubChatIds = _a.openSubChatIds, chatId = _a.chatId;
        if (openSubChatIds.includes(subChatId))
            return;
        var newIds = __spreadArray(__spreadArray([], openSubChatIds, true), [subChatId], false);
        set({ openSubChatIds: newIds });
        if (chatId)
            saveToLS(chatId, "open", newIds);
    },
    removeFromOpenSubChats: function (subChatId) {
        var _a = get(), openSubChatIds = _a.openSubChatIds, activeSubChatId = _a.activeSubChatId, chatId = _a.chatId;
        var newIds = openSubChatIds.filter(function (id) { return id !== subChatId; });
        // If closing active tab, switch to last remaining tab
        var newActive = activeSubChatId;
        if (activeSubChatId === subChatId) {
            newActive = newIds[newIds.length - 1] || null;
        }
        set({ openSubChatIds: newIds, activeSubChatId: newActive });
        if (chatId) {
            saveToLS(chatId, "open", newIds);
            saveToLS(chatId, "active", newActive);
        }
        // Cleanup queue, streaming status, and Chat instance to prevent memory leaks
        // and race conditions (QueueProcessor sending to closed subChat)
        message_queue_store_1.useMessageQueueStore.getState().clearQueue(subChatId);
        streaming_status_store_1.useStreamingStatusStore.getState().clearStatus(subChatId);
        agent_chat_store_1.agentChatStore.delete(subChatId);
    },
    togglePinSubChat: function (subChatId) {
        var _a = get(), pinnedSubChatIds = _a.pinnedSubChatIds, chatId = _a.chatId;
        var newPinnedIds = pinnedSubChatIds.includes(subChatId)
            ? pinnedSubChatIds.filter(function (id) { return id !== subChatId; })
            : __spreadArray(__spreadArray([], pinnedSubChatIds, true), [subChatId], false);
        set({ pinnedSubChatIds: newPinnedIds });
        if (chatId)
            saveToLS(chatId, "pinned", newPinnedIds);
    },
    setAllSubChats: function (subChats) {
        set({ allSubChats: subChats });
    },
    addToAllSubChats: function (subChat) {
        var allSubChats = get().allSubChats;
        if (allSubChats.some(function (sc) { return sc.id === subChat.id; }))
            return;
        set({ allSubChats: __spreadArray(__spreadArray([], allSubChats, true), [subChat], false) });
        // No localStorage persistence - allSubChats is rebuilt from DB + open IDs on init
    },
    updateSubChatName: function (subChatId, name) {
        var allSubChats = get().allSubChats;
        set({
            allSubChats: allSubChats.map(function (sc) {
                return sc.id === subChatId
                    ? __assign(__assign({}, sc), { name: name }) : sc;
            }),
        });
        // No localStorage modification - just update in-memory state (like Canvas)
    },
    updateSubChatMode: function (subChatId, mode) {
        var allSubChats = get().allSubChats;
        set({
            allSubChats: allSubChats.map(function (sc) {
                return sc.id === subChatId
                    ? __assign(__assign({}, sc), { mode: mode }) : sc;
            }),
        });
    },
    updateSubChatTimestamp: function (subChatId) {
        var allSubChats = get().allSubChats;
        var newTimestamp = new Date().toISOString();
        set({
            allSubChats: allSubChats.map(function (sc) {
                return sc.id === subChatId
                    ? __assign(__assign({}, sc), { updated_at: newTimestamp }) : sc;
            }),
        });
    },
    reset: function () {
        set({
            chatId: null,
            activeSubChatId: null,
            openSubChatIds: [],
            pinnedSubChatIds: [],
            allSubChats: [],
        });
    },
}); });
