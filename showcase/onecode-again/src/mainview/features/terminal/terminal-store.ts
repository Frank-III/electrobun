import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { createWindowScopedRawStorage } from "@/lib/window-storage";
import type { TerminalInstance } from "./types";

const STORAGE_KEY = "terminal-store";

export type TerminalState = {
  /** Per-chat: is terminal sidebar open */
  sidebarOpenByChatId: Record<string, boolean>;
  /** Terminal sidebar width (px) */
  sidebarWidth: number;
  /** Per-pane: current working directory */
  cwdByPaneId: Record<string, string>;
  /** Per-pane: is search open */
  searchOpenByPaneId: Record<string, boolean>;
  /** Per-chat: terminal instances */
  terminalsByChatId: Record<string, TerminalInstance[]>;
  /** Per-chat: active terminal id */
  activeTerminalIdByChatId: Record<string, string | null>;
};

const defaultState: TerminalState = {
  sidebarOpenByChatId: {},
  sidebarWidth: 500,
  cwdByPaneId: {},
  searchOpenByPaneId: {},
  terminalsByChatId: {},
  activeTerminalIdByChatId: {},
};

function parseJson<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Read initial state from localStorage (window-scoped). Migrates from old per-key format. */
export function getInitialTerminalState(): TerminalState {
  const storage = createWindowScopedRawStorage();

  const stored = storage.getItem(STORAGE_KEY);
  if (stored != null) {
    const parsed = parseJson<Partial<TerminalState>>(stored, {});
    return {
      ...defaultState,
      ...parsed,
      sidebarOpenByChatId: { ...defaultState.sidebarOpenByChatId, ...parsed.sidebarOpenByChatId },
      cwdByPaneId: { ...defaultState.cwdByPaneId, ...parsed.cwdByPaneId },
      searchOpenByPaneId: { ...defaultState.searchOpenByPaneId, ...parsed.searchOpenByPaneId },
      terminalsByChatId: { ...defaultState.terminalsByChatId, ...parsed.terminalsByChatId },
      activeTerminalIdByChatId: { ...defaultState.activeTerminalIdByChatId, ...parsed.activeTerminalIdByChatId },
    };
  }

  const sidebarOpen = parseJson<Record<string, boolean>>(storage.getItem("terminal-sidebar-open-by-chat"), {});
  const sidebarWidth = parseJson<number>(storage.getItem("terminal-sidebar-width"), defaultState.sidebarWidth);
  const cwds = parseJson<Record<string, string>>(storage.getItem("terminal-cwds"), {});
  const terminals = parseJson<Record<string, TerminalInstance[]>>(storage.getItem("terminals-by-chat"), {});
  const activeIds = parseJson<Record<string, string | null>>(storage.getItem("active-terminal-by-chat"), {});

  return {
    sidebarOpenByChatId: sidebarOpen,
    sidebarWidth: typeof sidebarWidth === "number" ? sidebarWidth : defaultState.sidebarWidth,
    cwdByPaneId: cwds,
    searchOpenByPaneId: {},
    terminalsByChatId: terminals,
    activeTerminalIdByChatId: activeIds,
  };
}

/** Storage adapter that runs migration when "terminal-store" is missing. */
function createTerminalPersistStorage() {
  const base = createWindowScopedRawStorage();
  return {
    getItem: (key: string): string | null => {
      if (key !== STORAGE_KEY) return base.getItem(key);
      const raw = base.getItem(key);
      if (raw != null) return raw;
      return JSON.stringify(getInitialTerminalState());
    },
    setItem: (key: string, value: string) => base.setItem(key, value),
    removeItem: (key: string) => base.removeItem(key),
  };
}

export type SetTerminalStore = ReturnType<typeof createStore<TerminalState>>[1];

export function createTerminalStore(): [TerminalState, SetTerminalStore] {
  const [state, setState] = makePersisted(createStore(defaultState), {
    name: STORAGE_KEY,
    storage: createTerminalPersistStorage(),
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => ({ ...defaultState, ...JSON.parse(data) } as TerminalState),
  });
  return [state, setState];
}
