/**
 * Socket.ts - Backward compatibility
 *
 * WebSocket server is now handled by ElysiaRPC.ts
 * This file re-exports for backward compatibility.
 */

export {
  rpcPort,
  sendMessageToWebviewViaSocket,
  socketMap,
} from "./ElysiaRPC";

// Legacy - rpcServer is no longer exposed
export const rpcServer = null;
