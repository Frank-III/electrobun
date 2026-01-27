import { Utils } from "electrobun/bun";
import { homedir } from "os";
import { join } from "path";

function expandTilde(filePath: string): string {
  if (filePath.startsWith("~/") || filePath === "~") {
    return join(homedir(), filePath.slice(1));
  }
  return filePath;
}

export function createExternalHandlers() {
  return {
    openInFinder: ({ path }: { path: string }) => {
      const expandedPath = expandTilde(path);
      Utils.showItemInFolder(expandedPath);
      return { success: true };
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
