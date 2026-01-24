/**
 * Eden-style Type-Safe Client for Electrobun
 *
 * Provides end-to-end type safety for calling procedures defined with ElysiaElectrobun.
 * Works over encrypted WebSocket connection.
 */

// ============================================================================
// Types
// ============================================================================

/** RPC Request format */
interface RPCRequest {
  type: "request";
  id: string;
  method: string;
  params: unknown;
}

/** RPC Response format */
interface RPCResponse {
  type: "response";
  id: string;
  result?: unknown;
  error?: string;
}

/** RPC Message format */
interface RPCMessage {
  type: "message";
  name: string;
  payload: unknown;
}

type RPCPacket = RPCRequest | RPCResponse | RPCMessage;

// ============================================================================
// Request ID Generation
// ============================================================================

let requestIdCounter = 0;
function generateRequestId(): string {
  return `req_${++requestIdCounter}_${Date.now()}`;
}

// ============================================================================
// Pending Requests
// ============================================================================

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const pendingRequests: Map<string, PendingRequest> = new Map();

// ============================================================================
// Message Handlers
// ============================================================================

const messageHandlers: Map<string, Set<(payload: unknown) => void>> = new Map();

// ============================================================================
// WebSocket Connection
// ============================================================================

let socket: WebSocket | null = null;
let encryptFn: ((msg: string) => Promise<{ encryptedData: string; iv: string; tag: string }>) | null = null;
let decryptFn: ((data: string, iv: string, tag: string) => Promise<string>) | null = null;

/**
 * Initialize the Eden client with the WebSocket connection
 */
export function initEdenClient(config: {
  socket: WebSocket;
  encrypt: (msg: string) => Promise<{ encryptedData: string; iv: string; tag: string }>;
  decrypt: (data: string, iv: string, tag: string) => Promise<string>;
}) {
  socket = config.socket;
  encryptFn = config.encrypt;
  decryptFn = config.decrypt;

  // Set up message handler
  socket.addEventListener("message", async (event) => {
    if (typeof event.data !== "string") return;

    try {
      const encryptedPacket = JSON.parse(event.data);
      const decrypted = await decryptFn!(
        encryptedPacket.encryptedData,
        encryptedPacket.iv,
        encryptedPacket.tag
      );

      const packet: RPCPacket = JSON.parse(decrypted);
      handleIncomingPacket(packet);
    } catch (error) {
      console.error("[Eden] Error handling message:", error);
    }
  });
}

/**
 * Handle incoming RPC packets
 */
function handleIncomingPacket(packet: RPCPacket) {
  if (packet.type === "response") {
    const pending = pendingRequests.get(packet.id);
    if (pending) {
      clearTimeout(pending.timeout);
      pendingRequests.delete(packet.id);

      if (packet.error) {
        pending.reject(new Error(packet.error));
      } else {
        pending.resolve(packet.result);
      }
    }
  } else if (packet.type === "message") {
    // Call specific handler
    const handlers = messageHandlers.get(packet.name);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(packet.payload);
        } catch (error) {
          console.error(`[Eden] Message handler error for "${packet.name}":`, error);
        }
      }
    }

    // Call wildcard handler
    const wildcardHandlers = messageHandlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          handler({ name: packet.name, payload: packet.payload });
        } catch (error) {
          console.error("[Eden] Wildcard handler error:", error);
        }
      }
    }
  }
}

/**
 * Send an encrypted packet
 */
async function sendPacket(packet: RPCPacket): Promise<void> {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket not connected");
  }

  if (!encryptFn) {
    throw new Error("Encryption not initialized");
  }

  const encrypted = await encryptFn(JSON.stringify(packet));
  socket.send(JSON.stringify(encrypted));
}

/**
 * Call a procedure on the Bun side
 */
async function callProcedure<T>(
  method: string,
  params: unknown,
  timeout: number = 60000
): Promise<T> {
  const id = generateRequestId();

  const request: RPCRequest = {
    type: "request",
    id,
    method,
    params,
  };

  return new Promise<T>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request timeout: ${method}`));
    }, timeout);

    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timeout: timeoutHandle,
    });

    sendPacket(request).catch((error) => {
      clearTimeout(timeoutHandle);
      pendingRequests.delete(id);
      reject(error);
    });
  });
}

// ============================================================================
// Eden Client API
// ============================================================================

/**
 * Create a type-safe Eden client for calling Electrobun procedures.
 *
 * @example
 * ```tsx
 * import { createEdenClient, onMessage, sendMessage } from "electrobun/view";
 * import type { App } from "../bun";
 *
 * const api = createEdenClient<App>();
 *
 * // Type-safe procedure calls!
 * const { users } = await api.getUsers({});
 * const { user } = await api.createUser({ name: "Alice" });
 *
 * // Subscribe to messages
 * onMessage<{ level: string }>("log", (payload) => {
 *   console.log(payload.level);
 * });
 * ```
 */
export function createEdenClient<
  App extends { procedures: Record<string, { input: unknown; output: unknown }> }
>(options: { timeout?: number } = {}): EdenClient<App["procedures"]> {
  const timeout = options.timeout ?? 60000;

  return new Proxy({} as EdenClient<App["procedures"]>, {
    get(_target, method: string) {
      return async (params: unknown) => {
        return callProcedure(method, params, timeout);
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
  if (!messageHandlers.has(name)) {
    messageHandlers.set(name, new Set());
  }

  const handlers = messageHandlers.get(name)!;
  handlers.add(handler as (payload: unknown) => void);

  // Return unsubscribe function
  return () => {
    handlers.delete(handler as (payload: unknown) => void);
    if (handlers.size === 0) {
      messageHandlers.delete(name);
    }
  };
}

/**
 * Send a fire-and-forget message to the Bun process
 */
export function sendMessage(name: string, payload: unknown): void {
  const message: RPCMessage = {
    type: "message",
    name,
    payload,
  };

  sendPacket(message).catch((error) => {
    console.error(`[Eden] Failed to send message "${name}":`, error);
  });
}

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Type-safe client generated from ElysiaElectrobun procedures
 */
export type EdenClient<Procedures extends Record<string, { input: unknown; output: unknown }>> = {
  [K in keyof Procedures]: (
    params: Procedures[K]["input"]
  ) => Promise<Procedures[K]["output"]>;
};

/**
 * Type helper to extract App type for Eden client
 */
export type InferApp<T> = T extends { procedures: infer P; messages: infer M }
  ? { procedures: P; messages: M }
  : never;
