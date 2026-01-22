/**
 * Elysia Adapter for Electrobun - Server Side (Bun Process)
 *
 * This adapter allows you to use Elysia's elegant syntax with Electrobun,
 * providing end-to-end type safety with an Eden-style client on the webview side.
 *
 * Supports both RPC-style calls (procedure-based) and REST-style routes.
 */

import { Elysia, t, type Static } from "elysia";
import type {
  ElectrobunAdapterConfig,
  RPCRequest,
  RPCResponse,
  RPCMessage,
  RPCPacket,
} from "./types";

// Re-export Elysia's t for convenience
export { t };

// Generate unique request IDs
let requestIdCounter = 0;
const generateRequestId = () => `req_${++requestIdCounter}_${Date.now()}`;

/**
 * Define a procedure with typed input and output.
 * This is the RPC-style approach that matches Electrobun's current patterns.
 */
export type Procedure<TInput, TOutput> = {
  input: TInput;
  output: TOutput;
  handler: (params: TInput, ctx: { webviewId: number }) => TOutput | Promise<TOutput>;
};

/**
 * Schema definition for procedures
 */
export type ProcedureSchema<T> = {
  [K in keyof T]: T[K] extends Procedure<infer I, infer O>
    ? { params: I; response: O }
    : never;
};

/**
 * Create an Elysia-powered RPC handler for Electrobun.
 *
 * @example
 * ```ts
 * import { ElysiaElectrobun, t } from "electrobun/elysia";
 *
 * const app = new ElysiaElectrobun()
 *   .procedure("getUsers", {
 *     input: t.Object({}),
 *     output: t.Object({ users: t.Array(t.Object({ id: t.Number(), name: t.String() })) }),
 *     handler: async () => {
 *       return { users: [{ id: 1, name: "Alice" }] };
 *     },
 *   })
 *   .procedure("createUser", {
 *     input: t.Object({ name: t.String(), email: t.String() }),
 *     output: t.Object({ success: t.Boolean(), user: t.Object({ id: t.Number() }) }),
 *     handler: async ({ name, email }) => {
 *       const user = await createUser(name, email);
 *       return { success: true, user };
 *     },
 *   });
 *
 * export type App = typeof app;
 *
 * const window = new BrowserWindow({
 *   url: "views://app",
 *   rpc: app.toRPC(),
 * });
 * ```
 */
export class ElysiaElectrobun<
  Procedures extends Record<string, { params: unknown; response: unknown }> = {},
  Messages extends Record<string, unknown> = {},
