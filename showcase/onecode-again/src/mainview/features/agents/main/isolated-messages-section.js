"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolatedMessagesSection = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var message_store_1 = require("../stores/message-store");
var isolated_message_group_1 = require("./isolated-message-group");
function areSectionPropsEqual(prev, next) {
    return prev.subChatId === next.subChatId && prev.chatId === next.chatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupWrapper === next.MessageGroupWrapper && prev.toolRegistry === next.toolRegistry;
}
exports.IsolatedMessagesSection = (0, solid_js_1.memo)(function IsolatedMessagesSection(_a) {
    var subChatId = _a.subChatId, chatId = _a.chatId, isMobile = _a.isMobile, sandboxSetupStatus = _a.sandboxSetupStatus, stickyTopClass = _a.stickyTopClass, sandboxSetupError = _a.sandboxSetupError, onRetrySetup = _a.onRetrySetup, UserBubbleComponent = _a.UserBubbleComponent, ToolCallComponent = _a.ToolCallComponent, MessageGroupWrapper = _a.MessageGroupWrapper, toolRegistry = _a.toolRegistry;
    // CRITICAL: Check if global atoms are synced for THIS subChat FIRST
    // With keep-alive tabs, multiple ChatViewInner instances exist simultaneously.
    // Global atoms (messageIdsAtom, etc.) contain data from the ACTIVE tab only.
    // When a tab becomes active, useLayoutEffect syncs its messages to global atoms,
    // but that happens AFTER this component renders. So on first render after activation,
    // we might read stale data from the previous active tab.
    //
    // Solution: Check currentSubChatIdAtom BEFORE reading userMessageIdsAtom.
    // If it doesn't match our subChatId, return empty to avoid showing wrong messages.
    // The useLayoutEffect will sync and update currentSubChatIdAtom, which triggers
    // a re-render of this component (since we're subscribed to it).
    var currentSubChatId = (0, jotai_1.useAtomValue)(message_store_1.currentSubChatIdAtom);
    // Subscribe to user message IDs - but only use them if we're the active chat
    var userMsgIds = (0, jotai_1.useAtomValue)(message_store_1.userMessageIdsAtom);
    if (currentSubChatId !== subChatId) {
        // Data not synced yet - render nothing, we'll re-render when currentSubChatIdAtom updates
        return null;
    }
    return <>
      {userMsgIds.map(function (userMsgId) { return <isolated_message_group_1.IsolatedMessageGroup key={userMsgId} userMsgId={userMsgId} subChatId={subChatId} chatId={chatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus} stickyTopClass={stickyTopClass} sandboxSetupError={sandboxSetupError} onRetrySetup={onRetrySetup} UserBubbleComponent={UserBubbleComponent} ToolCallComponent={ToolCallComponent} MessageGroupWrapper={MessageGroupWrapper} toolRegistry={toolRegistry}/>; })}
    </>;
}, areSectionPropsEqual);
