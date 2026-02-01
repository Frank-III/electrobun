import type { BunRequestClient } from "../../shared/rpc-schema"
import { getRpcRequest } from "./electrobun-rpc"

export type { BunRequestClient }
export type BunRequests = import("../../shared/rpc-schema").BunRequestsSchema

export function getRpc(): BunRequestClient {
	return getRpcRequest()
}
