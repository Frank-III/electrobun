/**
 * Elysia Integration for Electrobun
 *
 * Use the electrobun() plugin with your Elysia app:
 *
 * ```ts
 * import { Elysia } from "elysia";
 * import { electrobun } from "electrobun/elysia";
 *
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => [{ id: 1, name: "Alice" }])
 *   .post("/users", ({ body }) => ({ success: true }));
 *
 * export type App = typeof app;
 * ```
 *
 * Then in the browser, use Eden Treaty:
 *
 * ```tsx
 * import { treaty } from "@elysiajs/eden";
 * import type { App } from "../bun";
 *
 * const port = window.__electrobunRpcSocketPort;
 * const api = treaty<App>(`localhost:${port}`);
 *
 * const { data } = await api.users.get();
 * ```
 *
 * @module
 */

export {
  electrobun,
  Elysia,
  t,
  startServer,
  getServerPort,
} from "../../bun/core/ElysiaRPC";
