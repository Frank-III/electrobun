# Why Electrobun RPC, Not tRPC

On **Electrobun**, the main process is Bun and the renderer talks to it via **Electrobun’s built-in RPC** (rpc-anywhere over WebSocket). There is no Electron IPC and no tRPC server.

- **Electrobun main** (`src/bun/index.ts`) exposes the API via `BrowserView.defineRPC<AppRPC>({ handlers: { requests: { projectsList, chatsList, ... } } })`.
- **Renderer** gets the client from `window.rpc.request` (see `mainview/lib/rpc.ts` → `getRpc()`). All procedure-style calls (projects, chats, files, etc.) should go through this RPC client.

**tRPC** (`@trpc/react-query`, `trpc-electron`, `trpcClient`) was used in the **Electron** version of the app (legacy main in `src/bun/legacy/`), where the main process ran a tRPC server over `ipcMain`/`ipcRenderer`. On Electrobun that stack does not run; the only transport is Electrobun RPC.

So:

- **Use Electrobun RPC** for all main↔renderer API calls: `getRpc()` and the procedures defined in `AppRPC` in `src/shared/rpc-schema.ts`.
- **Use `@tanstack/solid-query`** in the UI for caching and invalidation; the data source should be `getRpc()` (or a thin client that wraps it), not `trpcClient`.
- **Remove** `@trpc/react-query`, `@trpc/client`, and `trpc-electron` from the Electrobun app and migrate call sites from `trpc.*.useQuery` / `trpcClient.*.query()` to Solid Query + Electrobun RPC (e.g. a `desktopRpc` client that mirrors the tRPC-like API but calls `getRpc()` under the hood).
