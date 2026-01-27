# Migrating from Electron + tRPC to Electrobun (Bun-Native)

This guide covers migrating an Electron app that uses tRPC for IPC to Electrobun with fully Bun-native alternatives, including terminal emulation via `bun-pty` / `Bun.Terminal` and optionally libghostty.

---

## Architecture Comparison

| Concept | Electron + tRPC | Electrobun (Bun-native) |
|---------|----------------|------------------------|
| Runtime | Node.js (main) + Chromium (renderer) | Bun (main) + system webview or CEF (renderer) |
| IPC | `ipcMain`/`ipcRenderer` + tRPC adapters | Built-in typed RPC via `defineRPC` |
| Process model | Main + renderer processes | Bun main process + webview processes |
| Bundling | Electron Forge / electron-builder | `electrobun build` (self-extracting ~12MB) |
| Updates | electron-updater | Built-in `Updater` with bsdiff patches (~14KB) |
| PTY/Terminal | `node-pty` | `Bun.Terminal` (built-in) or `bun-pty` |
| Native code | N-API / node-addon | Bun FFI (`bun:ffi`) or Zig directly |

---

## Step 1: Project Setup

### Electron project structure (typical)
```
src/
  main/           # Node.js main process
    index.ts
    trpc/
      router.ts   # tRPC router definitions
      context.ts
  renderer/       # React/Vue/etc frontend
    App.tsx
  preload.ts      # Electron preload script
```

### Electrobun project structure (target)
```
src/
  bun/            # Bun main process
    index.ts
  mainview/       # Frontend (any framework)
    index.html
    App.tsx
electrobun.config.ts
```

### Create the Electrobun project

```bash
npx electrobun init           # or start from a template
bun add electrobun
```

### `electrobun.config.ts`
```typescript
import type { ElectrobunConfig } from "electrobun/config";

const config: ElectrobunConfig = {
  name: "my-app",
  identifier: "com.mycompany.myapp",
  version: "1.0.0",
  build: {
    views: {
      mainview: {
        src: "./src/mainview/index.html",
      },
    },
  },
};

export default config;
```

---

## Step 2: Replace tRPC with Electrobun's Typed RPC

This is the core migration. Electrobun's RPC is type-safe, bidirectional, and requires zero boilerplate compared to tRPC + Electron IPC adapters.

### Before: Electron + tRPC

```typescript
// main/trpc/router.ts
import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const appRouter = router({
  getFiles: publicProcedure
    .input(z.object({ dir: z.string() }))
    .query(async ({ input }) => {
      return await readdir(input.dir);
    }),

  saveFile: publicProcedure
    .input(z.object({ path: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      await writeFile(input.path, input.content);
      return { success: true };
    }),
});

// preload.ts
contextBridge.exposeInMainWorld('trpc', createTRPCClient(/* ... */));

// renderer/App.tsx
const files = await window.trpc.getFiles.query({ dir: '/tmp' });
```

### After: Electrobun RPC

**1. Define the RPC schema (shared types):**

```typescript
// src/shared/rpc-schema.ts
import type { RPCSchema } from "electrobun/bun";

export interface AppRPC {
  bun: RPCSchema<{
    requests: {
      getFiles: { params: { dir: string }; response: string[] };
      saveFile: { params: { path: string; content: string }; response: { success: boolean } };
    };
    messages: {
      fileChanged: { path: string };
    };
  }>;
  webview: RPCSchema<{
    requests: {
      confirmSave: { params: { path: string }; response: boolean };
    };
    messages: {
      notify: { message: string };
    };
  }>;
}
```

**2. Main process (Bun side):**

```typescript
// src/bun/index.ts
import { BrowserWindow, BrowserView, ApplicationMenu, Utils } from "electrobun/bun";
import type { AppRPC } from "../shared/rpc-schema";

const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      // These handle requests FROM the webview
      getFiles: async ({ dir }) => {
        const glob = new Bun.Glob("*");
        return Array.from(glob.scanSync(dir));
      },
      saveFile: async ({ path, content }) => {
        await Bun.write(path, content);
        return { success: true };
      },
    },
    messages: {},
  },
});

const mainWindow = new BrowserWindow({
  title: "My App",
  url: "views://mainview/index.html",
  frame: { width: 1200, height: 800, x: 100, y: 100 },
  rpc,
});

// Send messages TO the webview
mainWindow.webview.on("dom-ready", () => {
  mainWindow.webview.rpc?.send.notify({ message: "App loaded" });
});
```

