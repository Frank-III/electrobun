"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatActions = useChatActions;
exports.ChatDataSync = ChatDataSync;
var solid_js_1 = require("solid-js");
var react_1 = require("@ai-sdk/react");
var jotai_1 = require("../../../lib/state/jotai");
var message_store_1 = require("../stores/message-store");
var ChatActionsContext = (0, solid_js_1.createContext)(null);
function useChatActions() {
    var context = (0, solid_js_1.useContext)(ChatActionsContext);
    if (!context) {
        throw new Error("useChatActions must be used within ChatDataSync");
    }
    return context;
}
function ChatDataSync(_a) {
    var chat = _a.chat, subChatId = _a.subChatId, streamId = _a.streamId, children = _a.children;
    // Call useChat - this causes re-renders on every chunk
    var _b = (0, react_1.useChat)({
        id: subChatId,
        chat: chat,
        resume: !!streamId,
        experimental_throttle: 50
    }), messages = _b.messages, sendMessage = _b.sendMessage, status = _b.status, stop = _b.stop, regenerate = _b.regenerate;
    // Get setter for Jotai store
    var syncMessages = (0, jotai_1.useSetAtom)(message_store_1.syncMessagesWithStatusAtom);
    // Sync to Jotai store - this is the ONLY thing we do with messages
    // Using useLayoutEffect to sync before paint
    // CRITICAL: Must pass subChatId to correctly key caches per chat
    (0, solid_js_1.createEffect)(function () {
        syncMessages({
            messages: messages,
            status: status,
            subChatId: subChatId
        });
    });
    // Stable refs for actions to prevent context recreation
    var _c = (0, solid_js_1.createSignal)({
        sendMessage: sendMessage,
        stop: stop,
        regenerate: regenerate,
        status: status
    }), actionsRef = _c[0], setActionsRef = _c[1];
    // Update refs (no re-render triggered)
    actionsRef.current.sendMessage = sendMessage;
    actionsRef.current.stop = stop;
    actionsRef.current.regenerate = regenerate;
    actionsRef.current.status = status;
    // Memoized context value - only recreate when status changes
    // (actions are accessed via ref, so they're always current)
    var contextValue = useRef({
        get sendMessage() {
            return actionsRef.current.sendMessage;
        },
        get stop() {
            return actionsRef.current.stop;
        },
        get regenerate() {
            return actionsRef.current.regenerate;
        },
        get status() {
            return actionsRef.current.status;
        }
    }).current;
    return <ChatActionsContext.Provider value={contextValue}>
      {children}
    </ChatActionsContext.Provider>;
}
