import { Utils } from "electrobun/bun";
import { GhosttyTerminal } from "./ghostty-ffi";

interface ManagedTerminal {
  proc: ReturnType<typeof Bun.spawn>;
  terminal: any;
  vt: GhosttyTerminal;
  cols: number;
  rows: number;
  shell: string;
  cwd: string;
  title: string;
}

const terminals = new Map<string, ManagedTerminal>();

function detectShell(): { shell: string; args: string[] } {
  const env = process.env;

  if (env.SHELL) {
    return { shell: env.SHELL, args: ["--login"] };
  }

  if (process.platform === "win32") {
    const pwsh7 = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
    try {
      Bun.spawnSync(["test", "-f", pwsh7]);
      return { shell: pwsh7, args: [] };
    } catch {
      return { shell: env.COMSPEC || "cmd.exe", args: [] };
    }
  }

  return { shell: "/bin/sh", args: [] };
}

function buildEnv(userEnv?: Record<string, string>): Record<string, string> {
  return {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: "truecolor",
    LANG: process.env.LANG || "en_US.UTF-8",
    TERM_PROGRAM: "electrobun",
    ...userEnv,
  };
}

export function createTerminalHandlers(
  sendData: (id: string, data: string) => void,
  sendExit: (id: string, exitCode: number, signal?: number) => void,
  sendTitle: (id: string, title: string) => void,
  sendBell: (id: string) => void,
) {
  return {
    create: ({ id, cols, rows, cwd, shell: shellOverride, env: userEnv }: {
      id: string;
      cols: number;
      rows: number;
      cwd?: string;
      shell?: string;
      env?: Record<string, string>;
    }) => {
      if (terminals.has(id)) {
        throw new Error(`Terminal ${id} already exists`);
      }

      const detected = detectShell();
      const shellPath = shellOverride || detected.shell;
      const shellArgs = detected.args;
      const resolvedCwd = cwd || process.env.HOME || "/";

      const vt = new GhosttyTerminal(cols, rows);

      const proc = Bun.spawn([shellPath, ...shellArgs], {
        cwd: resolvedCwd,
        env: buildEnv(userEnv),
        terminal: {
          cols,
          rows,
          data(_terminal: any, rawData: string | Uint8Array) {
            const str = typeof rawData === "string"
              ? rawData
              : new TextDecoder().decode(rawData);

            const oscMatch = str.match(/\x1b\](?:0|2);([^\x07]*)\x07/);
            if (oscMatch) {
              const t = terminals.get(id);
              if (t) {
                t.title = oscMatch[1];
                sendTitle(id, oscMatch[1]);
              }
            }

            if (str.includes("\x07")) {
              sendBell(id);
            }

            vt.feed(rawData);
            sendData(id, str);
          },
        },
      });

      const managed: ManagedTerminal = {
        proc,
        terminal: proc.terminal,
        vt,
        cols,
        rows,
        shell: shellPath,
        cwd: resolvedCwd,
        title: shellPath.split("/").pop() || "terminal",
      };

      terminals.set(id, managed);

      proc.exited.then((exitCode) => {
        sendExit(id, exitCode ?? 0);
        vt.destroy();
        terminals.delete(id);
      });

      return { pid: proc.pid, shell: shellPath };
    },

    write: ({ id, data }: { id: string; data: string }) => {
      const t = terminals.get(id);
      if (!t) throw new Error(`Terminal ${id} not found`);
      t.terminal.write(data);
    },

    resize: ({ id, cols, rows }: { id: string; cols: number; rows: number }) => {
      const t = terminals.get(id);
      if (!t) return;
      t.terminal.resize(cols, rows);
      t.vt.resize(cols, rows);
      t.cols = cols;
      t.rows = rows;
    },

    destroy: ({ id }: { id: string }) => {
      const t = terminals.get(id);
      if (!t) return;
      t.proc.kill("SIGHUP");
      t.terminal.close();
      t.vt.destroy();
      terminals.delete(id);
    },

    getDefaultShell: () => detectShell(),

    clipboardWrite: ({ text }: { text: string }) => {
      Utils.clipboard.writeText(text);
    },

    clipboardRead: async () => {
      const text = await Utils.clipboard.readText();
      return { text: text || "" };
    },

    getScreenContent: ({ id, startRow, endRow }: {
      id: string;
      startRow?: number;
      endRow?: number;
    }) => {
      const t = terminals.get(id);
      if (!t) throw new Error(`Terminal ${id} not found`);
      const lines: string[] = [];
      const start = startRow ?? 0;
      const end = endRow ?? t.rows;
      for (let row = start; row < end; row += 1) {
        lines.push(t.vt.getRowText(row));
      }
      return { lines, cursorX: t.vt.cursorX, cursorY: t.vt.cursorY };
    },

    searchScrollback: ({ id, query }: { id: string; query: string }) => {
      const t = terminals.get(id);
      if (!t) throw new Error(`Terminal ${id} not found`);
      const screen = t.vt.getScreenText();
      const matches: Array<{ row: number; col: number; text: string }> = [];
      const lines = screen.split("\n");
      for (let row = 0; row < lines.length; row += 1) {
        let col = lines[row].indexOf(query);
        while (col !== -1) {
          matches.push({ row, col, text: lines[row] });
          col = lines[row].indexOf(query, col + 1);
        }
      }
      return { matches };
    },

    getCurrentCommand: ({ id }: { id: string }) => {
      const t = terminals.get(id);
      if (!t) return null;
      const line = t.vt.getRowText(t.vt.cursorY);
      const match = line.match(/(?:\$|>|#|%)\s*(.*)$/);
      return match ? { command: match[1], cwd: t.cwd } : null;
    },
  };
}

export function destroyAll() {
  for (const [, t] of terminals) {
    t.proc.kill("SIGKILL");
    t.terminal.close();
    t.vt.destroy();
  }
  terminals.clear();
}
