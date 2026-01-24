/**
 * Elysia Integration for Electrobun
 *
 * This module provides integration between Elysia and Electrobun,
 * enabling type-safe communication between Bun and webview.
 *
 * ## Quick Example
 *
 * ```ts
 * // === Bun side ===
 * import { Elysia } from "elysia";
 * import { electrobun, registerProcedure } from "electrobun/elysia";
 *
 * // Create your Elysia app with electrobun plugin
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => [{ id: 1, name: "Alice" }])
 *   .post("/users", ({ body }) => ({ success: true, id: 1 }));
 *
 * export type App = typeof app;
 *
 * // For RPC-style procedures over encrypted WebSocket
 * registerProcedure("getUser", async (params, ctx) => {
 *   return { id: params.id, name: "Alice" };
 * });
 * ```
 *
 * ```tsx
 * // === Webview side ===
 * import { createEdenClient, onMessage } from "electrobun/elysia/client";
 *
 * // For RPC procedures
 * const rpc = createEdenClient<{
 *   procedures: {
 *     getUser: { input: { id: number }; output: { id: number; name: string } };
 *   };
 * }>();
 *
 * const user = await rpc.getUser({ id: 1 });
 *
 * // Subscribe to messages from Bun
 * onMessage("notification", (payload) => {
 *   console.log("Got notification:", payload);
 * });
 * ```
 *
 * @module
 */

// Re-export from core
export {
  electrobun,
  Elysia,
  t,
  registerProcedure,
  registerMessageHandler,
  sendMessage,
  broadcastMessage,
  startServer,
  getServerPort,
  type InferProcedures,
} from "../../bun/core/ElysiaRPC";
