import type { JSX } from "solid-js";
import { QueryClient } from "@tanstack/solid-query";
import { QueryClientProvider, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../lib/desktop-rpc";

const defaultOptions = {
  defaultOptions: {
    queries: {
      staleTime: 5e3,
      refetchOnWindowFocus: false,
      networkMode: "always" as const,
      retry: false,
    },
    mutations: {
      networkMode: "always" as const,
      retry: false,
    },
  },
};

let globalQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient | null {
  return globalQueryClient;
}

function getOrCreateQueryClient(): QueryClient {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient(defaultOptions);
  }
  return globalQueryClient;
}

export interface QueryProviderProps {
  children: JSX.Element;
}

/**
 * Solid Query provider. Use useQuery / useMutation from @tanstack/solid-query
 * with getRpc() or desktopRpc for data.
 */
export function QueryProvider(props: QueryProviderProps) {
  const client = getOrCreateQueryClient();
  return (
    <QueryClientProvider client={client}>
      {props.children}
    </QueryClientProvider>
  );
}

export { useQueryClient };