**3. Webview side (browser):**

```typescript
// src/mainview/index.ts
import { Electroview } from "electrobun/view";
import type { AppRPC } from "../shared/rpc-schema";

const rpc = Electroview.defineRPC<AppRPC>({
  handlers: {
    requests: {
      confirmSave: async ({ path }) => {
        return confirm(`Save changes to ${path}?`);
      },
    },
    messages: {
      notify: ({ message }) => {
        console.log("Notification:", message);
      },
      fileChanged: ({ path }) => {
        console.log("File changed:", path);
      },
    },
  },
});

// Call the Bun main process (replaces tRPC client calls)
const files = await rpc.request.getFiles({ dir: "/tmp" });
const result = await rpc.request.saveFile({ path: "/tmp/test.txt", content: "hello" });
```

### Migration cheat sheet

| tRPC pattern | Electrobun equivalent |
|---|---|
| `publicProcedure.query()` | RPC schema `requests` (bun side handler) |
| `publicProcedure.mutation()` | RPC schema `requests` (bun side handler) |
| `publicProcedure.subscription()` | RPC schema `messages` (bun sends, webview listens) |
| `trpc.foo.query(input)` | `rpc.request.foo(input)` |
| `trpc.foo.mutate(input)` | `rpc.request.foo(input)` |
| `trpc.foo.subscribe()` | Define in `messages`, listen in webview handler |
| Zod validation | TypeScript types (validate manually if needed) |
| tRPC context | Just use closures / module scope in the bun handler |
| tRPC middleware | Wrap handler functions, or use before/after logic in handlers |

---

## Step 3: Build a Fully Fledged Terminal

This section builds a complete, production-quality embedded terminal -- multi-instance, resizable, with clipboard, selection, themes, ligatures, and shell integration. It replaces `node-pty` + Electron IPC entirely.

### File layout

```
src/
  shared/
    terminal-rpc.ts        # Typed RPC schema for terminal
  bun/
    index.ts               # Main process entry
    terminal-manager.ts    # PTY lifecycle, multiplexing, shell detection
  terminal-view/
    index.html             # Terminal webview
    terminal.ts            # xterm.js setup, input handling, theming
    styles.css             # Terminal chrome
```

### 3.1 RPC Schema -- fully typed terminal contract

```typescript
// src/shared/terminal-rpc.ts
import type { RPCSchema } from "electrobun/bun";

export interface TerminalRPC {
  /** Bun (main process) handles these */
  bun: RPCSchema<{
    requests: {
      create: {
        params: { id: string; cols: number; rows: number; cwd?: string; shell?: string; env?: Record<string, string> };
        response: { pid: number; shell: string };
      };
      write: {
        params: { id: string; data: string };
        response: void;
      };
      resize: {
        params: { id: string; cols: number; rows: number };
        response: void;
      };
      destroy: {
        params: { id: string };
        response: void;
      };
      getDefaultShell: {
        params: {};
        response: { shell: string; args: string[] };
      };
      /** Write to the clipboard from the main process (webview may be sandboxed) */
      clipboardWrite: {
        params: { text: string };
        response: void;
      };
      clipboardRead: {
        params: {};
        response: { text: string };
      };
    };
    messages: {};
  }>;

  /** Webview handles these (bun pushes data/events here) */
  webview: RPCSchema<{
    requests: {};
    messages: {
      /** Raw PTY output -- binary-safe, base64-encoded for large payloads */
      data: { id: string; data: string };
      /** Process exited */
      exit: { id: string; exitCode: number; signal?: number };
      /** Title changed (via OSC escape sequence or CWD detection) */
      titleChanged: { id: string; title: string };
      /** Bell character received */
      bell: { id: string };
    };
  }>;
}
```

### 3.2 Terminal manager -- Bun main process

