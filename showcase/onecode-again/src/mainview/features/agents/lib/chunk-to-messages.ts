/**
 * Reduces UIMessageChunk stream to UIMessage[].
 * Backend uses Claude Agent SDK and emits chunks; we consume them here (no AI SDK on frontend).
 */
import type { UIMessage, UIMessageChunk, UIMessagePart } from "../../../../shared/chat-rpc";

export type ChunkReducerState = {
  messages: UIMessage[];
  /** Current assistant message being streamed */
  current: UIMessage | null;
  /** Current text part id for text-delta */
  currentTextId: string | null;
};

function createAssistantMessage(id?: string): UIMessage {
  return { id: id ?? crypto.randomUUID(), role: "assistant", parts: [] };
}

function getOrCreateTextPart(msg: UIMessage, textId: string): UIMessagePart {
  let part = msg.parts.find((p) => (p as { id?: string }).id === textId) as (UIMessagePart & { id?: string }) | undefined;
  if (!part) {
    part = { type: "text", text: "", id: textId };
    msg.parts.push(part);
  }
  return part;
}

/**
 * Apply one chunk to state; returns new state (immutable where possible).
 */
export function reduceChunk(state: ChunkReducerState, chunk: UIMessageChunk): ChunkReducerState {
  switch (chunk.type) {
    case "start": {
      const next = createAssistantMessage(chunk.messageId);
      return {
        messages: state.messages,
        current: next,
        currentTextId: null,
      };
    }
    case "text-start":
      return { ...state, currentTextId: chunk.id };
    case "text-delta": {
      if (!state.current) return state;
      const part = getOrCreateTextPart(state.current, chunk.id) as UIMessagePart & { text?: string };
      part.text = (part.text ?? "") + chunk.delta;
      return { ...state };
    }
    case "text-end":
      return { ...state, currentTextId: null };
    case "tool-input-available": {
      if (!state.current) return state;
      state.current.parts.push({
        type: `tool-${chunk.toolName}`,
        toolCallId: chunk.toolCallId,
        toolName: chunk.toolName,
        input: chunk.input,
        state: "input-available",
      });
      return { ...state };
    }
    case "tool-output-available": {
      if (!state.current) return state;
      const part = state.current.parts.find(
        (p) => (p as { toolCallId?: string }).toolCallId === chunk.toolCallId
      ) as (UIMessagePart & { state?: string; output?: unknown }) | undefined;
      if (part) part.state = "output-available";
      if (part) part.output = chunk.output;
      return { ...state };
    }
    case "tool-output-error": {
      if (!state.current) return state;
      const part = state.current.parts.find(
        (p) => (p as { toolCallId?: string }).toolCallId === chunk.toolCallId
      ) as (UIMessagePart & { state?: string; errorText?: string }) | undefined;
      if (part) part.state = "output-error";
      if (part) part.errorText = chunk.errorText;
      return { ...state };
    }
    case "reasoning":
    case "reasoning-delta": {
      if (!state.current) return state;
      let part = state.current.parts.find((p) => p.type === "reasoning") as (UIMessagePart & { text?: string }) | undefined;
      if (!part) {
        part = { type: "reasoning", text: "" };
        state.current.parts.push(part);
      }
      if (chunk.type === "reasoning") part.text = chunk.text;
      else part.text = (part.text ?? "") + (chunk as { delta: string }).delta;
      return { ...state };
    }
    case "finish": {
      const finished = state.current;
      const messageMetadata = (chunk as { messageMetadata?: import("../../../../shared/chat-rpc").MessageMetadata }).messageMetadata;
      const messages = finished
        ? [...state.messages, { ...finished, ...(messageMetadata && { metadata: messageMetadata }) }]
        : state.messages;
      return { messages, current: null, currentTextId: null };
    }
    case "error":
      // Keep current state; caller will set error separately
      return state;
    default:
      return state;
  }
}

/**
 * Initial reducer state from existing messages.
 */
export function initialReducerState(messages: UIMessage[]): ChunkReducerState {
  return { messages: Array.isArray(messages) ? messages : [], current: null, currentTextId: null };
}
