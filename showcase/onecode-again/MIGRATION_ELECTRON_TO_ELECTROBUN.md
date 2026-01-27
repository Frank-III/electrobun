# Migrating from Electron + tRPC to Electrobun (Bun-Native)

Everything backend: RPC, PTY, native terminal emulation via libghostty, window APIs, platform APIs, and Bun-native replacements. No UI framework code -- bring your own renderer.

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
| Terminal emulation | xterm.js (webview) | libghostty-vt (native Zig) + any webview renderer |
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
    terminal-manager.ts
  shared/         # Shared types (RPC schemas)
    rpc-schema.ts
    terminal-rpc.ts
  native/         # Zig native extensions (ghostty-vt, etc.)
    terminal_vt.zig
    build.zig
    build.zig.zon
  mainview/       # Frontend (any framework -- not covered here)
    index.html
electrobun.config.ts
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

// Push messages to webview
mainWindow.webview.on("dom-ready", () => {
  mainWindow.webview.rpc?.send.notify({ message: "App loaded" });
});
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
| Zod validation | TypeScript types (validate manually at boundaries if needed) |
| tRPC context | Closures / module scope in the bun handler |
| tRPC middleware | Wrap handler functions directly |

---

## Step 3: Terminal Backend -- PTY Manager

This section covers the bun-side terminal infrastructure only. Your webview renderer (xterm.js, ghostty-web, or custom canvas) connects to this via the RPC schema. The architecture is intentionally renderer-agnostic.

### 3.1 RPC Schema

```typescript
// src/shared/terminal-rpc.ts
import type { RPCSchema } from "electrobun/bun";

export interface TerminalRPC {
  bun: RPCSchema<{
    requests: {
      create: {
        params: {
          id: string;
          cols: number;
          rows: number;
          cwd?: string;
          shell?: string;
          env?: Record<string, string>;
        };
        response: { pid: number; shell: string };
      };
      write: { params: { id: string; data: string }; response: void };
      resize: { params: { id: string; cols: number; rows: number }; response: void };
      destroy: { params: { id: string }; response: void };
      getDefaultShell: { params: {}; response: { shell: string; args: string[] } };
      clipboardWrite: { params: { text: string }; response: void };
      clipboardRead: { params: {}; response: { text: string } };
      /** Query terminal state from ghostty-vt (see Step 4) */
      getScreenContent: {
        params: { id: string; startRow?: number; endRow?: number };
        response: { lines: string[]; cursorX: number; cursorY: number };
      };
      searchScrollback: {
        params: { id: string; query: string };
        response: { matches: Array<{ row: number; col: number; text: string }> };
      };
      getCurrentCommand: {
        params: { id: string };
        response: { command: string; cwd: string } | null;
      };
    };
    messages: {};
  }>;

  webview: RPCSchema<{
    requests: {};
    messages: {
      data: { id: string; data: string };
      exit: { id: string; exitCode: number; signal?: number };
      titleChanged: { id: string; title: string };
      bell: { id: string };
    };
  }>;
}
```

### 3.2 Terminal manager

```typescript
// src/bun/terminal-manager.ts
import { Utils } from "electrobun/bun";

interface ManagedTerminal {
  proc: ReturnType<typeof Bun.spawn>;
  terminal: any; // Bun.Terminal handle
  shell: string;
  cwd: string;
  title: string;
}

const terminals = new Map<string, ManagedTerminal>();

/** Detect the user's preferred shell */
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

/** Build environment for a terminal session */
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
            const str = typeof rawData === "string"
              ? rawData
              : new TextDecoder().decode(rawData);

            // Detect OSC title sequences: \x1b]0;title\x07 or \x1b]2;title\x07
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

            // Forward raw bytes to webview renderer AND ghostty-vt (see Step 4)
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
      t.proc.kill("SIGHUP");
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
  for (const [, t] of terminals) {
    t.proc.kill("SIGKILL");
    t.terminal.close();
  }
  terminals.clear();
}
```

