/**
 * Electrobun Elysia Plugin
 *
 * Provides internal routes and WebSocket for Electrobun's system operations.
 * Users extend with their own Elysia routes and use Eden Treaty for type-safe clients.
 *
 * @example
 * ```ts
 * import { Elysia } from "elysia";
 * import { electrobun } from "electrobun/bun";
 *
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => [{ id: 1, name: "Alice" }])
 *   .post("/users", ({ body }) => ({ id: 1, ...body }))
 *   .listen(0);
 *
 * export type App = typeof app;
 * ```
 *
 * ```tsx
 * // Browser - use Eden Treaty directly
 * import { treaty } from "@elysiajs/eden";
 * import type { App } from "../bun";
 *
 * const api = treaty<App>(`localhost:${port}`);
 * const { data } = await api.users.get();
 * ```
 */

import { Elysia, t } from "elysia";
import { BrowserView } from "./BrowserView";

// Re-export Elysia and t for convenience
export { Elysia, t };

// ============================================================================
// Electrobun Elysia Plugin
// ============================================================================

/**
 * Electrobun Elysia plugin.
 *
 * Adds internal system routes for debugging/monitoring.
 * The internal WebSocket RPC is handled separately by Socket.ts.
 *
 * @example
 * ```ts
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/your-routes", () => ...)
 * ```
 */
export function electrobun() {
  return new Elysia({ name: "electrobun" })
    // Internal system routes
    .group("/_electrobun", (app) =>
      app
        .get("/health", () => ({ status: "ok" }))
        .get("/info", () => ({
          webviews: BrowserView.getAll().map((v) => ({
            id: v.id,
            url: v.url,
          })),
        }))
    );
}

// ============================================================================
// Server Utilities
// ============================================================================

/**
 * Start an Elysia server on an available port.
 *
 * @example
 * ```ts
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => [...]);
 *
 * const port = startServer(app);
 * ```
 */
export function startServer(app: Elysia<any, any, any, any, any, any, any, any>): number {
  const startPort = 50000;
  const endPort = 65535;

  for (let port = startPort; port <= endPort; port++) {
    try {
      app.listen(port);
      console.log(`[Electrobun] Elysia server started on port ${port}`);
      return port;
    } catch (error: any) {
      if (error.code === "EADDRINUSE") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No available ports for Electrobun server");
}

// Re-export rpcPort from Socket.ts for backward compatibility
export { rpcPort } from "./Socket";
