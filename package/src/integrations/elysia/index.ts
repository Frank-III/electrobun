/**
 * Elysia Adapter for Electrobun
 *
 * This module provides integration between Elysia's type system and Electrobun,
 * enabling end-to-end type safety for RPC communication between Bun and webview.
 *
 * ## Quick Example
 *
 * ```ts
 * // === Bun side ===
 * import { ElysiaElectrobun, t } from "electrobun/elysia";
 *
 * const app = new ElysiaElectrobun()
 *   .procedure("getUsers", {
 *     input: t.Object({}),
 *     handler: async () => ({ users: [{ id: 1, name: "Alice" }] }),
 *   })
 *   .procedure("createUser", {
 *     input: t.Object({ name: t.String(), email: t.String() }),
 *     handler: async ({ name, email }) => ({ success: true, id: 1 }),
 *   });
 *
 * export type App = typeof app;
 *
 * const window = new BrowserWindow({
 *   url: "views://app",
 *   rpc: app.toRPC(),
 * });
 * ```
 *
 * ```tsx
 * // === Webview side ===
 * import { edenElectrobun } from "electrobun/elysia/client";
 * import type { App } from "../bun";
 *
 * const api = edenElectrobun<App>(electroview);
 *
 * // Full type safety!
 * const { users } = await api.getUsers({});
 * const { success, id } = await api.createUser({ name: "Bob", email: "bob@example.com" });
 * ```
 *
 * @module
 */

// Server-side exports (Bun process)
export { ElysiaElectrobun, t, type InferApp, type InferProcedureInput, type InferProcedureOutput } from "./server";

// Re-export types
export type {
  ElectrobunAdapterConfig,
  EdenClientOptions,
  RPCRequest,
  RPCResponse,
  RPCMessage,
  RPCPacket,
} from "./types";
