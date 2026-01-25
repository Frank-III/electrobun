/**
 * Electrobun Elysia Plugin
 *
 * Provides internal routes and WebSocket for Electrobun's system operations.
 * Users extend with their own Elysia routes and use Eden Treaty for type-safe clients.
 *
 * @example
 * ```ts
 * import { Elysia } from "elysia";
 * import { electrobun } from "electrobun/bun";
 *
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/users", () => [{ id: 1, name: "Alice" }])
 *   .post("/users", ({ body }) => ({ id: 1, ...body }))
 *   .listen(0);
 *
 * export type App = typeof app;
 * ```
 *
 * ```tsx
 * // Browser - use Eden Treaty directly
 * import { treaty } from "@elysiajs/eden";
 * import type { App } from "../bun";
 *
 * const api = treaty<App>(`localhost:${port}`);
 * const { data } = await api.users.get();
 * ```
 */

import { Elysia, t } from "elysia";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { BrowserView } from "./BrowserView";

// Re-export Elysia and t for convenience
export { Elysia, t };

// ============================================================================
// Encryption Layer (for internal Electrobun WebSocket)
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
// Socket Management (for internal use)
// ============================================================================

export const socketMap: Map<number, WebSocket> = new Map();

// ============================================================================
// Electrobun Elysia Plugin
// ============================================================================

/**
 * Electrobun Elysia plugin.
 *
 * Adds internal routes and WebSocket for Electrobun's system operations
 * (window management, webview tags, etc.).
 *
 * @example
 * ```ts
 * const app = new Elysia()
 *   .use(electrobun())
 *   .get("/your-routes", () => ...)
 * ```
 */
export function electrobun() {
  return new Elysia({ name: "electrobun" })
    // Internal WebSocket for Electrobun system communication
    .ws("/socket", {
      query: t.Object({
        webviewId: t.String(),
      }),

      open(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.set(webviewId, ws.raw);
        }
      },

      close(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.delete(webviewId);
        }
      },

      message(ws, encryptedMessage) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (isNaN(webviewId)) return;

        const browserView = BrowserView.getById(webviewId);
        if (!browserView) return;

        try {
          const encryptedPacket = JSON.parse(encryptedMessage as string);

          const decrypted = decrypt(
            browserView.secretKey,
            base64ToUint8Array(encryptedPacket.encryptedData),
            base64ToUint8Array(encryptedPacket.iv),
            base64ToUint8Array(encryptedPacket.tag)
          );

          // Pass to BrowserView's RPC handler (for internal Electrobun RPC)
          if (browserView.rpcHandler) {
            browserView.rpcHandler(JSON.parse(decrypted));
          }
        } catch (error) {
          console.error("[Electrobun] Error handling WebSocket message:", error);
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
// Server Utilities
// ============================================================================

let serverPort: number = 0;

/**
 * Start an Elysia server on an available port.
 */
export function startServer(app: Elysia<any, any, any, any, any, any, any, any>): number {
  const startPort = 50000;
  const endPort = 65535;

  for (let port = startPort; port <= endPort; port++) {
    try {
      app.listen(port);
      serverPort = port;
      console.log(`[Electrobun] Server started on port ${port}`);
      return port;
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
 * Get the server port (after startServer is called).
 */
export function getServerPort(): number {
  return serverPort;
}

// ============================================================================
// Auto-start for backward compatibility
// ============================================================================

const baseApp = new Elysia().use(electrobun());
export const rpcPort = startServer(baseApp);
