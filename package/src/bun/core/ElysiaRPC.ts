/**
 * Elysia-based RPC Server for Electrobun
 *
 * Replaces rpc-anywhere with Elysia's WebSocket support while maintaining
 * the existing AES-256-GCM encryption layer for secure IPC.
 */

import { Elysia, t, type Static } from "elysia";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { BrowserView } from "./BrowserView";

// Re-export Elysia's t for schema definitions
export { t };

// ============================================================================
// Encryption Layer (kept from original Socket.ts)
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
// Types
// ============================================================================

/** Encrypted packet format */
export const EncryptedPacket = t.Object({
  encryptedData: t.String(),
  iv: t.String(),
  tag: t.String(),
});

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

/** WebSocket connection data */
interface WSData {
  webviewId: number;
}

// ============================================================================
// Socket Management
// ============================================================================

export const socketMap: Map<number, WebSocket> = new Map();

// ============================================================================
// Elysia RPC Server
// ============================================================================

let rpcServerInstance: ReturnType<typeof createElysiaRPCServer> | null = null;
let rpcServerPort: number = 0;

interface ProcedureDefinition {
  handler: (params: unknown, ctx: { webviewId: number }) => unknown | Promise<unknown>;
}

const globalProcedures: Map<string, ProcedureDefinition> = new Map();
const globalMessageHandlers: Map<string, (payload: unknown, webviewId: number) => void> = new Map();

/**
 * Create the Elysia WebSocket server for RPC
 */
function createElysiaRPCServer(port: number) {
  const app = new Elysia()
    .ws("/socket", {
      query: t.Object({
        webviewId: t.String(),
      }),
      body: t.String(), // Encrypted JSON string

      open(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.set(webviewId, ws.raw);
          console.log(`[Elysia RPC] WebSocket opened for webview ${webviewId}`);
        }
      },

      close(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.delete(webviewId);
          console.log(`[Elysia RPC] WebSocket closed for webview ${webviewId}`);
        }
      },

      async message(ws, encryptedMessage) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (isNaN(webviewId)) return;

        const browserView = BrowserView.getById(webviewId);
        if (!browserView) {
          console.error(`[Elysia RPC] No BrowserView found for webview ${webviewId}`);
          return;
        }

        try {
          // Parse encrypted packet
          const encryptedPacket = JSON.parse(encryptedMessage as string);

          // Decrypt
          const decrypted = decrypt(
            browserView.secretKey,
            base64ToUint8Array(encryptedPacket.encryptedData),
            base64ToUint8Array(encryptedPacket.iv),
            base64ToUint8Array(encryptedPacket.tag)
          );

          const packet: RPCPacket = JSON.parse(decrypted);

          // Route based on packet type
          if (packet.type === "request") {
            await handleRequest(ws, browserView, packet);
          } else if (packet.type === "message") {
            handleMessage(packet, webviewId);
          }
        } catch (error) {
          console.error("[Elysia RPC] Error handling message:", error);
        }
      },
    })
    .listen(port);

  console.log(`[Elysia RPC] Server started on port ${port}`);
  return app;
}

/**
 * Handle an RPC request
 */
async function handleRequest(
  ws: any,
  browserView: BrowserView<any>,
  request: RPCRequest
) {
  const procedure = globalProcedures.get(request.method);

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

  // Encrypt and send response
  sendToWebview(browserView, response);
}

/**
 * Handle a fire-and-forget message
 */
function handleMessage(message: RPCMessage, webviewId: number) {
  const handler = globalMessageHandlers.get(message.name);
  if (handler) {
    try {
      handler(message.payload, webviewId);
    } catch (error) {
      console.error(`[Elysia RPC] Message handler error for "${message.name}":`, error);
    }
  }

  // Also call wildcard handler if registered
  const wildcardHandler = globalMessageHandlers.get("*");
  if (wildcardHandler) {
    try {
      wildcardHandler({ name: message.name, payload: message.payload }, webviewId);
    } catch (error) {
      console.error("[Elysia RPC] Wildcard message handler error:", error);
    }
  }
}

