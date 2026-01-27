"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentChatStore = void 0;
/**
 * Simple module-level storage for Chat objects.
 * Lives outside React lifecycle so chats persist across component mount/unmount.
 */
var chats = new Map();
var streamIds = new Map();
var parentChatIds = new Map(); // subChatId → parentChatId (stored at creation time)
var manuallyAborted = new Map(); // Track if chat was manually stopped
exports.agentChatStore = {
    get: function (id) { return chats.get(id); },
    set: function (id, chat, parentChatId) {
        chats.set(id, chat);
        parentChatIds.set(id, parentChatId);
    },
    has: function (id) { return chats.has(id); },
    delete: function (id) {
        chats.delete(id);
        streamIds.delete(id);
        parentChatIds.delete(id);
        manuallyAborted.delete(id);
    },
    // Get the ORIGINAL parentChatId that was set when the Chat was created
    getParentChatId: function (subChatId) { return parentChatIds.get(subChatId); },
    getStreamId: function (id) { return streamIds.get(id); },
    setStreamId: function (id, streamId) {
        streamIds.set(id, streamId);
    },
    // Track manual abort to prevent completion sound
    setManuallyAborted: function (id, aborted) {
        manuallyAborted.set(id, aborted);
    },
    wasManuallyAborted: function (id) { var _a; return (_a = manuallyAborted.get(id)) !== null && _a !== void 0 ? _a : false; },
    clearManuallyAborted: function (id) {
        manuallyAborted.delete(id);
    },
    clear: function () {
        chats.clear();
        streamIds.clear();
        parentChatIds.clear();
        manuallyAborted.clear();
    },
};
