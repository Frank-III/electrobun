# Elysia Integration for Electrobun

This integration provides a seamless way to use [Elysia](https://elysiajs.com) with Electrobun for type-safe communication between your Bun process and webview.

## Features

- **Elysia Plugin**: Use standard Elysia patterns with `.get()`, `.post()`, `.ws()` etc.
- **Encrypted WebSocket**: Secure RPC over encrypted WebSocket
- **Type-Safe Client**: Eden-style client for webview-side calls
- **Message Passing**: Bidirectional message support

## Installation

```bash
bun add elysia
```

## Quick Start

### 1. Create Server with Elysia Plugin (Bun Side)

```typescript
// src/bun/index.ts
import { Elysia } from "elysia";
import { electrobun, registerProcedure, broadcastMessage } from "electrobun/elysia";
import { BrowserWindow } from "electrobun/bun";

// Create Elysia app with electrobun plugin
const app = new Elysia()
  .use(electrobun())
  // Add your own routes - these work with Eden Treaty!
  .get("/users", () => [{ id: 1, name: "Alice" }])
  .post("/users", ({ body }) => ({ success: true, id: 1 }))
  .get("/users/:id", ({ params }) => ({ id: params.id, name: "Alice" }));

// For encrypted WebSocket RPC, register procedures
registerProcedure("getData", async (params, ctx) => {
  console.log(`Request from webview ${ctx.webviewId}`);
  return { data: "Hello from Bun!" };
});

// Create your window
const window = new BrowserWindow({
  url: "views://app",
});

// Send messages to webviews
broadcastMessage("notification", { message: "Hello!" });

export type App = typeof app;
```

### 2. Use Type-Safe Client (Webview Side)

```tsx
// src/mainview/App.tsx
import { createEdenClient, onMessage, sendMessage } from "electrobun/elysia/client";

// Create RPC client for encrypted WebSocket procedures
const rpc = createEdenClient<{
  procedures: {
    getData: { input: {}; output: { data: string } };
  };
}>();

// Call procedures - fully type-safe!
async function fetchData() {
  const result = await rpc.getData({});
  console.log(result.data); // "Hello from Bun!"
}

// Subscribe to messages from Bun
onMessage<{ message: string }>("notification", (payload) => {
  console.log("Got notification:", payload.message);
});

// Send messages to Bun
sendMessage("analytics", { event: "page_load" });
```

## API Reference

### Server Side (`electrobun/elysia`)

#### `electrobun()`

Elysia plugin that adds internal Electrobun routes.

```typescript
import { Elysia } from "elysia";
import { electrobun } from "electrobun/elysia";

const app = new Elysia()
  .use(electrobun())
  .get("/your-route", () => ({ ... }));
```

#### `registerProcedure(name, handler)`

Register an RPC procedure for encrypted WebSocket calls.

```typescript
import { registerProcedure } from "electrobun/elysia";

registerProcedure("methodName", async (params, ctx) => {
  // ctx.webviewId - the calling webview's ID
  return { result: "..." };
});
```

#### `registerMessageHandler(name, handler)`

Handle fire-and-forget messages from webviews.

```typescript
import { registerMessageHandler } from "electrobun/elysia";

registerMessageHandler("analytics", (payload, webviewId) => {
  console.log(`Event from webview ${webviewId}:`, payload);
});
```

#### `sendMessage(webviewId, name, payload)`

Send a message to a specific webview.

```typescript
import { sendMessage } from "electrobun/elysia";

sendMessage(webviewId, "notification", { text: "Hello!" });
```

#### `broadcastMessage(name, payload)`

Send a message to all connected webviews.

```typescript
import { broadcastMessage } from "electrobun/elysia";

broadcastMessage("update", { version: "1.0.1" });
```

### Client Side (`electrobun/elysia/client`)

#### `createEdenClient<App>(options?)`

Create a type-safe RPC client for encrypted WebSocket procedures.

```typescript
import { createEdenClient } from "electrobun/elysia/client";

const rpc = createEdenClient<{
  procedures: {
    getData: { input: { id: number }; output: { data: string } };
  };
}>({ timeout: 60000 });

const result = await rpc.getData({ id: 1 });
```

#### `onMessage<T>(name, handler)`

Subscribe to messages from Bun.

```typescript
import { onMessage } from "electrobun/elysia/client";

const unsubscribe = onMessage<{ count: number }>("update", (payload) => {
  console.log("Count:", payload.count);
});

// Later: stop listening
unsubscribe();
```

#### `sendMessage(name, payload)`

Send a fire-and-forget message to Bun.

```typescript
import { sendMessage } from "electrobun/elysia/client";

sendMessage("log", { level: "info", message: "User clicked button" });
```

#### `isConnected()`

Check if the WebSocket connection is open.

```typescript
import { isConnected } from "electrobun/elysia/client";

if (isConnected()) {
  // Safe to send messages
}
```

#### `waitForConnection(timeout?)`

Wait for the WebSocket connection to be ready.

```typescript
import { waitForConnection } from "electrobun/elysia/client";

await waitForConnection(5000);
// Connection is now ready
```

## Using with Eden Treaty

For HTTP-style routes, you can use Elysia's Eden Treaty directly:

```typescript
// Server
const app = new Elysia()
  .use(electrobun())
  .get("/api/users", () => [{ id: 1, name: "Alice" }])
  .post("/api/users", ({ body }) => ({ id: 2, ...body }));

export type App = typeof app;
```

```typescript
// Client (if using fetch to localhost)
import { treaty } from "@elysiajs/eden";
import type { App } from "../bun";

const api = treaty<App>("localhost:50000");
const { data } = await api.api.users.get();
```

## Internal Routes

The electrobun plugin adds these internal routes:

- `/_electrobun/health` - Health check endpoint
- `/_electrobun/info` - Get info about connected webviews
- `/socket` - Encrypted WebSocket for RPC

## License

MIT - Same as Electrobun
