"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeTerminalIdAtom = exports.terminalsAtom = exports.terminalSearchOpenAtom = exports.terminalCwdAtom = exports.terminalSidebarWidthAtom = exports.terminalSidebarOpenAtom = exports.terminalSidebarOpenAtomFamily = void 0;
var solid_js_1 = require("solid-js");
var signal_storage_1 = require("../../lib/state/signal-storage");
var signal_map_1 = require("../../lib/state/signal-map");
var window_storage_1 = require("../../lib/window-storage");
// Storage atom for persisting per-chat terminal sidebar state - window-scoped
var terminalSidebarOpenStorageAtom = (0, window_storage_1.atomWithWindowStorage)("terminal-sidebar-open-by-chat", {}, { getOnInit: true });
// Per-chat terminal sidebar open state (like diffSidebarOpenAtomFamily)
exports.terminalSidebarOpenAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(terminalSidebarOpenStorageAtom, false);
// Deprecated: Keep for backwards compatibility, but should not be used
// Use terminalSidebarOpenAtomFamily(chatId) instead
exports.terminalSidebarOpenAtom = (0, solid_js_1.createSignal)(false);
exports.terminalSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("terminal-sidebar-width", 500, undefined, { getOnInit: true });
// Terminal cwd tracking - window-scoped, maps paneId to current working directory
exports.terminalCwdAtom = (0, window_storage_1.atomWithWindowStorage)("terminal-cwds", {}, { getOnInit: true });
// Terminal search open state - maps paneId to search visibility
exports.terminalSearchOpenAtom = (0, solid_js_1.createSignal)({});
// ============================================================================
// Multi-Terminal State Management
// ============================================================================
/**
 * Map of chatId -> terminal instances.
 * Window-scoped so each window manages its own terminal instances.
 */
exports.terminalsAtom = (0, window_storage_1.atomWithWindowStorage)("terminals-by-chat", {}, { getOnInit: true });
/**
 * Map of chatId -> active terminal id.
 * Window-scoped - tracks which terminal is currently active for each chat in this window.
 */
exports.activeTerminalIdAtom = (0, window_storage_1.atomWithWindowStorage)("active-terminal-by-chat", {}, { getOnInit: true });
