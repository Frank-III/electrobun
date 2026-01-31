import type { AppRPC } from "./rpc-schema";
import type { Electroview } from "electrobun/view";

/**
 * RPC client type returned by Electroview.defineRPC<AppRPC>().
 * Use this to type your exported rpc instance.
 */
export type AppRPCClient = ReturnType<typeof Electroview.defineRPC<AppRPC>>;

export {};