### 3.3 Wire into the main process

```typescript
// src/bun/index.ts
import { BrowserWindow, BrowserView, ApplicationMenu, Utils } from "electrobun/bun";
import type { TerminalRPC } from "../shared/terminal-rpc";
import { createTerminalHandlers, destroyAll } from "./terminal-manager";

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
      // ghostty-vt backed queries -- see Step 4
      getScreenContent: async ({ id, startRow, endRow }) => { /* Step 4 */ },
      searchScrollback: async ({ id, query }) => { /* Step 4 */ },
      getCurrentCommand: async ({ id }) => { /* Step 4 */ },
    },
    messages: {},
  },
});

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

### 3.4 Alternative PTY backend: `bun-pty`

If you need Windows support before Bun.Terminal supports it:

```bash
bun add @zenyr/bun-pty
```

```typescript
// In terminal-manager.ts, swap the Bun.spawn terminal block:
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

// write/resize/destroy → pty.write(), pty.resize(), pty.kill()
```

---

## Step 4: Native Terminal Emulation with libghostty-vt

This is the key section for running Claude Code or any tool that outputs complex VT sequences. Instead of relying on a webview-side JS terminal emulator, we integrate Ghostty's VT parser natively via Zig -- the same language Electrobun already uses for native code. This gives you:

- **Server-side terminal state**: query cursor position, cell content, scrollback from Bun without round-tripping through the webview
- **Correct VT handling**: Ghostty's parser is battle-tested against every escape sequence Claude Code emits (alternate screen, cursor save/restore, bracketed paste, OSC hyperlinks, DCS passthrough, etc.)
- **AI-assisted terminal**: inspect the terminal buffer from Bun to detect commands, extract output, search scrollback
- **Headless mode**: run terminals without a webview for automation/testing

### 4.1 Architecture

```
                    ┌──────────────────────────────────────┐
                    │            Webview (any renderer)     │
                    │  xterm.js / ghostty-web / canvas      │
                    │                                      │
                    │  Receives raw PTY data via RPC        │
                    │  Sends keystrokes via RPC             │
                    └──────────────┬───────────────────────┘
                                   │ Electrobun RPC
                    ┌──────────────┴───────────────────────┐
                    │          Bun Main Process             │
                    │                                      │
                    │  terminal-manager.ts                  │
                    │    ├── Bun.Terminal (PTY)             │
                    │    └── ghostty-vt (via FFI)           │
                    │          ├── Stream ← raw PTY bytes   │
                    │          ├── Terminal state machine    │
                    │          ├── Screen (cells, cursor)   │
                    │          └── PageList (scrollback)    │
                    └──────────────────────────────────────┘
```

Every byte from the PTY flows to both:
1. The webview (for rendering)
2. The ghostty-vt `Stream` (for state tracking)

This means the Bun process always knows the terminal state -- it can answer "what text is on screen?" without asking the webview.

### 4.2 Building ghostty-vt as a shared library

Ghostty's `lib-vt` module is a Zig library. We compile it to a shared library that Bun can load via `bun:ffi`.

```zig
// src/native/build.zig.zon
.{
    .name = "electrobun-terminal",
    .version = "0.1.0",
    .dependencies = .{
        .ghostty = .{
            .url = "https://github.com/ghostty-org/ghostty/archive/main.tar.gz",
            .hash = "...", // pin to a specific commit
        },
    },
    .paths = .{"."},
}
```

```zig
// src/native/build.zig
const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const ghostty_dep = b.dependency("ghostty", .{
        .target = target,
        .optimize = optimize,
    });

    const lib = b.addSharedLibrary(.{
        .name = "electrobun_vt",
        .root_source_file = b.path("terminal_vt.zig"),
        .target = target,
        .optimize = optimize,
    });

    lib.root_module.addImport("ghostty-vt", ghostty_dep.module("ghostty-vt"));
    b.installArtifact(lib);
}
```

### 4.3 Zig wrapper -- C-ABI exports for FFI

This wraps ghostty-vt's Zig API into `extern "C"` functions that Bun can call via `dlopen`.

```zig
// src/native/terminal_vt.zig
const std = @import("std");
const ghostty = @import("ghostty-vt");

