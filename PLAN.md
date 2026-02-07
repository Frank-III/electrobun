# Fix: Maximum Call Stack Size Exceeded (Reactivity Loop)

## Root Cause
Signal family setters read signals they're about to modify, creating circular dependencies:
`setter → reads signal → writes signal → triggers re-evaluation → setter again`

## Locations

### 1. `signal-map.ts:28-32` - `createKeyedSignalFamily`
```ts
const set = (value) => {
  const current = storage[0]()  // ← TRACKS storage
  // ...
  storage[1]({...current})       // ← WRITES storage → re-triggers
}
```
**Fix:** `untrack(() => storage[0]())`

### 2. `agents-store.ts:287-294` - `diffSidebarOpenAtomFamily.set`
```ts
const set = (value) => {
  const currentValue = get()  // ← TRACKS 3 signals via get()
  // ...
  diffSidebarOpenRuntimeAtom[1](...)   // ← WRITES
  diffSidebarOpenStorageAtom[1](...)   // ← WRITES
}
```
**Fix:** Wrap `get()` and both `[0]()` reads in `untrack()`

### 3. `agents-store.ts:645-654` - `planEditRefetchTriggerAtomFamily.set`
```ts
const set = (value) => {
  const current = planEditRefetchTriggerStorageAtom[0]()  // ← TRACKS
  // ...
  planEditRefetchTriggerStorageAtom[1](...)               // ← WRITES
}
```
**Fix:** `untrack(() => planEditRefetchTriggerStorageAtom[0]())`

## Implementation

1. Import `untrack` from solid-js
2. Wrap all signal reads inside setters with `untrack()`
3. Test diff sidebar toggle + plan file edits

## Pattern to Apply
```ts
// Before
const set = (value) => {
  const current = someSignal[0]()
  someSignal[1]({ ...current, [key]: newVal })
}

// After
const set = (value) => {
  const current = untrack(() => someSignal[0]())
  someSignal[1]({ ...current, [key]: newVal })
}
```

## Files to Edit
- `src/mainview/lib/state/signal-map.ts` (1 untrack)
- `src/mainview/lib/state/agents-store.ts` (2 locations, ~4 untracks)
