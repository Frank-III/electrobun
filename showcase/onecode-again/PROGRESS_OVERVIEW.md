# How far are we? — Migration progress

**Project:** onecode-again (React/Electron/tRPC → SolidJS/Electrobun)  
**Last updated:** from current codebase scan

---

## High-level status

| Area | Status | Notes |
|------|--------|--------|
| **UI framework** | **SolidJS** | Mainview: **198 .tsx**, **0 .jsx**. Entry: `main.tsx` uses `solid-js/web`. All UI uses Solid (createSignal, createEffect, createMemo, Show, For). No React components; wdyr stubbed. |
| **Desktop IPC** | Done | **285** uses of `desktopRpc` / `getRpc()` across **63** mainview files. Electrobun RPC is the primary path. |
| **Diff view** | Done | Migrated from `@git-diff-view/react` to `@pierre/diffs` (vanilla API from Solid). No React diff dependency. |
| **Sub-chat store** | Done | `useAgentSubChatStore` fixed: no selector API; Solid store + `createMemo` for reactive slices. |
| **Queue processor** | Done | Uses Solid `createEffect` + store reads; `getState` added to message-queue and streaming-status stores. |
| **Debug logging** | Done | Noisy diff/transport logs gated behind `DEBUG_AGENTS_DIFF` / `DEBUG_AGENT_DIFF_VIEW`. |
| **React remnants** | Minimal | Only `Chat` from `@ai-sdk/react` + types from `ai` in chat layer (active-chat, use-chat-solid, agent-chat-store, transports). UI uses useChatSolid (Solid accessors). Backend uses Claude agent SDK. |
| **State (atoms)** | Intentional | **288** `atom[0]`/`atom[1]` usages in **57** files. Jotai-style API backed by Solid; migration to pure signals is optional/later. |
| **tRPC** | Legacy only | `lib/trpc.ts` and remote-trpc for web; no `trpc.useQuery` in mainview. Electrobun uses RPC. |

---

## What’s done (recent + overall)

1. **React → Solid UI**  
   - Mainview is TSX with Solid patterns (signals, effects, memos, Show, For).  
   - No `.jsx` in mainview.

2. **Electron → Electrobun IPC**  
   - Mainview talks to backend via `desktopRpc` / `getRpc()` (typed RPC).  
   - tRPC kept only for legacy/remote; not used for new desktop flows.

3. **Diff stack**  
   - `agent-diff-view.tsx` uses `@pierre/diffs` (FileDiff, parsePatchFiles) with Solid (ref + createEffect + onCleanup).  
   - No `@git-diff-view/react` in mainview.

4. **Stores**  
   - `useAgentSubChatStore()`: no selectors; use store + `createMemo` for reactive values.  
   - `useMessageQueueStore` / `useStreamingStatusStore`: `getState()` added and typed; queue-processor uses `createEffect` + store reads instead of non-existent `subscribe`.

5. **Cleanup**  
   - Verbose diff/transport logs behind flags.  
   - Store `getState` types: `MessageQueueStoreApi`, `StreamingStatusStoreApi`.

---

## What’s left (by priority)

### 1. React in chat (optional: remove last dependency)

| File | What |
|------|------|
| `active-chat.tsx` | `Chat` constructor from `@ai-sdk/react` (creates chat instances; UI uses useChatSolid) |
| `message-store.ts` | 1 comment reference |
| `wdyr.ts` | Stubbed (no React import); app is SolidJS. |

**Done:** useChat replaced by useChatSolid (Solid accessors); ChatDataSync removed; wdyr stubbed. **Optional:** Replace `new Chat(...)` + `ai` types with RPC-only chat layer (backend already uses Claude agent SDK).

### 2. Optional: atom → pure Solid

- **288** usages of `atom[0]` / `atom[1]` in **57** files.  
- Current atoms are implemented on top of Solid (`lib/state/jotai.ts`).  
- Migrating to pure `createSignal`/`createStore` is a large refactor; not required for “Solid app” or Electrobun.

### 3. Docs and polish

- `MIGRATION_PROGRESS.md`: phases are outdated; can be updated to match this overview.  
- `wdyr` stubbed; no React import in mainview.

---

## Quick metrics

| Metric | Count |
|--------|--------|
| Mainview `.tsx` files | 198 |
| Mainview `.jsx` files | 0 |
| Files using `desktopRpc` / `getRpc()` | 63 |
| React/usChat references in mainview | 16 (5 files) |
| Atom usages (atom[0]/[1]) | 288 (57 files) |

---

## Summary

- **UI:** **SolidJS.** Entry `main.tsx` uses `solid-js/web`; all mainview components use Solid (signals, effects, memos, Show, For). No React components; `wdyr.ts` stubbed (no React import).  
- **Desktop IPC:** Electrobun RPC (`desktopRpc` / `getRpc()`).  
- **Backend chat:** Claude agent SDK (`@anthropic-ai/claude-agent-sdk`) in `src/bun/chat-stream.ts`.  
- **Frontend chat:** Still uses `Chat` from `@ai-sdk/react` + types from `ai`; UI reactivity via useChatSolid (Solid accessors). Optional: replace with RPC-only chat layer.  
- **Atoms:** Optional migration; current setup is compatible with Solid.
