# Elysia Adapter for Electrobun

This adapter provides end-to-end type safety between your Bun process and webview using Elysia's TypeBox schema validation.

## Features

- **End-to-End Type Safety**: Full TypeScript inference from server procedures to client calls
- **TypeBox Validation**: Runtime validation with automatic type inference
- **RPC-Style API**: Familiar procedure-based pattern that matches Electrobun's design
- **Fire-and-Forget Messages**: Bidirectional message passing support

## Installation

```bash
bun add elysia
```

## Quick Start

### 1. Define Procedures (Bun Side)

```typescript
// src/bun/index.ts
import { BrowserWindow } from "electrobun/bun";
import { ElysiaElectrobun, t } from "electrobun/elysia";

const app = new ElysiaElectrobun()
  .procedure("getUsers", {
    input: t.Object({}),
    handler: async () => {
      return { users: [{ id: 1, name: "Alice" }] };
    },
  })
  .procedure("getUser", {
    input: t.Object({ id: t.Number() }),
    handler: async ({ id }) => {
      return { user: { id, name: "Alice" } };
    },
  })
  .procedure("createUser", {
    input: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
    }),
    handler: async ({ name, email }) => {
      // Create user in database...
      return { success: true, user: { id: 1, name, email } };
    },
  })
  .onMessage("analytics", (payload, webviewId) => {
    console.log(`[Analytics] webview=${webviewId}`, payload);
  });

// Export the type for the webview to use
export type App = typeof app;

// Create window with the RPC
const window = new BrowserWindow({
  url: "views://app",
  rpc: app.toRPC(),
});
```

### 2. Use the Type-Safe Client (Webview Side)

```tsx
// src/mainview/App.tsx
import Electrobun, { Electroview } from "electrobun/view";
import { edenElectrobun, sendMessage, onMessage } from "electrobun/elysia/client";
import type { App } from "../bun/index";

// Set up the RPC
const rpc = Electroview.defineRPC<any>({
  handlers: { requests: {}, messages: {} },
});
const electroview = new Electrobun.Electroview({ rpc });

// Create the type-safe client
const api = edenElectrobun<App>(electroview);

// Now you have full type safety!
async function loadData() {
  // Hover over these in your IDE - types are inferred!
  const { users } = await api.getUsers({});
  const { user } = await api.getUser({ id: 1 });
  const result = await api.createUser({
    name: "Bob",
    email: "bob@example.com"
  });

  // Send analytics event
  sendMessage("analytics", { event: "page_load" });
}

// Subscribe to messages from Bun
onMessage<{ level: string; message: string }>("log", (payload) => {
  console.log(`[${payload.level}] ${payload.message}`);
});
```

## API Reference

### Server Side (`electrobun/elysia`)

#### `ElysiaElectrobun`

```typescript
const app = new ElysiaElectrobun({
  maxRequestTime: 60000, // Request timeout in ms (default: 60000)
});
```

#### `.procedure(name, definition)`

Define a typed procedure (RPC method).

```typescript
app.procedure("methodName", {
  input: t.Object({ ... }),  // TypeBox schema for input
  handler: async (params, ctx) => {
    // params is typed based on input schema
    // ctx.webviewId is the calling webview's ID
    return { ... };  // Return type is inferred
  },
});
```

#### `.onMessage(name, handler)`

Register a message handler for fire-and-forget messages.

```typescript
app.onMessage("eventName", (payload, webviewId) => {
  console.log(payload);
});
```

#### `.toRPC()`

Convert the app to an Electrobun RPC handler.

```typescript
const window = new BrowserWindow({
  url: "views://app",
  rpc: app.toRPC(),
});
```

### Client Side (`electrobun/elysia/client`)

#### `edenElectrobun<App>(electroview, options?)`

Create a type-safe client.

```typescript
const api = edenElectrobun<App>(electroview, {
  timeout: 60000, // Request timeout in ms
});

// Call procedures
const result = await api.procedureName(params);
```

#### `sendMessage(name, payload)`

Send a fire-and-forget message to Bun.

```typescript
sendMessage("analytics", { event: "click" });
```

#### `onMessage<T>(name, handler)`

Subscribe to messages from Bun.

```typescript
const unsubscribe = onMessage<{ level: string }>("log", (payload) => {
  console.log(payload.level);
});

// Later: unsubscribe();
```

## TypeBox Schema Examples

```typescript
import { t } from "electrobun/elysia";

// Basic types
t.String()
t.Number()
t.Boolean()
t.Null()

// Objects
t.Object({
  name: t.String(),
  age: t.Number(),
  email: t.Optional(t.String()),
})

// Arrays
t.Array(t.String())
t.Array(t.Object({ id: t.Number() }))

// Unions
t.Union([
  t.Object({ ok: t.Literal(true), data: t.String() }),
  t.Object({ ok: t.Literal(false), error: t.String() }),
])

// With validation
t.String({ minLength: 1, maxLength: 100 })
t.Number({ minimum: 0, maximum: 100 })
t.String({ format: "email" })
```

## Comparison with Default Electrobun RPC

| Feature | Default `BrowserView.defineRPC` | `ElysiaElectrobun` |
|---------|--------------------------------|-------------------|
| Type Safety | Manual `RPCSchema` definition | Automatic inference |
| Runtime Validation | Manual | TypeBox built-in |
| API Style | `rpc.request.methodName(params)` | `api.methodName(params)` |
| Schema Definition | Separate type definition | Inline with handlers |

### When to Use Each

**Use `ElysiaElectrobun` when:**
- Starting a new project
- You want TypeBox validation
- You prefer co-located types and handlers
- You want simpler client-side code

**Use default `BrowserView.defineRPC` when:**
- Existing codebase uses it
- You need maximum control over the RPC schema
- You prefer explicit type definitions

## Migration from Default RPC

If you have an existing app using `BrowserView.defineRPC`, you can migrate gradually:

```typescript
// Before (default RPC)
type MyRPC = {
  bun: RPCSchema<{
    requests: {
      getUsers: {
        params: {};
        response: { users: User[] };
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{ requests: {}; messages: {} }>;
};

const rpc = BrowserView.defineRPC<MyRPC>({
  handlers: {
    requests: {
      getUsers: async () => ({ users: [...] }),
    },
  },
});

// After (Elysia adapter)
const app = new ElysiaElectrobun()
  .procedure("getUsers", {
    input: t.Object({}),
    handler: async () => ({ users: [...] }),
  });

export type App = typeof app;
```

## License

MIT - Same as Electrobun
