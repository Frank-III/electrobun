import type { BunRequestClient } from "../../shared/rpc-schema"

export type { BunRequestClient }
export type BunRequests = import("../../shared/rpc-schema").BunRequestsSchema

export function getRpc(): BunRequestClient {
  const rpc = window.rpc?.request
  if (!rpc) {
    throw new Error("RPC is not available in this window")
  }
  return rpc
}
