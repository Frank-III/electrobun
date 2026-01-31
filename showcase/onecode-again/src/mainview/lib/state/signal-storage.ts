/**
 * Persisted state: use makePersisted from @solid-primitives/storage directly.
 * This file only provides one thin helper for the common case (signal + key + storage).
 */

import { createRoot, createSignal, type Accessor, type Setter } from "solid-js"
import { makePersisted, type SyncStorage } from "@solid-primitives/storage"

export { makePersisted, type SyncStorage } from "@solid-primitives/storage"

export type SignalPair<T> = readonly [Accessor<T>, Setter<T>]

/** Persist a signal to storage. For stores, use makePersisted(createStore(...), { name, storage }) directly. */
export function createPersistedSignal<T>(
  key: string,
  initialValue: T,
  storage: SyncStorage = localStorage,
): SignalPair<T> {
  let signal!: SignalPair<T>
  createRoot(() => {
    const [value, setValue] = createSignal<T>(initialValue)
    makePersisted([value, setValue], {
      name: key,
      storage,
      serialize: (data) => JSON.stringify(data),
      deserialize: (data) => JSON.parse(data) as T,
    })
    signal = [value, setValue] as const
  })
  return signal
}
