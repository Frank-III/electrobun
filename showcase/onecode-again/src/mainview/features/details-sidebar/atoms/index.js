"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planContentCacheAtomFamily = exports.focusedSectionAtom = exports.detailsSidebarWidthAtom = exports.expandedSectionsAtomFamily = exports.detailsSidebarOpenAtom = exports.unifiedSidebarEnabledAtom = exports.expandedWidgetSidebarWidthAtom = exports.expandedWidgetAtomFamily = exports.widgetOrderAtomFamily = exports.widgetVisibilityAtomFamily = exports.WIDGET_REGISTRY = void 0;
var solid_js_1 = require("solid-js");
var signal_storage_1 = require("../../../lib/state/signal-storage");
var signal_map_1 = require("../../../lib/state/signal-map");
var window_storage_1 = require("../../../lib/window-storage");
var lucide_react_1 = require("lucide-react");
exports.WIDGET_REGISTRY = [
    { id: "info", label: "Workspace", icon: lucide_react_1.Box, canExpand: false, defaultVisible: true },
    { id: "todo", label: "To-dos", icon: lucide_react_1.ListTodo, canExpand: false, defaultVisible: true },
    { id: "plan", label: "Plan", icon: lucide_react_1.FileText, canExpand: true, defaultVisible: true },
    { id: "terminal", label: "Terminal", icon: lucide_react_1.Terminal, canExpand: true, defaultVisible: false },
    { id: "diff", label: "Changes", icon: lucide_react_1.FileDiff, canExpand: true, defaultVisible: true },
];
// Helper to get default visible widgets
var DEFAULT_VISIBLE_WIDGETS = exports.WIDGET_REGISTRY
    .filter(function (w) { return w.defaultVisible; })
    .map(function (w) { return w.id; });
// Default widget order (all widgets)
var DEFAULT_WIDGET_ORDER = exports.WIDGET_REGISTRY.map(function (w) { return w.id; });
// ============================================================================
// Widget Visibility (per workspace)
// ============================================================================
var widgetVisibilityStorageAtom = (0, signal_storage_1.createStoredSignal)("overview:widgetVisibility", {}, undefined, { getOnInit: true });
exports.widgetVisibilityAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(widgetVisibilityStorageAtom, DEFAULT_VISIBLE_WIDGETS);
// ============================================================================
// Widget Order (per workspace) - controls display order of all widgets
// ============================================================================
var widgetOrderStorageAtom = (0, signal_storage_1.createStoredSignal)("overview:widgetOrder", {}, undefined, { getOnInit: true });
exports.widgetOrderAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(widgetOrderStorageAtom, DEFAULT_WIDGET_ORDER);
// ============================================================================
// Expanded Widget State (per workspace, runtime only - not persisted)
// ============================================================================
// Which widget is currently expanded as a separate sidebar
// null = no widget expanded
var expandedWidgetStorageAtom = (0, solid_js_1.createSignal)({});
exports.expandedWidgetAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(expandedWidgetStorageAtom, null);
// Expanded widget sidebar width
exports.expandedWidgetSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("overview:expandedWidgetWidth", 500, undefined, { getOnInit: true });
// ============================================================================
// Feature Flag & Sidebar State
// ============================================================================
// Feature flag for unified vs separate sidebars (for future toggle)
exports.unifiedSidebarEnabledAtom = (0, signal_storage_1.createStoredSignal)("overview:unifiedEnabled", true, // Enable by default
undefined, { getOnInit: true });
// Details sidebar open state (per-window, persisted)
exports.detailsSidebarOpenAtom = (0, window_storage_1.atomWithWindowStorage)("overview:sidebarOpen", false, { getOnInit: true });
// Default expanded sections
var DEFAULT_EXPANDED_SECTIONS = ["info", "plan", "terminal"];
// Section expand states (per workspace) - stores array of expanded section IDs
var sectionExpandStorageAtom = (0, signal_storage_1.createStoredSignal)("overview:expandedSections", {}, undefined, { getOnInit: true });
exports.expandedSectionsAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(sectionExpandStorageAtom, DEFAULT_EXPANDED_SECTIONS);
// Unified sidebar width (persisted)
exports.detailsSidebarWidthAtom = (0, signal_storage_1.createStoredSignal)("overview:sidebarWidth", 500, undefined, { getOnInit: true });
// Focused section for "focus mode" (when a section needs more space like Diff)
// null = normal mode, section name = focused mode
exports.focusedSectionAtom = (0, solid_js_1.createSignal)(null);
// Runtime cache for plan content per workspace (not persisted)
var planContentCacheStorageAtom = (0, solid_js_1.createSignal)({});
exports.planContentCacheAtomFamily = (0, signal_map_1.createKeyedSignalFamily)(planContentCacheStorageAtom, null);