> {
  private config: ElectrobunAdapterConfig;
  private procedures: Map<
    string,
    {
      inputSchema?: unknown;
      outputSchema?: unknown;
      handler: (params: unknown, ctx: { webviewId: number }) => unknown | Promise<unknown>;
    }
  > = new Map();
  private messageHandlers: Map<string, (payload: unknown, webviewId: number) => void> = new Map();

  constructor(config: ElectrobunAdapterConfig = {}) {
    this.config = {
      maxRequestTime: config.maxRequestTime ?? 60000,
    };
  }

  /**
   * Define a typed procedure (RPC method).
   *
   * @param name - The procedure name (e.g., "getUsers", "createUser")
   * @param definition - The procedure definition with input/output schemas and handler
   */
  procedure<
    TName extends string,
    TInput extends ReturnType<typeof t.Object<any>> | ReturnType<typeof t.Void>,
    TOutput extends ReturnType<typeof t.Object<any>> | ReturnType<typeof t.Union<any>> | ReturnType<typeof t.Array<any>>,
  >(
    name: TName,
    definition: {
      input?: TInput;
      output?: TOutput;
      handler: (
        params: TInput extends ReturnType<typeof t.Void> ? {} : Static<TInput>,
        ctx: { webviewId: number }
      ) => Static<TOutput> | Promise<Static<TOutput>>;
    }
  ): ElysiaElectrobun<
    Procedures & {
      [K in TName]: {
        params: TInput extends ReturnType<typeof t.Void> ? {} : Static<TInput>;
        response: Static<TOutput>;
      };
    },
    Messages
  > {
    this.procedures.set(name, {
      inputSchema: definition.input,
      outputSchema: definition.output,
      handler: definition.handler as (params: unknown, ctx: { webviewId: number }) => unknown,
    });

    return this as any;
  }

  /**
   * Register a message handler for fire-and-forget messages from the webview.
   *
   * @example
   * ```ts
   * app.onMessage("log", t.Object({ level: t.String(), message: t.String() }), (payload) => {
   *   console.log(`[${payload.level}] ${payload.message}`);
   * });
   * ```
   */
  onMessage<TName extends string, TPayload extends ReturnType<typeof t.Object<any>>>(
    name: TName,
    schema: TPayload,
    handler: (payload: Static<TPayload>, webviewId: number) => void
  ): ElysiaElectrobun<Procedures, Messages & { [K in TName]: Static<TPayload> }>;
  onMessage<TName extends string, TPayload>(
    name: TName,
    handler: (payload: TPayload, webviewId: number) => void
  ): ElysiaElectrobun<Procedures, Messages & { [K in TName]: TPayload }>;
  onMessage(
    name: string,
    schemaOrHandler: unknown,
    maybeHandler?: (payload: unknown, webviewId: number) => void
  ): this {
    const handler = maybeHandler ?? (schemaOrHandler as (payload: unknown, webviewId: number) => void);
    this.messageHandlers.set(name, handler);
    return this;
  }

  /**
   * Convert this app to an Electrobun RPC handler.
   * Pass the result to BrowserWindow's `rpc` option.
   */
  toRPC() {
    const procedures = this.procedures;
    const messageHandlers = this.messageHandlers;
    const maxRequestTime = this.config.maxRequestTime ?? 60000;

    let rpcSend: ((message: RPCPacket) => void) | null = null;
    let rpcHandler: ((msg: unknown) => void) | null = null;

    // Handle incoming packets from webview
    const handleIncoming = async (packet: RPCPacket & { hostWebviewId?: number }) => {
      const webviewId = packet.hostWebviewId ?? 0;

      if (packet.type === "message") {
        const handler = messageHandlers.get(packet.name);
        if (handler) {
          try {
            handler(packet.payload, webviewId);
          } catch (err) {
            console.error(`[ElysiaElectrobun] Message handler error for "${packet.name}":`, err);
          }
        }
        return;
      }

      if (packet.type === "request") {
        const response = await handleRequest(packet, webviewId);
        if (rpcSend) {
          rpcSend(response);
        }
      }
    };

    // Handle a procedure call
    const handleRequest = async (
      request: RPCRequest,
      webviewId: number
    ): Promise<RPCResponse> => {
      const procedureName = request.path.replace(/^\//, ""); // Remove leading slash if any
      const procedure = procedures.get(procedureName);

      if (!procedure) {
        return {
          id: request.id,
          type: "response",
          success: false,
          error: `Unknown procedure: ${procedureName}`,
        };
      }

      try {
        const params = request.body ?? {};
        const result = await procedure.handler(params, { webviewId });

        return {
          id: request.id,
          type: "response",
          success: true,
          data: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          id: request.id,
          type: "response",
          success: false,
          error: message,
        };
      }
    };

    // Return an object compatible with Electrobun's RPC interface
    return {
      setTransport(transport: { send: (msg: unknown) => void; registerHandler?: (h: (msg: unknown) => void) => void }) {
        rpcSend = transport.send as (message: RPCPacket) => void;
        if (transport.registerHandler) {
          transport.registerHandler((msg: unknown) => {
            handleIncoming(msg as RPCPacket & { hostWebviewId?: number });
          });
        }
      },

      // Send a message to the webview
      send: <K extends keyof Messages>(name: K, payload: Messages[K]) => {
        if (rpcSend) {
          rpcSend({
            type: "message",
            name: name as string,
            payload,
          });
        }
      },

      // Expose request for compatibility (webview -> bun requests handled by procedures)
      request: new Proxy({} as Record<string, never>, {
        get: () => {
          throw new Error("Use procedures for bun-side handlers");
        },
      }),
    };
  }
}

/**
 * Type helper to extract the app type for Eden client
 */
export type InferApp<T extends ElysiaElectrobun<any, any>> = T extends ElysiaElectrobun<
  infer P,
  infer M
>
  ? { procedures: P; messages: M }
  : never;

/**
 * Type helper for procedure params
 */
export type InferProcedureInput<
  T extends ElysiaElectrobun<any, any>,
  K extends keyof InferApp<T>["procedures"],
> = InferApp<T>["procedures"][K]["params"];

/**
 * Type helper for procedure response
 */
export type InferProcedureOutput<
  T extends ElysiaElectrobun<any, any>,
  K extends keyof InferApp<T>["procedures"],
> = InferApp<T>["procedures"][K]["response"];
