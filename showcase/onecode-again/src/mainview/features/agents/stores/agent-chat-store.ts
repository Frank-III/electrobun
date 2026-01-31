import type { RpcChat } from "../lib/rpc-chat";

/**
 * Simple module-level storage for chat instances (RpcChat from Claude backend).
 * Lives outside component lifecycle so chats persist across mount/unmount.
 */

const chats = new Map<string, RpcChat>();
const streamIds = new Map<string, string | null>();
const parentChatIds = new Map<string, string>();
const manuallyAborted = new Map<string, boolean>();

export const agentChatStore = {
  get: (id: string) => chats.get(id),

  set: (id: string, chat: RpcChat, parentChatId: string) => {
    chats.set(id, chat);
    parentChatIds.set(id, parentChatId);
  },

  has: (id: string) => chats.has(id),

  delete: (id: string) => {
    chats.delete(id);
    streamIds.delete(id);
    parentChatIds.delete(id);
    manuallyAborted.delete(id);
  },

  getParentChatId: (subChatId: string) => parentChatIds.get(subChatId),

  getStreamId: (id: string) => streamIds.get(id),
  setStreamId: (id: string, streamId: string | null) => {
    streamIds.set(id, streamId);
  },

  setManuallyAborted: (id: string, aborted: boolean) => {
    manuallyAborted.set(id, aborted);
  },
  wasManuallyAborted: (id: string) => manuallyAborted.get(id) ?? false,
  clearManuallyAborted: (id: string) => {
    manuallyAborted.delete(id);
  },

  clear: () => {
    chats.clear();
    streamIds.clear();
    parentChatIds.clear();
    manuallyAborted.clear();
  },
};