const Allocator = std.mem.Allocator;

/// Opaque handle for a terminal instance
const TerminalHandle = *TerminalState;

const TerminalState = struct {
    terminal: ghostty.Terminal,
    stream: ghostty.Stream(*ghostty.Terminal),
    alloc: Allocator,
};

// ─── Lifecycle ───────────────────────────────────────────────────────

/// Create a new terminal instance. Returns opaque handle.
export fn vt_create(cols: u16, rows: u16, max_scrollback: u32) callconv(.C) ?*anyopaque {
    const alloc = std.heap.c_allocator;
    const state = alloc.create(TerminalState) catch return null;

    state.terminal = ghostty.Terminal.init(alloc, .{
        .cols = cols,
        .rows = rows,
        .max_scrollback = max_scrollback,
    }) catch {
        alloc.destroy(state);
        return null;
    };

    state.stream = ghostty.Stream(*ghostty.Terminal).init(&state.terminal);
    state.alloc = alloc;
    return @ptrCast(state);
}

/// Destroy a terminal instance and free all memory.
export fn vt_destroy(handle: ?*anyopaque) callconv(.C) void {
    const state = unwrap(handle) orelse return;
    state.terminal.deinit(state.alloc);
    state.alloc.destroy(state);
}

// ─── Input ───────────────────────────────────────────────────────────

/// Feed raw PTY output bytes through the VT parser.
/// Call this with every chunk of data from Bun.Terminal's data callback.
export fn vt_feed(handle: ?*anyopaque, data: [*]const u8, len: u32) callconv(.C) void {
    const state = unwrap(handle) orelse return;
    state.stream.nextSlice(data[0..len]) catch {};
}

/// Resize the terminal. Also resizes the internal screen with reflow.
export fn vt_resize(handle: ?*anyopaque, cols: u16, rows: u16) callconv(.C) void {
    const state = unwrap(handle) orelse return;
    state.terminal.resize(state.alloc, cols, rows) catch {};
}

// ─── Cursor ──────────────────────────────────────────────────────────

export fn vt_cursor_x(handle: ?*anyopaque) callconv(.C) u16 {
    const state = unwrap(handle) orelse return 0;
    return state.terminal.screen.cursor.x;
}

export fn vt_cursor_y(handle: ?*anyopaque) callconv(.C) u16 {
    const state = unwrap(handle) orelse return 0;
    return state.terminal.screen.cursor.y;
}

// ─── Screen content ──────────────────────────────────────────────────

/// Extract plain text for a single row (0-indexed from top of active area).
/// Writes into caller-provided buffer, returns bytes written.
export fn vt_get_row_text(
    handle: ?*anyopaque,
    row: u16,
    buf: [*]u8,
    buf_len: u32,
) callconv(.C) u32 {
    const state = unwrap(handle) orelse return 0;
    const t = &state.terminal;

    // Use plainString for the whole screen, then extract the row.
    // For production, iterate cells directly for better performance.
    const full = t.plainString(state.alloc) catch return 0;
    defer state.alloc.free(full);

    var line_start: usize = 0;
    var current_row: u16 = 0;
    for (full, 0..) |c, i| {
        if (c == '\n') {
            if (current_row == row) {
                const line = full[line_start..i];
                const copy_len = @min(line.len, buf_len);
                @memcpy(buf[0..copy_len], line[0..copy_len]);
                return @intCast(copy_len);
            }
            current_row += 1;
            line_start = i + 1;
        }
    }
    // Last line (no trailing newline)
    if (current_row == row) {
        const line = full[line_start..];
        const copy_len = @min(line.len, buf_len);
        @memcpy(buf[0..copy_len], line[0..copy_len]);
        return @intCast(copy_len);
    }
    return 0;
}

