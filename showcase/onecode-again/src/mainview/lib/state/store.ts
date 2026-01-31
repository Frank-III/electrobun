import {
  createMemo,
  createRoot,
  createSignal,
  createEffect,
  type Accessor,
  type Setter,
  type ParentProps,
} from "solid-js"

export type Atom<T> = {
  init?: T
  read?: (get: Getter) => T
  write?: (get: Getter, set: SetterFn, update: unknown) => void
}

export type SignalPair<T> = readonly [Accessor<T>, Setter<T>]

export type Getter = <T>(atom: Atom<T> | SignalPair<T>) => T
export type SetterFn = <T>(atom: Atom<T> | SignalPair<T>, value: T | ((prev: T) => T)) => void

type AtomState<T> = {
  signal?: [Accessor<T>, Setter<T>]
  memo?: Accessor<T>
}

const atomState = new WeakMap<Atom<unknown>, AtomState<unknown>>()

function isSignalPair<T>(value: Atom<T> | SignalPair<T>): value is SignalPair<T> {
  return Array.isArray(value) && value.length >= 2 && typeof value[0] === "function"
}

function ensureState<T>(atom: Atom<T>): AtomState<T> {
  const existing = atomState.get(atom) as AtomState<T> | undefined
  if (existing) return existing
  const state: AtomState<T> = {}
  if (!atom.read) {
    state.signal = createSignal(atom.init as T)
  }
  atomState.set(atom, state as AtomState<unknown>)
  return state
}

export function atom<T>(init: T): Atom<T>
export function atom<T>(read: (get: Getter) => T, write?: (get: Getter, set: SetterFn, update: unknown) => void): Atom<T>
export function atom<T>(initOrRead: T | ((get: Getter) => T), write?: (get: Getter, set: SetterFn, update: unknown) => void): Atom<T> {
  if (typeof initOrRead === "function") {
    return { read: initOrRead as (get: Getter) => T, write }
  }
  return { init: initOrRead as T }
}

export function getAtomValue<T>(atomRef: Atom<T> | SignalPair<T>): T {
  if (isSignalPair(atomRef)) {
    return atomRef[0]()
  }
  const state = ensureState(atomRef)
  if (atomRef.read) {
    if (!state.memo) {
      state.memo = createMemo(() => atomRef.read!(getAtomValue))
    }
    return state.memo()
  }
  return state.signal![0]()
}

export function setAtomValue<T>(atomRef: Atom<T> | SignalPair<T>, value: T | ((prev: T) => T)) {
  if (isSignalPair(atomRef)) {
    const setter = atomRef[1]
    if (typeof value === "function") {
      setter(value as (prev: T) => T)
    } else {
      setter(value)
    }
    return
  }
  const state = ensureState(atomRef)
  if (atomRef.write) {
    return atomRef.write(getAtomValue, setAtomValue, value)
  }
  const setter = state.signal![1]
  if (typeof value === "function") {
    setter(value as (prev: T) => T)
  } else {
    setter(value)
  }
}

export function useAtom<T>(
  atomRef: Atom<T> | SignalPair<T>,
): [Accessor<T>, (value: T | ((prev: T) => T)) => void] {
  if (isSignalPair(atomRef)) {
    return [atomRef[0], atomRef[1]]
  }
  return [() => getAtomValue(atomRef), (value) => setAtomValue(atomRef, value)]
}

export function useAtomValue<T>(atomRef: Atom<T> | SignalPair<T>): Accessor<T> {
  if (isSignalPair(atomRef)) {
    return atomRef[0]
  }
  return () => getAtomValue(atomRef)
}

export function useSetAtom<T>(atomRef: Atom<T> | SignalPair<T>): (value: T | ((prev: T) => T)) => void {
  if (isSignalPair(atomRef)) {
    return atomRef[1]
  }
  return (value) => setAtomValue(atomRef, value)
}

export type Store = {
  get: typeof getAtomValue
  set: typeof setAtomValue
  sub: <T>(atomRef: Atom<T>, callback: () => void) => () => void
}

export function createStore(): Store {
  return {
    get: getAtomValue,
    set: setAtomValue,
    sub<T>(atomRef: Atom<T>, callback: () => void) {
      let dispose: (() => void) | undefined
      createRoot((d) => {
        dispose = d
        createEffect(() => {
          getAtomValue(atomRef)
          callback()
        })
      })
      return () => dispose?.()
    },
  }
}

export function Provider(props: ParentProps) {
  return props.children
}
