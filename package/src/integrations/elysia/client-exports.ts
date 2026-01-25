/**
 * Elysia Client for Electrobun
 *
 * Use @elysiajs/eden's treaty client directly for type-safe API calls:
 *
 * ```tsx
 * import { treaty } from "@elysiajs/eden";
 * import type { App } from "../bun";
 *
 * const port = window.__electrobunRpcSocketPort;
 * const api = treaty<App>(`localhost:${port}`);
 *
 * // Fully type-safe!
 * const { data } = await api.users.get();
 * ```
 *
 * @module
 */

// Users should import directly from @elysiajs/eden
export {};