/// Extract the entire visible screen as plain text.
/// Returns a malloc'd C string (caller must free with vt_free_string).
export fn vt_get_screen_text(handle: ?*anyopaque) callconv(.C) ?[*:0]u8 {
    const state = unwrap(handle) orelse return null;
    const text = state.terminal.plainString(state.alloc) catch return null;
    defer state.alloc.free(text);

    // Copy to a C-compatible null-terminated string via malloc
    const c_str = std.heap.c_allocator.allocSentinel(u8, text.len, 0) catch return null;
    @memcpy(c_str[0..text.len], text);
    return c_str;
}

export fn vt_free_string(ptr: ?[*:0]u8) callconv(.C) void {
    if (ptr) |p| {
        // Find length by scanning for null terminator
        var len: usize = 0;
        while (p[len] != 0) : (len += 1) {}
        std.heap.c_allocator.free(p[0 .. len + 1]);
    }
}

// ─── Cell inspection ─────────────────────────────────────────────────

/// Get the codepoint at (row, col) in the active area. Returns 0 for empty cells.
export fn vt_get_cell_codepoint(handle: ?*anyopaque, row: u16, col: u16) callconv(.C) u21 {
    const state = unwrap(handle) orelse return 0;
    const result = state.terminal.screen.pages.getCell(.{
        .active = .{ .x = col, .y = row },
    }) orelse return 0;
    return result.cell.codepoint();
}

/// Get the SGR style flags for a cell. Returns a packed u16:
/// bit 0: bold, bit 1: italic, bit 2: faint, bit 3: blink,
/// bit 4: inverse, bit 5: invisible, bit 6: strikethrough, bit 7: overline
export fn vt_get_cell_flags(handle: ?*anyopaque, row: u16, col: u16) callconv(.C) u16 {
    const state = unwrap(handle) orelse return 0;
    const result = state.terminal.screen.pages.getCell(.{
        .active = .{ .x = col, .y = row },
    }) orelse return 0;
    _ = result; // Style lookup requires page-level style table access
    // In production: resolve result.cell.style_id via the page's style table
    return 0;
}

// ─── Scrollback ──────────────────────────────────────────────────────

/// Scroll the viewport. delta > 0 scrolls up, delta < 0 scrolls down.
export fn vt_scroll(handle: ?*anyopaque, delta: i32) callconv(.C) void {
    const state = unwrap(handle) orelse return;
    state.terminal.screen.scroll(.{ .delta_row = delta });
}

/// Jump viewport to bottom (active area).
export fn vt_scroll_to_bottom(handle: ?*anyopaque) callconv(.C) void {
    const state = unwrap(handle) orelse return;
    state.terminal.screen.scroll(.active);
}

/// Check if viewport is at the bottom.
export fn vt_is_at_bottom(handle: ?*anyopaque) callconv(.C) bool {
    const state = unwrap(handle) orelse return true;
    return state.terminal.screen.viewportIsBottom();
}

// ─── Helpers ─────────────────────────────────────────────────────────

fn unwrap(handle: ?*anyopaque) ?*TerminalState {
    const ptr = handle orelse return null;
    return @ptrCast(@alignCast(ptr));
}
```

Build it:

```bash
cd src/native && zig build -Doptimize=ReleaseFast
# Output: zig-out/lib/libelectrobun_vt.{so,dylib,dll}
```

### 4.4 FFI bridge -- load ghostty-vt from Bun

Following Electrobun's own pattern in `package/src/bun/proc/native.ts`:

```typescript
// src/bun/ghostty-ffi.ts
import { dlopen, FFIType, suffix, CString, ptr, toBuffer } from "bun:ffi";
import { join } from "path";

