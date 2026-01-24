/**
 * Elysia Adapter for Electrobun - Client Exports
 *
 * Import this in your webview code for type-safe RPC calls.
 *
 * @example
 * ```tsx
 * import { edenElectrobun, onMessage, sendMessage } from "electrobun/elysia/client";
 * import type { App } from "../bun";
 *
 * const api = edenElectrobun<App>(electroview);
 *
 * // Type-safe procedure calls
 * const result = await api.getUsers({});
 * ```
 *
 * @module
 */

export {
  edenElectrobun,
  onMessage,
  sendMessage,
  type EdenRPCClient,
  type MessageClient,
} from "./client";

export type { EdenClientOptions } from "./types";
