# Elysia + Solid Minimal Example

A minimal Electrobun app demonstrating type-safe API calls using Elysia and Eden Treaty with SolidJS.

## Features

- **Elysia** - Fast, type-safe HTTP framework
- **Eden Treaty** - End-to-end type inference from server to client
- **SolidJS** - Reactive UI framework
- **No Vite** - Direct Bun.build() with Babel for Solid JSX

## Project Structure

```
elysia-solid-minimal/
├── src/
│   ├── bun/
│   │   └── index.ts       # Elysia server + Electrobun window
│   └── mainview/
│       ├── main.tsx       # Solid app with Eden client
│       └── index.html     # Entry HTML
├── scripts/
│   ├── build-ui.ts        # UI build script
│   └── solid-plugin.ts    # Bun plugin for Solid JSX
├── electrobun.config.ts
├── package.json
└── tsconfig.json
```

## How It Works

### 1. Server (Bun side)

```typescript
import { Elysia } from "elysia";
import { BrowserWindow, electrobunPlugin, startServer } from "electrobun/bun";

const app = new Elysia()
  .use(electrobunPlugin())
  .get("/api/users", () => [...])
  .post("/api/users", ({ body }) => ({ ... }));

const port = startServer(app);
export type App = typeof app;  // Export for Eden
```

### 2. Client (Browser side)

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "../bun";

const api = treaty<App>(`localhost:${port}`);

// Fully type-safe!
const { data } = await api.api.users.get();
const { data: newUser } = await api.api.users.post({ name: "Alice", email: "..." });
```

## Getting Started

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev
```

## Type Safety

Eden Treaty provides full end-to-end type inference:

- Route paths are type-checked
- Request bodies are validated
- Response types are inferred
- No code generation needed

All types flow from your Elysia route definitions to the client automatically.
