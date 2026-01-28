import { createStore, produce } from "solid-js/store"
import type { AgentQueueItem } from "../lib/queue-utils"
import { removeQueueItem } from "../lib/queue-utils"

// Empty array constant to avoid creating new arrays on each call
export const EMPTY_QUEUE: AgentQueueItem[] = []

interface MessageQueueState {
  queues: Record<string, AgentQueueItem[]>
}

const [store, setStore] = createStore<MessageQueueState>({
  queues: {},
})

export function useMessageQueueStore() {
  return {
    get queues() { return store.queues },

    addToQueue: (subChatId: string, item: AgentQueueItem) => {
      setStore("queues", subChatId, (current) => [...(current || []), item])
    },

    removeFromQueue: (subChatId: string, itemId: string) => {
      setStore("queues", subChatId, (current) => removeQueueItem(current || [], itemId))
    },

    getQueue: (subChatId: string): AgentQueueItem[] => {
      return store.queues[subChatId] ?? EMPTY_QUEUE
    },

    getNextItem: (subChatId: string): AgentQueueItem | null => {
      const queue = store.queues[subChatId] || []
      return queue.find((item) => item.status === "pending") || null
    },

    clearQueue: (subChatId: string) => {
      setStore("queues", subChatId, [])
    },

    // Atomic pop: find and remove in single update
    popItem: (subChatId: string, itemId: string): AgentQueueItem | null => {
      const currentQueue = store.queues[subChatId] || []
      const foundItem = currentQueue.find((i) => i.id === itemId) || null
      if (foundItem) {
        setStore("queues", subChatId, (current) => (current || []).filter((i) => i.id !== itemId))
      }
      return foundItem
    },

    // Add item to front of queue (used for error recovery)
    prependItem: (subChatId: string, item: AgentQueueItem) => {
      setStore("queues", subChatId, (current) => [item, ...(current || [])])
    },
  }
}

// For direct state access
export function getMessageQueueState() {
  return store
}
