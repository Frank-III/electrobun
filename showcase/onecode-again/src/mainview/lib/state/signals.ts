/**
 * Pure SolidJS signals state management
 * 
 * This module replaces the Jotai-compatible layer with pure SolidJS patterns.
 * Instead of useAtomValue/useSetAtom, we export signals directly.
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
  createSignal, 
  createMemo, 
  batch,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js"
import { createStore, produce, type Store, type SetStoreFunction } from "solid-js/store"

// ============================================
// Types
// ============================================

export type SignalPair<T> = [Accessor<T>, Setter<T>]
export type StorePair<T> = [Store<T>, SetStoreFunction<T>]

// Storage type for createStoredSignal compatibility
export interface StorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  storage?: Storage
  getOnInit?: boolean
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

/**
 * Create a stored signal that persists to localStorage
 */
export function createStoredState<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
): SignalPair<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = typeof window !== "undefined" ? localStorage : undefined,
    getOnInit = true,
  } = options || {}

  // Initialize from storage or default
  const getInitial = (): T => {
    if (!getOnInit || !storage) return initialValue
    try {
      const stored = storage.getItem(key)
      if (stored !== null) {
        return deserialize(stored)
      }
    } catch (e) {
      console.warn(`[createStoredState] Failed to read ${key}:`, e)
    }
    return initialValue
  }

  const [value, setValue] = createSignal<T>(getInitial())

  // Wrap setter to persist to storage
  const setStoredValue: Setter<T> = (newValue: T | ((prev: T) => T)) => {
    const resolved = typeof newValue === "function" 
      ? (newValue as (prev: T) => T)(value()) 
      : newValue
    
    setValue(() => resolved)
    
    if (storage) {
      try {
        storage.setItem(key, serialize(resolved))
      } catch (e) {
        console.warn(`[createStoredState] Failed to write ${key}:`, e)
      }
    }
  }

  return [value, setStoredValue]
}

/**
 * Create a window-scoped stored signal (for multi-window apps)
 * Each window gets its own isolated state
 */
export function createWindowState<T>(
  key: string,
  initialValue: T,
  options?: Omit<StorageOptions<T>, "storage">
): SignalPair<T> {
  // Use sessionStorage for window-scoped state
  return createStoredState(key, initialValue, {
    ...options,
    storage: typeof window !== "undefined" ? sessionStorage : undefined,
  })
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

/**
 * Create a stored store that persists to localStorage
 */
export function createStoredAppStore<T extends object>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
): StorePair<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = typeof window !== "undefined" ? localStorage : undefined,
    getOnInit = true,
  } = options || {}

  // Initialize from storage
  const getInitial = (): T => {
    if (!getOnInit || !storage) return initialValue
    try {
      const stored = storage.getItem(key)
      if (stored !== null) {
        return deserialize(stored)
      }
    } catch (e) {
      console.warn(`[createStoredAppStore] Failed to read ${key}:`, e)
    }
    return initialValue
  }

  const [store, setStore] = createStore<T>(getInitial())

  // Wrap setter to persist changes
  const setStoredStore: SetStoreFunction<T> = (...args: any[]) => {
    // Apply the store update
    setStore(...args as Parameters<SetStoreFunction<T>>)
    
    // Persist to storage
    if (storage) {
      try {
        storage.setItem(key, serialize(store))
      } catch (e) {
        console.warn(`[createStoredAppStore] Failed to write ${key}:`, e)
      }
    }
  }

  return [store, setStoredStore]
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
