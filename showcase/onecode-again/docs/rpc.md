# Electrobun RPC Usage (Frontend)

This project uses Electrobun's typed RPC to communicate between the webview
and the Bun main process. The shared types live in:

- `showcase/onecode-again/src/shared/rpc-schema.ts`
- `showcase/onecode-again/src/shared/terminal-rpc.ts`

## Webview side quickstart

```ts
import type { AppRPC } from "../shared/rpc-schema";

declare global {
  interface Window {
    rpc: AppRPC["webview"];
  }
}

const rpc = window.rpc;

// Requests (webview -> bun)
const pong = await rpc.request.ping({ label: "ui" });

// Terminal: create a PTY
const term = await rpc.request.create({
  id: "term-1",
  cols: 120,
  rows: 30,
});

// Terminal: write input
await rpc.request.write({ id: "term-1", data: "ls\n" });

// Terminal: query ghostty-vt state
const screen = await rpc.request.getScreenContent({ id: "term-1" });
const matches = await rpc.request.searchScrollback({
  id: "term-1",
  query: "src",
});
const current = await rpc.request.getCurrentCommand({ id: "term-1" });

// Window / system helpers
await rpc.request.windowMinimize({});
await rpc.request.openExternal({ url: "https://example.com" });
```

## Webview listeners (bun -> webview)

Messages are pushed from the Bun process and can be wired to your renderer
terminal UI (xterm.js, canvas, or another renderer). The terminal messages are
defined in `TerminalMessages`.

```ts
import type { AppRPC } from "../shared/rpc-schema";

declare global {
  interface Window {
    rpc: AppRPC["webview"];
  }
}

const rpc = window.rpc;

rpc.on?.data?.((payload: { id: string; data: string }) => {
  // Feed terminal renderer with raw data
});

rpc.on?.exit?.((payload: { id: string; exitCode: number }) => {
  // Mark tab closed
});

rpc.on?.titleChanged?.((payload: { id: string; title: string }) => {
  // Update tab title
});
```

## Request surface

The Bun side exposes these request handlers (see `AppRPC` and
`TerminalRequests`):

- App: `ping`, `openExternal`, `openFileDialog`, `windowMinimize`,
  `windowMaximize`, `windowClose`, `windowIsMaximized`,
  `windowToggleFullscreen`, `windowIsFullscreen`
- Terminal: `create`, `write`, `resize`, `destroy`, `getDefaultShell`,
  `clipboardWrite`, `clipboardRead`, `getScreenContent`, `searchScrollback`,
  `getCurrentCommand`

If you add new RPC methods, update the shared schema files and keep this
doc in sync.
