# Elysia Integration for Electrobun

Use [Elysia](https://elysiajs.com) with Electrobun for type-safe communication between Bun and webview.

## Quick Start

### 1. Bun Side

```typescript
import { Elysia } from "elysia";
import { electrobun, startServer } from "electrobun/elysia";
import { BrowserWindow } from "electrobun/bun";

// Create your Elysia app with the electrobun plugin
const app = new Elysia()
  .use(electrobun())
  .get("/users", () => [{ id: 1, name: "Alice" }])
  .post("/users", ({ body }) => ({ success: true, id: 1 }))
  .get("/users/:id", ({ params }) => ({ id: params.id, name: "Alice" }));

// Start on an available port
const port = startServer(app);

// Export type for Eden Treaty
export type App = typeof app;

// Create window
const window = new BrowserWindow({
  url: "views://app",
});
```

### 2. Browser Side (Eden Treaty)

```tsx
import { treaty } from "@elysiajs/eden";
import type { App } from "../bun";

// Get the port from Electrobun globals
const port = window.__electrobunRpcSocketPort;
const api = treaty<App>(`localhost:${port}`);

// Fully type-safe API calls!
async function loadUsers() {
  const { data: users } = await api.users.get();
  const { data: user } = await api.users({ id: "1" }).get();
  const { data: result } = await api.users.post({ name: "Bob" });
}
```

## API

### `electrobun()`

Elysia plugin that sets up internal Electrobun routes (WebSocket for system communication).

```typescript
const app = new Elysia()
  .use(electrobun())
  .get("/your-routes", () => ...);
```

### `startServer(app)`

Starts the Elysia server on an available port (50000-65535).

```typescript
const port = startServer(app);
```

## Type Safety

Eden Treaty provides full end-to-end type inference:

```typescript
// Server defines the types
.get("/users/:id", ({ params }) => ({
  id: params.id,
  name: "Alice"
}))

// Client gets full type inference
const { data } = await api.users({ id: "1" }).get();
// data is typed as { id: string; name: string }
```

## License

MIT
