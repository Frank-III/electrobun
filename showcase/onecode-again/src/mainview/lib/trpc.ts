/**
 * LEGACY: tRPC + trpc-electron were used only for the Electron build (legacy main in src/bun/legacy/).
 *
 * On Electrobun we use Electrobun RPC, not tRPC. The main process exposes the API via
 * BrowserView.defineRPC<AppRPC> and the renderer gets the client from window.rpc.request (getRpc() in lib/rpc.ts).
 * Use getRpc() + @tanstack/solid-query for all main↔renderer calls on Electrobun.
 * See docs/why-electrobun-rpc-not-trpc.md.
 */

/** @deprecated On Electrobun use getRpc() + Solid Query. Stub for Electrobun build; no React/tRPC deps. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = {} as any;

/** @deprecated On Electrobun use getRpc() (lib/rpc.ts). Stub for Electrobun build; no trpc-electron. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpcClient = {} as any;
