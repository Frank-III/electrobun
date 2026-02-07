import Electrobun, { Electroview } from "electrobun/view";
import type { AppRPC, BunRequestClient } from "../../shared/rpc-schema";
import type { TerminalMessages } from "../../shared/terminal-rpc";
import type { ChatMessages, UIMessageChunk } from "../../shared/chat-rpc";

type TerminalMessageKey = keyof TerminalMessages;

type TerminalListenerMap = {
  [K in TerminalMessageKey]: Set<(payload: TerminalMessages[K]) => void>;
};

const shouldLogBunInfo =
  typeof window !== "undefined" && window.localStorage.getItem("DEBUG_BUN_LOGS") === "1";

const terminalListeners: TerminalListenerMap = {
  data: new Set(),
  exit: new Set(),
  titleChanged: new Set(),
  bell: new Set(),
};

// Chat message listeners - keyed by subChatId
const chatListeners = new Map<string, Set<(chunk: UIMessageChunk) => void>>();

const rpc = Electroview.defineRPC<AppRPC>({
  // Worktree setup and initial chat hydration can legitimately exceed 10s.
  // Keep RPC requests alive long enough to avoid false timeout->null flows.
  maxRequestTime: 120000,
  handlers: {
    requests: {},
    messages: {
      data: (payload) => {
        terminalListeners.data.forEach((listener) => listener(payload));
      },
      exit: (payload) => {
        terminalListeners.exit.forEach((listener) => listener(payload));
      },
      titleChanged: (payload) => {
        terminalListeners.titleChanged.forEach((listener) => listener(payload));
      },
      bell: (payload) => {
        terminalListeners.bell.forEach((listener) => listener(payload));
      },
      log: ({ level, message }) => {
        if (level === "error") {
          console.error(`[bun] ${message}`);
        } else if (shouldLogBunInfo) {
          console.log(`[bun] ${message}`);
        }
      },
      gitStatusChanged: (payload) => {
        window.dispatchEvent(
          new CustomEvent("electrobun:gitStatusChanged", { detail: payload }),
        );
      },
      chatChunk: (payload) => {
        const listeners = chatListeners.get(payload.subChatId);
        if (listeners) {
          listeners.forEach((listener) => listener(payload.chunk));
        }
      },
    },
  },
});

// Initialize Electroview with the typed RPC
const electroview = new Electrobun.Electroview({ rpc });

// Export the typed request client directly
export const rpcRequest = rpc.request;

export function getRpcRequest(): BunRequestClient {
  return rpc.request;
}

export function onTerminalMessage<K extends TerminalMessageKey>(
  type: K,
  handler: (payload: TerminalMessages[K]) => void,
) {
  const listeners = terminalListeners[type];
  listeners.add(handler as (payload: TerminalMessages[TerminalMessageKey]) => void);
  return () => {
    listeners.delete(handler as (payload: TerminalMessages[TerminalMessageKey]) => void);
  };
}

/**
 * Subscribe to chat chunks for a specific subChatId.
 * Returns an unsubscribe function.
 */
export function onChatMessage(
  subChatId: string,
  handler: (chunk: UIMessageChunk) => void,
) {
  let listeners = chatListeners.get(subChatId);
  if (!listeners) {
    listeners = new Set();
    chatListeners.set(subChatId, listeners);
  }
  listeners.add(handler);
  return () => {
    listeners?.delete(handler);
    if (listeners?.size === 0) {
      chatListeners.delete(subChatId);
    }
  };
}
