import { type BrowserWindow, Utils } from "electrobun/bun";
import { GhosttyApp, isGhosttyAvailable, ghosttyLibPath } from "./ghostty-native";
import type { Pointer } from "bun:ffi";

type TabFrame = { x: number; y: number; width: number; height: number };

interface ManagedTab {
  nativeViewId: number;
  ghosttySurfaceId: number;
  nsViewPtr: Pointer;
  frame: TabFrame;
}

// BrowserWindow with ghostty native view methods (added in package/src/bun/core/BrowserWindow.ts)
interface GhosttyWindow extends BrowserWindow {
  ghosttyCreateNativeView(x: number, y: number, width: number, height: number): { nativeViewId: number; nsViewPtr: Pointer };
  ghosttyResizeNativeView(surfaceId: number, x: number, y: number, width: number, height: number): void;
  ghosttyDestroyNativeView(surfaceId: number): void;
  ghosttyFocusNativeView(surfaceId: number): void;
  ghosttyGetScaleFactor(): number;
  ghosttySetSurfacePtr(surfaceId: number, surfacePtr: Pointer, libghosttyPath: string): void;
}

export function createGhosttyTabHandlers(getWindow: () => BrowserWindow | null) {
  const tabIdToTab = new Map<string, ManagedTab>();
  let ghosttyApp: GhosttyApp | null = null;
  let ghosttyInitPromise: Promise<boolean> | null = null;

  const getScaleFactor = (): number => {
    const win = getWindow() as GhosttyWindow | null;
    if (!win) return 2.0;
    const scale = win.ghosttyGetScaleFactor();
    return scale > 0 ? scale : 2.0;
  };

  const ensureGhosttyApp = async (): Promise<GhosttyApp | null> => {
    if (ghosttyApp) return ghosttyApp;
    if (!isGhosttyAvailable) {
      console.warn("[ghostty-tabs] libghostty not available, native terminal disabled");
      return null;
    }

    if (!ghosttyInitPromise) {
      ghosttyInitPromise = (async () => {
        const app = new GhosttyApp({
          clipboard: {
            readText: () => Utils.clipboardReadText(),
            writeText: (text: string) => Utils.clipboardWriteText(text),
          },
          callbacks: {
            onSurfaceClose: (surfacePtr) => {
              // Find and close the tab associated with this surface
              const surfaceId = app.getSurfaceIdByPtr(surfacePtr);
              if (surfaceId === undefined) return;
              for (const [tabId, tab] of tabIdToTab) {
                if (tab.ghosttySurfaceId === surfaceId) {
                  const win = getWindow() as GhosttyWindow | null;
                  if (win) win.ghosttyDestroyNativeView(tab.nativeViewId);
                  tabIdToTab.delete(tabId);
                  break;
                }
              }
            },
          },
        });
        const ok = await app.init();
        if (ok) {
          ghosttyApp = app;
          return true;
        }
        return false;
      })();
    }

    const ok = await ghosttyInitPromise;
    return ok ? ghosttyApp : null;
  };

  return {
    ghosttyTabsCreate: async ({ tabId, frame, cwd, command }: {
      tabId: string;
      frame: TabFrame;
      cwd?: string;
      command?: string;
    }) => {
      const existing = tabIdToTab.get(tabId);
      if (existing) {
        return { surfaceId: existing.nativeViewId };
      }

      const win = getWindow() as GhosttyWindow | null;
      if (!win) {
        throw new Error("No window available for ghostty tab creation");
      }

      const app = await ensureGhosttyApp();
      if (!app) {
        throw new Error("Failed to initialize ghostty app");
      }

      const { nativeViewId, nsViewPtr } = win.ghosttyCreateNativeView(
        frame.x,
        frame.y,
        frame.width,
        frame.height,
      );

      if (nativeViewId === 0) {
        throw new Error("Failed to create native view for ghostty surface");
      }

      const scaleFactor = getScaleFactor();

      const ghosttySurfaceId = app.createSurface(
        nsViewPtr,
        scaleFactor,
        cwd ?? null,
        command ?? null,
      );

      if (ghosttySurfaceId == null) {
        win.ghosttyDestroyNativeView(nativeViewId);
        throw new Error("Failed to create ghostty surface");
      }

      // Connect the native view to the ghostty surface so input events get forwarded
      const surfacePtr = app.getSurfacePtr(ghosttySurfaceId);
      if (surfacePtr) {
        win.ghosttySetSurfacePtr(nativeViewId, surfacePtr, ghosttyLibPath);
      }

      app.resizeSurface(
        ghosttySurfaceId,
        Math.round(frame.width * scaleFactor),
        Math.round(frame.height * scaleFactor),
      );

      const tab: ManagedTab = {
        nativeViewId,
        ghosttySurfaceId,
        nsViewPtr,
        frame,
      };
      tabIdToTab.set(tabId, tab);

      return { surfaceId: nativeViewId };
    },

    ghosttyTabsFocus: ({ tabId }: { tabId: string }) => {
      const tab = tabIdToTab.get(tabId);
      if (!tab) return { success: false };

      const win = getWindow() as GhosttyWindow | null;
      if (!win) return { success: false };

      win.ghosttyFocusNativeView(tab.nativeViewId);
      ghosttyApp?.focusSurface(tab.ghosttySurfaceId);

      return { success: true };
    },

    ghosttyTabsResize: ({ tabId, frame }: { tabId: string; frame: TabFrame }) => {
      const tab = tabIdToTab.get(tabId);
      if (!tab) return { success: false };

      const win = getWindow() as GhosttyWindow | null;
      if (!win) return { success: false };

      win.ghosttyResizeNativeView(
        tab.nativeViewId,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
      );

      const scaleFactor = getScaleFactor();
      ghosttyApp?.resizeSurface(
        tab.ghosttySurfaceId,
        Math.round(frame.width * scaleFactor),
        Math.round(frame.height * scaleFactor),
      );

      tab.frame = frame;
      return { success: true };
    },

    ghosttyTabsClose: ({ tabId }: { tabId: string }) => {
      const tab = tabIdToTab.get(tabId);
      if (!tab) return { success: false };

      ghosttyApp?.destroySurface(tab.ghosttySurfaceId);

      const win = getWindow() as GhosttyWindow | null;
      if (win) {
        win.ghosttyDestroyNativeView(tab.nativeViewId);
      }

      tabIdToTab.delete(tabId);
      return { success: true };
    },

    ghosttyTabsList: () => {
      return {
        tabs: [...tabIdToTab.entries()].map(([tabId, tab]) => ({
          tabId,
          surfaceId: tab.nativeViewId,
        })),
        activeTabId: null, // TODO: track active tab
      };
    },
  };
}