```typescript
// src/bun/terminal-manager.ts
import { Utils } from "electrobun/bun";

interface ManagedTerminal {
  proc: ReturnType<typeof Bun.spawn>;
  terminal: any; // Bun.Terminal instance
  shell: string;
  cwd: string;
  title: string;
}

const terminals = new Map<string, ManagedTerminal>();

/** Detect the user's preferred shell */
function detectShell(): { shell: string; args: string[] } {
  const env = process.env;

  // Respect $SHELL on POSIX
  if (env.SHELL) {
    return { shell: env.SHELL, args: ["--login"] };
  }

  // Windows: prefer PowerShell 7, fall back to pwsh, then cmd
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

/**
 * Build the environment for a terminal session.
 * Sets TERM, COLORTERM, LANG, and merges user-provided env.
 */
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
      id: string; cols: number; rows: number;
      cwd?: string; shell?: string; env?: Record<string, string>;
    }) => {
      if (terminals.has(id)) {
        throw new Error(`Terminal ${id} already exists`);
      }

      const detected = detectShell();
      const shellPath = shellOverride || detected.shell;
      const shellArgs = detected.args;
      const resolvedCwd = cwd || process.env.HOME || "/";

      const proc = Bun.spawn([shellPath, ...shellArgs], {
        cwd: resolvedCwd,
        env: buildEnv(userEnv),
        terminal: {
          cols,
          rows,
          data(_terminal: any, rawData: string | Uint8Array) {
            const str = typeof rawData === "string" ? rawData : new TextDecoder().decode(rawData);

            // Detect OSC title sequences: \x1b]0;title\x07 or \x1b]2;title\x07
            const oscMatch = str.match(/\x1b\](?:0|2);([^\x07]*)\x07/);
            if (oscMatch) {
              const t = terminals.get(id);
              if (t) {
                t.title = oscMatch[1];
                sendTitle(id, oscMatch[1]);
              }
            }

            // Detect bell
            if (str.includes("\x07")) {
              sendBell(id);
            }

            sendData(id, str);
          },
        },
      });

      const managed: ManagedTerminal = {
        proc,
        terminal: proc.terminal,
        shell: shellPath,
        cwd: resolvedCwd,
        title: shellPath.split("/").pop() || "terminal",
      };

      terminals.set(id, managed);

      // Handle exit
      proc.exited.then((exitCode) => {
        sendExit(id, exitCode ?? 0);
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
    },

    destroy: ({ id }: { id: string }) => {
      const t = terminals.get(id);
      if (!t) return;
      t.proc.kill("SIGHUP"); // graceful: SIGHUP like closing a terminal window
      t.terminal.close();
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
  };
}

/** Kill all remaining terminals on app quit */
export function destroyAll() {
  for (const [id, t] of terminals) {
    t.proc.kill("SIGKILL");
    t.terminal.close();
  }
  terminals.clear();
}
```

### 3.3 Wire it up in the main process

```typescript
// src/bun/index.ts
import { BrowserWindow, BrowserView, ApplicationMenu, Utils } from "electrobun/bun";
import type { TerminalRPC } from "../shared/terminal-rpc";
import { createTerminalHandlers, destroyAll } from "./terminal-manager";

// We need a reference to the window's RPC to push messages.
// Electrobun's defineRPC returns a value we attach to the window,
// then we get the send handle from window.webview.rpc after creation.

let sendToWebview: BrowserView["rpc"] | null = null;

const handlers = createTerminalHandlers(
  (id, data) => sendToWebview?.send.data({ id, data }),
  (id, exitCode, signal) => sendToWebview?.send.exit({ id, exitCode, signal }),
  (id, title) => sendToWebview?.send.titleChanged({ id, title }),
  (id) => sendToWebview?.send.bell({ id }),
);

const rpc = BrowserView.defineRPC<TerminalRPC>({
  maxRequestTime: 30000,
  handlers: {
    requests: {
      create: handlers.create,
      write: handlers.write,
      resize: handlers.resize,
      destroy: handlers.destroy,
      getDefaultShell: handlers.getDefaultShell,
      clipboardWrite: handlers.clipboardWrite,
      clipboardRead: handlers.clipboardRead,
    },
    messages: {},
  },
});

ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ label: "Quit", role: "quit", accelerator: "q" }],
  },
  {
    label: "Edit",
    submenu: [
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
]);

const win = new BrowserWindow({
  title: "Terminal",
  url: "views://terminal-view/index.html",
  frame: { width: 900, height: 600, x: 200, y: 100 },
  rpc,
});

win.webview.on("dom-ready", () => {
  sendToWebview = win.webview.rpc;
});

win.on("close", () => {
  destroyAll();
  Utils.quit();
});
```

