"use strict";
/**
 * Platform detection utilities for Agents Desktop
 *
 * Detects whether the app is running in Electron desktop app
 * and provides platform-specific shortcuts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHORTCUTS = void 0;
exports.isDesktopApp = isDesktopApp;
exports.getPlatform = getPlatform;
exports.isMacOS = isMacOS;
exports.isWindows = isWindows;
exports.isLinux = isLinux;
exports.getShortcutDisplay = getShortcutDisplay;
exports.getHotkey = getHotkey;
exports.getShortcut = getShortcut;
exports.getShortcutKey = getShortcutKey;
exports.getShortcutHotkey = getShortcutHotkey;
exports.useShortcut = useShortcut;
/**
 * Check if running inside Electron desktop app
 */
function isDesktopApp() {
    if (typeof window === "undefined")
        return false;
    return !!window.desktopApi;
}
/**
 * Get the current platform
 */
function getPlatform() {
    var _a;
    if (typeof window !== "undefined" && ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.platform)) {
        return window.desktopApi.platform;
    }
    return "unknown";
}
/**
 * Check if running on macOS
 */
function isMacOS() {
    return getPlatform() === "darwin";
}
/**
 * Check if running on Windows
 */
function isWindows() {
    return getPlatform() === "win32";
}
/**
 * Check if running on Linux
 */
function isLinux() {
    return getPlatform() === "linux";
}
/**
 * Get the correct shortcut display string based on platform
 * In web browser: uses Option (⌥) modifier for shortcuts that would conflict
 * In Electron: uses simpler shortcuts without Option
 *
 * @param webShortcut - Shortcut string for web browser (e.g., "⌥⌘N")
 * @param desktopShortcut - Shortcut string for desktop app (e.g., "⌘N")
 */
function getShortcutDisplay(webShortcut, desktopShortcut) {
    return isDesktopApp() ? desktopShortcut : webShortcut;
}
/**
 * Get the correct hotkey string for registration
 *
 * @param webHotkey - Hotkey for web browser (e.g., "opt+cmd+n")
 * @param desktopHotkey - Hotkey for desktop app (e.g., "cmd+n")
 */
function getHotkey(webHotkey, desktopHotkey) {
    return isDesktopApp() ? desktopHotkey : webHotkey;
}
/**
 * Shortcut mappings for common actions
 * Each entry has both web and desktop variants
 */
exports.SHORTCUTS = {
    newAgent: {
        web: { hotkey: "opt+cmd+n", display: "⌥⌘N" },
        desktop: { hotkey: "cmd+n", display: "⌘N" },
    },
    newTab: {
        web: { hotkey: "opt+cmd+t", display: "⌥⌘T" },
        desktop: { hotkey: "cmd+t", display: "⌘T" },
    },
    closeTab: {
        web: { hotkey: "opt+cmd+w", display: "⌥⌘W" },
        desktop: { hotkey: "cmd+w", display: "⌘W" },
    },
    prevTab: {
        web: { hotkey: "opt+cmd+[", display: "⌥⌘[" },
        desktop: { hotkey: "cmd+[", display: "⌘[" },
    },
    nextTab: {
        web: { hotkey: "opt+cmd+]", display: "⌥⌘]" },
        desktop: { hotkey: "cmd+]", display: "⌘]" },
    },
    archiveAgent: {
        web: { hotkey: "opt+cmd+e", display: "⌥⌘E" },
        desktop: { hotkey: "cmd+e", display: "⌘E" },
    },
    quickSwitchAgents: {
        web: { hotkey: "opt+ctrl+tab", display: "⌥⌃Tab" },
        desktop: { hotkey: "opt+ctrl+tab", display: "⌥⌃Tab" },
    },
    quickSwitchSubChats: {
        web: { hotkey: "ctrl+tab", display: "⌃Tab" },
        desktop: { hotkey: "ctrl+tab", display: "⌃Tab" },
    },
    preview: {
        web: { hotkey: "opt+cmd+p", display: "⌥⌘P" },
        desktop: { hotkey: "cmd+p", display: "⌘P" },
    },
    toggleSidebar: {
        web: { hotkey: "cmd+backslash", display: "⌘\\" },
        desktop: { hotkey: "cmd+backslash", display: "⌘\\" },
    },
    settings: {
        web: { hotkey: "cmd+comma", display: "⌘," },
        desktop: { hotkey: "cmd+comma", display: "⌘," },
    },
    invite: {
        web: { hotkey: "cmd+shift+i", display: "⌘⇧I" },
        desktop: { hotkey: "cmd+shift+i", display: "⌘⇧I" },
    },
    focusChat: {
        web: { hotkey: "cmd+d", display: "⌘D" },
        desktop: { hotkey: "cmd+d", display: "⌘D" },
    },
    shortcuts: {
        web: { hotkey: "?", display: "?" },
        desktop: { hotkey: "?", display: "?" },
    },
    terminal: {
        web: { hotkey: "cmd+j", display: "⌘J" },
        desktop: { hotkey: "cmd+j", display: "⌘J" },
    },
};
/**
 * Get shortcut info for the current platform
 */
function getShortcut(key) {
    var shortcut = exports.SHORTCUTS[key];
    return isDesktopApp() ? shortcut.desktop : shortcut.web;
}
/**
 * Get shortcut display string for the current platform
 */
function getShortcutKey(key) {
    return getShortcut(key).display;
}
/**
 * Get hotkey string for the current platform
 */
function getShortcutHotkey(key) {
    return getShortcut(key).hotkey;
}
/**
 * React hook to get platform-aware shortcut (re-renders on mount)
 */
function useShortcut(key) {
    // This will be correct after hydration
    // SSR will use web variant, then client will update if desktop
    if (typeof window === "undefined") {
        return exports.SHORTCUTS[key].web;
    }
    return getShortcut(key);
}
