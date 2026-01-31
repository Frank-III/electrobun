import type { BrowserWindow } from "electrobun/bun";

type TabFrame = { x: number; y: number; width: number; height: number };

export function createGhosttyTabHandlers(getWindow: () => BrowserWindow | null) {
  const tabIdToSurfaceId = new Map<string, number>();

  const getTabManager = () => {
    const window = getWindow();
    if (!window || typeof window.getTerminalTabs !== "function") {
      throw new Error("Ghostty terminal tabs are not available");
    }
    return window.getTerminalTabs();
  };

  return {
    ghosttyTabsCreate: ({ tabId, frame, cwd, command }: {
      tabId: string;
      frame: TabFrame;
      cwd?: string;
      command?: string;
    }) => {
      const existing = tabIdToSurfaceId.get(tabId);
      if (existing != null) {
        return { surfaceId: existing };
      }

      const manager = getTabManager();
      const surface = manager.createTab({
        frame,
        workingDirectory: cwd ?? null,
        command: command ?? null,
      });

      tabIdToSurfaceId.set(tabId, surface.id);
      return { surfaceId: surface.id };
    },

    ghosttyTabsFocus: ({ tabId }: { tabId: string }) => {
      const surfaceId = tabIdToSurfaceId.get(tabId);
      if (surfaceId == null) return { success: false };
      const manager = getTabManager();
      manager.focusTab(surfaceId);
      return { success: true };
    },

    ghosttyTabsResize: ({ tabId, frame }: { tabId: string; frame: TabFrame }) => {
      const surfaceId = tabIdToSurfaceId.get(tabId);
      if (surfaceId == null) return { success: false };
      const manager = getTabManager();
      manager.resizeTab(surfaceId, frame);
      return { success: true };
    },

    ghosttyTabsClose: ({ tabId }: { tabId: string }) => {
      const surfaceId = tabIdToSurfaceId.get(tabId);
      if (surfaceId == null) return { success: false };
      const manager = getTabManager();
      manager.closeTab(surfaceId);
      tabIdToSurfaceId.delete(tabId);
      return { success: true };
    },

    ghosttyTabsList: () => {
      const manager = getTabManager();
      const activeSurfaceId = manager.getActiveTab();
      return {
        tabs: [...tabIdToSurfaceId.entries()].map(([tabId, surfaceId]) => ({
          tabId,
          surfaceId,
        })),
        activeTabId:
          activeSurfaceId == null
            ? null
            : [...tabIdToSurfaceId.entries()].find(([, id]) => id === activeSurfaceId)?.[0] ?? null,
      };
    },
  };
}
