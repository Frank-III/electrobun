import { createStore, produce } from "solid-js/store"

export type StreamingStatus = "ready" | "streaming" | "submitted" | "error"

interface StreamingStatusState {
  statuses: Record<string, StreamingStatus>
}

const [store, setStore] = createStore<StreamingStatusState>({
  statuses: {},
})

function _useStreamingStatusStore() {
  return {
    get statuses() { return store.statuses },

    setStatus: (subChatId: string, status: StreamingStatus) => {
      setStore("statuses", subChatId, status)
    },

    getStatus: (subChatId: string): StreamingStatus => {
      return store.statuses[subChatId] ?? "ready"
    },

    isStreaming: (subChatId: string): boolean => {
      const status = store.statuses[subChatId] ?? "ready"
      return status === "streaming" || status === "submitted"
    },

    clearStatus: (subChatId: string) => {
      setStore(produce((state) => {
        delete state.statuses[subChatId]
      }))
    },

    getReadySubChats: (): string[] => {
      return Object.entries(store.statuses)
        .filter(([_, status]) => status === "ready")
        .map(([subChatId]) => subChatId)
    },
  }
}

// For direct state access (e.g., from other stores or effects)
export function getStreamingStatusState() {
  return store
}

// Return type for hook and getState (for TypeScript augmentation)
export type StreamingStatusStoreApi = ReturnType<typeof _useStreamingStatusStore>

// Zustand-compatible getState() for imperative access (e.g. QueueProcessor)
type UseStreamingStatusStoreWithGetState = typeof _useStreamingStatusStore & { getState(): StreamingStatusStoreApi }
export const useStreamingStatusStore: UseStreamingStatusStoreWithGetState = Object.assign(_useStreamingStatusStore, {
  getState: (): StreamingStatusStoreApi => ({
    get statuses() {
      return store.statuses
    },
    setStatus: (subChatId: string, status: StreamingStatus) => {
      setStore("statuses", subChatId, status)
    },
    getStatus: (subChatId: string): StreamingStatus => store.statuses[subChatId] ?? "ready",
    isStreaming: (subChatId: string): boolean => {
      const status = store.statuses[subChatId] ?? "ready"
      return status === "streaming" || status === "submitted"
    },
    clearStatus: (subChatId: string) => {
      setStore(produce((state) => {
        delete state.statuses[subChatId]
      }))
    },
    getReadySubChats: (): string[] => {
      return Object.entries(store.statuses)
        .filter(([_, status]) => status === "ready")
        .map(([subChatId]) => subChatId)
    },
  }),
})
