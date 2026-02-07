/**
 * Remote API - wrapper around Electrobun RPC for chat operations
 * Originally used tRPC for web backend, now uses local Electrobun RPC
 */
import { desktopRpc } from "./desktop-rpc"

// Re-export types for convenience
export type Team = {
  id: string
  name: string
  slug?: string
}

export type RemoteChat = {
  id: string
  name: string
  sandbox_id: string | null
  worktreePath?: string | null
  projectId?: string | null
  projectPath?: string | null
  meta: {
    repository?: string
    branch?: string | null
    originalSandboxId?: string | null
    isQuickSetup?: boolean
    isPublicImport?: boolean
  } | null
  created_at: string
  updated_at: string
  stats: { fileCount: number; additions: number; deletions: number } | null
}

export type RemoteSubChat = {
  id: string
  name: string
  mode: string
  messages: unknown[]
  stream_id: string | null
  created_at: string
  updated_at: string
}

export type RemoteChatWithSubChats = RemoteChat & {
  subChats: RemoteSubChat[]
}

// API base URL - dynamically fetched from main process (for sandbox operations)
let API_BASE: string | null = null

async function getApiBase(): Promise<string> {
  if (!API_BASE) {
    API_BASE = await window.desktopApi?.getApiBaseUrl?.() || "https://21st.dev"
  }
  return API_BASE
}

// Helper to convert date to ISO string
function toISOString(date: string | number | Date | null | undefined): string {
  if (!date) return new Date().toISOString()
  if (typeof date === "string") return date
  if (typeof date === "number") return new Date(date).toISOString()
  return date.toISOString()
}

export const remoteApi = {
  /**
   * Fetch user's teams - desktop mode has no teams, returns empty
   */
  async getTeams(): Promise<Team[]> {
    // Desktop mode doesn't have team concept
    return []
  },

  /**
   * Fetch all agent chats - uses local Electrobun RPC
   */
  async getAgentChats(_teamId: string): Promise<RemoteChat[]> {
    const chats = await desktopRpc.chats.list.query()
    return chats.map((chat) => ({
      id: chat.id,
      name: chat.name || "Untitled",
      sandbox_id: null,
      worktreePath: chat.worktreePath ?? null,
      projectId: chat.projectId ?? null,
      projectPath: null,
      meta: {
        repository: chat.branch ? `${chat.projectId}` : undefined,
        branch: chat.branch,
      },
      created_at: toISOString(chat.createdAt),
      updated_at: toISOString(chat.updatedAt),
      stats: null,
    }))
  },

  /**
   * Fetch a single agent chat with all sub-chats - uses local Electrobun RPC
   */
  async getAgentChat(chatId: string): Promise<RemoteChatWithSubChats> {
    const chat = await desktopRpc.chats.get({ id: chatId })
    if (!chat) {
      throw new Error(`Chat not found: ${chatId}`)
    }

    // Parse subChats from the chat response
    const subChats = (chat.subChats || []).map((sc) => ({
      id: sc.id,
      name: sc.name || "Untitled",
      mode: sc.mode,
      messages: typeof sc.messages === "string" ? JSON.parse(sc.messages) : (sc.messages || []),
      stream_id: sc.streamId ?? null,
      created_at: toISOString(sc.createdAt),
      updated_at: toISOString(sc.updatedAt),
    }))

    return {
      id: chat.id,
      name: chat.name || "Untitled",
      sandbox_id: null,
      worktreePath: chat.worktreePath ?? chat.project?.path ?? null,
      projectId: chat.projectId ?? null,
      projectPath: chat.project?.path ?? null,
      meta: {
        repository: chat.branch ? `${chat.projectId}` : undefined,
        branch: chat.branch,
      },
      created_at: toISOString(chat.createdAt),
      updated_at: toISOString(chat.updatedAt),
      stats: null,
      subChats,
    }
  },

  /**
   * Fetch archived chats - uses local Electrobun RPC
   */
  async getArchivedChats(_teamId: string): Promise<RemoteChat[]> {
    const chats = await desktopRpc.chats.listArchived.query()
    return chats.map((chat) => ({
      id: chat.id,
      name: chat.name || "Untitled",
      sandbox_id: null,
      worktreePath: chat.worktreePath ?? null,
      projectId: chat.projectId ?? null,
      projectPath: null,
      meta: {
        repository: chat.branch ? `${chat.projectId}` : undefined,
        branch: chat.branch,
      },
      created_at: toISOString(chat.createdAt),
      updated_at: toISOString(chat.updatedAt),
      stats: null,
    }))
  },

  /**
   * Archive a chat - uses local Electrobun RPC
   */
  async archiveChat(chatId: string): Promise<void> {
    await desktopRpc.chats.archive.mutate({ id: chatId })
  },

  /**
   * Archive multiple chats at once - uses local Electrobun RPC
   */
  async archiveChatsBatch(chatIds: string[]): Promise<{ archivedCount: number }> {
    const result = await desktopRpc.chats.archiveBatch.mutate({ chatIds })
    // archiveBatch returns the archived chats array
    return { archivedCount: Array.isArray(result) ? result.length : chatIds.length }
  },

  /**
   * Restore a chat from archive - uses local Electrobun RPC
   */
  async restoreChat(chatId: string): Promise<void> {
    await desktopRpc.chats.restore.mutate({ id: chatId })
  },

  /**
   * Rename a sub-chat - uses local Electrobun RPC
   */
  async renameSubChat(subChatId: string, name: string): Promise<void> {
    await desktopRpc.chats.renameSubChat.mutate({ id: subChatId, name })
  },

  /**
   * Rename a chat (workspace) - uses local Electrobun RPC
   */
  async renameChat(chatId: string, name: string): Promise<void> {
    await desktopRpc.chats.rename.mutate({ id: chatId, name })
  },

  /**
   * Get diff from a sandbox (via REST endpoint with signedFetch)
   * This is only used for remote sandbox operations
   */
  async getSandboxDiff(sandboxId: string): Promise<{ diff: string }> {
    if (!window.desktopApi?.signedFetch) {
      throw new Error("Desktop API not available")
    }
    const apiBase = await getApiBase()
    const response = await window.desktopApi.signedFetch(
      `${apiBase}/api/agents/sandbox/${sandboxId}/diff`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch diff: ${response.status}`)
    }
    const result = await response.json() as { diff: string }
    return result
  },

  /**
   * Get file content from a sandbox (via REST endpoint with signedFetch)
   * This is only used for remote sandbox operations
   */
  async getSandboxFile(sandboxId: string, path: string): Promise<{ content: string }> {
    if (!window.desktopApi?.signedFetch) {
      throw new Error("Desktop API not available")
    }
    const apiBase = await getApiBase()
    const response = await window.desktopApi.signedFetch(
      `${apiBase}/api/agents/sandbox/${sandboxId}/files?path=${encodeURIComponent(path)}`
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }
    const result = await response.json() as { content: string }
    return result
  },
}