const lib = dlopen(join(process.cwd(), `libelectrobun_vt.${suffix}`), {
  vt_create: {
    args: [FFIType.u16, FFIType.u16, FFIType.u32],
    returns: FFIType.ptr,
  },
  vt_destroy: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_feed: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32],
    returns: FFIType.void,
  },
  vt_resize: {
    args: [FFIType.ptr, FFIType.u16, FFIType.u16],
    returns: FFIType.void,
  },
  vt_cursor_x: {
    args: [FFIType.ptr],
    returns: FFIType.u16,
  },
  vt_cursor_y: {
    args: [FFIType.ptr],
    returns: FFIType.u16,
  },
  vt_get_screen_text: {
    args: [FFIType.ptr],
    returns: FFIType.ptr,
  },
  vt_free_string: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_get_row_text: {
    args: [FFIType.ptr, FFIType.u16, FFIType.ptr, FFIType.u32],
    returns: FFIType.u32,
  },
  vt_get_cell_codepoint: {
    args: [FFIType.ptr, FFIType.u16, FFIType.u16],
    returns: FFIType.u32, // u21 promoted to u32
  },
  vt_scroll: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  vt_scroll_to_bottom: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  vt_is_at_bottom: {
    args: [FFIType.ptr],
    returns: FFIType.bool,
  },
});

const { symbols } = lib;

/**
 * Managed ghostty-vt terminal instance.
 * Mirrors the PTY state -- feed it the same bytes the webview sees.
 */
export class GhosttyTerminal {
  private handle: ReturnType<typeof symbols.vt_create>;

  constructor(cols: number, rows: number, maxScrollback = 10_000) {
    this.handle = symbols.vt_create(cols, rows, maxScrollback);
    if (!this.handle) throw new Error("Failed to create ghostty-vt terminal");
  }

  /** Feed raw PTY output bytes. Call from Bun.Terminal's data callback. */
  feed(data: string | Uint8Array) {
    const buf = typeof data === "string" ? Buffer.from(data) : data;
    symbols.vt_feed(this.handle, ptr(buf), buf.length);
  }

  resize(cols: number, rows: number) {
    symbols.vt_resize(this.handle, cols, rows);
  }

  get cursorX(): number {
    return symbols.vt_cursor_x(this.handle);
  }

  get cursorY(): number {
    return symbols.vt_cursor_y(this.handle);
  }

  /** Extract the entire visible screen as plain text. */
  getScreenText(): string {
    const cstr = symbols.vt_get_screen_text(this.handle);
    if (!cstr) return "";
    const result = new CString(cstr).toString();
    symbols.vt_free_string(cstr);
    return result;
  }

  /** Extract a single row as plain text. */
  getRowText(row: number): string {
    const buf = new Uint8Array(4096);
    const len = symbols.vt_get_row_text(this.handle, row, ptr(buf), buf.length);
    return new TextDecoder().decode(buf.subarray(0, len));
  }

  /** Get the Unicode codepoint at (row, col). 0 = empty. */
  getCellCodepoint(row: number, col: number): number {
    return symbols.vt_get_cell_codepoint(this.handle, row, col);
  }

  scroll(delta: number) {
    symbols.vt_scroll(this.handle, delta);
  }

  scrollToBottom() {
    symbols.vt_scroll_to_bottom(this.handle);
  }

  get isAtBottom(): boolean {
    return symbols.vt_is_at_bottom(this.handle);
  }

  destroy() {
    symbols.vt_destroy(this.handle);
  }
}
```

### 4.5 Integrate with terminal-manager

Modify the terminal manager to maintain a ghostty-vt shadow for each PTY:

```typescript
// In terminal-manager.ts, add to ManagedTerminal:
import { GhosttyTerminal } from "./ghostty-ffi";

interface ManagedTerminal {
  proc: ReturnType<typeof Bun.spawn>;
  terminal: any;
  vt: GhosttyTerminal; // ghostty-vt shadow state
  shell: string;
  cwd: string;
  title: string;
}

// In create(), after Bun.spawn:
const vt = new GhosttyTerminal(cols, rows);

