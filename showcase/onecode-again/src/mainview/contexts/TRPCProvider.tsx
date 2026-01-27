import { createSignal } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ipcLink } from "trpc-electron/renderer";
import { trpc } from "../lib/trpc";
import superjson from "superjson";
interface TRPCProviderProps {
	children: React.ReactNode;
}
// Global query client instance for use outside React components
let globalQueryClient: QueryClient | null = null;
export function getQueryClient(): QueryClient | null {
	return globalQueryClient;
}
export function TRPCProvider({ children }: TRPCProviderProps) {
	const [queryClient] = createSignal(() => {
		const client = new QueryClient({ defaultOptions: {
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
	});
	const [trpcClient] = createSignal(() => {
		const client = trpc.createClient({ links: [ipcLink({ transformer: superjson })] });
		return client;
	});
	return <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>;
}
