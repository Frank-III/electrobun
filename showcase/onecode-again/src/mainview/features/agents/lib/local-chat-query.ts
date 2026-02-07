import type { ChatWithSubChats } from "../../../../shared/rpc-schema";
import { desktopRpc } from "../../../lib/desktop-rpc";

const LOCAL_CHAT_TIMEOUT_MS = 15_000;

export function localChatQueryKey(chatId: string) {
  return ["chats", "get", chatId] as const;
}

export async function fetchLocalChatById(
  chatId: string,
  timeoutMs = LOCAL_CHAT_TIMEOUT_MS,
): Promise<ChatWithSubChats | null> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timed out waiting for chats.get(${chatId})`));
    }, timeoutMs);
  });

  try {
    return (
      await Promise.race([
        desktopRpc.chats.get({ id: chatId }),
        timeoutPromise,
      ])
    ) ?? null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function createLocalChatQueryOptions(chatId: string) {
  return {
    queryKey: localChatQueryKey(chatId),
    queryFn: () => fetchLocalChatById(chatId),
    retry: 0 as const,
  };
}
