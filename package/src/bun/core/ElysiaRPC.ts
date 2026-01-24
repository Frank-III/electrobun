/**
 * Electrobun Elysia Server
 *
 * Provides a base Elysia app with internal Electrobun routes.
 * Users can extend this with their own routes using standard Elysia patterns.
 */

import { Elysia, t } from "elysia";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { BrowserView } from "./BrowserView";

// Re-export Elysia's t for schema definitions
export { t };

// ============================================================================
// Encryption Layer
// ============================================================================

function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(
    atob(base64)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}

export function encrypt(secretKey: Uint8Array, text: string) {
  const iv = new Uint8Array(randomBytes(12));
  const cipher = createCipheriv("aes-256-gcm", secretKey, iv);
  const encrypted = Buffer.concat([
    new Uint8Array(cipher.update(text, "utf8")),
    new Uint8Array(cipher.final()),
  ]).toString("base64");
  const tag = cipher.getAuthTag().toString("base64");
  return { encrypted, iv: Buffer.from(iv).toString("base64"), tag };
}

export function decrypt(
  secretKey: Uint8Array,
  encryptedData: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array
): string {
  const decipher = createDecipheriv("aes-256-gcm", secretKey, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    new Uint8Array(decipher.update(encryptedData)),
    new Uint8Array(decipher.final()),
  ]);
  return decrypted.toString("utf8");
}

// ============================================================================
// Socket Management
// ============================================================================

export const socketMap: Map<number, WebSocket> = new Map();

// ============================================================================
// Internal Message Types
// ============================================================================

/** RPC Request format (inside encrypted payload) */
export interface RPCRequest {
  type: "request";
  id: string;
  method: string;
  params: unknown;
}

/** RPC Response format */
export interface RPCResponse {
  type: "response";
  id: string;
  result?: unknown;
  error?: string;
}

/** RPC Message format (fire-and-forget) */
export interface RPCMessage {
  type: "message";
  name: string;
  payload: unknown;
}

export type RPCPacket = RPCRequest | RPCResponse | RPCMessage;

// ============================================================================
// Procedure & Message Registry
// ============================================================================

interface ProcedureHandler {
  handler: (params: unknown, ctx: { webviewId: number }) => unknown | Promise<unknown>;
}

const procedures: Map<string, ProcedureHandler> = new Map();
const messageHandlers: Map<string, Set<(payload: unknown, webviewId: number) => void>> = new Map();

/**
 * Register a procedure handler
 */
export function registerProcedure(
  name: string,
  handler: (params: unknown, ctx: { webviewId: number }) => unknown | Promise<unknown>
) {
  procedures.set(name, { handler });
}

/**
 * Register a message handler
 */
export function registerMessageHandler(
  name: string,
  handler: (payload: unknown, webviewId: number) => void
): () => void {
  if (!messageHandlers.has(name)) {
    messageHandlers.set(name, new Set());
  }
  const handlers = messageHandlers.get(name)!;
  handlers.add(handler);

  // Return unsubscribe function
  return () => {
    handlers.delete(handler);
    if (handlers.size === 0) {
      messageHandlers.delete(name);
    }
  };
}

// ============================================================================
// Packet Handling
// ============================================================================

