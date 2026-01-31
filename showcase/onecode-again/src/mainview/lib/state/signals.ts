/**
 * Pure SolidJS signals state management
 * 
 * This module replaces the Jotai-compatible layer with pure SolidJS patterns.
 * Instead of useAtomValue/we export signals directly.
 * 
 * Usage:
 *   // Before (Jotai-like)
 *   const count = useAtomValue(countAtom)
 *   const setCount = useSetAtom(countAtom)
 *   
 *   // After (SolidJS)
 *   const [count, setCount] = useCount()
 *   // or with direct imports:
 *   import { count } from "./state/atoms"
 *   // In JSX: {count()}
 *   // To update: setCount(5)
 */

import { 
  createRoot,
  createSignal, 
  createMemo, 
  batch,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js"
import { createStore, produce, type Store, type SetStoreFunction } from "solid-js/store"
import { makePersisted } from "@solid-primitives/storage"
import { createPersistedSignal } from "./signal-storage"
import { makeWindowPersistedSignal } from "../window-storage"

// ============================================
// Types
// ============================================

export type SignalPair<T> = [Accessor<T>, Setter<T>]
export type StorePair<T> = [Store<T>, SetStoreFunction<T>]

export interface StorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  storage?: Storage
}

// ============================================
// Signal Factory Functions
// ============================================

/**
 * Create a simple signal with optional default value
 */
export function createState<T>(initialValue: T): SignalPair<T> {
  return createSignal(initialValue)
}

/** Persist to localStorage. Thin wrapper over createPersistedSignal. */
export function createStoredState<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
): SignalPair<T> {
  const storage = options?.storage ?? (typeof window !== "undefined" ? localStorage : undefined)
  if (!storage) return createSignal<T>(initialValue) as SignalPair<T>
  return createPersistedSignal(key, initialValue, storage as import("@solid-primitives/storage").SyncStorage) as SignalPair<T>
}

/** Persist to window-scoped storage. Thin wrapper over makeWindowPersistedSignal. */
export function createWindowState<T>(
  key: string,
  initialValue: T,
  _options?: Omit<StorageOptions<T>, "storage">
): SignalPair<T> {
  if (typeof window === "undefined") return createSignal<T>(initialValue) as SignalPair<T>
  return makeWindowPersistedSignal(key, initialValue) as SignalPair<T>
}

// ============================================
// Store Factory Functions
// ============================================

/**
 * Create a reactive store for complex/nested state
 */
export function createAppStore<T extends object>(initialValue: T): StorePair<T> {
  return createStore(initialValue)
}

/** Persist a store. Thin wrapper over makePersisted(createStore(...)). */
export function createStoredAppStore<T extends object>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
): StorePair<T> {
  const storage = options?.storage ?? (typeof window !== "undefined" ? localStorage : undefined)
  if (!storage) return createStore(initialValue) as StorePair<T>
  let pair!: StorePair<T>
  createRoot(() => {
    const [store, setStore] = makePersisted(createStore(initialValue), {
      name: key,
      storage,
      serialize: (d: T) => JSON.stringify(d),
      deserialize: (s: string) => ({ ...initialValue, ...JSON.parse(s) } as T),
    })
    pair = [store, setStore]
  })
  return pair
}

// ============================================
// Derived State Helpers
// ============================================

/**
 * Create a memoized derived value from signals
 */
export function createDerived<T>(fn: () => T): Accessor<T> {
  return createMemo(fn)
}

/**
 * Batch multiple state updates together
 */
export { batch }

/**
 * Immer-like produce for stores
 */
export { produce }

// ============================================
// Helper Hooks/Functions
// ============================================

/**
 * Toggle a boolean signal
 */
export function createToggle(initial = false): SignalPair<boolean> & { toggle: () => void } {
  const [value, setValue] = createSignal(initial)
  
  const toggle = () => setValue(v => !v)
  
  return [value, setValue, toggle] as any
}

/**
 * Create a counter signal
 */
export function createCounter(initial = 0): SignalPair<number> & { 
  increment: () => void
  decrement: () => void
} {
  const [value, setValue] = createSignal(initial)
  
  const increment = () => setValue(v => v + 1)
  const decrement = () => setValue(v => v - 1)
  
  return [value, setValue, increment, decrement] as any
}

// ============================================
// Keyed State Families
// ============================================

/**
 * Create a family of signals keyed by an identifier
 * Useful for per-entity state (e.g., state per chatId)
 */
export function createKeyedStateFamily<K extends string | number, T>(
  defaultValue: T
): {
  get: (key: K) => SignalPair<T>
  getValue: (key: K) => Accessor<T>
  setValue: (key: K, value: T | ((prev: T) => T)) => void
  remove: (key: K) => void
} {
  const signals = new Map<K, SignalPair<T>>()

  const get = (key: K): SignalPair<T> => {
    if (!signals.has(key)) {
      signals.set(key, createSignal<T>(defaultValue))
    }
    return signals.get(key)!
  }

  const getValue = (key: K): Accessor<T> => get(key)[0]
  
  const setValue = (key: K, value: T | ((prev: T) => T)) => {
    const [, setter] = get(key)
    setter(value)
  }

  const remove = (key: K) => {
    signals.delete(key)
  }

  return { get, getValue, setValue, remove }
}

/**
 * Create a family of stored signals keyed by an identifier
 */
export function createStoredKeyedStateFamily<K extends string | number, T>(
  baseKey: string,
  defaultValue: T,
  options?: StorageOptions<T>
): {
  get: (key: K) => SignalPair<T>
  getValue: (key: K) => Accessor<T>
  setValue: (key: K, value: T | ((prev: T) => T)) => void
  remove: (key: K) => void
} {
  const signals = new Map<K, SignalPair<T>>()

  const get = (key: K): SignalPair<T> => {
    if (!signals.has(key)) {
      const storageKey = `${baseKey}:${key}`
      signals.set(key, createStoredState<T>(storageKey, defaultValue, options))
    }
    return signals.get(key)!
  }

  const getValue = (key: K): Accessor<T> => get(key)[0]
  
  const setValue = (key: K, value: T | ((prev: T) => T)) => {
    const [, setter] = get(key)
    setter(value)
  }

  const remove = (key: K) => {
    signals.delete(key)
  }

  return { get, getValue, setValue, remove }
}