// In the data callback:
data(_terminal: any, rawData: string | Uint8Array) {
  // ...existing OSC/bell detection...

  // Feed raw bytes to ghostty-vt for state tracking
  vt.feed(rawData);

  sendData(id, str);
}

// In resize():
managed.vt.resize(cols, rows);

// In destroy():
managed.vt.destroy();

// New RPC handlers:
getScreenContent: ({ id, startRow, endRow }) => {
  const t = terminals.get(id);
  if (!t) throw new Error(`Terminal ${id} not found`);
  const lines: string[] = [];
  const start = startRow ?? 0;
  const end = endRow ?? (/* t.vt rows */ 24);
  for (let row = start; row < end; row++) {
    lines.push(t.vt.getRowText(row));
  }
  return { lines, cursorX: t.vt.cursorX, cursorY: t.vt.cursorY };
},

searchScrollback: ({ id, query }) => {
  const t = terminals.get(id);
  if (!t) throw new Error(`Terminal ${id} not found`);
  const screen = t.vt.getScreenText();
  const matches: Array<{ row: number; col: number; text: string }> = [];
  const lines = screen.split("\n");
  for (let row = 0; row < lines.length; row++) {
    let col = lines[row].indexOf(query);
    while (col !== -1) {
      matches.push({ row, col, text: lines[row] });
      col = lines[row].indexOf(query, col + 1);
    }
  }
  return { matches };
},

getCurrentCommand: ({ id }) => {
  const t = terminals.get(id);
  if (!t) return null;
  // Heuristic: read the line at cursorY, extract text after the prompt
  const line = t.vt.getRowText(t.vt.cursorY);
  // Simple heuristic -- strip common prompt patterns
  const match = line.match(/(?:\$|>|#|%)\s*(.*)$/);
  return match ? { command: match[1], cwd: t.cwd } : null;
},
```

### 4.6 What this enables

With ghostty-vt running as a shadow state machine:

**Running Claude Code in the terminal:**
- Claude Code uses alternate screen, cursor positioning, ANSI colors, bracketed paste -- ghostty-vt handles all of it correctly
- You can query the terminal state from Bun at any point to see what Claude Code is displaying
- No dependency on the webview renderer being correct

**AI-assisted features:**
```typescript
// From any Bun code, not just RPC handlers:
const t = terminals.get("term-1");
const screen = t.vt.getScreenText();
// Send screen content to an LLM for analysis
const analysis = await askClaude(`What command just ran? Output:\n${screen}`);
```

**Headless terminal (no webview needed):**
```typescript
// Useful for testing, automation, CI
const vt = new GhosttyTerminal(80, 24);
const proc = Bun.spawn(["bun", "test"], {
  terminal: {
    cols: 80, rows: 24,
    data(_, data) { vt.feed(data); },
  },
});
await proc.exited;
const output = vt.getScreenText();
console.log("Test output:", output);
vt.destroy();
```

---

## Step 5: Window APIs

### Window management

```typescript
// Electron
const win = new BrowserWindow({ width: 800, height: 600, webPreferences: { preload } });
win.loadURL('file://...');
win.on('closed', () => { /* cleanup */ });

// Electrobun
import { BrowserWindow, Utils } from "electrobun/bun";

const win = new BrowserWindow({
  title: "My App",
  url: "views://mainview/index.html",   // bundled views
  frame: { width: 800, height: 600, x: 100, y: 100 },
  renderer: "cef",                       // "cef" or "native" (system webview)
  titleBarStyle: "hiddenInset",          // "default" | "hidden" | "hiddenInset"
  transparent: false,
  rpc: myRPC,                            // attach RPC directly -- no preload scripts
});

// Window methods
win.setTitle("New Title");
win.minimize();
win.maximize();
win.setFullScreen(true);
win.setAlwaysOnTop(true);
win.setPosition(100, 200);
win.setSize(1024, 768);
win.setFrame(100, 200, 1024, 768);
const { x, y, width, height } = win.getFrame();

// Events
win.on("close", () => { destroyAll(); Utils.quit(); });
win.on("resize", (e) => console.log("Resized:", e));
win.on("move", (e) => console.log("Moved:", e));
win.on("focus", () => console.log("Focused"));
win.on("blur", () => console.log("Blurred"));
```

### Application menus

```typescript
// Electron
Menu.setApplicationMenu(Menu.buildFromTemplate([...]));

// Electrobun
import Electrobun, { ApplicationMenu } from "electrobun/bun";

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
      { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" },
    ],
  },
  {
    label: "Terminal",
    submenu: [
      { label: "New Tab", action: "new-tab", accelerator: "CommandOrControl+T" },
      { label: "Close Tab", action: "close-tab", accelerator: "CommandOrControl+W" },
    ],
  },
]);