async function handleRequest(
  ws: any,
  browserView: BrowserView<any>,
  request: RPCRequest
) {
  const procedure = procedures.get(request.method);

  let response: RPCResponse;

  if (!procedure) {
    response = {
      type: "response",
      id: request.id,
      error: `Unknown procedure: ${request.method}`,
    };
  } else {
    try {
      const result = await procedure.handler(request.params, {
        webviewId: browserView.id,
      });
      response = {
        type: "response",
        id: request.id,
        result,
      };
    } catch (error) {
      response = {
        type: "response",
        id: request.id,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  sendToWebview(browserView, response);
}

function handleMessage(message: RPCMessage, webviewId: number) {
  // Call specific handlers
  const handlers = messageHandlers.get(message.name);
  if (handlers) {
    for (const handler of handlers) {
      try {
        handler(message.payload, webviewId);
      } catch (error) {
        console.error(`[Electrobun] Message handler error for "${message.name}":`, error);
      }
    }
  }

  // Call wildcard handlers
  const wildcardHandlers = messageHandlers.get("*");
  if (wildcardHandlers) {
    for (const handler of wildcardHandlers) {
      try {
        handler({ name: message.name, payload: message.payload }, webviewId);
      } catch (error) {
        console.error("[Electrobun] Wildcard message handler error:", error);
      }
    }
  }
}

/**
 * Send an encrypted packet to a webview
 */
export function sendToWebview(browserView: BrowserView<any>, packet: RPCPacket): boolean {
  const socket = socketMap.get(browserView.id);

  if (socket?.readyState === WebSocket.OPEN) {
    try {
      const unencryptedString = JSON.stringify(packet);
      const encrypted = encrypt(browserView.secretKey, unencryptedString);

      const encryptedPacket = {
        encryptedData: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
      };

      socket.send(JSON.stringify(encryptedPacket));
      return true;
    } catch (error) {
      console.error("[Electrobun] Error sending to webview:", error);
    }
  }

  return false;
}

/**
 * Send a message to a specific webview
 */
export function sendMessage(webviewId: number, name: string, payload: unknown): boolean {
  const browserView = BrowserView.getById(webviewId);
  if (!browserView) {
    console.error(`[Electrobun] No BrowserView found for webview ${webviewId}`);
    return false;
  }

  const packet: RPCMessage = {
    type: "message",
    name,
    payload,
  };

  return sendToWebview(browserView, packet);
}

/**
 * Broadcast a message to all connected webviews
 */
export function broadcastMessage(name: string, payload: unknown): void {
  for (const browserView of BrowserView.getAll()) {
    sendMessage(browserView.id, name, payload);
  }
}

// ============================================================================
// Electrobun Elysia Plugin
// ============================================================================

/**
 * Create the Electrobun Elysia plugin with internal routes.
 *
 * This provides:
 * - WebSocket endpoint at /socket for encrypted RPC
 * - Internal routes under /_electrobun/* for system operations
 *
 * @example
 * ```ts
 * import { Elysia } from "elysia";
 * import { electrobun } from "electrobun/bun";
 *
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => ({ users: [] }))
 *   .post("/users", ({ body }) => ({ id: 1, ...body }))
 *   .listen(0);
 *
 * export type App = typeof app;
 * ```
 */
export function electrobun() {
  return new Elysia({ name: "electrobun" })
    // Internal WebSocket for encrypted RPC
    .ws("/socket", {
      query: t.Object({
        webviewId: t.String(),
      }),

      open(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.set(webviewId, ws.raw);
          console.log(`[Electrobun] WebSocket opened for webview ${webviewId}`);
        }
      },

      close(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.delete(webviewId);
          console.log(`[Electrobun] WebSocket closed for webview ${webviewId}`);
        }
      },

      async message(ws, encryptedMessage) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (isNaN(webviewId)) return;

        const browserView = BrowserView.getById(webviewId);
        if (!browserView) {
          console.error(`[Electrobun] No BrowserView found for webview ${webviewId}`);
          return;
        }

        try {
          const encryptedPacket = JSON.parse(encryptedMessage as string);

          const decrypted = decrypt(
            browserView.secretKey,
            base64ToUint8Array(encryptedPacket.encryptedData),
            base64ToUint8Array(encryptedPacket.iv),
            base64ToUint8Array(encryptedPacket.tag)
          );

          const packet: RPCPacket = JSON.parse(decrypted);

          if (packet.type === "request") {
            await handleRequest(ws, browserView, packet);
          } else if (packet.type === "message") {
            handleMessage(packet, webviewId);
          }
        } catch (error) {
          console.error("[Electrobun] Error handling message:", error);
        }
      },
    })

    // Internal system routes
    .group("/_electrobun", (app) =>
      app
        .get("/health", () => ({ status: "ok" }))
        .get("/info", () => ({
          webviews: BrowserView.getAll().map((v) => ({
            id: v.id,
            url: v.url,
            connected: socketMap.has(v.id),
          })),
        }))
    );
}

// ============================================================================
// Server Management
// ============================================================================

let serverInstance: ReturnType<typeof Elysia.prototype.listen> | null = null;
let serverPort: number = 0;

/**
 * Start the Electrobun server
 */
export function startServer(userApp?: Elysia<any, any, any, any, any, any, any, any>): { port: number; app: Elysia } {
  const startPort = 50000;
  const endPort = 65535;

  const baseApp = new Elysia().use(electrobun());
  const app = userApp ? baseApp.use(userApp) : baseApp;

  for (let port = startPort; port <= endPort; port++) {
    try {
      serverInstance = app.listen(port);
      serverPort = port;
      console.log(`[Electrobun] Server started on port ${port}`);
      return { port, app };
    } catch (error: any) {
      if (error.code === "EADDRINUSE") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No available ports for Electrobun server");
}

/**
 * Get the server port
 */
export function getServerPort(): number {
  return serverPort;
}

// ============================================================================
// Type Helpers for Eden Treaty
// ============================================================================

/**
 * Helper type to extract procedures from an Elysia app for Eden client
 */
export type InferProcedures<T> = T extends Elysia<any, any, any, any, any, infer Routes, any, any>
  ? Routes
  : never;

// Keep backward compatibility exports
export { Elysia };

// Auto-start basic server for backward compatibility with existing code
const { port: _serverPort } = startServer();
export const rpcPort = _serverPort;
