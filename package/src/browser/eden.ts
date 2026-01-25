/**
 * Eden Treaty Integration for Electrobun
 *
 * For type-safe API calls, use @elysiajs/eden's treaty client directly:
 *
 * @example
 * ```tsx
 * import { treaty } from "@elysiajs/eden";
 * import type { App } from "../bun";
 *
 * // Get the port from Electrobun globals
 * const port = window.__electrobunRpcSocketPort;
 * const api = treaty<App>(`localhost:${port}`);
 *
 * // Fully type-safe!
 * const { data } = await api.users.get();
 * const { data: user } = await api.users({ id: "1" }).get();
 * ```
 */

// This file is kept minimal - users should use @elysiajs/eden directly
// for the best type inference experience.

export {};