Electrobun.events.on("application-menu-clicked", (e) => {
  if (e.data.action === "new-tab") { /* ... */ }
  if (e.data.action === "close-tab") { /* ... */ }
});
```

### Context menus

```typescript
// Electron
const menu = new Menu();
menu.append(new MenuItem({ label: 'Copy', role: 'copy' }));
menu.popup();

// Electrobun
import { ContextMenu } from "electrobun/bun";
ContextMenu.show([
  { label: "Copy", role: "copy" },
  { label: "Paste", role: "paste" },
  { type: "separator" },
  { label: "Clear", action: "clear-terminal" },
]);
```

### Dialogs & system utilities

```typescript
// Electron
dialog.showOpenDialog({ properties: ['openFile'] });
shell.openExternal('https://...');
clipboard.writeText('hello');
new Notification({ title: '...', body: '...' }).show();

// Electrobun
import { Utils } from "electrobun/bun";

await Utils.openFileDialog({ directory: false, multiple: false });
Utils.openExternal("https://...");
Utils.openPath("/path/to/file");
Utils.showItemInFolder("/path/to/file");
Utils.moveToTrash("/path/to/file");
Utils.showNotification({ title: "...", body: "..." });
await Utils.showMessageBox({ title: "Confirm", message: "Are you sure?" });

// Clipboard
Utils.clipboard.writeText("hello");
const text = await Utils.clipboard.readText();
const imageData = await Utils.clipboard.readImage();
Utils.clipboard.writeImage(buffer);
```

### Global shortcuts

```typescript
// Electron
globalShortcut.register('CommandOrControl+Shift+I', () => { /* ... */ });

// Electrobun
import { GlobalShortcut } from "electrobun/bun";
GlobalShortcut.register("CommandOrControl+Shift+I", () => { /* ... */ });
```

### System tray

```typescript
// Electron
const tray = new Tray('/path/to/icon.png');
tray.setContextMenu(menu);

// Electrobun
import { Tray } from "electrobun/bun";
const tray = new Tray({ icon: "/path/to/icon.png", menu: [...] });
```

### Screen / display info

```typescript
import { Screen } from "electrobun/bun";

const primary = Screen.getPrimaryDisplay();  // { width, height, scaleFactor, ... }
const all = Screen.getAllDisplays();
const cursor = Screen.getCursorScreenPoint();  // { x, y }
```

### Session & storage

```typescript
import { Session } from "electrobun/bun";

const session = Session.fromPartition("persist:my-app");
// or: Session.defaultSession

const cookies = await session.cookies.get({ domain: "example.com" });
await session.cookies.set({ url: "https://example.com", name: "key", value: "val" });
await session.clearStorageData(["cookies", "localStorage"]);
```

### Webview events

```typescript
win.webview.on("dom-ready", () => { /* webview DOM loaded */ });
win.webview.on("did-navigate", (e) => console.log("Navigated to:", e.url));
win.webview.on("did-fail-load", (e) => console.log("Load failed:", e));

