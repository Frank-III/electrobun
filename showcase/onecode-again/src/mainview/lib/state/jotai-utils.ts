import type { Atom, SignalPair } from "./store"

export type StorageLike<T> = {
  getItem: (key: string) => T | null
  setItem: (key: string, value: T) => void
  removeItem: (key: string) => void
}

export function createJSONStorage<T>(getStorage: () => Storage): StorageLike<T> {
  return {
    getItem: (key) => {
      try {
        const raw = getStorage().getItem(key)
        return raw ? (JSON.parse(raw) as T) : null
      } catch {
        return null
      }
    },
    setItem: (key, value) => {
      try {
        getStorage().setItem(key, JSON.stringify(value))
      } catch {}
    },
    removeItem: (key) => {
      try {
        getStorage().removeItem(key)
      } catch {}
    },
  }
}

export function atomFamily<P, T>(init: (param: P) => Atom<T> | SignalPair<T>) {
  const map = new Map<P, Atom<T> | SignalPair<T>>()
  return (param: P) => {
    if (!map.has(param)) map.set(param, init(param))
    return map.get(param)!
  }
}