### 3.4 Webview -- full xterm.js terminal with all the trimmings

Install in your view's package context:

```bash
bun add @xterm/xterm @xterm/addon-fit @xterm/addon-webgl @xterm/addon-web-links @xterm/addon-unicode11 @xterm/addon-image @xterm/addon-clipboard @xterm/addon-ligatures
```

```html
<!-- src/terminal-view/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Terminal</title>
  <link rel="stylesheet" href="node_modules/@xterm/xterm/css/xterm.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="terminal-tabs"></div>
  <div id="terminal-container"></div>
  <script type="module" src="terminal.ts"></script>
</body>
</html>
```

```css
/* src/terminal-view/styles.css */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; background: #1e1e2e; overflow: hidden; }

#terminal-tabs {
  display: flex;
  height: 36px;
  background: #181825;
  align-items: center;
  padding: 0 8px;
  gap: 4px;
  -webkit-app-region: drag;       /* draggable title bar area */
}
.tab {
  -webkit-app-region: no-drag;
  padding: 4px 12px;
  border-radius: 6px 6px 0 0;
  background: #313244;
  color: #cdd6f4;
  font: 12px/1 system-ui, sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab.active { background: #1e1e2e; }
.tab .close { opacity: 0.5; cursor: pointer; font-size: 14px; }
.tab .close:hover { opacity: 1; }
.tab-add {
  -webkit-app-region: no-drag;
  color: #a6adc8;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
}

#terminal-container {
  height: calc(100% - 36px);
  width: 100%;
}
```

