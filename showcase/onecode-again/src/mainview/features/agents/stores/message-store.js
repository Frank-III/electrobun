"use client";
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
exports.setTtsPlaybackRateAtom = exports.ttsPlaybackRateAtom = exports.PLAYBACK_SPEEDS = exports.syncMessagesAtom = exports.syncMessagesWithStatusAtom = exports.messageTokenDataAtom = exports.hasUnapprovedPlanAtom = exports.lastAssistantMessageAtom = exports.hasMessagesAtom = exports.isStreamingAtom = exports.isLastUserMessageAtomFamily = exports.assistantIdsForUserMsgAtomFamily = exports.messageGroupsAtom = exports.userMessageIdsAtom = exports.messageStructureAtomFamily = exports.textPartAtomFamily = exports.isMessageStreamingAtomFamily = exports.isLastMessageAtomFamily = exports.lastMessageIdAtom = exports.currentSubChatIdAtom = exports.isRollingBackAtom = exports.rollbackHandlerAtom = exports.chatStatusAtom = exports.streamingMessageIdAtom = exports.messageIdsAtom = exports.messageAtomFamily = void 0;
exports.clearSubChatCaches = clearSubChatCaches;
exports.clearAllCaches = clearAllCaches;
var solid_js_1 = require("solid-js");
var signal_map_1 = require("../../../lib/state/signal-map");
var noopSetter = function () { };
function createDerivedSignalPair(get) {
    return [(0, solid_js_1.createMemo)(get), noopSetter];
}
function createActionSignalPair(action) {
    return [(function () { return undefined; }), action];
}
function createDerivedSignalFamily(derive) {
    return (0, signal_map_1.createSignalMap)(function (key) { return createDerivedSignalPair(function () { return derive(key); }); });
}
// ============================================================================
// MESSAGE STORE - OPTIMIZED ARCHITECTURE
// ============================================================================
// Key insight: Jotai atomFamily creates INDEPENDENT atoms for each key.
// When we use atomFamily with primitive atoms (not derived), each message
// has its own atom that can be updated without affecting other messages.
//
// Architecture:
// - messageAtomFamily: atomFamily<messageId, Message | null> - INDEPENDENT atoms per message
// - messageIdsAtom: string[] - ordered list of message IDs for rendering
// - messageRolesAtom: Map<messageId, role> - cached roles for grouping (avoids reading all messages)
// - lastMessageIdAtom: derived atom for the last message ID
// - streamingMessageIdAtom: ID of currently streaming message (or null)
//
// During streaming:
// - Only the streaming message's atom is updated
// - Other message atoms remain unchanged → no re-renders
// ============================================================================
// Per-message atom family - each message has its own INDEPENDENT atom
// This is the key optimization: updating one message doesn't affect others
exports.messageAtomFamily = (0, signal_map_1.createSignalMap)(function () { return (0, solid_js_1.createSignal)(null); });
// Track active message IDs per subChat for cleanup
var activeMessageIdsByChat = new Map();
// Ordered list of message IDs (for rendering order)
exports.messageIdsAtom = (0, solid_js_1.createSignal)([]);
// Message roles cache - updated only when messages are added/removed
// This avoids reading all message atoms just to check roles
var messageRolesAtom = (0, solid_js_1.createSignal)(new Map());
// Currently streaming message ID (null if not streaming)
exports.streamingMessageIdAtom = (0, solid_js_1.createSignal)(null);
// Chat status atom
exports.chatStatusAtom = (0, solid_js_1.createSignal)("ready");
// Rollback handler/state (optional) to avoid prop drilling
exports.rollbackHandlerAtom = (0, solid_js_1.createSignal)(null);
exports.isRollingBackAtom = (0, solid_js_1.createSignal)(false);
// Current subChatId - used to isolate caches per chat
exports.currentSubChatIdAtom = (0, solid_js_1.createSignal)("default");
// Last message ID - derived (uses stable messageIdsAtom)
exports.lastMessageIdAtom = createDerivedSignalPair(function () {
    var ids = exports.messageIdsAtom[0]();
    return ids.length > 0 ? ids[ids.length - 1] : null;
});
// ============================================================================
// SELECTORS
// ============================================================================
// Check if a specific message is the last one
exports.isLastMessageAtomFamily = createDerivedSignalFamily(function (messageId) { return exports.lastMessageIdAtom[0]() === messageId; });
// Check if a specific message is currently streaming
exports.isMessageStreamingAtomFamily = createDerivedSignalFamily(function (messageId) {
    var streamingId = exports.streamingMessageIdAtom[0]();
    var lastId = exports.lastMessageIdAtom[0]();
    return messageId === lastId && streamingId === messageId;
});
// ============================================================================
// TEXT PART ATOMS - For IsolatedTextPart optimization
// ============================================================================
// Problem: When IsolatedTextPart subscribes to messageAtomFamily, ALL text parts
// of that message re-render when ANY part changes (even tool parts).
//
// Solution: Create a derived atom that extracts ONLY the specific text part.
// This way, a text part only re-renders when ITS text changes, not when
// other parts of the same message change.
// Cache for text part content to return stable references
var textPartCache = new Map();
exports.textPartAtomFamily = createDerivedSignalFamily(function (key) {
    // Key format: "messageId:partIndex"
    var _a = key.split(":"), messageId = _a[0], partIndexStr = _a[1];
    var partIndex = parseInt(partIndexStr, 10);
    var message = (0, exports.messageAtomFamily)(messageId)[0]();
    var parts = (message === null || message === void 0 ? void 0 : message.parts) || [];
    var part = parts[partIndex];
    var text = (part === null || part === void 0 ? void 0 : part.type) === "text" ? (part.text || "") : "";
    // Return cached value if text hasn't changed (stable reference)
    var cached = textPartCache.get(key);
    if (cached === text) {
        return cached;
    }
    textPartCache.set(key, text);
    return text;
});
// Cache for message structure
var messageStructureCache = new Map();
exports.messageStructureAtomFamily = createDerivedSignalFamily(function (messageId) {
    var message = (0, exports.messageAtomFamily)(messageId)[0]();
    if (!message)
        return null;
    // Build structure without text content
    var partsStructure = (message.parts || []).map(function (part) {
        var _a;
        var structure = {
            type: part.type,
        };
        if (part.toolCallId)
            structure.toolCallId = part.toolCallId;
        if (part.state)
            structure.state = part.state;
        // For tools, include input as JSON for comparison
        if (part.input)
            structure.inputJson = JSON.stringify(part.input);
        if (part.output !== undefined)
            structure.hasOutput = true;
        if (part.result !== undefined)
            structure.hasResult = true;
        if (part.error !== undefined || part.errorText !== undefined)
            structure.hasError = true;
        // For text parts, track whether text is non-empty (without including actual text)
        if (part.type === "text")
            structure.hasText = !!((_a = part.text) === null || _a === void 0 ? void 0 : _a.trim());
        return structure;
    });
    var newStructure = {
        id: message.id,
        role: message.role,
        partsStructure: partsStructure,
        metadata: message.metadata,
    };
    // Check if structure changed
    var cached = messageStructureCache.get(messageId);
    if (cached) {
        // Compare structures
        if (cached.id === newStructure.id &&
            cached.role === newStructure.role &&
            cached.partsStructure.length === newStructure.partsStructure.length &&
            cached.partsStructure.every(function (p, i) {
                var n = newStructure.partsStructure[i];
                return (p.type === (n === null || n === void 0 ? void 0 : n.type) &&
                    p.toolCallId === (n === null || n === void 0 ? void 0 : n.toolCallId) &&
                    p.state === (n === null || n === void 0 ? void 0 : n.state) &&
                    p.inputJson === (n === null || n === void 0 ? void 0 : n.inputJson) &&
                    p.hasOutput === (n === null || n === void 0 ? void 0 : n.hasOutput) &&
                    p.hasResult === (n === null || n === void 0 ? void 0 : n.hasResult) &&
                    p.hasError === (n === null || n === void 0 ? void 0 : n.hasError) &&
                    p.hasText === (n === null || n === void 0 ? void 0 : n.hasText));
            }) &&
            // Shallow compare metadata (for usage tracking)
            cached.metadata === message.metadata) {
            return cached;
        }
    }
    messageStructureCache.set(messageId, newStructure);
    return newStructure;
});
// ============================================================================
// USER MESSAGE IDS - For IsolatedMessagesSection
// ============================================================================
// Uses a cache to return stable reference when IDs haven't changed
// Cache is per-subChatId to avoid collisions between different chats
var userMessageIdsCacheByChat = new Map();
exports.userMessageIdsAtom = createDerivedSignalPair(function () {
    var ids = exports.messageIdsAtom[0]();
    var roles = messageRolesAtom[0]();
    var subChatId = exports.currentSubChatIdAtom[0]();
    var newUserIds = ids.filter(function (id) { return roles.get(id) === "user"; });
    // Return cached array if content is the same
    var cached = userMessageIdsCacheByChat.get(subChatId);
    if (cached &&
        newUserIds.length === cached.length &&
        newUserIds.every(function (id, i) { return id === cached[i]; })) {
        return cached;
    }
    userMessageIdsCacheByChat.set(subChatId, newUserIds);
    return newUserIds;
});
var messageGroupsCacheByChat = new Map();
exports.messageGroupsAtom = createDerivedSignalPair(function () {
    var _a;
    var ids = exports.messageIdsAtom[0]();
    var roles = messageRolesAtom[0]();
    var subChatId = exports.currentSubChatIdAtom[0]();
    var groups = [];
    var currentGroup = null;
    for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
        var id = ids_1[_i];
        var role = roles.get(id);
        if (!role)
            continue;
        if (role === "user") {
            if (currentGroup) {
                groups.push(currentGroup);
            }
            currentGroup = { userMsgId: id, assistantMsgIds: [] };
        }
        else if (currentGroup && role === "assistant") {
            currentGroup.assistantMsgIds.push(id);
        }
    }
    if (currentGroup) {
        groups.push(currentGroup);
    }
    // Check if groups structurally match cached
    var cachedMessageGroups = (_a = messageGroupsCacheByChat.get(subChatId)) !== null && _a !== void 0 ? _a : [];
    if (groups.length === cachedMessageGroups.length) {
        var allMatch = true;
        var _loop_1 = function (i) {
            var newGroup = groups[i];
            var cachedGroup = cachedMessageGroups[i];
            if (newGroup.userMsgId !== (cachedGroup === null || cachedGroup === void 0 ? void 0 : cachedGroup.userMsgId) ||
                newGroup.assistantMsgIds.length !== (cachedGroup === null || cachedGroup === void 0 ? void 0 : cachedGroup.assistantMsgIds.length) ||
                !newGroup.assistantMsgIds.every(function (id, j) { return id === (cachedGroup === null || cachedGroup === void 0 ? void 0 : cachedGroup.assistantMsgIds[j]); })) {
                allMatch = false;
                return "break";
            }
        };
        for (var i = 0; i < groups.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
        if (allMatch) {
            return cachedMessageGroups;
        }
    }
    messageGroupsCacheByChat.set(subChatId, groups);
    return groups;
});
// ============================================================================
// ASSISTANT IDS FOR USER MESSAGE - For IsolatedMessageGroup
// ============================================================================
// Key format: "subChatId:userMsgId" to isolate per chat
var assistantIdsCacheByChat = new Map();
exports.assistantIdsForUserMsgAtomFamily = createDerivedSignalFamily(function (userMsgId) {
    var _a;
    var groups = exports.messageGroupsAtom[0]();
    var subChatId = exports.currentSubChatIdAtom[0]();
    var group = groups.find(function (g) { return g.userMsgId === userMsgId; });
    var newIds = (_a = group === null || group === void 0 ? void 0 : group.assistantMsgIds) !== null && _a !== void 0 ? _a : [];
    // Return cached array if content is the same
    var cacheKey = "".concat(subChatId, ":").concat(userMsgId);
    var cached = assistantIdsCacheByChat.get(cacheKey);
    if (cached &&
        cached.length === newIds.length &&
        cached.every(function (id, i) { return id === newIds[i]; })) {
        return cached;
    }
    assistantIdsCacheByChat.set(cacheKey, newIds);
    return newIds;
});
// Is this user message the last one?
exports.isLastUserMessageAtomFamily = createDerivedSignalFamily(function (userMsgId) {
    var userIds = exports.userMessageIdsAtom[0]();
    return userIds[userIds.length - 1] === userMsgId;
});
// ============================================================================
// STREAMING STATUS
// ============================================================================
exports.isStreamingAtom = createDerivedSignalPair(function () {
    var status = exports.chatStatusAtom[0]();
    return status === "streaming" || status === "submitted";
});
// Has any messages
exports.hasMessagesAtom = createDerivedSignalPair(function () {
    var ids = exports.messageIdsAtom[0]();
    return ids.length > 0;
});
// ============================================================================
// LAST ASSISTANT MESSAGE - For plan detection
// ============================================================================
// Cache for last assistant message to avoid re-reading on every check
// Keyed by subChatId to isolate per chat
var lastAssistantCacheByChat = new Map();
exports.lastAssistantMessageAtom = createDerivedSignalPair(function () {
    var ids = exports.messageIdsAtom[0]();
    var roles = messageRolesAtom[0]();
    var subChatId = exports.currentSubChatIdAtom[0]();
    // Find the last assistant ID
    var lastAssistantId = null;
    for (var i = ids.length - 1; i >= 0; i--) {
        if (roles.get(ids[i]) === "assistant") {
            lastAssistantId = ids[i];
            break;
        }
    }
    var cached = lastAssistantCacheByChat.get(subChatId);
    if (!lastAssistantId) {
        lastAssistantCacheByChat.set(subChatId, { id: null, msg: null });
        return null;
    }
    // If same ID, return cached message
    if (lastAssistantId === (cached === null || cached === void 0 ? void 0 : cached.id) && cached.msg) {
        // But we need to get fresh message in case it changed during streaming
        var freshMsg = (0, exports.messageAtomFamily)(lastAssistantId)[0]();
        if (freshMsg === cached.msg) {
            return cached.msg;
        }
        lastAssistantCacheByChat.set(subChatId, { id: lastAssistantId, msg: freshMsg });
        return freshMsg;
    }
    // Different ID, get fresh message
    var msg = (0, exports.messageAtomFamily)(lastAssistantId)[0]();
    lastAssistantCacheByChat.set(subChatId, { id: lastAssistantId, msg: msg });
    return msg;
});
// Has unapproved plan (for approve button)
exports.hasUnapprovedPlanAtom = createDerivedSignalPair(function () {
    var lastAssistant = exports.lastAssistantMessageAtom[0]();
    if (!lastAssistant)
        return false;
    var parts = lastAssistant.parts || [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.type === "tool-invocation" && part.toolName === "ExitPlanMode") {
            if (!part.result)
                return true;
        }
    }
    return false;
});
var tokenDataCacheByChat = new Map();
exports.messageTokenDataAtom = createDerivedSignalPair(function () {
    var _a;
    var ids = exports.messageIdsAtom[0]();
    var subChatId = exports.currentSubChatIdAtom[0]();
    // Get the last message to check if its tokens changed
    var lastId = ids[ids.length - 1];
    var lastMsg = lastId ? (0, exports.messageAtomFamily)(lastId)[0]() : null;
    // Note: metadata has flat structure (metadata.outputTokens), not nested (metadata.usage.outputTokens)
    var lastMsgOutputTokens = ((_a = lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.metadata) === null || _a === void 0 ? void 0 : _a.outputTokens) || 0;
    var cached = tokenDataCacheByChat.get(subChatId);
    // Cache is valid if:
    // 1. Message count is the same AND
    // 2. Last message's output tokens haven't changed (detects streaming completion)
    if (cached &&
        ids.length === cached.messageCount &&
        lastMsgOutputTokens === cached.lastMsgOutputTokens) {
        return cached;
    }
    // Recalculate token data
    var inputTokens = 0;
    var outputTokens = 0;
    var cacheReadTokens = 0;
    var cacheWriteTokens = 0;
    var reasoningTokens = 0;
    for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
        var id = ids_2[_i];
        var msg = (0, exports.messageAtomFamily)(id)[0]();
        var metadata = msg === null || msg === void 0 ? void 0 : msg.metadata;
        // Note: metadata has flat structure from transform.ts (metadata.inputTokens, metadata.outputTokens)
        // Extended fields like cacheReadInputTokens are not currently in MessageMetadata type
        if (metadata) {
            inputTokens += metadata.inputTokens || 0;
            outputTokens += metadata.outputTokens || 0;
            // These fields are not in current MessageMetadata but kept for future compatibility
            cacheReadTokens += metadata.cacheReadInputTokens || 0;
            cacheWriteTokens += metadata.cacheCreationInputTokens || 0;
            reasoningTokens += metadata.reasoningTokens || 0;
        }
    }
    var newTokenData = {
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        cacheReadTokens: cacheReadTokens,
        cacheWriteTokens: cacheWriteTokens,
        reasoningTokens: reasoningTokens,
        totalTokens: inputTokens + outputTokens,
        messageCount: ids.length,
        lastMsgOutputTokens: lastMsgOutputTokens,
    };
    tokenDataCacheByChat.set(subChatId, newTokenData);
    return newTokenData;
});
// ============================================================================
// SYNC WITH STATUS - Main sync function
// ============================================================================
// This is called from useChat to sync messages to the store.
// Key optimization: Only updates atoms for messages that actually changed.
// ============================================================================
// Track previous message state to detect changes
// Key format: "subChatId:msgId" to isolate per chat
//
// NOTE: This is a simplified change detection optimized for streaming performance.
// It only checks the LAST part (partsLength + lastPartText + lastPartState).
// During streaming, only the last part changes, so this is sufficient and fast.
//
// Compare with messages-list.tsx which uses a more thorough check (all parts'
// textLengths[] and partStates[]) for useSyncExternalStore. That approach is
// more comprehensive but slightly slower. Both are correct for their use cases:
// - This (message-store): Jotai atom updates during high-frequency streaming
// - messages-list.tsx: External store subscription for React render triggering
var previousMessageState = new Map();
function hasMessageChanged(subChatId, msgId, msg) {
    var cacheKey = "".concat(subChatId, ":").concat(msgId);
    var prev = previousMessageState.get(cacheKey);
    var parts = msg.parts || [];
    var lastPart = parts[parts.length - 1];
    var current = {
        partsLength: parts.length,
        lastPartText: lastPart === null || lastPart === void 0 ? void 0 : lastPart.text,
        lastPartState: lastPart === null || lastPart === void 0 ? void 0 : lastPart.state,
        lastPartInputJson: (lastPart === null || lastPart === void 0 ? void 0 : lastPart.input) ? JSON.stringify(lastPart.input) : undefined,
    };
    if (!prev) {
        previousMessageState.set(cacheKey, current);
        return true;
    }
    var changed = prev.partsLength !== current.partsLength ||
        prev.lastPartText !== current.lastPartText ||
        prev.lastPartState !== current.lastPartState ||
        prev.lastPartInputJson !== current.lastPartInputJson;
    if (changed) {
        previousMessageState.set(cacheKey, current);
    }
    return changed;
}
exports.syncMessagesWithStatusAtom = createActionSignalPair(function (_a) {
    var _b, _c, _d;
    var messages = _a.messages, status = _a.status, subChatId = _a.subChatId;
    var prevSubChatId = exports.currentSubChatIdAtom[0]();
    if (subChatId && subChatId !== prevSubChatId) {
        exports.currentSubChatIdAtom[1](subChatId);
    }
    var currentSubChatId = subChatId !== null && subChatId !== void 0 ? subChatId : prevSubChatId;
    var prevStatus = exports.chatStatusAtom[0]();
    if (status !== prevStatus) {
        exports.chatStatusAtom[1](status);
    }
    var currentIds = exports.messageIdsAtom[0]();
    var currentRoles = messageRolesAtom[0]();
    // Build new IDs list and roles map
    var newIds = messages.map(function (m) { return m.id; });
    var newRoles = new Map();
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        newRoles.set(msg.id, msg.role);
    }
    // Check if IDs changed (new message added or removed)
    var idsChanged = newIds.length !== currentIds.length ||
        newIds.some(function (id, i) { return id !== currentIds[i]; });
    if (idsChanged) {
        exports.messageIdsAtom[1](newIds);
    }
    // Check if roles changed
    var rolesChanged = newRoles.size !== currentRoles.size;
    if (!rolesChanged) {
        for (var _e = 0, newRoles_1 = newRoles; _e < newRoles_1.length; _e++) {
            var _f = newRoles_1[_e], id = _f[0], role = _f[1];
            if (currentRoles.get(id) !== role) {
                rolesChanged = true;
                break;
            }
        }
    }
    if (rolesChanged) {
        messageRolesAtom[1](newRoles);
    }
    // Update individual message atoms ONLY if they changed
    // This is the key optimization - only changed messages trigger re-renders
    // CRITICAL: AI SDK mutates objects in-place, so we MUST create a new reference
    // for Jotai to detect the change (it uses Object.is() for comparison)
    // We need to deep clone the message because:
    // 1. msg object itself is mutated in-place
    // 2. msg.parts array is mutated in-place
    // 3. Individual part objects inside parts are mutated in-place
    for (var _g = 0, messages_2 = messages; _g < messages_2.length; _g++) {
        var msg = messages_2[_g];
        var currentAtomValue = (0, exports.messageAtomFamily)(msg.id)[0]();
        var msgChanged = hasMessageChanged(currentSubChatId, msg.id, msg);
        // CRITICAL FIX: Also update if atom is null (not yet populated)
        if (msgChanged || !currentAtomValue) {
            // Deep clone message with new parts array and new part objects
            var clonedMsg = __assign(__assign({}, msg), { parts: (_b = msg.parts) === null || _b === void 0 ? void 0 : _b.map(function (part) { return (__assign(__assign({}, part), { input: part.input ? __assign({}, part.input) : undefined })); }) });
            (0, exports.messageAtomFamily)(msg.id)[1](clonedMsg);
        }
    }
    // Cleanup removed message atoms to prevent memory leaks
    var newIdsSet = new Set(newIds);
    var previousIds = (_c = activeMessageIdsByChat.get(currentSubChatId)) !== null && _c !== void 0 ? _c : new Set();
    for (var _h = 0, previousIds_1 = previousIds; _h < previousIds_1.length; _h++) {
        var oldId = previousIds_1[_h];
        if (!newIdsSet.has(oldId)) {
            // Message was removed - cleanup its atom and caches
            exports.messageAtomFamily.delete(oldId);
            previousMessageState.delete("".concat(currentSubChatId, ":").concat(oldId));
            assistantIdsCacheByChat.delete("".concat(currentSubChatId, ":").concat(oldId));
        }
    }
    // Update active IDs tracking
    activeMessageIdsByChat.set(currentSubChatId, newIdsSet);
    // Update streaming message ID
    if (status === "streaming" || status === "submitted") {
        var lastId = (_d = newIds[newIds.length - 1]) !== null && _d !== void 0 ? _d : null;
        exports.streamingMessageIdAtom[1](lastId);
    }
    else {
        exports.streamingMessageIdAtom[1](null);
    }
});
// Legacy sync atom (not used, but kept for compatibility)
exports.syncMessagesAtom = createActionSignalPair(function (messages) {
    exports.syncMessagesWithStatusAtom[1]({ messages: messages, status: exports.chatStatusAtom[0]() });
});
// ============================================================================
// CLEANUP - For clearing store when switching chats
// ============================================================================
// Clear all caches for a specific subChat (call when unmounting/switching)
function clearSubChatCaches(subChatId) {
    // Clear message atoms
    var activeIds = activeMessageIdsByChat.get(subChatId);
    if (activeIds) {
        for (var _i = 0, activeIds_1 = activeIds; _i < activeIds_1.length; _i++) {
            var id = activeIds_1[_i];
            exports.messageAtomFamily.delete(id);
            previousMessageState.delete("".concat(subChatId, ":").concat(id));
            assistantIdsCacheByChat.delete("".concat(subChatId, ":").concat(id));
        }
        activeMessageIdsByChat.delete(subChatId);
    }
    // Clear other caches
    userMessageIdsCacheByChat.delete(subChatId);
    messageGroupsCacheByChat.delete(subChatId);
    lastAssistantCacheByChat.delete(subChatId);
    tokenDataCacheByChat.delete(subChatId);
}
// Clear all caches (call on app reset/logout)
function clearAllCaches() {
    for (var _i = 0, _a = activeMessageIdsByChat.keys(); _i < _a.length; _i++) {
        var subChatId = _a[_i];
        clearSubChatCaches(subChatId);
    }
}
// ============================================================================
// TTS PLAYBACK RATE - For PlayButton
// ============================================================================
// Stored in localStorage and accessible via Jotai atom.
// This allows PlayButton to manage its own state without passing callbacks
// through props (which would break memoization).
exports.PLAYBACK_SPEEDS = [1, 2, 3];
// Atom with localStorage persistence
exports.ttsPlaybackRateAtom = (0, solid_js_1.createSignal)(
// Initial value from localStorage
(function () {
    if (typeof window !== "undefined") {
        var saved = localStorage.getItem("tts-playback-rate");
        if (saved && exports.PLAYBACK_SPEEDS.includes(Number(saved))) {
            return Number(saved);
        }
    }
    return 1;
})());
// Write atom that also persists to localStorage
exports.setTtsPlaybackRateAtom = createActionSignalPair(function (rate) {
    exports.ttsPlaybackRateAtom[1](rate);
    if (typeof window !== "undefined") {
        localStorage.setItem("tts-playback-rate", String(rate));
    }
});
