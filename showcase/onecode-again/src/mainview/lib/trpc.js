"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcClient = exports.trpc = void 0;
var react_query_1 = require("@trpc/react-query");
var client_1 = require("@trpc/client");
var renderer_1 = require("trpc-electron/renderer");
var superjson_1 = require("superjson");
/**
 * React hooks for tRPC
 */
exports.trpc = (0, react_query_1.createTRPCReact)();
/**
 * Vanilla client for use outside React components (stores, utilities)
 */
exports.trpcClient = (0, client_1.createTRPCProxyClient)({
    links: [(0, renderer_1.ipcLink)({ transformer: superjson_1.default })],
});