// Execute arbitrary JS in the webview
win.webview.executeJavascript('document.title');
const result = await win.webview.rpc?.request.evaluateJavascriptWithResponse({
  script: 'return document.title',
});
```

---

## Step 6: Node.js → Bun Replacements

| Node.js / Electron | Bun equivalent |
|---|---|
| `fs.readFile` | `Bun.file(path).text()` / `.arrayBuffer()` / `.json()` |
| `fs.writeFile` | `Bun.write(path, data)` |
| `fs.watch` | `fs.watch(path)` (Bun supports this) |
| `child_process.spawn` | `Bun.spawn(cmd, opts)` |
| `child_process.exec` | `Bun.spawn(["sh", "-c", cmd])` |
| `child_process.fork` + IPC | `Bun.spawn(["bun", "child.ts"], { ipc(msg) { ... } })` |
| `crypto.randomBytes` | `crypto.getRandomValues(new Uint8Array(n))` |
| `http.createServer` | `Bun.serve({ fetch(req) { ... } })` |
| `ws` (WebSocket server) | `Bun.serve({ websocket: { message(ws, msg) { ... } } })` |
| `path.join` | `import { join } from "path"` (works in Bun) |
| `require('module')` | `import x from "module"` (ESM native) |
| `node-fetch` / `axios` | `fetch()` (built-in, Web standard) |
| `node-pty` | `Bun.Terminal` (built-in) or `@zenyr/bun-pty` |
| `better-sqlite3` | `import { Database } from "bun:sqlite"` (built-in) |
| `dotenv` | Bun loads `.env` automatically |
| `jest` / `vitest` | `bun test` (built-in test runner) |
| `tsx` / `ts-node` | Not needed -- Bun runs TypeScript natively |
| `nodemon` | `bun --watch` |

### Bun IPC between processes

```typescript
// parent.ts
const child = Bun.spawn(["bun", "child.ts"], {
  ipc(message) {
    console.log("From child:", message);
  },
  serialization: "advanced", // structuredClone-compatible (ArrayBuffer, Map, Set, etc.)
});
child.send({ command: "start", config: { ... } });

// child.ts
process.on("message", (msg) => {
  process.send({ status: "done", result: { ... } });
});
```

---

## Step 7: Build & Ship

```bash
# Development
cd package && bun dev

# Build for distribution
electrobun build

# The output is a self-extracting bundle (~12MB)
# Updates use bsdiff patches (as small as ~14KB)
```

### Auto-updates

```typescript
import { Updater } from "electrobun/bun";

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
- [ ] Set up terminal manager with `Bun.Terminal` PTY backend
- [ ] Build `libelectrobun_vt` from ghostty-vt Zig module
- [ ] Wire FFI bridge (`ghostty-ffi.ts`) for native terminal state
- [ ] Feed PTY output to both webview (via RPC) and ghostty-vt (via FFI)
- [ ] Implement `getScreenContent` / `searchScrollback` / `getCurrentCommand` RPC handlers
- [ ] Replace `BrowserWindow` / preload script with Electrobun window APIs
- [ ] Replace Electron menus, dialogs, tray, shortcuts with Electrobun equivalents
- [ ] Replace Node.js APIs with Bun built-ins (`Bun.file`, `Bun.serve`, `bun:sqlite`, etc.)
- [ ] Remove all Electron, tRPC, and Zod dependencies
- [ ] Test with `bun dev`, build with `electrobun build`

---

## Key Differences

1. **No preload scripts.** Electrobun's RPC is the bridge. No `contextBridge`, no `ipcRenderer`.

2. **No Zod for IPC.** RPC schema is TypeScript-typed end-to-end.

3. **Views are bundled.** Use `views://viewname/index.html` URLs. Configure in `electrobun.config.ts`.

4. **RPC is bidirectional by default.** Both bun and webview can send requests and messages.

5. **Terminal state lives natively.** With ghostty-vt, the Bun process always knows what's on screen -- no round-trip to the webview to read terminal content.

6. **Encrypted IPC.** AES-256-GCM between bun and webviews, automatic, zero config.

7. **Zig-native extension path.** Electrobun already uses Zig -- adding ghostty-vt is a natural dependency, not a foreign build system.
