import { createRoot, createSignal, type Accessor, type Setter } from "solid-js"
import { makePersisted, type SyncStorage } from "@solid-primitives/storage"

export type SignalPair<T> = readonly [Accessor<T>, Setter<T>]

export function createStoredSignal<T>(
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