```typescript
// src/terminal-view/terminal.ts
import { Electroview } from "electrobun/view";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { LigaturesAddon } from "@xterm/addon-ligatures";
import type { TerminalRPC } from "../shared/terminal-rpc";

// ── Theme (Catppuccin Mocha -- swap to any xterm ITheme) ──────────────
const THEME = {
  background: "#1e1e2e",
  foreground: "#cdd6f4",
  cursor: "#f5e0dc",
  cursorAccent: "#1e1e2e",
  selectionBackground: "#585b7066",
  selectionForeground: "#cdd6f4",
  black: "#45475a",   red: "#f38ba8",
  green: "#a6e3a1",   yellow: "#f9e2af",
  blue: "#89b4fa",    magenta: "#f5c2e7",
  cyan: "#94e2d5",    white: "#bac2de",
  brightBlack: "#585b70",  brightRed: "#f38ba8",
  brightGreen: "#a6e3a1",  brightYellow: "#f9e2af",
  brightBlue: "#89b4fa",   brightMagenta: "#f5c2e7",
  brightCyan: "#94e2d5",   brightWhite: "#a6adc8",
};

// ── State ─────────────────────────────────────────────────────────────
interface Tab {
  id: string;
  xterm: Terminal;
  fit: FitAddon;
  title: string;
  el: HTMLElement;
}

const tabs: Tab[] = [];
let activeTab: Tab | null = null;
let tabCounter = 0;

const container = document.getElementById("terminal-container")!;
const tabBar = document.getElementById("terminal-tabs")!;

// ── RPC ───────────────────────────────────────────────────────────────
const rpc = Electroview.defineRPC<TerminalRPC>({
  handlers: {
    requests: {},
    messages: {
      data: ({ id, data }) => {
        const tab = tabs.find((t) => t.id === id);
        tab?.xterm.write(data);
      },

      exit: ({ id, exitCode }) => {
        const tab = tabs.find((t) => t.id === id);
        if (tab) {
          tab.xterm.writeln(`\r\n\x1b[90m[Process exited with code ${exitCode}]\x1b[0m`);
          // Auto-close tab after a short delay, or leave it for the user
          setTimeout(() => closeTab(id), 2000);
        }
      },

      titleChanged: ({ id, title }) => {
        const tab = tabs.find((t) => t.id === id);
        if (tab) {
          tab.title = title;
          const span = tab.el.querySelector(".tab-title");
          if (span) span.textContent = title;
        }
      },

      bell: ({ id }) => {
        // Visual bell: briefly flash the tab if it's not active
        const tab = tabs.find((t) => t.id === id);
        if (tab && tab !== activeTab) {
          tab.el.classList.add("bell");
          setTimeout(() => tab.el.classList.remove("bell"), 300);
        }
      },
    },
  },
});

// ── Tab management ────────────────────────────────────────────────────
async function createTab() {
  const id = `term-${++tabCounter}`;

  const xterm = new Terminal({
    theme: THEME,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
    fontSize: 14,
    lineHeight: 1.2,
    cursorBlink: true,
    cursorStyle: "bar",
    scrollback: 10000,
    allowProposedApi: true,          // needed for some addons
    macOptionIsMeta: true,           // Alt as Meta on macOS
    macOptionClickForcesSelection: true,
    drawBoldTextInBrightColors: false,
  });

  const fit = new FitAddon();
  xterm.loadAddon(fit);
  xterm.loadAddon(new WebLinksAddon());
  xterm.loadAddon(new Unicode11Addon());

  // Ligatures (font must support them)
  try { xterm.loadAddon(new LigaturesAddon()); } catch { /* optional */ }

  // Tab element
  const el = document.createElement("div");
  el.className = "tab";
  el.innerHTML = `<span class="tab-title">terminal</span><span class="close">×</span>`;
  el.addEventListener("click", () => activateTab(id));
  el.querySelector(".close")!.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(id);
  });
  tabBar.insertBefore(el, tabBar.querySelector(".tab-add"));

  const tab: Tab = { id, xterm, fit, title: "terminal", el };
  tabs.push(tab);

  activateTab(id);

  // Open xterm into the container
  xterm.open(container);

  // WebGL renderer for GPU-accelerated drawing
  try { xterm.loadAddon(new WebglAddon()); } catch { /* falls back to canvas */ }

  fit.fit();

  // ── Keyboard input → PTY ───────────────────────────────────────────
  xterm.onData((data) => {
    rpc.request.write({ id, data });
  });

  // Binary data (for things like bracketed paste with binary content)
  xterm.onBinary((data) => {
    rpc.request.write({ id, data });
  });

  // ── Clipboard: Ctrl+Shift+C / Ctrl+Shift+V (or Cmd+C/V on macOS) ──
  xterm.attachCustomKeyEventHandler((ev) => {
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && ev.key === "c" && xterm.hasSelection()) {
      rpc.request.clipboardWrite({ text: xterm.getSelection() });
      return false; // prevent sending ^C
    }
    if (mod && ev.key === "v") {
      rpc.request.clipboardRead().then(({ text }) => {
        rpc.request.write({ id, data: text });
      });
      return false;
    }
    // Ctrl+Shift+T = new tab
    if (ev.ctrlKey && ev.shiftKey && ev.key === "T") {
      createTab();
      return false;
    }
    // Ctrl+Shift+W = close tab
    if (ev.ctrlKey && ev.shiftKey && ev.key === "W") {
      closeTab(id);
      return false;
    }
    return true;
  });

  // ── Spawn the PTY on the bun side ──────────────────────────────────
  const { pid, shell } = await rpc.request.create({
    id,
    cols: xterm.cols,
    rows: xterm.rows,
  });
  tab.title = shell.split("/").pop() || "terminal";
  el.querySelector(".tab-title")!.textContent = tab.title;

  xterm.focus();
}

function activateTab(id: string) {
  activeTab?.xterm.element?.style.setProperty("display", "none");
  activeTab?.el.classList.remove("active");

  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;

  tab.xterm.element?.style.setProperty("display", "");
  tab.el.classList.add("active");
  activeTab = tab;

  // Re-fit in case the window resized while this tab was hidden
  requestAnimationFrame(() => {
    tab.fit.fit();
    tab.xterm.focus();
  });
}

function closeTab(id: string) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;

  const tab = tabs[idx];
  rpc.request.destroy({ id }).catch(() => {});
  tab.xterm.dispose();
  tab.el.remove();
  tabs.splice(idx, 1);

  if (activeTab?.id === id) {
    activeTab = null;
    if (tabs.length > 0) {
      activateTab(tabs[Math.max(0, idx - 1)].id);
    }
  }

  // If no tabs left, create a new one (or you could quit the app)
  if (tabs.length === 0) {
    createTab();
  }
}

// ── Resize handling ───────────────────────────────────────────────────
const resizeObserver = new ResizeObserver(() => {
  if (!activeTab) return;
  activeTab.fit.fit();
  rpc.request.resize({
    id: activeTab.id,
    cols: activeTab.xterm.cols,
    rows: activeTab.xterm.rows,
  });
});
resizeObserver.observe(container);

// ── "New tab" button ──────────────────────────────────────────────────
const addBtn = document.createElement("div");
addBtn.className = "tab-add";
addBtn.textContent = "+";
addBtn.addEventListener("click", () => createTab());
tabBar.appendChild(addBtn);

// ── Boot ──────────────────────────────────────────────────────────────
createTab();
```

### 3.5 What this gives you

- **Multiple terminal tabs** with Ctrl+Shift+T / Ctrl+Shift+W
- **GPU-accelerated rendering** via WebGL (canvas fallback automatic)
- **Proper resize** -- ResizeObserver on the container triggers `fit.fit()` and sends new dimensions to the PTY
- **Clipboard integration** via Electrobun's native `Utils.clipboard` (works even in sandboxed webviews)
- **Ligatures** (JetBrains Mono, Fira Code, etc.)
- **Full Unicode 11** (CJK, emoji, wide chars)
- **Web links** -- Cmd/Ctrl+click opens URLs via `Utils.openExternal`
- **OSC title detection** -- tab titles update when the shell sets them (e.g., showing CWD)
- **Visual bell** -- inactive tabs flash on bell character
- **Truecolor** -- `COLORTERM=truecolor` and `TERM=xterm-256color` are set
- **Login shell** -- `--login` flag so `.bash_profile` / `.zprofile` are sourced
- **Graceful shutdown** -- SIGHUP on close, SIGKILL on app quit

### 3.6 Using `bun-pty` instead of `Bun.Terminal`

If you need Windows support before Bun.Terminal supports it, swap the PTY backend:

```bash
bun add @zenyr/bun-pty
```

```typescript
// In terminal-manager.ts, replace the Bun.spawn terminal block:
import { spawn as spawnPty } from "@zenyr/bun-pty";

// Inside create():
const pty = spawnPty(shellPath, shellArgs, {
  name: "xterm-256color",
  cols,
  rows,
  cwd: resolvedCwd,
  env: buildEnv(userEnv),
});

pty.onData((data) => sendData(id, data));
pty.onExit(({ exitCode, signal }) => {
  sendExit(id, exitCode, signal);
  terminals.delete(id);
});

terminals.set(id, { pty, shell: shellPath, cwd: resolvedCwd, title: "terminal" });

// write/resize/destroy use pty.write(), pty.resize(), pty.kill()
```

The webview code stays identical -- it doesn't know or care which PTY backend is used.

---

## Step 4: Aggressive Option -- libghostty for Terminal Rendering

If you want to go beyond xterm.js and use Ghostty's battle-tested VT parser or eventually its GPU renderer, here are the paths available today.

### Current status (Jan 2026)

| Component | Status | Usable today? |
|-----------|--------|---------------|
| `libghostty-vt` (Zig module) | Merged, API unstable | Yes (Zig projects) |
| `ghostty-web` (WASM) | Available from Coder | Yes (any webview) |
| Public C API | Planned, not shipped | No |
| `libghostty-render` (Metal/OpenGL) | Roadmap | No |
| `libghostty-input` | Roadmap | No |

### Path A: ghostty-web -- replace xterm.js with Ghostty's WASM parser

`ghostty-web` (by Coder, `github.com/coder/ghostty-web`) compiles Ghostty's VT parser to WebAssembly and wraps it with an xterm.js-compatible API. This gives you Ghostty's correct, SIMD-optimized terminal emulation inside a standard webview.

```bash
# Check the actual published package name -- it may be under @anthropic or @coder
bun add ghostty-web
```

```typescript
// src/terminal-view/terminal.ts -- swap the import
// Before:
import { Terminal } from "@xterm/xterm";
// After:
import { Terminal } from "ghostty-web";

// The rest of the code (FitAddon, onData, etc.) stays the same --
// ghostty-web is API-compatible with xterm.js.
```

Why you'd do this:
- Ghostty's parser handles edge cases that xterm.js gets wrong (complex grapheme clusters, certain OSC sequences, DCS passthrough)
- SIMD-optimized UTF-8 scanning in WASM
- Same webview code, just a different `Terminal` import

### Path B: libghostty-vt via Zig in Electrobun's native layer

Since Electrobun's native code is already Zig + C++, you can add `ghostty-vt` as a Zig dependency and use it for server-side terminal state. This is useful if you want to do things like:
- Semantic terminal state inspection from the main process (e.g., "what's the current command?", "where is the cursor?")
- Search through terminal scrollback from Bun
- Headless terminal capture for testing/automation

```zig
// In Electrobun's build.zig.zon, add ghostty as a dependency:
// .dependencies = .{
//     .ghostty = .{ .url = "https://github.com/ghostty-org/ghostty/archive/main.tar.gz", ... },
// },

// In your Zig code:
const vt = @import("ghostty-vt");

var terminal = try vt.Terminal.init(allocator, .{ .cols = 80, .rows = 24 });
defer terminal.deinit();

// Feed raw PTY bytes through the terminal state machine
terminal.feed(pty_output_bytes);

// Query terminal state
const cell = terminal.getCell(row, col);
const cursor = terminal.getCursor();
const selection = terminal.getSelectedText();
```

Then expose these to Bun via FFI for features like AI-assisted terminal, command detection, etc.

### Path C: Full native rendering (future)

When `libghostty-render` ships with Metal/OpenGL surfaces, you could render a terminal natively inside an Electrobun window alongside (or instead of) a webview. This would give you the same rendering quality as the Ghostty terminal app itself -- GPU-accelerated text, perfect font rendering, zero DOM overhead.

This isn't available yet. When it is, the integration point would be Electrobun's native C++/Zig layer, creating a native view alongside the CEF/WebKit webview.

**Recommendation for today:** Use xterm.js (proven, full-featured) or ghostty-web (better parser). Move to Path C when the rendering library ships.

---

## Step 5: Replace Remaining Electron APIs

### Window management

```typescript
// Electron
const win = new BrowserWindow({ width: 800, height: 600, webPreferences: { preload } });
win.loadURL('file://...');
win.on('closed', () => { /* cleanup */ });

// Electrobun
const win = new BrowserWindow({
  title: "My App",
  url: "views://mainview/index.html",   // bundled views
  frame: { width: 800, height: 600, x: 100, y: 100 },
  rpc: myRPC,                            // attach RPC directly
});
win.on("close", () => Utils.quit());
```

### Menus

```typescript
// Electron
Menu.setApplicationMenu(Menu.buildFromTemplate([...]));

// Electrobun
ApplicationMenu.setApplicationMenu([
  {
    submenu: [
      { label: "Quit", role: "quit", accelerator: "q" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" }, { role: "redo" },
      { type: "separator" },
      { role: "cut" }, { role: "copy" }, { role: "paste" },
    ],
  },
]);
```

### Dialogs & system utilities

```typescript
// Electron
const { dialog, shell, clipboard, Notification } = require('electron');
dialog.showOpenDialog({ properties: ['openFile'] });
shell.openExternal('https://...');
clipboard.writeText('hello');
new Notification({ title: '...', body: '...' }).show();

// Electrobun
await Utils.openFileDialog({ directory: false, multiple: false });
Utils.openExternal("https://...");
Utils.clipboard.writeText("hello");
Utils.showNotification({ title: "...", body: "..." });
```

### Global shortcuts

```typescript
// Electron
globalShortcut.register('CommandOrControl+Shift+I', () => { /* ... */ });

// Electrobun
import { GlobalShortcut } from "electrobun/bun";
GlobalShortcut.register("CommandOrControl+Shift+I", () => { /* ... */ });
```

### Tray

```typescript
// Electron
const tray = new Tray('/path/to/icon.png');
tray.setContextMenu(menu);

// Electrobun
import { Tray } from "electrobun/bun";
const tray = new Tray({ icon: "/path/to/icon.png", menu: [...] });
```

---

## Step 6: Replace Node.js APIs with Bun-Native Equivalents

| Node.js / Electron | Bun equivalent |
|---|---|
| `fs.readFile` | `Bun.file(path).text()` / `.arrayBuffer()` |
| `fs.writeFile` | `Bun.write(path, data)` |
| `child_process.spawn` | `Bun.spawn(cmd, opts)` |
| `child_process.exec` | `Bun.spawn(["sh", "-c", cmd])` |
| `crypto.randomBytes` | `crypto.getRandomValues(new Uint8Array(n))` |
| `http.createServer` | `Bun.serve({ fetch(req) { ... } })` |
| `path.join` | `import { join } from "path"` (works in Bun) |
| `require('module')` | `import x from "module"` (ESM native) |
| `node-fetch` | `fetch()` (built-in) |
| `node-pty` | `Bun.Terminal` or `bun-pty` |
| `better-sqlite3` | `bun:sqlite` (built-in) |
| `ws` (WebSocket) | `Bun.serve` with `websocket` handler (built-in) |

---

## Step 7: Build & Ship

```bash
# Development
cd package && bun dev

# Build for distribution
electrobun build

# The output is a self-extracting bundle (~12MB)
# Updates use bsdiff patches (~14KB)
```

### Update mechanism

```typescript
import { Updater } from "electrobun/bun";

// Built-in updater with bsdiff -- replaces electron-updater entirely
const updater = new Updater({
  url: "https://updates.myapp.com",
});

await updater.checkForUpdates();
```

---

## Migration Checklist

- [ ] Initialize Electrobun project with `electrobun.config.ts`
- [ ] Define RPC schemas to replace all tRPC routers
- [ ] Implement bun-side RPC handlers (replaces tRPC procedures)
- [ ] Update webview code to use `Electroview.defineRPC` instead of tRPC client
- [ ] Replace `node-pty` with `Bun.Terminal` or `bun-pty`
- [ ] Keep xterm.js frontend, update transport to use Electrobun RPC
- [ ] (Optional) Replace xterm.js with ghostty-web for WASM-based rendering
- [ ] Replace `BrowserWindow` / preload script with Electrobun equivalents
- [ ] Replace Electron menus, dialogs, tray, shortcuts with Electrobun APIs
- [ ] Replace Node.js APIs with Bun built-ins (`Bun.file`, `Bun.serve`, `bun:sqlite`, etc.)
- [ ] Remove all Electron and tRPC dependencies from `package.json`
- [ ] Test with `bun dev`, build with `electrobun build`

---

## Key Differences to Keep in Mind

1. **No preload scripts needed.** Electrobun's RPC is the bridge -- no `contextBridge` or `ipcRenderer` required.

2. **No Zod needed for IPC.** The RPC schema is TypeScript-typed end-to-end. Add runtime validation only if you need it.

3. **Views are bundled.** Use `views://viewname/index.html` URLs instead of `file://` paths. Configure views in `electrobun.config.ts`.

4. **RPC is bidirectional by default.** Both bun and webview can send requests and messages to each other -- no separate "main-to-renderer" vs "renderer-to-main" channel setup.

5. **Bun.Terminal is built-in.** No native addon compilation, no `node-gyp`, no `prebuild`. It just works.

6. **Encrypted IPC.** Electrobun encrypts all RPC traffic between bun and webviews with AES-256-GCM automatically. No configuration needed.
