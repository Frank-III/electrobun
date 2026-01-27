import type { AppRPC } from "../shared/rpc-schema"

export type BunRequests = AppRPC["bun"]["requests"]

export function getRpc(): BunRequests {
  const rpc = (window as any)?.rpc?.request
  if (!rpc) {
    throw new Error("RPC is not available in this window")
  }
  return rpc as BunRequests
}
