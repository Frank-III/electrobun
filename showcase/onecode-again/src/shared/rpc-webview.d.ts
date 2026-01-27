import type { AppRPC } from "./rpc-schema";

declare global {
  interface Window {
    rpc: AppRPC["webview"];
  }
}

export {};
