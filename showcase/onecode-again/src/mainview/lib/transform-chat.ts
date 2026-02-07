/**
 * Transform raw chat from desktop RPC (chats.get) into the shape expected by
 * agents UI (subChats with created_at, updated_at, parsed messages, etc.).
 */
import type { ChatWithSubChats, SubChat } from "../../shared/rpc-schema";
import type { UIMessage, UIMessagePart } from "../../shared/chat-rpc";

export type TransformedSubChat = Omit<SubChat, "messages"> & {
  messages: UIMessage[];
  created_at: SubChat["createdAt"];
  updated_at: SubChat["updatedAt"];
  stream_id: string | null;
};

export type TransformedChat = Omit<ChatWithSubChats, "subChats"> & {
  subChats: TransformedSubChat[];
  sandbox_id: null;
  meta: null;
};

export function parseSerializedSubChatMessages(
  serializedMessages: string | null | undefined,
  subChatId: string | null | undefined,
): UIMessage[] {
  let parsedMessages: UIMessage[] = [];
  try {
    const rawMessages: Record<string, unknown>[] = serializedMessages
      ? JSON.parse(serializedMessages)
      : [];
    parsedMessages = rawMessages.map((msg, idx) => {
      // Legacy chats may not have message ids. The isolated message store requires ids
      // for stable per-message atoms; generate deterministic ids per subChat+index.
      const legacyId = `legacy-${String(subChatId ?? "subchat")}-${idx}`;
      const msgIdRaw = msg.id;
      const msgId =
        typeof msgIdRaw === "string" && msgIdRaw.length > 0
          ? msgIdRaw
          : typeof msgIdRaw === "number"
            ? String(msgIdRaw)
            : legacyId;

      // Normalize legacy message formats into the UIMessage shape (role + parts).
      // - New format: { parts: UIMessagePart[] }
      // - Legacy format: { content: string } (or { text: string })
      let parts: UIMessagePart[] = [];
      if (Array.isArray(msg.parts)) {
        parts = msg.parts as UIMessagePart[];
      } else if (typeof msg.content === "string") {
        parts = [{ type: "text", text: msg.content }];
      } else if (typeof msg.text === "string") {
        parts = [{ type: "text", text: msg.text as string }];
      }
      return {
        ...msg,
        id: msgId,
        role: msg.role as UIMessage["role"],
        parts: normalizeMessageParts(parts),
      };
    });
  } catch {
    console.warn("[transform-chat] Failed to parse messages for subChat:", subChatId);
  }
  return parsedMessages;
}

function normalizeMessageParts(parts: UIMessagePart[]): UIMessagePart[] {
  return parts.map((part) => {
    const partType = part.type;

    if (partType === "tool-invocation" && part.toolName) {
      return {
        ...part,
        type: `tool-${part.toolName}`,
        toolCallId: part.toolCallId || part.toolInvocationId,
        input: part.input || part.args,
      };
    }
    if (partType.startsWith("tool-") && part.state) {
      let normalizedState = part.state;
      if (part.state === "result") {
        const result = part.result;
        normalizedState =
          typeof result === "object" && result !== null && !Array.isArray(result) && (result as Record<string, unknown>).success === false
            ? "output-error"
            : "output-available";
      }
      return {
        ...part,
        state: normalizedState,
        output: part.output || part.result,
      };
    }
    return part;
  });
}

export function transformAgentChatFromRpc(raw: ChatWithSubChats | null | undefined): TransformedChat | null {
  if (!raw) return null;
  const subChats = raw.subChats;
  return {
    ...raw,
    sandbox_id: null,
    meta: null,
    subChats: subChats?.map((sc) => {
      const parsedMessages = parseSerializedSubChatMessages(sc.messages as string, sc.id);
      return {
        ...sc,
        created_at: sc.createdAt,
        updated_at: sc.updatedAt,
        messages: parsedMessages,
        stream_id:
          ("streamId" in sc && typeof sc.streamId === "string" && sc.streamId.length > 0)
            ? sc.streamId
            : null,
      };
    }),
  };
}
