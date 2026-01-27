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

## Step 3: Replace `node-pty` with Bun-Native PTY

### Option A: `Bun.Terminal` (built-in, recommended, Bun v1.3.5+)

No dependencies required. This replaces `node-pty` entirely.

```typescript
// src/bun/terminal.ts
// Main process: spawn a PTY and relay data over RPC

import { BrowserView } from "electrobun/bun";
import type { TerminalRPC } from "../shared/terminal-rpc";

const terminals = new Map<string, { proc: any; terminal: any }>();

const terminalRPC = BrowserView.defineRPC<TerminalRPC>({
  handlers: {
    requests: {
      createTerminal: async ({ id, cols, rows }) => {
        const proc = Bun.spawn(["bash"], {
          terminal: {
            cols,
            rows,
            data(terminal, data) {
              // Relay PTY output to the webview
              mainWindow.webview.rpc?.send.terminalData({ id, data });
            },
          },
        });
        terminals.set(id, { proc, terminal: proc.terminal });
        return { pid: proc.pid };
      },

      writeTerminal: ({ id, data }) => {
        terminals.get(id)?.terminal.write(data);
      },

      resizeTerminal: ({ id, cols, rows }) => {
        terminals.get(id)?.terminal.resize(cols, rows);
      },

      destroyTerminal: ({ id }) => {
        const t = terminals.get(id);
        t?.proc.kill();
        t?.terminal.close();
        terminals.delete(id);
      },
    },
    messages: {},
  },
});
```

### Option B: `bun-pty` (third-party, if you need broader OS support)

```bash
bun add @zenyr/bun-pty
```

```typescript
import { spawn } from "@zenyr/bun-pty";

const pty = spawn("bash", [], {
  name: "xterm-256color",
  cols: 80,
  rows: 24,
});

pty.onData((data) => {
  mainWindow.webview.rpc?.send.terminalData({ id, data });
});

pty.onExit(({ exitCode }) => {
  mainWindow.webview.rpc?.send.terminalExit({ id, exitCode });
});

// Write user input
pty.write("ls -la\n");

// Resize
pty.resize(120, 40);
```

### Webview side: xterm.js (same as Electron)

Your existing xterm.js frontend code stays largely the same. Just replace the IPC transport:

```typescript
// Before (Electron + tRPC)
window.trpc.terminal.write.mutate({ id, data: inputData });
window.trpc.terminal.onData.subscribe({ id }, { onData: (d) => xterm.write(d) });

// After (Electrobun RPC)
rpc.request.writeTerminal({ id, data: inputData });
// In your message handler:
// messages: { terminalData: ({ id, data }) => xterm.write(data) }
```

---

## Step 4: Aggressive Option -- libghostty for Terminal Rendering

If you want to go beyond xterm.js and use a GPU-accelerated terminal renderer, libghostty is an option. This is the most aggressive migration path.

### Current status (as of Jan 2026)

- **`libghostty-vt`** is available as a Zig module for terminal emulation (parser, state machine, scrollback)
- The clean **public C API** is not yet stable
- **`ghostty-web`** (by Coder) compiles the parser to WASM with xterm.js API compatibility
- Full rendering libraries (`libghostty-render` with Metal/OpenGL) are on the roadmap but not shipped

### Path A: ghostty-web (WASM, drop-in xterm.js replacement)

The easiest path. Use `ghostty-web` as a WASM-backed xterm.js-compatible terminal in your webview:

```bash
bun add @anthropic-ai/ghostty-web   # check npm for actual package name
```

```typescript
// In your webview code, replace xterm.js with ghostty-web
import { GhosttyTerminal } from "ghostty-web";

const terminal = new GhosttyTerminal({ /* xterm.js-compatible options */ });
terminal.open(document.getElementById("terminal"));

// Same API as xterm.js -- your existing code should work
terminal.write(data);
terminal.onData((input) => rpc.request.writeTerminal({ id, data: input }));
```

### Path B: Native libghostty via Bun FFI (advanced)

Since Electrobun already uses Zig for native code, you can integrate `ghostty-vt` as a Zig dependency for the terminal state machine, then expose it via FFI:

```typescript
// bun:ffi approach (once a C API is available)
import { dlopen, FFIType, suffix } from "bun:ffi";

const ghostty = dlopen(`libghostty_vt.${suffix}`, {
  terminal_new: { args: [FFIType.i32, FFIType.i32], returns: FFIType.ptr },
  terminal_feed: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32], returns: FFIType.void },
  terminal_resize: { args: [FFIType.ptr, FFIType.i32, FFIType.i32], returns: FFIType.void },
  terminal_get_cell: { args: [FFIType.ptr, FFIType.i32, FFIType.i32], returns: FFIType.ptr },
  terminal_free: { args: [FFIType.ptr], returns: FFIType.void },
});
```

### Path C: Zig integration via Electrobun's native layer (most integrated)

Add `ghostty-vt` as a Zig dependency in `build.zig.zon` and use it inside the native wrapper alongside CEF. This gives you a native terminal view rendered directly in the window without a webview.

**Recommendation:** Use Path A (ghostty-web) today. Move to Path C when `libghostty-render` ships with GPU rendering surfaces.

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
