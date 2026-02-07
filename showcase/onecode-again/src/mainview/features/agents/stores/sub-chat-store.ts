import { createStore, produce } from "solid-js/store"
import { useMessageQueueStore } from "./message-queue-store"
import { useStreamingStatusStore } from "./streaming-status-store"
import { agentChatStore } from "./agent-chat-store"
import { getWindowId } from "../../../contexts/WindowContext"

export interface SubChatMeta {
  id: string
  name: string
  created_at?: string
  updated_at?: string
  mode?: "plan" | "agent"
}

interface AgentSubChatState {
  chatId: string | null
  activeSubChatId: string | null
  openSubChatIds: string[]
  pinnedSubChatIds: string[]
  allSubChats: SubChatMeta[]
}

// localStorage helpers
const getStorageKey = (chatId: string, type: "open" | "active" | "pinned") =>
  `${getWindowId()}:agent-${type}-sub-chats-${chatId}`

const getLegacyStorageKey = (chatId: string, type: "open" | "active" | "pinned") =>
  `agent-${type}-sub-chats-${chatId}`

// Custom event for notifying other components
export const OPEN_SUB_CHATS_CHANGE_EVENT = "open-sub-chats-change"

let openSubChatsChangeTimer: ReturnType<typeof setTimeout> | null = null

const saveToLS = (chatId: string, type: "open" | "active" | "pinned", value: unknown) => {
  if (typeof window === "undefined") return
  localStorage.setItem(getStorageKey(chatId, type), JSON.stringify(value))
  if (type === "open") {
    if (openSubChatsChangeTimer) clearTimeout(openSubChatsChangeTimer)
    openSubChatsChangeTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent(OPEN_SUB_CHATS_CHANGE_EVENT))
      openSubChatsChangeTimer = null
    }, 50)
  }
}

const findNumericWindowIdValue = (legacyKey: string, targetKey: string): string | null => {
  if (!targetKey.startsWith("main:")) return null

  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i)
    if (!storageKey) continue

    const match = storageKey.match(/^(\d+):(.+)$/)
    if (match && match[2] === legacyKey) {
      const value = localStorage.getItem(storageKey)
      if (value !== null) {
        console.log(`[SubChatStore] Migrated from numeric ID: ${storageKey} to ${targetKey}`)
        return value
      }
    }
  }
  return null
}

