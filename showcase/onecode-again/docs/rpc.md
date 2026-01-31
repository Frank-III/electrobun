# Electrobun RPC Usage (Frontend)

This project uses Electrobun's typed RPC to communicate between the webview
and the Bun main process. The shared types live in:

- `src/shared/rpc-schema.ts` - Full `AppRPC` schema definition
- `src/shared/terminal-rpc.ts` - Terminal-specific RPC types
- `src/shared/chat-rpc.ts` - Chat streaming RPC types

## Setting up the RPC client

Use `Electroview.defineRPC<AppRPC>()` to create a fully-typed RPC instance:

```ts
// src/mainview/rpc.ts
import { Electroview } from "electrobun/view";
import type { AppRPC } from "../shared/rpc-schema";

export const rpc = Electroview.defineRPC<AppRPC>({
  maxRequestTime: 10000,
  handlers: {
    requests: {
      // Handle requests FROM bun TO webview (if any)
    },
    messages: {
      // Handle messages pushed FROM bun TO webview
      data: (payload) => {
        // Terminal data: { id: string; data: string }
        console.log(`[term ${payload.id}] data:`, payload.data);
      },
      exit: (payload) => {
        // Terminal exit: { id: string; exitCode: number }
        console.log(`[term ${payload.id}] exited with code`, payload.exitCode);
      },
      titleChanged: (payload) => {
        // Terminal title change: { id: string; title: string }
        console.log(`[term ${payload.id}] title:`, payload.title);
      },
      cursorMoved: (payload) => {
        // Terminal cursor: { id: string; row: number; col: number }
      },
      bell: (payload) => {
        // Terminal bell: { id: string }
      },
      log: (payload) => {
        // Log message: { level: "info" | "error"; message: string }
        console.log(`[${payload.level}]`, payload.message);
      },
      gitStatusChanged: (payload) => {
        // Git watcher: { worktreePath: string; changes: Array<...> }
      },
      // Chat streaming messages
      streamStart: (payload) => {},
      streamChunk: (payload) => {},
      streamEnd: (payload) => {},
      streamError: (payload) => {},
      toolApprovalRequired: (payload) => {},
    },
  },
});
```

## Making requests (webview → bun)

All request methods are fully typed via `rpc.request.<method>()`:

```ts
import { rpc } from "./rpc";

// Ping
const pong = await rpc.request.ping({ label: "ui" });
// => { ok: true, reply: string }

// Terminal: create a PTY
await rpc.request.create({
  id: "term-1",
  cols: 120,
  rows: 30,
});

// Terminal: write input
await rpc.request.write({ id: "term-1", data: "ls\n" });

// Terminal: resize
await rpc.request.resize({ id: "term-1", cols: 80, rows: 24 });

// Terminal: query ghostty-vt state
const screen = await rpc.request.getScreenContent({ id: "term-1" });
const matches = await rpc.request.searchScrollback({
  id: "term-1",
  query: "src",
});
const current = await rpc.request.getCurrentCommand({ id: "term-1" });

// Window controls
await rpc.request.windowMinimize({});
await rpc.request.windowMaximize({});
await rpc.request.windowClose({});
const { isMaximized } = await rpc.request.windowIsMaximized({});
const { isFullscreen } = await rpc.request.windowIsFullscreen({});

// System helpers
await rpc.request.openExternal({ url: "https://example.com" });
await rpc.request.openInFinder({ path: "/Users/me/project" });
const { paths } = await rpc.request.openFileDialog({ directory: true });

// Files
const content = await rpc.request.filesRead({ filePath: "/path/to/file.ts" });
const results = await rpc.request.filesSearch({
  projectPath: "/path/to/project",
  query: "component",
  limit: 50,
});

// Projects
const projects = await rpc.request.projectsList({});
const project = await rpc.request.projectsCreate({ path: "/path/to/new" });

// Chats
const chats = await rpc.request.chatsList({ projectId: "..." });
const chat = await rpc.request.chatsCreate({
  projectId: "...",
  name: "New Chat",
  mode: "agent",
});

// Chat streaming
await rpc.request.startStream({
  subChatId: "...",
  userMessage: "Hello!",
});
await rpc.request.cancelStream({ subChatId: "..." });
```

## Request surface reference

### Terminal (`TerminalRequests`)

| Method | Params | Response |
|--------|--------|----------|
| `create` | `{ id, cols, rows, cwd?, shell?, env? }` | `{ success, pid? }` |
| `write` | `{ id, data }` | `void` |
| `resize` | `{ id, cols, rows }` | `void` |
| `destroy` | `{ id }` | `void` |
| `getDefaultShell` | `{}` | `string` |
| `clipboardWrite` | `{ text }` | `void` |
| `clipboardRead` | `{}` | `string` |
| `getScreenContent` | `{ id }` | `{ lines, cursorRow, cursorCol }` |
| `searchScrollback` | `{ id, query }` | `{ matches: Array<{row, col, length}> }` |
| `getCurrentCommand` | `{ id }` | `{ command, cursorPosition }` |

### Window / System

| Method | Params | Response |
|--------|--------|----------|
| `ping` | `{ label }` | `{ ok, reply }` |
| `openExternal` | `{ url }` | `void` |
| `openInFinder` | `{ path }` | `{ success }` |
| `openFileInEditor` | `{ path, cwd? }` | `{ success, editor }` |
| `openFileDialog` | `{ directory?, multiple? }` | `{ paths }` |
| `windowMinimize` | `{}` | `void` |
| `windowMaximize` | `{}` | `void` |
| `windowClose` | `{}` | `void` |
| `windowIsMaximized` | `{}` | `{ isMaximized }` |
| `windowToggleFullscreen` | `{}` | `void` |
| `windowIsFullscreen` | `{}` | `{ isFullscreen }` |

### Files

| Method | Params | Response |
|--------|--------|----------|
| `filesSearch` | `{ projectPath, query?, limit? }` | `FileEntryResult[]` |
| `filesClearCache` | `{ projectPath }` | `{ success }` |
| `filesRead` | `{ filePath }` | `string` |
| `filesWritePastedText` | `{ subChatId, text, filename? }` | `{ filePath, filename, size }` |

### Projects / Chats

See `rpc-schema.ts` for the full typed surface (~70+ methods covering projects,
chats, subchats, git changes, GitHub status, Ollama, agents, skills, voice, etc.)

## Adding new RPC methods

1. Add the method signature to `src/shared/rpc-schema.ts` under `AppRPC.bun.requests`
2. Implement the handler in `src/bun/index.ts` (or a dedicated handler file)
3. The frontend gets types automatically via `Electroview.defineRPC<AppRPC>()`
