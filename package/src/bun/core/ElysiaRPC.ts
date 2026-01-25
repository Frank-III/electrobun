/**
 * Electrobun Elysia Integration
 *
 * Single Elysia server handling:
 * - WebSocket at /socket for encrypted RPC
 * - Internal routes at /_electrobun/*
 * - User's custom routes via Eden Treaty
 */

import { Elysia, t } from "elysia";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { BrowserView } from "./BrowserView";

export { Elysia, t };

// ============================================================================
// Encryption
// ============================================================================

function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(
    atob(base64)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}

function encrypt(secretKey: Uint8Array, text: string) {
  const iv = new Uint8Array(randomBytes(12));
  const cipher = createCipheriv("aes-256-gcm", secretKey, iv);
  const encrypted = Buffer.concat([
    new Uint8Array(cipher.update(text, "utf8")),
    new Uint8Array(cipher.final()),
  ]).toString("base64");
  const tag = cipher.getAuthTag().toString("base64");
  return { encrypted, iv: Buffer.from(iv).toString("base64"), tag };
}

function decrypt(
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

type RawWebSocket = { send: (data: string) => void; readyState: number };

export const socketMap: Map<number, RawWebSocket> = new Map();

/**
 * Send encrypted message to a webview via WebSocket
 */
export function sendMessageToWebviewViaSocket(webviewId: number, message: any): boolean {
  const socket = socketMap.get(webviewId);
  const browserView = BrowserView.getById(webviewId);

  if (!browserView || !socket || socket.readyState !== 1) {
    return false;
  }

  try {
    const encrypted = encrypt(browserView.secretKey, JSON.stringify(message));
    socket.send(
      JSON.stringify({
        encryptedData: encrypted.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
      })
    );
    return true;
  } catch (error) {
    console.error("[Electrobun] Error sending to webview:", error);
    return false;
  }
}

// ============================================================================
// Electrobun Plugin
// ============================================================================

/**
 * Electrobun Elysia plugin with WebSocket + internal routes.
 */
export function electrobun() {
  return new Elysia({ name: "electrobun" })
    // WebSocket for encrypted RPC
    .ws("/socket", {
      query: t.Object({
        webviewId: t.String(),
      }),

      open(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.set(webviewId, ws.raw as RawWebSocket);
        }
      },

      close(ws) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (!isNaN(webviewId)) {
          socketMap.delete(webviewId);
        }
      },

      message(ws, message) {
        const webviewId = parseInt(ws.data.query.webviewId, 10);
        if (isNaN(webviewId)) return;

        const browserView = BrowserView.getById(webviewId);
        if (!browserView) return;

        try {
          const encryptedPacket = JSON.parse(message as string);
          const decrypted = decrypt(
            browserView.secretKey,
            base64ToUint8Array(encryptedPacket.encryptedData),
            base64ToUint8Array(encryptedPacket.iv),
            base64ToUint8Array(encryptedPacket.tag)
          );

          if (browserView.rpcHandler) {
            browserView.rpcHandler(JSON.parse(decrypted));
          }
        } catch (error) {
          console.error("[Electrobun] WebSocket error:", error);
        }
      },
    })

    // Internal routes
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
// Server
// ============================================================================

/**
 * Start Elysia server on available port (50000-65535)
 */
export function startServer(app: Elysia<any, any, any, any, any, any, any, any>): number {
  for (let port = 50000; port <= 65535; port++) {
    try {
      app.listen(port);
      console.log(`[Electrobun] Server on port ${port}`);
      return port;
    } catch (error: any) {
      if (error.code === "EADDRINUSE") continue;
      throw error;
    }
  }
  throw new Error("No available ports");
}

// ============================================================================
// Auto-start
// ============================================================================

const baseApp = new Elysia().use(electrobun());
export const rpcPort = startServer(baseApp);
