"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// SolidJS Entry Point
var web_1 = require("solid-js/web");
var App_1 = require("./App");
require("./styles/globals.css");
var diff_view_highlighter_1 = require("./lib/themes/diff-view-highlighter");
// Preload shiki highlighter for diff view (prevents delay when opening diff sidebar)
(0, diff_view_highlighter_1.preloadDiffHighlighter)();
// Suppress ResizeObserver loop error - this is a non-fatal browser warning
// that can occur when layout changes trigger observation callbacks
// Common with virtualization libraries and diff viewers
var resizeObserverErr = /ResizeObserver loop/;
// Handle both error event and unhandledrejection
window.addEventListener("error", function (e) {
    if (e.message && resizeObserverErr.test(e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    }
});
// Also override window.onerror for broader coverage
var originalOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === "string" && resizeObserverErr.test(message)) {
        return true;
    }
    if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
    }
    return false;
};
var rootElement = document.getElementById("root");
if (rootElement) {
    (0, web_1.render)(function () { return <App_1.App />; }, rootElement);
}
