import { createSignal } from "solid-js"
import { createPersistedSignal } from "../../../lib/state/signal-storage"
import { createKeyedSignalFamily } from "../../../lib/state/signal-map"
import { makeWindowPersistedSignal } from "../../../lib/window-storage"
import type { Component } from "solid-js"
import { Box, FileText, Terminal, FileDiff, ListTodo } from "lucide-solid"

// ============================================================================
// Widget System Types & Registry
// ============================================================================

export type WidgetId = "info" | "todo" | "plan" | "terminal" | "diff"

export interface WidgetConfig {
  id: WidgetId
  label: string
  icon: Component<{ class?: string }>
  canExpand: boolean // true = can open as separate sidebar
  defaultVisible: boolean
}

export const WIDGET_REGISTRY: WidgetConfig[] = [
  { id: "info", label: "Workspace", icon: Box, canExpand: false, defaultVisible: true },
  { id: "todo", label: "To-dos", icon: ListTodo, canExpand: false, defaultVisible: true },
  { id: "plan", label: "Plan", icon: FileText, canExpand: true, defaultVisible: true },
  { id: "terminal", label: "Terminal", icon: Terminal, canExpand: true, defaultVisible: false },
  { id: "diff", label: "Changes", icon: FileDiff, canExpand: true, defaultVisible: true },
]

// Helper to get default visible widgets
const DEFAULT_VISIBLE_WIDGETS: WidgetId[] = WIDGET_REGISTRY
  .filter((w) => w.defaultVisible)
  .map((w) => w.id)

// Default widget order (all widgets)
const DEFAULT_WIDGET_ORDER: WidgetId[] = WIDGET_REGISTRY.map((w) => w.id)

// ============================================================================
// Widget Visibility (per workspace)
// ============================================================================

const widgetVisibilityStorageAtom = createPersistedSignal<Record<string, WidgetId[]>>(
  "overview:widgetVisibility",
  {},
)

export const widgetVisibilityAtomFamily = createKeyedSignalFamily(
  widgetVisibilityStorageAtom,
  DEFAULT_VISIBLE_WIDGETS
)

// ============================================================================
// Widget Order (per workspace) - controls display order of all widgets
// ============================================================================

const widgetOrderStorageAtom = createPersistedSignal<Record<string, WidgetId[]>>(
  "overview:widgetOrder",
  {},
)

export const widgetOrderAtomFamily = createKeyedSignalFamily(
  widgetOrderStorageAtom,
  DEFAULT_WIDGET_ORDER
)

// ============================================================================
// Expanded Widget State (per workspace, runtime only - not persisted)
// ============================================================================

// Which widget is currently expanded as a separate sidebar
// null = no widget expanded
const expandedWidgetStorageAtom = createSignal<Record<string, WidgetId | null>>({})

export const expandedWidgetAtomFamily = createKeyedSignalFamily(
  expandedWidgetStorageAtom,
  null
)

// Expanded widget sidebar width
export const expandedWidgetSidebarWidthAtom = createPersistedSignal<number>(
  "overview:expandedWidgetWidth",
  500,
)

// ============================================================================
// Feature Flag & Sidebar State
// ============================================================================

// Feature flag for unified vs separate sidebars (for future toggle)
export const unifiedSidebarEnabledAtom = createPersistedSignal<boolean>(
  "overview:unifiedEnabled",
  true,
)

// Details sidebar open state (per-window, persisted)
export const detailsSidebarOpenAtom = makeWindowPersistedSignal<boolean>(
  "overview:sidebarOpen",
  false,
)

// Section types for the overview sidebar
export type OverviewSection = "info" | "plan" | "terminal" | "diff"

// Default expanded sections
const DEFAULT_EXPANDED_SECTIONS: OverviewSection[] = ["info", "plan", "terminal"]

// Section expand states (per workspace) - stores array of expanded section IDs
const sectionExpandStorageAtom = createPersistedSignal<
  Record<string, OverviewSection[]>
>("overview:expandedSections", {})

export const expandedSectionsAtomFamily = createKeyedSignalFamily(
  sectionExpandStorageAtom,
  DEFAULT_EXPANDED_SECTIONS
)

// Unified sidebar width (persisted)
export const detailsSidebarWidthAtom = createPersistedSignal<number>(
  "overview:sidebarWidth",
  500,
)

// Focused section for "focus mode" (when a section needs more space like Diff)
// null = normal mode, section name = focused mode
export const focusedSectionAtom = createSignal<OverviewSection | null>(null)

// ============================================================================
// Plan Content Cache (per workspace) - prevents flashing loading states
// ============================================================================

export interface PlanContentCache {
  content: string
  planPath: string
  // Track if content is ready (file loaded successfully)
  isReady: boolean
}

// Runtime cache for plan content per workspace (not persisted)
const planContentCacheStorageAtom = createSignal<Record<string, PlanContentCache | null>>({})

export const planContentCacheAtomFamily = createKeyedSignalFamily(
  planContentCacheStorageAtom,
  null
)
