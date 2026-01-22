/**
 * Elysia Adapter for Electrobun
 * Type definitions for end-to-end type safety between Bun and Webview
 */

import type { Elysia } from "elysia";

/** Extract route types from an Elysia app for Eden client usage */
export type ElysiaRoutes<T extends Elysia<any, any, any, any, any, any, any, any>> =
  T extends Elysia<any, any, any, any, any, any, infer Routes, any> ? Routes : never;

/** Route handler context passed to each handler */
export interface ElectrobunContext<Params = unknown, Body = unknown, Query = unknown> {
  params: Params;
  body: Body;
  query: Query;
  webviewId: number;
  windowId?: number;
}

/** Response type for handlers */
export type HandlerResponse<T> = T | Promise<T>;

/** Message types for fire-and-forget messages */
export interface MessageSchema {
  [key: string]: unknown;
}

/** RPC Request message format */
export interface RPCRequest {
  id: string;
  type: "request";
  path: string;
  method: string;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

/** RPC Response message format */
export interface RPCResponse {
  id: string;
  type: "response";
  success: boolean;
  data?: unknown;
  error?: string;
}

/** RPC Message format (fire-and-forget) */
export interface RPCMessage {
  type: "message";
  name: string;
  payload: unknown;
}

/** Combined RPC packet type */
export type RPCPacket = RPCRequest | RPCResponse | RPCMessage;

/** Configuration for the Electrobun adapter */
export interface ElectrobunAdapterConfig {
  /** Maximum time to wait for a request response (ms) */
  maxRequestTime?: number;
}

/** Route definition for internal routing */
export interface RouteDefinition {
  method: string;
  path: string;
  pathPattern: RegExp;
  paramNames: string[];
  handler: (ctx: ElectrobunContext<any, any, any>) => HandlerResponse<any>;
}

/** Eden client options */
export interface EdenClientOptions {
  /** Timeout for requests in ms (default: 30000) */
  timeout?: number;
}

/** Type helper to extract successful response type */
export type InferResponse<T> = T extends { ok: true } & infer R ? R : T;

/** Type helper for route params */
export type RouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof RouteParams<`/${Rest}`>]: string }
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;
