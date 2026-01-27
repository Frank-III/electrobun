"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryClient = getQueryClient;
exports.TRPCProvider = TRPCProvider;
var solid_js_1 = require("solid-js");
var react_query_1 = require("@tanstack/react-query");
var renderer_1 = require("trpc-electron/renderer");
var trpc_1 = require("../lib/trpc");
var superjson_1 = require("superjson");
// Global query client instance for use outside React components
var globalQueryClient = null;
function getQueryClient() {
    return globalQueryClient;
}
function TRPCProvider(_a) {
    var children = _a.children;
    var queryClient = (0, solid_js_1.createSignal)(function () {
        var client = new react_query_1.QueryClient({ defaultOptions: {
                queries: {
                    staleTime: 5e3,
                    refetchOnWindowFocus: false,
                    networkMode: "always",
                    retry: false
                },
                mutations: {
                    networkMode: "always",
                    retry: false
                }
            } });
        globalQueryClient = client;
        return client;
    })[0];
    var trpcClient = (0, solid_js_1.createSignal)(function () {
        var client = trpc_1.trpc.createClient({ links: [(0, renderer_1.ipcLink)({ transformer: superjson_1.default })] });
        return client;
    })[0];
    return <trpc_1.trpc.Provider client={trpcClient} queryClient={queryClient}>
      <react_query_1.QueryClientProvider client={queryClient}>{children}</react_query_1.QueryClientProvider>
    </trpc_1.trpc.Provider>;
}
