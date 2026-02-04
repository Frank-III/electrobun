/**
 * tRPC client for remote web backend (21st.dev)
 * Uses signedFetch via IPC for authentication (no CORS issues)
 */
import { createTRPCClient, httpLink, type TRPCClientErrorLike } from "@trpc/client"
import SuperJSON from "superjson"

// Placeholder URL - actual base is fetched dynamically from main process
const TRPC_PLACEHOLDER = "/__dynamic__/api/trpc"

// Cache the API base URL after first fetch
let cachedApiBase: string | null = null

async function getApiBase(): Promise<string> {
  if (!cachedApiBase) {
    cachedApiBase = await window.desktopApi?.getApiBaseUrl() || "https://21st.dev"
  }
  return cachedApiBase
}

/**
 * Custom fetch that goes through Electron IPC
 * Automatically adds auth token and bypasses CORS
 * Replaces placeholder URL with actual API base from env
 */
async function signedFetchImpl(input: URL | RequestInfo, init?: RequestInit): Promise<Response> {
  if (typeof window === "undefined" || !window.desktopApi?.signedFetch) {
    throw new Error("Desktop API not available")
  }

  let url = typeof input === "string" ? input : input.toString()

  // Replace placeholder with actual API base
  if (url.startsWith("/__dynamic__")) {
    const apiBase = await getApiBase()
    url = url.replace("/__dynamic__", apiBase)
  }

  // signedFetch returns a standard Response object
  const response = await window.desktopApi.signedFetch(url, {
    method: init?.method,
    body: init?.body as BodyInit | undefined,
    headers: init?.headers as HeadersInit | undefined,
  })

  return response
}

// Type-safe procedure result types for the remote API
type QueryProcedure<TInput, TOutput> = {
  query: (input: TInput) => Promise<TOutput>
}
type MutationProcedure<TInput, TOutput> = {
  mutate: (input: TInput) => Promise<TOutput>
}

// Stub type for the remote tRPC router shape we use
// This mirrors the actual API structure without importing the web backend
interface RemoteTrpcClient {
  teams: {
    getUserTeams: QueryProcedure<void, Array<{ id: string; name: string }>>
  }
  agents: {
    getAgentChats: QueryProcedure<{ teamId: string }, unknown[]>
    getAgentChat: QueryProcedure<{ chatId: string }, unknown>
    getArchivedChats: QueryProcedure<{ teamId: string }, unknown[]>
    archiveChat: MutationProcedure<{ chatId: string }, void>
    archiveChatsBatch: MutationProcedure<{ chatIds: string[] }, { archivedCount: number }>
    restoreChat: MutationProcedure<{ chatId: string }, void>
    renameSubChat: MutationProcedure<{ subChatId: string; name: string }, void>
    renameChat: MutationProcedure<{ chatId: string; name: string }, void>
  }
}

/**
 * tRPC client connected to web backend
 * Fully typed, handles superjson automatically
 * Note: Uses type assertion because the actual AppRouter type is in the web backend
 */
export const remoteTrpc: RemoteTrpcClient = createTRPCClient({
  links: [
    httpLink({
      url: TRPC_PLACEHOLDER,
      fetch: signedFetchImpl,
      transformer: SuperJSON,
    }),
  ],
}) as unknown as RemoteTrpcClient
