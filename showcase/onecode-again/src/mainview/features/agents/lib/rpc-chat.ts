/**
 * RPC-based chat state. Consumes UIMessageChunk stream from backend (Claude Agent SDK).
 * No @ai-sdk/react or "ai" package.
 */
import type { UIMessage, UIMessageChunk } from "../../../../shared/chat-rpc";
import { initialReducerState, reduceChunk } from "./chunk-to-messages";

export type RpcChatTransport = {
  sendMessages(options: {
    trigger: "submit-message" | "regenerate-message";
    chatId: string;
    messageId: string | undefined;
    messages: UIMessage[];
    abortSignal: AbortSignal | undefined;
  }): Promise<ReadableStream<UIMessageChunk>>;
  reconnectToStream?(options: { chatId: string }): Promise<ReadableStream<UIMessageChunk> | null>;
};

export type CreateRpcChatOptions = {
  id: string;
  messages: UIMessage[];
  transport: RpcChatTransport;
  chatId: string;
  onError?: () => void;
  onFinish?: () => void;
};

type Listener = () => void;
const noop = () => {};

function throttle(fn: () => void, waitMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, waitMs);
  };
}

/**
 * Chat instance that uses RPC transport and reduces chunks to messages.
 * Exposes the same callback API as before for useChatSolid.
 */
export function createRpcChat(options: CreateRpcChatOptions): RpcChat {
  const { id, messages: initialMessages, transport, chatId, onError = noop, onFinish = noop } = options;

  let messages: UIMessage[] = Array.isArray(initialMessages) ? [...initialMessages] : [];
  let status: string = "ready";
  let error: Error | undefined;
  let abortController: AbortController | null = null;

  const messageListeners = new Set<Listener>();
  const statusListeners = new Set<Listener>();
  const errorListeners = new Set<Listener>();

  function notifyMessages() {
    messageListeners.forEach((l) => l());
  }
  function notifyStatus() {
    statusListeners.forEach((l) => l());
  }
  function notifyError() {
    errorListeners.forEach((l) => l());
  }

  const api: RpcChat = {
    get id() {
      return id;
    },
    get messages() {
      return messages;
    },
    get status() {
      return status;
    },
    get error() {
      return error;
    },

    "~registerMessagesCallback"(cb: () => void, throttleWaitMs?: number) {
      const run = throttleWaitMs ? throttle(cb, throttleWaitMs) : cb;
      messageListeners.add(run);
      return () => messageListeners.delete(run);
    },
    "~registerStatusCallback"(cb: () => void) {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
    "~registerErrorCallback"(cb: () => void) {
      errorListeners.add(cb);
      return () => errorListeners.delete(cb);
    },

    setMessages(next: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) {
      messages = typeof next === "function" ? next(messages) : next;
      notifyMessages();
    },

    async sendMessage(opts: { role: "user"; parts: Array<{ type: string; text?: string; [k: string]: unknown }> }) {
      const userMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: opts.parts.map((p) => ({ ...p })),
      };
      messages = [...messages, userMsg];
      notifyMessages();
      status = "submitted";
      notifyStatus();

      abortController = new AbortController();
      try {
        const stream = await transport.sendMessages({
          trigger: "submit-message",
          chatId,
          messageId: undefined,
          messages,
          abortSignal: abortController.signal,
        });
        status = "streaming";
        notifyStatus();
        error = undefined;
        notifyError();

        let state = initialReducerState(messages);
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            state = reduceChunk(state, value as UIMessageChunk);
            messages = state.current ? [...state.messages, state.current] : state.messages;
            notifyMessages();
            if ((value as UIMessageChunk).type === "error") {
              error = new Error((value as { errorText?: string }).errorText ?? "Stream error");
              notifyError();
            }
            if ((value as UIMessageChunk).type === "finish") {
              messages = state.messages;
              notifyMessages();
              break;
            }
          }
        }
        status = "ready";
        notifyStatus();
        onFinish();
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") {
          status = "ready";
          notifyStatus();
          return;
        }
        error = e instanceof Error ? e : new Error(String(e));
        status = "error";
        notifyStatus();
        notifyError();
        onError();
      } finally {
        abortController = null;
      }
    },

    stop() {
      if (abortController) {
        abortController.abort();
      }
      return () => {};
    },

    async regenerate() {
      const withoutLastAssistant = messages.slice(0, -1);
      const lastUser = [...withoutLastAssistant].reverse().find((m) => m.role === "user");
      if (!lastUser) return;
      messages = withoutLastAssistant;
      notifyMessages();
      await api.sendMessage({ role: "user", parts: lastUser.parts });
    },

    resumeStream() {
      // Optional: implement reconnection if backend supports it
    },

    clearError() {
      error = undefined;
      notifyError();
    },
  };

  return api;
}

export type RpcChat = {
  id: string;
  messages: UIMessage[];
  status: string;
  error: Error | undefined;
  setMessages: (next: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  sendMessage: (opts: { role: "user"; parts: Array<{ type: string; text?: string; [k: string]: unknown }> }) => Promise<void>;
  regenerate: () => Promise<void>;
  stop: () => () => void;
  resumeStream: () => void;
  clearError: () => void;
  "~registerMessagesCallback": (cb: () => void, throttleWaitMs?: number) => () => void;
  "~registerStatusCallback": (cb: () => void) => () => void;
  "~registerErrorCallback": (cb: () => void) => () => void;
};
