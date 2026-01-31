import { Utils } from "electrobun/bun";
import { existsSync, statSync } from "node:fs";
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
  oscBuffer: string;
}

const terminals = new Map<string, ManagedTerminal>();
const textDecoder = new TextDecoder();
const MAX_OSC_BUFFER = 8 * 1024;

function detectShell(): { shell: string; args: string[] } {
  const env = process.env;

  if (env.SHELL) {
    return { shell: env.SHELL, args: ["--login"] };
  }

  if (process.platform === "win32") {
    const pwsh7 = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
    if (existsSync(pwsh7)) {
      return { shell: pwsh7, args: [] };
    }
    return { shell: env.COMSPEC || "cmd.exe", args: [] };
  }

  return { shell: "/bin/sh", args: [] };
}

function resolveCwd(cwd?: string): string {
  const fallback = process.env.HOME || process.env.USERPROFILE || "/";
  if (!cwd) return fallback;
  try {
    const stat = statSync(cwd);
    if (stat.isDirectory()) return cwd;
  } catch {
    return fallback;
  }
  return fallback;
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

function extractOscTitles(input: string): { titles: string[]; rest: string } {
  let buffer = input;
  const titles: string[] = [];

  while (true) {
    const oscIndex = buffer.search(/\x1b\](0|2);/);
    if (oscIndex === -1) {
      return { titles, rest: buffer.slice(-MAX_OSC_BUFFER) };
    }

    const semicolonIndex = buffer.indexOf(";", oscIndex + 2);
    if (semicolonIndex === -1) {
      return { titles, rest: buffer.slice(oscIndex).slice(-MAX_OSC_BUFFER) };
    }

    const belIndex = buffer.indexOf("\x07", semicolonIndex + 1);
    const stIndex = buffer.indexOf("\x1b\\", semicolonIndex + 1);
    let endIndex = -1;
    let endLength = 1;

    if (belIndex !== -1 && (stIndex === -1 || belIndex < stIndex)) {
      endIndex = belIndex;
      endLength = 1;
    } else if (stIndex !== -1) {
      endIndex = stIndex;
      endLength = 2;
    }

    if (endIndex === -1) {
      return { titles, rest: buffer.slice(oscIndex).slice(-MAX_OSC_BUFFER) };
    }

    const title = buffer.slice(semicolonIndex + 1, endIndex);
    titles.push(title);
    buffer = buffer.slice(endIndex + endLength);
  }
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
      const resolvedCwd = resolveCwd(cwd);
      const safeCols = Math.max(2, cols);
      const safeRows = Math.max(2, rows);

      const vt = new GhosttyTerminal(safeCols, safeRows);

      const proc = Bun.spawn([shellPath, ...shellArgs], {
        cwd: resolvedCwd,
        env: buildEnv(userEnv),
        terminal: {
          cols: safeCols,
          rows: safeRows,
          data(_terminal: any, rawData: string | Uint8Array) {
            const str = typeof rawData === "string"
              ? rawData
              : textDecoder.decode(rawData);

            const t = terminals.get(id);
            if (t) {
              const parsed = extractOscTitles(t.oscBuffer + str);
              t.oscBuffer = parsed.rest;
              for (const title of parsed.titles) {
                t.title = title;
                sendTitle(id, title);
              }

              if (str.includes("\x07")) {
                sendBell(id);
              }

              vt.feed(rawData);
              sendData(id, str);
            }
          },
        },
      });

      const managed: ManagedTerminal = {
        proc,
        terminal: proc.terminal,
        vt,
        cols: safeCols,
        rows: safeRows,
        shell: shellPath,
        cwd: resolvedCwd,
        title: shellPath.split("/").pop() || "terminal",
        oscBuffer: "",
      };

      terminals.set(id, managed);
      sendTitle(id, managed.title);

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
      try {
        t.proc.kill("SIGHUP");
      } catch {}
      try {
        t.terminal.close();
      } catch {}
      try {
        t.vt.destroy();
      } catch {}
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
    try {
      t.proc.kill("SIGKILL");
    } catch {}
    try {
      t.terminal.close();
    } catch {}
    try {
      t.vt.destroy();
    } catch {}
  }
  terminals.clear();
}
