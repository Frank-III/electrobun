"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowProvider = WindowProvider;
exports.useWindowId = useWindowId;
exports.getWindowId = getWindowId;
exports.getInitialWindowParams = getInitialWindowParams;
var solid_js_1 = require("solid-js");
var WindowContext = (0, solid_js_1.createContext)("default");
function WindowProvider(_a) {
    var children = _a.children;
    var windowId = (0, solid_js_1.createMemo)(function () {
        return getWindowId();
    });
    return <WindowContext.Provider value={windowId}>
      {children}
    </WindowContext.Provider>;
}
function useWindowId() {
    return (0, solid_js_1.useContext)(WindowContext);
}
// Global getter for use outside React (in atom definitions)
// This is cached after first call for the lifetime of the window
var globalWindowId = null;
/**
* Get the unique window ID for this Electron window.
* Can be called outside of React components (e.g., in atom definitions).
*
* Priority:
* 1. URL query param (dev mode): ?windowId=1
* 2. URL hash param (production): #windowId=1
* 3. sessionStorage fallback (generates unique ID per tab/window)
*/
function getWindowId() {
    if (globalWindowId)
        return globalWindowId;
    // Try URL params first (dev mode)
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get("windowId");
    // Try hash params (production file:// URLs)
    if (!id && window.location.hash) {
        var hashParams = new URLSearchParams(window.location.hash.slice(1));
        id = hashParams.get("windowId");
    }
    // Fallback: use sessionStorage to preserve ID across page refresh
    // This handles cases like page refresh where URL params may be lost
    if (!id) {
        id = sessionStorage.getItem("windowId");
        if (!id) {
            // Default to "main" - this is the expected ID for the primary window
            // Using a stable default prevents orphan localStorage keys
            id = "main";
            sessionStorage.setItem("windowId", id);
        }
    }
    else {
        // Store the ID in sessionStorage so it persists across navigation/refresh
        sessionStorage.setItem("windowId", id);
    }
    globalWindowId = id;
    console.log("[WindowContext] Window ID:", id);
    return id;
}
/**
* Get initial window params (chatId, subChatId) passed when opening a new window.
* These are one-time use - cleared from sessionStorage after first read.
*/
function getInitialWindowParams() {
    // Check if already consumed
    var consumed = sessionStorage.getItem("windowParamsConsumed");
    if (consumed)
        return {};
    // Try URL params first (dev mode)
    var urlParams = new URLSearchParams(window.location.search);
    var chatId = urlParams.get("chatId");
    var subChatId = urlParams.get("subChatId");
    // Try hash params (production file:// URLs)
    if (!chatId && window.location.hash) {
        var hashParams = new URLSearchParams(window.location.hash.slice(1));
        chatId = hashParams.get("chatId");
        subChatId = hashParams.get("subChatId");
    }
    // Mark as consumed so we don't re-apply on hot reload
    if (chatId || subChatId) {
        sessionStorage.setItem("windowParamsConsumed", "true");
    }
    return {
        chatId: chatId || undefined,
        subChatId: subChatId || undefined
    };
}