/**
 * Send an encrypted message to a webview
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
      console.error("[Elysia RPC] Error sending to webview:", error);
    }
  }

  return false;
}

/**
 * Start the RPC server (finds an available port)
 */
export function startRPCServer(): { port: number } {
  const startPort = 50000;
  const endPort = 65535;

  for (let port = startPort; port <= endPort; port++) {
    try {
      rpcServerInstance = createElysiaRPCServer(port);
      rpcServerPort = port;
      return { port };
    } catch (error: any) {
      if (error.code === "EADDRINUSE") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No available ports for RPC server");
}

/**
 * Get the RPC server port
 */
export function getRPCPort(): number {
  return rpcServerPort;
}

// ============================================================================
// ElysiaElectrobun - The main API for defining procedures
// ============================================================================

/**
 * Define type-safe RPC procedures using Elysia's type system.
 *
 * @example
 * ```ts
 * import { ElysiaElectrobun, t } from "electrobun/bun";
 *
 * const app = new ElysiaElectrobun()
 *   .procedure("getUsers", {
 *     input: t.Object({}),
 *     handler: async () => ({ users: [] }),
 *   })
 *   .procedure("createUser", {
 *     input: t.Object({ name: t.String() }),
 *     handler: async ({ name }) => ({ id: 1, name }),
 *   });
 *
 * export type App = typeof app;
 * ```
 */
export class ElysiaElectrobun<
  Procedures extends Record<string, { input: unknown; output: unknown }> = {},
  Messages extends Record<string, unknown> = {},
> {
  private _procedures: Map<string, ProcedureDefinition> = new Map();
  private _messageHandlers: Map<string, (payload: unknown, webviewId: number) => void> = new Map();

  constructor() {
    // Ensure RPC server is started
    if (!rpcServerInstance) {
      startRPCServer();
    }
  }

  /**
   * Define a typed procedure
   */
  procedure<
    TName extends string,
    TInput,
    TOutput,
  >(
    name: TName,
    definition: {
      input?: TInput;
      handler: (
        params: TInput extends { static: infer S } ? S : TInput,
        ctx: { webviewId: number }
      ) => TOutput | Promise<TOutput>;
    }
  ): ElysiaElectrobun<
    Procedures & { [K in TName]: { input: TInput; output: TOutput } },
    Messages
  > {
    const procedureDef: ProcedureDefinition = {
      handler: definition.handler as (params: unknown, ctx: { webviewId: number }) => unknown,
    };

    this._procedures.set(name, procedureDef);
    globalProcedures.set(name, procedureDef);

    return this as any;
  }

  /**
   * Register a message handler
   */
  onMessage<TName extends string, TPayload = unknown>(
    name: TName,
    handler: (payload: TPayload, webviewId: number) => void
  ): ElysiaElectrobun<Procedures, Messages & { [K in TName]: TPayload }> {
    this._messageHandlers.set(name, handler as (payload: unknown, webviewId: number) => void);
    globalMessageHandlers.set(name, handler as (payload: unknown, webviewId: number) => void);
    return this as any;
  }

  /**
   * Get the RPC port for this app
   */
  get port(): number {
    return rpcServerPort;
  }

  /**
   * Create a sender for a specific webview
   */
  createSender(webviewId: number) {
    const browserView = BrowserView.getById(webviewId);
    if (!browserView) {
      throw new Error(`No BrowserView found for webview ${webviewId}`);
    }

    return {
      send: (name: string, payload: unknown) => {
        const packet: RPCMessage = {
          type: "message",
          name,
          payload,
        };
        sendToWebview(browserView, packet);
      },
    };
  }
}

// ============================================================================
// Type Helpers
// ============================================================================

export type InferProcedures<T extends ElysiaElectrobun<any, any>> =
  T extends ElysiaElectrobun<infer P, any> ? P : never;

export type InferMessages<T extends ElysiaElectrobun<any, any>> =
  T extends ElysiaElectrobun<any, infer M> ? M : never;

// Auto-start the server on import
const { port: _rpcPort } = startRPCServer();
export const rpcPort = _rpcPort;
