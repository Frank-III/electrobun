import { Utils } from "electrobun/bun";
import { homedir } from "os";
import { join } from "path";
import type { ExternalApp, APP_META } from "../shared/external-apps";

function expandTilde(filePath: string): string {
  if (filePath.startsWith("~/") || filePath === "~") {
    return join(homedir(), filePath.slice(1));
  }
  return filePath;
}

// Map ExternalApp IDs to macOS application names
const APP_TO_MAC_NAME: Record<string, string> = {
  finder: "Finder",
  cursor: "Cursor",
  vscode: "Visual Studio Code",
  "vscode-insiders": "Visual Studio Code - Insiders",
  zed: "Zed",
  windsurf: "Windsurf",
  sublime: "Sublime Text",
  xcode: "Xcode",
  warp: "Warp",
  terminal: "Terminal",
  iterm: "iTerm",
  ghostty: "Ghostty",
  "github-desktop": "GitHub Desktop",
  trae: "Trae",
  intellij: "IntelliJ IDEA",
  webstorm: "WebStorm",
  pycharm: "PyCharm",
  phpstorm: "PhpStorm",
  rubymine: "RubyMine",
  goland: "GoLand",
  clion: "CLion",
  rider: "Rider",
  datagrip: "DataGrip",
  appcode: "AppCode",
  fleet: "Fleet",
  rustrover: "RustRover",
};

export function createExternalHandlers() {
  return {
    openInFinder: ({ path }: { path: string }) => {
      const expandedPath = expandTilde(path);
      Utils.showItemInFolder(expandedPath);
      return { success: true };
    },

    openInApp: async ({ path, app }: { path: string; app: string }) => {
      const expandedPath = expandTilde(path);
      const macAppName = APP_TO_MAC_NAME[app];

      if (!macAppName) {
        console.warn(`[openInApp] Unknown app: ${app}, falling back to default`);
        Utils.openPath(expandedPath);
        return { success: true, app: "default" };
      }

      try {
        const proc = Bun.spawn(["open", "-a", macAppName, expandedPath], {
          stdin: "ignore",
          stdout: "ignore",
          stderr: "ignore",
          detached: true,
        });
        proc.unref?.();
        return { success: true, app };
      } catch (err) {
        console.error(`[openInApp] Failed to open with ${macAppName}:`, err);
        // Fallback to system default
        Utils.openPath(expandedPath);
        return { success: true, app: "default" };
      }
    },

    openFileInEditor: async ({ path, cwd }: { path: string; cwd?: string }) => {
      const expandedPath = expandTilde(path);
      const editors = [
        { cmd: "code", args: [expandedPath] },
        { cmd: "cursor", args: [expandedPath] },
        { cmd: "subl", args: [expandedPath] },
        { cmd: "atom", args: [expandedPath] },
        { cmd: "open", args: ["-t", expandedPath] },
      ];

      for (const editor of editors) {
        try {
          const proc = Bun.spawn([editor.cmd, ...editor.args], {
            cwd,
            stdin: "ignore",
            stdout: "ignore",
            stderr: "ignore",
            detached: true,
          });
          proc.unref?.();
          return { success: true, editor: editor.cmd };
        } catch {
          continue;
        }
      }

      Utils.openPath(expandedPath);
      return { success: true, editor: "default" };
    },
  };
}
