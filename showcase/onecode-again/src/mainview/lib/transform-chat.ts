/**
 * Transform raw chat from desktop RPC (chats.get) into the shape expected by
 * agents UI (subChats with created_at, updated_at, parsed messages, etc.).
 */
type AnyObj = Record<string, unknown>;

/** Type guard to check if a value is a record/object */
function isRecord(value: unknown): value is AnyObj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMessageParts(parts: unknown[]): unknown[] {
  return parts.map((part) => {
    if (!isRecord(part)) return part;

    const partType = part.type;
    if (typeof partType !== "string") return part;

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
          isRecord(result) && result.success === false ? "output-error" : "output-available";
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

export function transformAgentChatFromRpc(raw: AnyObj | null | undefined): AnyObj | null {
  if (!raw) return null;
  const subChats = raw.subChats as AnyObj[] | undefined;
  return {
    ...raw,
    sandbox_id: null,
    meta: null,
    subChats: subChats?.map((sc: AnyObj) => {
      let parsedMessages: AnyObj[] = [];
      try {
        parsedMessages = sc.messages ? JSON.parse(sc.messages as string) : [];
        parsedMessages = parsedMessages.map((msg: AnyObj) => {
          if (!msg.parts) return msg;
          return {
            ...msg,
            parts: normalizeMessageParts((msg.parts as unknown[]) || []),
          };
        });
      } catch {
        console.warn("[transform-chat] Failed to parse messages for subChat:", sc.id);
      }
      return {
        ...sc,
        created_at: sc.createdAt,
        updated_at: sc.updatedAt,
        messages: parsedMessages,
        stream_id: null,
      };
    }),
  };
}
