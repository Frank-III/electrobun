/**
 * Elysia Adapter for Electrobun - Client Exports
 *
 * Import this in your webview code for type-safe RPC calls.
 *
 * @example
 * ```tsx
 * import { createEdenClient, onMessage, sendMessage } from "electrobun/elysia/client";
 *
 * // Create type-safe client
 * const rpc = createEdenClient<{
 *   procedures: {
 *     getUsers: { input: {}; output: { users: User[] } };
 *   };
 * }>();
 *
 * // Type-safe procedure calls
 * const result = await rpc.getUsers({});
 *
 * // Subscribe to messages
 * onMessage("notification", (payload) => console.log(payload));
 * ```
 *
 * @module
 */

export {
  createEdenClient,
  onMessage,
  sendMessage,
  isConnected,
  waitForConnection,
  type EdenClient,
} from "../../browser/eden";
