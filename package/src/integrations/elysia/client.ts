/**
 * Elysia Adapter for Electrobun - Client Side (Webview)
 *
 * Provides a type-safe RPC client for calling procedures defined with ElysiaElectrobun.
 */

import type {
  RPCRequest,
  RPCResponse,
  RPCMessage,
  RPCPacket,
  EdenClientOptions,
} from "./types";
import type { ElysiaElectrobun, InferApp } from "./server";

// Generate unique request IDs
let requestIdCounter = 0;
const generateRequestId = () => `req_${++requestIdCounter}_${Date.now()}`;

// Pending request storage
const pendingRequests = new Map<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }
>();

// Global RPC send function
let globalRpcSend: ((packet: RPCPacket) => void) | null = null;
let globalMessageHandlers = new Map<string, Set<(payload: unknown) => void>>();

/**
 * Handle incoming RPC packets from the Bun process
 */
function handleIncomingPacket(packet: RPCPacket) {
  if (packet.type === "response") {
    const pending = pendingRequests.get(packet.id);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingRequests.delete(packet.id);

      if (packet.success) {
        pending.resolve(packet.data);
      } else {
        pending.reject(new Error(packet.error || "Unknown error"));
      }
    }
  } else if (packet.type === "message") {
    const handlers = globalMessageHandlers.get(packet.name);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(packet.payload);
        } catch (err) {
          console.error(`[edenElectrobun] Message handler error:`, err);
        }
      }
    }
  }
}

/**
 * Make an RPC request to the Bun process
 */
async function callProcedure<T>(
  procedureName: string,
  params: unknown,
  timeout: number
): Promise<T> {
  if (!globalRpcSend) {
    throw new Error("Eden client not initialized. Call edenElectrobun() first.");
  }

  const requestId = generateRequestId();

  const request: RPCRequest = {
    id: requestId,
    type: "request",
    path: procedureName,
    method: "POST",
    body: params,
  };

  return new Promise<T>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Request timeout: ${procedureName}`));
    }, timeout);

    pendingRequests.set(requestId, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timeout: timeoutHandle,
    });

    globalRpcSend!(request);
  });
}

/**
 * Create a type-safe RPC client for calling Elysia procedures.
 *
 * @example
 * ```tsx
 * import { edenElectrobun, onMessage, sendMessage } from "electrobun/elysia/client";
 * import type { App } from "../bun/index";
 *
 * const electroview = new Electrobun.Electroview({ rpc });
 * const api = edenElectrobun<App>(electroview);
 *
 * // Type-safe procedure calls!
 * const { users } = await api.getUsers({});
 * const { user } = await api.createUser({ name: "Alice", email: "alice@example.com" });
 * ```
 */
export function edenElectrobun<App extends ElysiaElectrobun<any, any>>(
  electroview: {
    rpc?: {
      setTransport?: (transport: {
        send: (msg: unknown) => void;
        registerHandler: (handler: (msg: unknown) => void) => void;
      }) => void;
    };
  },
  options: EdenClientOptions = {}
): EdenRPCClient<App> {
  const timeout = options.timeout ?? 60000;

  // Hook into the electroview's transport
  const originalRpc = electroview.rpc;

  if (originalRpc?.setTransport) {
    const originalSetTransport = originalRpc.setTransport.bind(originalRpc);

    originalRpc.setTransport = (transport) => {
      globalRpcSend = transport.send as (packet: RPCPacket) => void;

      const wrappedTransport = {
        send: transport.send,
        registerHandler: (handler: (msg: unknown) => void) => {
          transport.registerHandler((msg: unknown) => {
            const packet = msg as RPCPacket;
            if (packet && typeof packet === "object" && "type" in packet) {
              if (packet.type === "response" || packet.type === "message") {
                handleIncomingPacket(packet);
              }
            }
            handler(msg);
          });
        },
      };

      originalSetTransport(wrappedTransport);
    };
  }

  // Create the proxy-based client
  return createRPCProxy<App>(timeout);
}

/**
 * Create a proxy that transforms property access into RPC calls
 */
function createRPCProxy<App extends ElysiaElectrobun<any, any>>(
  timeout: number
): EdenRPCClient<App> {
  return new Proxy({} as EdenRPCClient<App>, {
    get(_target, procedureName: string) {
      return async (params: unknown) => {
        return callProcedure(procedureName, params, timeout);
      };
    },
  });
}

/**
 * Subscribe to messages from the Bun process
 */
export function onMessage<T = unknown>(
  name: string,
  handler: (payload: T) => void
): () => void {
  if (!globalMessageHandlers.has(name)) {
    globalMessageHandlers.set(name, new Set());
  }
  const handlers = globalMessageHandlers.get(name)!;
  handlers.add(handler as (payload: unknown) => void);

  return () => {
    handlers.delete(handler as (payload: unknown) => void);
    if (handlers.size === 0) {
      globalMessageHandlers.delete(name);
    }
  };
}

/**
 * Send a fire-and-forget message to the Bun process
 */
export function sendMessage(name: string, payload: unknown): void {
  if (!globalRpcSend) {
    console.warn("[edenElectrobun] Client not initialized, message dropped:", name);
    return;
  }

  const message: RPCMessage = {
    type: "message",
    name,
    payload,
  };

  globalRpcSend(message);
}

/**
 * Type-safe RPC client generated from ElysiaElectrobun app
 */
export type EdenRPCClient<App extends ElysiaElectrobun<any, any>> =
  InferApp<App> extends { procedures: infer P }
    ? {
        [K in keyof P]: P[K] extends { params: infer Params; response: infer Response }
          ? (params: Params) => Promise<Response>
          : never;
      }
    : never;

/**
 * Type-safe message client for sending messages to Bun
 */
export type MessageClient<App extends ElysiaElectrobun<any, any>> =
  InferApp<App> extends { messages: infer M }
    ? {
        [K in keyof M]: (payload: M[K]) => void;
      }
    : never;
