import { createSignal } from "solid-js"
import { createStoredSignal } from "../../lib/state/signal-storage"
import { createKeyedSignalFamily } from "../../lib/state/signal-map"
import { atomWithWindowStorage } from "../../lib/window-storage"
import type { TerminalInstance } from "./types"

// Storage atom for persisting per-chat terminal sidebar state - window-scoped
const terminalSidebarOpenStorageAtom = atomWithWindowStorage<Record<string, boolean>>(
  "terminal-sidebar-open-by-chat",
  {},
  { getOnInit: true },
)

// Per-chat terminal sidebar open state (like diffSidebarOpenAtomFamily)
export const terminalSidebarOpenAtomFamily = createKeyedSignalFamily(
  terminalSidebarOpenStorageAtom,
  false
)

// Deprecated: Keep for backwards compatibility, but should not be used
// Use terminalSidebarOpenAtomFamily(chatId) instead
export const terminalSidebarOpenAtom = createSignal(false)

export const terminalSidebarWidthAtom = createStoredSignal<number>(
  "terminal-sidebar-width",
  500,
  undefined,
  { getOnInit: true },
)

// Terminal cwd tracking - window-scoped, maps paneId to current working directory
export const terminalCwdAtom = atomWithWindowStorage<Record<string, string>>(
  "terminal-cwds",
  {},
  { getOnInit: true },
)

// Terminal search open state - maps paneId to search visibility
export const terminalSearchOpenAtom = createSignal<Record<string, boolean>>({})

// ============================================================================
// Multi-Terminal State Management
// ============================================================================

/**
 * Map of chatId -> terminal instances.
 * Window-scoped so each window manages its own terminal instances.
 */
export const terminalsAtom = atomWithWindowStorage<
  Record<string, TerminalInstance[]>
>("terminals-by-chat", {}, { getOnInit: true })

/**
 * Map of chatId -> active terminal id.
 * Window-scoped - tracks which terminal is currently active for each chat in this window.
 */
export const activeTerminalIdAtom = atomWithWindowStorage<
  Record<string, string | null>
>("active-terminal-by-chat", {}, { getOnInit: true })