const loadFromLS = <T>(chatId: string, type: "open" | "active" | "pinned", fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    const key = getStorageKey(chatId, type)
    let stored = localStorage.getItem(key)

    if (stored === null) {
      const legacyKey = getLegacyStorageKey(chatId, type)
      const numericValue = findNumericWindowIdValue(legacyKey, key)
      if (numericValue !== null) {
        localStorage.setItem(key, numericValue)
        stored = numericValue
      }
    }

    if (stored === null) {
      const legacyKey = getLegacyStorageKey(chatId, type)
      const legacyStored = localStorage.getItem(legacyKey)
      if (legacyStored !== null) {
        localStorage.setItem(key, legacyStored)
        stored = legacyStored
        console.log(`[SubChatStore] Migrated ${legacyKey} to ${key}`)
      }
    }

    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

const [store, setStore] = createStore<AgentSubChatState>({
  chatId: null,
  activeSubChatId: null,
  openSubChatIds: [],
  pinnedSubChatIds: [],
  allSubChats: [],
})

// Actions object for imperative access (like getState() pattern)
const actions = {
  setChatId: (chatId: string | null) => {
    // Idempotence for null as well: avoid clearing state repeatedly when
    // callers re-emit "no chat selected" during route/layout transitions.
    if (!chatId && store.chatId === null) {
      return
    }

    // Idempotence: callers may invoke setChatId multiple times during routing/mount
    // (e.g., layout + chat view initialization). Re-applying the same chatId would
    // wipe `allSubChats` and can reset active/open state back to localStorage values.
    // Bail early when the chatId is already active.
    if (chatId && store.chatId === chatId) {
      return
    }
    if (!chatId) {
      setStore({
        chatId: null,
        activeSubChatId: null,
        openSubChatIds: [],
        pinnedSubChatIds: [],
        allSubChats: [],
      })
      return
    }

    const openSubChatIds = loadFromLS<string[]>(chatId, "open", [])
    const activeSubChatId = loadFromLS<string | null>(chatId, "active", null)
    const pinnedSubChatIds = loadFromLS<string[]>(chatId, "pinned", [])

    setStore({ chatId, openSubChatIds, activeSubChatId, pinnedSubChatIds, allSubChats: [] })
  },

  setActiveSubChat: (subChatId: string) => {
    const chatId = store.chatId
    setStore("activeSubChatId", subChatId)
    if (chatId) saveToLS(chatId, "active", subChatId)
  },

  setOpenSubChats: (subChatIds: string[]) => {
    const chatId = store.chatId
    setStore("openSubChatIds", subChatIds)
    if (chatId) saveToLS(chatId, "open", subChatIds)
  },

  addToOpenSubChats: (subChatId: string) => {
    if (store.openSubChatIds.includes(subChatId)) return
    const newIds = [...store.openSubChatIds, subChatId]
    setStore("openSubChatIds", newIds)
    if (store.chatId) saveToLS(store.chatId, "open", newIds)
  },

  removeFromOpenSubChats: (subChatId: string) => {
    const newIds = store.openSubChatIds.filter((id) => id !== subChatId)
    let newActive = store.activeSubChatId
    if (store.activeSubChatId === subChatId) {
      newActive = newIds[newIds.length - 1] || null
    }

    setStore({ openSubChatIds: newIds, activeSubChatId: newActive })
    if (store.chatId) {
      saveToLS(store.chatId, "open", newIds)
      saveToLS(store.chatId, "active", newActive)
    }

    // Cleanup
    useMessageQueueStore().clearQueue(subChatId)
    useStreamingStatusStore().clearStatus(subChatId)
    agentChatStore.delete(subChatId)
  },

  togglePinSubChat: (subChatId: string) => {
    const newPinnedIds = store.pinnedSubChatIds.includes(subChatId)
      ? store.pinnedSubChatIds.filter((id) => id !== subChatId)
      : [...store.pinnedSubChatIds, subChatId]
    
    setStore("pinnedSubChatIds", newPinnedIds)
    if (store.chatId) saveToLS(store.chatId, "pinned", newPinnedIds)
  },

  setAllSubChats: (subChats: SubChatMeta[]) => {
    setStore("allSubChats", subChats)
  },

  addToAllSubChats: (subChat: SubChatMeta) => {
    if (store.allSubChats.some((sc) => sc.id === subChat.id)) return
    setStore("allSubChats", [...store.allSubChats, subChat])
  },

  updateSubChatName: (subChatId: string, name: string) => {
    setStore("allSubChats", (sc) => sc.id === subChatId, "name", name)
  },

  updateSubChatMode: (subChatId: string, mode: "plan" | "agent") => {
    setStore("allSubChats", (sc) => sc.id === subChatId, "mode", mode)
  },

  updateSubChatTimestamp: (subChatId: string) => {
    const newTimestamp = new Date().toISOString()
    setStore("allSubChats", (sc) => sc.id === subChatId, "updated_at", newTimestamp)
  },

  reset: () => {
    setStore({
      chatId: null,
      activeSubChatId: null,
      openSubChatIds: [],
      pinnedSubChatIds: [],
      allSubChats: [],
    })
  },
}

// Hook-style accessor (for use in components)
export function useAgentSubChatStore() {
  return {
    get chatId() { return store.chatId },
    get activeSubChatId() { return store.activeSubChatId },
    get openSubChatIds() { return store.openSubChatIds },
    get pinnedSubChatIds() { return store.pinnedSubChatIds },
    get allSubChats() { return store.allSubChats },
    ...actions,
  }
}

// Zustand-compatible getState() for imperative access
useAgentSubChatStore.getState = () => ({
  chatId: store.chatId,
  activeSubChatId: store.activeSubChatId,
  openSubChatIds: store.openSubChatIds,
  pinnedSubChatIds: store.pinnedSubChatIds,
  allSubChats: store.allSubChats,
  ...actions,
})

// Direct store access for fine-grained subscriptions
export function getAgentSubChatState() {
  return store
}
