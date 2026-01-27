import { ReactiveMap } from "@solid-primitives/map"

export type SignalPair<T> = readonly [() => T, (value: T | ((prev: T) => T)) => void]

export type SignalFamily<T> = ((key: string) => SignalPair<T>) & { delete: (key: string) => void }

export function createSignalMap<T>(init: (key: string) => SignalPair<T>): SignalFamily<T> {
  const map = new ReactiveMap<string, SignalPair<T>>()
  const family = ((key: string) => {
    const existing = map.get(key)
    if (existing) return existing
    const created = init(key)
    map.set(key, created)
    return created
  }) as SignalFamily<T>
  family.delete = (key: string) => {
    map.delete(key)
  }
  return family
}

export function createKeyedSignalFamily<T>(
  storage: SignalPair<Record<string, T>>,
  fallback: T
): SignalFamily<T> {
  return createSignalMap((id) => {
    const get = () => storage[0]()[id] ?? fallback
    const set = (value: T | ((prev: T) => T)) => {
      const current = storage[0]()
      const prev = current[id] ?? fallback
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value
      storage[1]({ ...current, [id]: next })
    }
    return [get, set] as const
  })
}
