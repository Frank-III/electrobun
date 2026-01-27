"use client";
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
exports.SimpleIsolatedMessagesList = exports.SimpleIsolatedGroup = exports.MessagesList = exports.MemoizedAssistantMessages = exports.MessageItemWrapper = void 0;
exports.useMessageStoreSync = useMessageStoreSync;
exports.MessageStoreProvider = MessageStoreProvider;
exports.useMessage = useMessage;
exports.useMessageIds = useMessageIds;
exports.useStreamingStatus = useStreamingStatus;
exports.useAllMessages = useAllMessages;
exports.useMessageGroups = useMessageGroups;
exports.useUserMessageIds = useUserMessageIds;
exports.useUserMessageWithAssistants = useUserMessageWithAssistants;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var assistant_message_item_1 = require("./assistant-message-item");
var message_store_1 = require("../stores/message-store");
var render_file_mentions_1 = require("../mentions/render-file-mentions");
function createMessageStore() {
    var messages = [];
    var status = "ready";
    var listeners = new Set();
    // Store snapshots of message state (not references!) to detect changes
    // Since AI SDK mutates objects in place, we can't compare object references
    //
    // NOTE: This is a thorough change detection that checks ALL parts.
    // Compare with message-store.ts hasMessageChanged() which only checks the
    // LAST part for performance during high-frequency streaming updates.
    // Both approaches are correct for their use cases:
    // - This (messages-list): useSyncExternalStore needs accurate change detection
    // - message-store.ts: Jotai atoms optimized for streaming (last part only)
    var messageSnapshotsMap = new Map();
    function getMessageSnapshot(msg) {
        var parts = msg.parts || [];
        return {
            partsCount: parts.length,
            textLengths: parts.map(function (p) { var _a; return p.type === "text" ? ((_a = p.text) === null || _a === void 0 ? void 0 : _a.length) || 0 : -1; }),
            partStates: parts.map(function (p) { return p.state; })
        };
    }
    function hasMessageChanged(msgId, newMsg) {
        var existingSnapshot = messageSnapshotsMap.get(msgId);
        var newSnapshot = getMessageSnapshot(newMsg);
        // No existing snapshot = new message
        if (!existingSnapshot) {
            return true;
        }
        // Compare parts count
        if (existingSnapshot.partsCount !== newSnapshot.partsCount) {
            return true;
        }
        // Compare text lengths (this detects streaming text changes!)
        for (var i = 0; i < newSnapshot.textLengths.length; i++) {
            if (existingSnapshot.textLengths[i] !== newSnapshot.textLengths[i]) {
                return true;
            }
        }
        // Compare part states
        for (var i = 0; i < newSnapshot.partStates.length; i++) {
            if (existingSnapshot.partStates[i] !== newSnapshot.partStates[i]) {
                return true;
            }
        }
        return false;
    }
    function stabilizeMessages(newMessages) {
        // Check if any message changed
        var anyChanged = false;
        for (var _i = 0, newMessages_1 = newMessages; _i < newMessages_1.length; _i++) {
            var msg = newMessages_1[_i];
            if (hasMessageChanged(msg.id, msg)) {
                anyChanged = true;
                // Update snapshot for this message
                messageSnapshotsMap.set(msg.id, getMessageSnapshot(msg));
            }
        }
        // If length changed, definitely return new array
        if (newMessages.length !== messages.length) {
            anyChanged = true;
        }
        // Return new array reference if anything changed, so subscribers see the update
        return anyChanged ? __spreadArray([], newMessages, true) : messages;
    }
    return {
        get messages() {
            return messages;
        },
        get status() {
            return status;
        },
        subscribe: function (listener) {
            listeners.add(listener);
            return function () { return listeners.delete(listener); };
        },
        getSnapshot: function () {
            return {
                messages: messages,
                status: status
            };
        },
        initMessages: function (newMessages, newStatus) {
            var stabilized = stabilizeMessages(newMessages);
            messages = stabilized;
            status = newStatus;
        },
        setMessages: function (newMessages, newStatus) {
            var stabilized = stabilizeMessages(newMessages);
            // Only notify if something actually changed
            var messagesChanged = stabilized !== messages;
            var statusChanged = newStatus !== status;
            if (messagesChanged || statusChanged) {
                messages = stabilized;
                status = newStatus;
                listeners.forEach(function (l) { return l(); });
            }
        }
    };
}
// Context for the store
var MessageStoreContext = (0, solid_js_1.createContext)(null);
// Hook to sync messages to global store - NOT USED, keeping for reference
function useMessageStoreSync(_messages, _status) {
    // Not used
}
// Provider component
function MessageStoreProvider(_a) {
    var children = _a.children, messages = _a.messages, status = _a.status;
    // Create store once per provider instance, initialized with current messages
    var _b = (0, solid_js_1.createSignal)(null), storeRef = _b[0], setStoreRef = _b[1];
    if (!storeRef.current) {
        storeRef.current = createMessageStore();
        // Initialize with current messages SILENTLY - no subscribers yet anyway
        storeRef.current.initMessages(messages, status);
    }
    // CRITICAL: Use useLayoutEffect to sync messages AFTER render, not during
    // This avoids "Cannot update a component while rendering a different component" error
    (0, solid_js_1.createEffect)(function () {
        var _a;
        (_a = storeRef.current) === null || _a === void 0 ? void 0 : _a.setMessages(messages, status);
    });
    return <MessageStoreContext.Provider value={storeRef.current}>
      {children}
    </MessageStoreContext.Provider>;
}
// Hook to get a specific message by ID - only triggers re-render when THIS message changes
function useMessage(messageId) {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useMessage must be used within MessageStoreProvider");
    var _a = (0, solid_js_1.createSignal)(null), prevMessageRef = _a[0], setPrevMessageRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            // Only notify if THIS message changed
            var currentMsg = store.messages.find(function (m) { return m.id === messageId; });
            if (currentMsg !== prevMessageRef.current) {
                prevMessageRef.current = currentMsg;
                onStoreChange();
            }
        });
    };
    var getSnapshot = function () {
        var msg = store.messages.find(function (m) { return m.id === messageId; });
        prevMessageRef.current = msg;
        return msg;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// Hook to get message IDs only (for list rendering)
function useMessageIds() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useMessageIds must be used within MessageStoreProvider");
    var subscribe = function (onStoreChange) {
        return store.subscribe(onStoreChange);
    };
    var _a = (0, solid_js_1.createSignal)([]), idsRef = _a[0], setIdsRef = _a[1];
    var getSnapshot = function () {
        var newIds = store.messages.filter(function (m) { return m.role === "assistant"; }).map(function (m) { return m.id; });
        // Only return new array if IDs actually changed
        if (newIds.length === idsRef.current.length && newIds.every(function (id, i) { return id === idsRef.current[i]; })) {
            return idsRef.current;
        }
        idsRef.current = newIds;
        return newIds;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// Hook to get streaming status - only triggers re-render when status actually changes
function useStreamingStatus() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useStreamingStatus must be used within MessageStoreProvider");
    var _a = (0, solid_js_1.createSignal)(null), cacheRef = _a[0], setCacheRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            var _a;
            var isStreaming = store.status === "streaming" || store.status === "submitted";
            var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
            if (!cacheRef.current || cacheRef.current.isStreaming !== isStreaming || cacheRef.current.status !== store.status || cacheRef.current.lastMessageId !== lastMsgId) {
                cacheRef.current = {
                    isStreaming: isStreaming,
                    status: store.status,
                    lastMessageId: lastMsgId
                };
                onStoreChange();
            }
        });
    };
    var getSnapshot = function () {
        var _a;
        var isStreaming = store.status === "streaming" || store.status === "submitted";
        var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
        if (cacheRef.current && cacheRef.current.isStreaming === isStreaming && cacheRef.current.status === store.status && cacheRef.current.lastMessageId === lastMsgId) {
            return cacheRef.current;
        }
        cacheRef.current = {
            isStreaming: isStreaming,
            status: store.status,
            lastMessageId: lastMsgId
        };
        return cacheRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// Hook that only re-renders THIS component when it becomes/stops being the last message
function useIsLastMessage(messageId) {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useIsLastMessage must be used within MessageStoreProvider");
    var _a = (0, solid_js_1.createSignal)(false), prevIsLastRef = _a[0], setPrevIsLastRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            var _a;
            var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
            var isLast = messageId === lastMsgId;
            // Only notify if THIS message's "isLast" status changed
            if (prevIsLastRef.current !== isLast) {
                prevIsLastRef.current = isLast;
                onStoreChange();
            }
        });
    };
    var getSnapshot = function () {
        var _a;
        var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
        var isLast = messageId === lastMsgId;
        prevIsLastRef.current = isLast;
        return isLast;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// Hook that only re-renders when streaming status changes
function useIsStreaming() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useIsStreaming must be used within MessageStoreProvider");
    // Cache must be stable and only updated when values actually change
    var _a = (0, solid_js_1.createSignal)(null), cacheRef = _a[0], setCacheRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            var isStreaming = store.status === "streaming" || store.status === "submitted";
            if (!cacheRef.current || cacheRef.current.isStreaming !== isStreaming || cacheRef.current.status !== store.status) {
                cacheRef.current = {
                    isStreaming: isStreaming,
                    status: store.status
                };
                onStoreChange();
            }
        });
    };
    var getSnapshot = function () {
        var isStreaming = store.status === "streaming" || store.status === "submitted";
        // Return cached value if it matches current state
        if (cacheRef.current && cacheRef.current.isStreaming === isStreaming && cacheRef.current.status === store.status) {
            return cacheRef.current;
        }
        // Create and cache new value
        cacheRef.current = {
            isStreaming: isStreaming,
            status: store.status
        };
        return cacheRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// For non-last messages - no streaming subscription needed
// Subscribes to message via Jotai messageAtomFamily, passes message as prop to AssistantMessageItem
var NonStreamingMessageItem = memo(function NonStreamingMessageItem(_a) {
    var messageId = _a.messageId, subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus;
    // Subscribe to this specific message via Jotai - only re-renders when THIS message changes
    var message = (0, jotai_1.useAtomValue)((0, message_store_1.messageAtomFamily)(messageId));
    if (!message)
        return null;
    return <assistant_message_item_1.AssistantMessageItem message={message} isLastMessage={false} isStreaming={false} status="ready" subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>;
});
// For the last message - subscribes to streaming status AND message via Jotai
// Passes message as prop to AssistantMessageItem
var StreamingMessageItem = memo(function StreamingMessageItem(_a) {
    var messageId = _a.messageId, subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus;
    // Subscribe to this specific message via Jotai - only re-renders when THIS message changes
    var message = (0, jotai_1.useAtomValue)((0, message_store_1.messageAtomFamily)(messageId));
    // Subscribe to streaming status
    var isStreaming = (0, jotai_1.useAtomValue)(message_store_1.isStreamingAtom);
    var status = (0, jotai_1.useAtomValue)(message_store_1.chatStatusAtom);
    if (!message)
        return null;
    return <assistant_message_item_1.AssistantMessageItem message={message} isLastMessage={true} isStreaming={isStreaming} status={status} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>;
});
// Combined hook - get message AND isLast in one subscription to avoid double re-renders
function useMessageWithLastStatus(messageId) {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useMessageWithLastStatus must be used within MessageStoreProvider");
    // Track what we last returned to detect changes
    var _a = (0, solid_js_1.createSignal)(null), lastReturnedRef = _a[0], setLastReturnedRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            var _a, _b, _c;
            var currentMsg = store.messages.find(function (m) { return m.id === messageId; });
            var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
            var isLast = messageId === lastMsgId;
            var msgChanged = ((_b = lastReturnedRef.current) === null || _b === void 0 ? void 0 : _b.message) !== currentMsg;
            var isLastChanged = ((_c = lastReturnedRef.current) === null || _c === void 0 ? void 0 : _c.isLast) !== isLast;
            // Only notify if message changed OR isLast changed
            // DO NOT update lastReturnedRef here - only in getSnapshot!
            if (!lastReturnedRef.current || msgChanged || isLastChanged) {
                onStoreChange();
            }
        });
    };
    var getSnapshot = function () {
        var _a;
        var currentMsg = store.messages.find(function (m) { return m.id === messageId; });
        var lastMsgId = store.messages.length > 0 ? (_a = store.messages[store.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
        var isLast = messageId === lastMsgId;
        // Return cached object if nothing changed
        if (lastReturnedRef.current && lastReturnedRef.current.message === currentMsg && lastReturnedRef.current.isLast === isLast) {
            return lastReturnedRef.current;
        }
        // Create new object and cache it
        lastReturnedRef.current = {
            message: currentMsg,
            isLast: isLast
        };
        return lastReturnedRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
exports.MessageItemWrapper = memo(function MessageItemWrapper(_a) {
    var messageId = _a.messageId, subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus;
    // Only subscribe to isLast - NOT to message content!
    // StreamingMessageItem and NonStreamingMessageItem will subscribe to message themselves
    var isLast = (0, jotai_1.useAtomValue)((0, message_store_1.isLastMessageAtomFamily)(messageId));
    // Only the last message subscribes to streaming status
    if (isLast) {
        // StreamingMessageItem subscribes to messageAtomFamily internally
        return <StreamingMessageItem messageId={messageId} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>;
    }
    // NonStreamingMessageItem subscribes to messageAtomFamily internally
    return <NonStreamingMessageItem messageId={messageId} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>;
});
function areMemoizedAssistantMessagesEqual(prev, next) {
    // Only re-render if IDs changed (new message added/removed)
    if (prev.assistantMsgIds.length !== next.assistantMsgIds.length) {
        return false;
    }
    // Check if all IDs are the same
    for (var i = 0; i < prev.assistantMsgIds.length; i++) {
        if (prev.assistantMsgIds[i] !== next.assistantMsgIds[i]) {
            return false;
        }
    }
    // Also check static props
    if (prev.subChatId !== next.subChatId)
        return false;
    if (prev.chatId !== next.chatId)
        return false;
    if (prev.isMobile !== next.isMobile)
        return false;
    if (prev.sandboxSetupStatus !== next.sandboxSetupStatus)
        return false;
    return true;
}
exports.MemoizedAssistantMessages = memo(function MemoizedAssistantMessages(_a) {
    var assistantMsgIds = _a.assistantMsgIds, subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus;
    // This component only re-renders when assistantMsgIds changes
    // During streaming, IDs stay the same, so this doesn't re-render
    // Therefore, MessageItemWrapper is never called, and the store
    // subscription handles updates directly
    return <>
      {assistantMsgIds.map(function (id) { return <exports.MessageItemWrapper key={id} messageId={id} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>; })}
    </>;
}, areMemoizedAssistantMessagesEqual);
// ============================================================================
// HOOKS FOR ISOLATED RENDERING
// ============================================================================
// Hook to get ALL messages (user + assistant) with stable references
function useAllMessages() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useAllMessages must be used within MessageStoreProvider");
    var _a = (0, solid_js_1.createSignal)([]), cacheRef = _a[0], setCacheRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(onStoreChange);
    };
    var getSnapshot = function () {
        // Return cached array if messages haven't changed
        if (cacheRef.current === store.messages) {
            return cacheRef.current;
        }
        cacheRef.current = store.messages;
        return cacheRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function useMessageGroups() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useMessageGroups must be used within MessageStoreProvider");
    // Cache for stable group references
    var _a = (0, solid_js_1.createSignal)([]), groupsCacheRef = _a[0], setGroupsCacheRef = _a[1];
    var _b = (0, solid_js_1.createSignal)(new Map()), assistantIdsCacheRef = _b[0], setAssistantIdsCacheRef = _b[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(onStoreChange);
    };
    var getSnapshot = function () {
        var messages = store.messages;
        // Compute groups
        var groups = [];
        var currentGroup = null;
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var msg = messages_1[_i];
            if (msg.role === "user") {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    userMsg: msg,
                    assistantMsgIds: [],
                    assistantMsgsCount: 0
                };
            }
            else if (currentGroup && msg.role === "assistant") {
                currentGroup.assistantMsgIds.push(msg.id);
                currentGroup.assistantMsgsCount++;
            }
        }
        if (currentGroup) {
            groups.push(currentGroup);
        }
        // Stabilize group references - only create new objects if content changed
        // Check if groups count changed
        if (groups.length !== groupsCacheRef.current.length) {
            var _loop_1 = function (i) {
                var newGroup = groups[i];
                var cachedGroup = groupsCacheRef.current[i];
                var cachedIds = assistantIdsCacheRef.current.get(newGroup.userMsg.id);
                // Stabilize assistantMsgIds array
                if (cachedIds && cachedIds.length === newGroup.assistantMsgIds.length && cachedIds.every(function (id, j) { return id === newGroup.assistantMsgIds[j]; })) {
                    newGroup.assistantMsgIds = cachedIds;
                }
                else {
                    assistantIdsCacheRef.current.set(newGroup.userMsg.id, newGroup.assistantMsgIds);
                }
                // Reuse cached group object if nothing changed
                if (cachedGroup && cachedGroup.userMsg === newGroup.userMsg && cachedGroup.assistantMsgIds === newGroup.assistantMsgIds && cachedGroup.assistantMsgsCount === newGroup.assistantMsgsCount) {
                    groups[i] = cachedGroup;
                }
            };
            // Stabilize individual groups
            for (var i = 0; i < groups.length; i++) {
                _loop_1(i);
            }
            groupsCacheRef.current = groups;
            return groups;
        }
        // Same length - check each group for changes
        var anyChanged = false;
        var _loop_2 = function (i) {
            var newGroup = groups[i];
            var cachedGroup = groupsCacheRef.current[i];
            var cachedIds = assistantIdsCacheRef.current.get(newGroup.userMsg.id);
            // Stabilize assistantMsgIds array
            if (cachedIds && cachedIds.length === newGroup.assistantMsgIds.length && cachedIds.every(function (id, j) { return id === newGroup.assistantMsgIds[j]; })) {
                newGroup.assistantMsgIds = cachedIds;
            }
            else {
                assistantIdsCacheRef.current.set(newGroup.userMsg.id, newGroup.assistantMsgIds);
                anyChanged = true;
            }
            // Check if group itself changed
            if (!cachedGroup || cachedGroup.userMsg !== newGroup.userMsg || cachedGroup.assistantMsgIds !== newGroup.assistantMsgIds || cachedGroup.assistantMsgsCount !== newGroup.assistantMsgsCount) {
                anyChanged = true;
            }
            else {
                // Reuse cached group
                groups[i] = cachedGroup;
            }
        };
        for (var i = 0; i < groups.length; i++) {
            _loop_2(i);
        }
        if (anyChanged) {
            groupsCacheRef.current = groups;
            return groups;
        }
        return groupsCacheRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
exports.MessagesList = memo(function MessagesList(_a) {
    var subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus;
    var messageIds = useMessageIds();
    return <>
      {messageIds.map(function (id) { return <exports.MessageItemWrapper key={id} messageId={id} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>; })}
    </>;
});
// ============================================================================
// HOOK: useUserMessageIds - Only returns user message IDs (for groups)
// ============================================================================
function useUserMessageIds() {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useUserMessageIds must be used within MessageStoreProvider");
    var _a = (0, solid_js_1.createSignal)([]), idsRef = _a[0], setIdsRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(onStoreChange);
    };
    var getSnapshot = function () {
        var newIds = store.messages.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.id; });
        // Only return new array if IDs actually changed
        if (newIds.length === idsRef.current.length && newIds.every(function (id, i) { return id === idsRef.current[i]; })) {
            return idsRef.current;
        }
        idsRef.current = newIds;
        return newIds;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// ============================================================================
// HOOK: useUserMessageWithAssistants - Get user message and its assistant IDs
// ============================================================================
function useUserMessageWithAssistants(userMsgId) {
    var store = (0, solid_js_1.useContext)(MessageStoreContext);
    if (!store)
        throw new Error("useUserMessageWithAssistants must be used within MessageStoreProvider");
    // Cache for stable return value
    var _a = (0, solid_js_1.createSignal)(null), cacheRef = _a[0], setCacheRef = _a[1];
    var subscribe = function (onStoreChange) {
        return store.subscribe(function () {
            var _a;
            // Get user message
            var userMsg = store.messages.find(function (m) { return m.id === userMsgId; });
            if (!userMsg) {
                if (((_a = cacheRef.current) === null || _a === void 0 ? void 0 : _a.userMsg) !== undefined) {
                    onStoreChange();
                }
                return;
            }
            // Find assistant messages that follow this user message
            var userIndex = store.messages.findIndex(function (m) { return m.id === userMsgId; });
            var assistantMsgIds = [];
            for (var i = userIndex + 1; i < store.messages.length; i++) {
                var msg = store.messages[i];
                if (msg.role === "user")
                    break;
                if (msg.role === "assistant") {
                    assistantMsgIds.push(msg.id);
                }
            }
            // Check if this is the last group
            var userMsgIds = store.messages.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.id; });
            var isLastGroup = userMsgIds[userMsgIds.length - 1] === userMsgId;
            // Check if anything changed
            if (cacheRef.current) {
                var idsChanged = assistantMsgIds.length !== cacheRef.current.assistantMsgIds.length || !assistantMsgIds.every(function (id, i) { return id === cacheRef.current.assistantMsgIds[i]; });
                var isLastChanged = isLastGroup !== cacheRef.current.isLastGroup;
                var userMsgChanged = userMsg !== cacheRef.current.userMsg;
                if (!idsChanged && !isLastChanged && !userMsgChanged) {
                    return;
                }
            }
            onStoreChange();
        });
    };
    var getSnapshot = function () {
        var userMsg = store.messages.find(function (m) { return m.id === userMsgId; });
        if (!userMsg) {
            if (!cacheRef.current || cacheRef.current.userMsg !== undefined) {
                cacheRef.current = {
                    userMsg: undefined,
                    assistantMsgIds: [],
                    isLastGroup: false
                };
            }
            return cacheRef.current;
        }
        // Find assistant messages
        var userIndex = store.messages.findIndex(function (m) { return m.id === userMsgId; });
        var assistantMsgIds = [];
        for (var i = userIndex + 1; i < store.messages.length; i++) {
            var msg = store.messages[i];
            if (msg.role === "user")
                break;
            if (msg.role === "assistant") {
                assistantMsgIds.push(msg.id);
            }
        }
        // Check if this is the last group
        var userMsgIds = store.messages.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.id; });
        var isLastGroup = userMsgIds[userMsgIds.length - 1] === userMsgId;
        // Return cached value if nothing changed
        if (cacheRef.current) {
            var idsMatch = assistantMsgIds.length === cacheRef.current.assistantMsgIds.length && assistantMsgIds.every(function (id, i) { return id === cacheRef.current.assistantMsgIds[i]; });
            if (userMsg === cacheRef.current.userMsg && idsMatch && isLastGroup === cacheRef.current.isLastGroup) {
                return cacheRef.current;
            }
            // Stabilize assistantMsgIds if they match
            if (idsMatch) {
                cacheRef.current = {
                    userMsg: userMsg,
                    assistantMsgIds: cacheRef.current.assistantMsgIds,
                    isLastGroup: isLastGroup
                };
                return cacheRef.current;
            }
        }
        cacheRef.current = {
            userMsg: userMsg,
            assistantMsgIds: assistantMsgIds,
            isLastGroup: isLastGroup
        };
        return cacheRef.current;
    };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function areSimpleGroupPropsEqual(prev, next) {
    return prev.userMsgId === next.userMsgId && prev.subChatId === next.subChatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.isSubChatsSidebarOpen === next.isSubChatsSidebarOpen && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupComponent === next.MessageGroupComponent && prev.toolRegistry === next.toolRegistry;
}
exports.SimpleIsolatedGroup = memo(function SimpleIsolatedGroup(_a) {
    var _b, _c, _d, _e, _f, _g;
    var userMsgId = _a.userMsgId, subChatId = _a.subChatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus, stickyTopClass = _a.stickyTopClass, sandboxSetupError = _a.sandboxSetupError, onRetrySetup = _a.onRetrySetup, UserBubbleComponent = _a.UserBubbleComponent, ToolCallComponent = _a.ToolCallComponent, MessageGroupComponent = _a.MessageGroupComponent, toolRegistry = _a.toolRegistry;
    // Subscribe to this specific user message and its assistant IDs
    var _h = useUserMessageWithAssistants(userMsgId), userMsg = _h.userMsg, assistantMsgIds = _h.assistantMsgIds, isLastGroup = _h.isLastGroup;
    var isStreaming = useStreamingStatus().isStreaming;
    if (!userMsg)
        return null;
    // User message data
    var rawTextContent = ((_b = userMsg.parts) === null || _b === void 0 ? void 0 : _b.filter(function (p) { return p.type === "text"; }).map(function (p) { return p.text; }).join("\n")) || "";
    var imageParts = ((_c = userMsg.parts) === null || _c === void 0 ? void 0 : _c.filter(function (p) { return p.type === "data-image"; })) || [];
    // Extract text mentions (quote/diff) to render separately above sticky block
    var _j = (0, solid_js_1.createMemo)(function () { return (0, render_file_mentions_1.extractTextMentions)(rawTextContent); }), textMentions = _j.textMentions, textContent = _j.cleanedText;
    // Show cloning when sandbox is being set up
    var shouldShowCloning = sandboxSetupStatus === "cloning" && isLastGroup && assistantMsgIds.length === 0;
    // Show setup error if sandbox setup failed
    var shouldShowSetupError = sandboxSetupStatus === "error" && isLastGroup && assistantMsgIds.length === 0;
    return <MessageGroupComponent>
      {/* Attachments - NOT sticky */}
      {imageParts.length > 0 && <div class="mb-2 pointer-events-auto">
          <UserBubbleComponent messageId={userMsg.id} textContent="" imageParts={imageParts} skipTextMentionBlocks/>
        </div>}

      {/* Text mentions (quote/diff/pasted) - NOT sticky */}
      {textMentions.length > 0 && <div class="mb-2 pointer-events-auto">
          <render_file_mentions_1.TextMentionBlocks mentions={textMentions}/>
        </div>}

      {/* User message text - sticky */}
      <div data-user-message-id={userMsg.id} class={"[&>div]:!mb-4 pointer-events-auto sticky z-10 ".concat(stickyTopClass)}>
        {/* Show "Using X" summary when no text but have attachments */}
        {!textContent.trim() && (imageParts.length > 0 || textMentions.length > 0) ? <div class="flex justify-start drop-shadow-[0_10px_20px_hsl(var(--background))]" data-user-bubble>
            <div class="space-y-2 w-full">
              <div class="bg-input-background border px-3 py-2 rounded-xl text-sm text-muted-foreground italic">
                {(function () {
                var parts = [];
                if (imageParts.length > 0) {
                    parts.push(imageParts.length === 1 ? "image" : "".concat(imageParts.length, " images"));
                }
                var quoteCount = textMentions.filter(function (m) { return m.type === "quote" || m.type === "pasted"; }).length;
                var codeCount = textMentions.filter(function (m) { return m.type === "diff"; }).length;
                if (quoteCount > 0) {
                    parts.push(quoteCount === 1 ? "selected text" : "".concat(quoteCount, " text selections"));
                }
                if (codeCount > 0) {
                    parts.push(codeCount === 1 ? "code selection" : "".concat(codeCount, " code selections"));
                }
                return "Using ".concat(parts.join(", "));
            })()}
              </div>
            </div>
          </div> : <UserBubbleComponent messageId={userMsg.id} textContent={textContent} imageParts={[]} skipTextMentionBlocks/>}

        {/* Cloning indicator */}
        {shouldShowCloning && <div class="mt-4">
            <ToolCallComponent icon={(_d = toolRegistry["tool-cloning"]) === null || _d === void 0 ? void 0 : _d.icon} title={((_e = toolRegistry["tool-cloning"]) === null || _e === void 0 ? void 0 : _e.title({})) || "Cloning..."} isPending={true} isError={false}/>
          </div>}

        {/* Setup error with retry */}
        {shouldShowSetupError && <div class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div class="flex items-center gap-2 text-destructive text-sm">
              <span>
                Failed to set up sandbox
                {sandboxSetupError ? ": ".concat(sandboxSetupError) : ""}
              </span>
              {onRetrySetup && <button class="px-2 py-1 text-sm hover:bg-destructive/20 rounded" onClick={onRetrySetup}>
                  Retry
                </button>}
            </div>
          </div>}
      </div>

      {/* Assistant messages */}
      {assistantMsgIds.length > 0 && <exports.MemoizedAssistantMessages assistantMsgIds={assistantMsgIds} subChatId={subChatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus}/>}

      {/* Planning indicator */}
      {isStreaming && isLastGroup && assistantMsgIds.length === 0 && sandboxSetupStatus === "ready" && <div class="mt-4">
          <ToolCallComponent icon={(_f = toolRegistry["tool-planning"]) === null || _f === void 0 ? void 0 : _f.icon} title={((_g = toolRegistry["tool-planning"]) === null || _g === void 0 ? void 0 : _g.title({})) || "Planning..."} isPending={true} isError={false}/>
        </div>}
    </MessageGroupComponent>;
}, areSimpleGroupPropsEqual);
function areSimpleListPropsEqual(prev, next) {
    return prev.subChatId === next.subChatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.isSubChatsSidebarOpen === next.isSubChatsSidebarOpen && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupComponent === next.MessageGroupComponent && prev.toolRegistry === next.toolRegistry;
}
exports.SimpleIsolatedMessagesList = memo(function SimpleIsolatedMessagesList(_a) {
    var subChatId = _a.subChatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus, isSubChatsSidebarOpen = _a.isSubChatsSidebarOpen, stickyTopClass = _a.stickyTopClass, sandboxSetupError = _a.sandboxSetupError, onRetrySetup = _a.onRetrySetup, UserBubbleComponent = _a.UserBubbleComponent, ToolCallComponent = _a.ToolCallComponent, MessageGroupComponent = _a.MessageGroupComponent, toolRegistry = _a.toolRegistry;
    // Subscribe to user message IDs only
    var userMsgIds = useUserMessageIds();
    return <>
      {userMsgIds.map(function (userMsgId) { return <exports.SimpleIsolatedGroup key={userMsgId} userMsgId={userMsgId} subChatId={subChatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus} isSubChatsSidebarOpen={isSubChatsSidebarOpen} stickyTopClass={stickyTopClass} sandboxSetupError={sandboxSetupError} onRetrySetup={onRetrySetup} UserBubbleComponent={UserBubbleComponent} ToolCallComponent={ToolCallComponent} MessageGroupComponent={MessageGroupComponent} toolRegistry={toolRegistry}/>; })}
    </>;
}, areSimpleListPropsEqual);
