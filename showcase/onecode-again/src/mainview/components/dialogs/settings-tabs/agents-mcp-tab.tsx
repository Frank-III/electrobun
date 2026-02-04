import { ChevronRight, ExternalLink, Loader2, RefreshCw } from "lucide-solid";
import { type Accessor, createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { toast } from "solid-sonner";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { OriginalMCPIcon } from "../../ui/icons";
// Hook to detect narrow screen
function useIsNarrowScreen(): Accessor<boolean> {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		onCleanup(() => window.removeEventListener("resize", checkWidth));
	});
	return isNarrow;
}
// Status indicator dot
interface StatusDotProps {
	status: string;
}
function StatusDot(props: StatusDotProps) {
	return <span class={cn("w-2 h-2 rounded-full flex-shrink-0", props.status === "connected" && "bg-foreground", props.status !== "connected" && "bg-muted-foreground/50", props.status === "pending" && "animate-pulse")} />;
}
// Get status text
function getStatusText(status: string): string {
	switch (status) {
		case "connected": return "Connected";
		case "failed": return "Failed";
		case "needs-auth": return "Needs auth";
		case "pending": return "Connecting...";
		default: return status;
	}
}
interface McpServer {
	name: string;
	status: string;
	tools: string[];
	needsAuth: boolean;
	config: Record<string, unknown>;
	serverInfo?: {
		name: string;
		version: string;
	};
	error?: string;
}
interface ServerRowProps {
	server: McpServer;
	isExpanded: boolean;
	onToggle: () => void;
	onAuth?: () => void;
}
function ServerRow(props: ServerRowProps) {
	const hasTools = props.server.tools.length > 0;
	const isConnected = props.server.status === "connected";
	return <div>
      <div role={hasTools ? "button" : undefined} tabIndex={hasTools ? 0 : undefined} onClick={hasTools ? props.onToggle : undefined} onKeyDown={hasTools ? (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			props.onToggle();
		}
	} : undefined} class={cn("w-full flex items-center gap-3 p-3 text-left transition-colors", hasTools && "hover:bg-muted/50 cursor-pointer", !hasTools && "cursor-default")}>
        {	/* Expand chevron */}
        <ChevronRight class={cn("h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0", props.isExpanded && "rotate-90", !hasTools && "opacity-0")} />

        { /* Status dot */}
		<StatusDot status={props.server.status} />

        { /* Server info */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground truncate">
              {props.server.name}
            </span>
            <Show when={props.server.serverInfo?.version}>
          <span class="text-xs text-muted-foreground">
                v{props.server.serverInfo!.version}
              </span>
        </Show>
          </div>
          <Show when={props.server.error}>
            <p class="text-xs text-muted-foreground truncate mt-0.5">
              {props.server.error}
            </p>
          </Show>
        </div>

        { /* Status / tool count */}
		<span class="text-xs text-muted-foreground flex-shrink-0">
			{isConnected ? hasTools ? `${props.server.tools.length} tool${props.server.tools.length !== 1 ? "s" : ""}` : "No tools" : getStatusText(props.server.status)}
		</span>

        { /* Authenticate button */}
		<Show when={props.server.needsAuth && props.onAuth}>
          <Button variant="secondary" size="sm" class="h-6 px-2 text-xs" onClick={(e: MouseEvent) => {
            e.stopPropagation();
            props.onAuth!();
          }}>
            {isConnected ? "Reconnect" : "Auth"}
          </Button>
        </Show>
      </div>

      {	/* Expanded tools list */}
		<Show when={props.isExpanded && hasTools}>
			<div class="overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
				<div class="pl-10 pr-3 pb-3 space-y-1">
					<For each={props.server.tools}>{(tool) => <div class="text-xs text-muted-foreground font-mono py-0.5">
                {tool}
              </div>}</For>
				</div>
			</div>
		</Show>
    </div>;
}
export function AgentsMcpTab() {
	const isNarrowScreen = useIsNarrowScreen();
	const [expandedServer, setExpandedServer] = createSignal<string | null>(null);
	// Fetch ALL MCP config (global + all projects) - includes tools for connected servers
	// Uses long staleTime since data is prefetched at app startup and user can manually refresh
	const allMcpConfigQuery = useQuery(() => ({
		queryKey: ["claude", "getAllMcpConfig"],
		queryFn: () => desktopRpc.claude.getAllMcpConfig(),
		staleTime: 10 * 60 * 1e3,
	}));
	const allMcpConfig = () => allMcpConfigQuery.data;
	const isLoadingConfig = () => allMcpConfigQuery.isLoading;
	const refetch = () => allMcpConfigQuery.refetch();
	// Refresh state - true during initial load OR manual refresh
	const [isManualRefreshing, setIsManualRefreshing] = createSignal(false);
	const isRefreshing = () => isLoadingConfig() || isManualRefreshing();
	const startOAuthMutation = useMutation(() => ({
		mutationFn: (input: { serverName: string; projectPath: string }) =>
			desktopRpc.claude.startMcpOAuth.mutate(input),
	}));
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (input: { path: string }) =>
			desktopRpc.external.openInFinder.mutate(input),
	}));
	// Process groups for display (filter out empty groups)
	type McpGroup = NonNullable<ReturnType<typeof allMcpConfig>>["groups"][number];
	const groups = createMemo(() => (allMcpConfig()?.groups || []).filter((g: McpGroup) => g.mcpServers.length > 0));
	const totalServers = createMemo(() => groups().reduce((acc: number, g: McpGroup) => acc + g.mcpServers.length, 0));
	const handleToggleServer = (serverKey: string) => {
		setExpandedServer(expandedServer() === serverKey ? null : serverKey);
	};
	const handleRefresh = async (silent = false) => {
		setIsManualRefreshing(true);
		try {
			await refetch();
			if (!silent) {
				toast.success("Refreshed MCP servers");
			}
		} catch (error) {
			if (!silent) {
				toast.error("Failed to refresh MCP servers");
			}
		} finally {
			setIsManualRefreshing(false);
		}
	};
	const handleAuth = async (serverName: string, projectPath: string | null) => {
		try {
			// Use "__global__" marker for global MCP servers
			const result = await startOAuthMutation.mutateAsync({
				serverName,
				projectPath: projectPath ?? "__global__"
			});
			if (result.success) {
				toast.success(`${serverName} authenticated, refreshing...`);
				// Refresh to update status and fetch tools
				await handleRefresh(false);
			} else {
				toast.error(result.error || "Authentication failed");
			}
		} catch (error) {
			// Extract actual error message from tRPC error
			const message = error instanceof Error ? error.message : "Authentication failed";
			console.error(`[MCP Auth] Error authenticating ${serverName}:`, error);
			toast.error(message);
		}
	};
	const handleOpenGlobalClaudeJson = () => {
		openInFinderMutation.mutate({ path: "~/.claude.json" });
	};
	return <div class="p-6 space-y-6 h-full">
      {	/* Header */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-1">
            <h3 class="text-sm font-semibold text-foreground">MCP Servers</h3>
            <button onClick={() => handleRefresh()} disabled={isRefreshing()} class="h-6 w-6 inline-flex items-center justify-center text-foreground/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors">
              <Show when={isRefreshing()} fallback={<RefreshCw class="h-3.5 w-3.5" />}>
                <Loader2 class="h-3.5 w-3.5 animate-spin" />
              </Show>
            </button>
          </div>
        </div>
      </Show>

      { /* Instructions Section - below header */}
      <div class="pb-4 border-b border-border space-y-3">
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            How to use MCP Tools
          </h4>
          <p class="text-xs text-muted-foreground">
            Mention a tool in chat with{" "}
            <code class="px-1 py-0.5 bg-muted rounded">@tool-name</code> or
            ask Claude to use it directly.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            Configuring Servers
          </h4>
          <p class="text-xs text-muted-foreground">
            Add MCP server configuration to{" "}
            <button onClick={handleOpenGlobalClaudeJson} class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded transition-colors">
              <ExternalLink class="h-3 w-3" />
              <span>~/.claude.json</span>
            </button>{" "}
            at the root for global servers or under your project path.
          </p>
          <p class="text-xs text-muted-foreground mt-1.5">
            <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground underline transition-colors">
              Documentation from Anthropic
            </a>
          </p>
        </div>
      </div>

      { /* Servers List */}
      <div class="space-y-4">
        <Show when={!isLoadingConfig()} fallback={
          <div class="bg-background rounded-lg border border-border p-6 text-center">
            <Loader2 class="h-6 w-6 text-muted-foreground/50 mx-auto mb-3 animate-spin" />
            <p class="text-sm text-muted-foreground">
              Loading MCP servers...
            </p>
          </div>
        }>
          <Show when={totalServers() > 0} fallback={
            <div class="bg-background rounded-lg border border-border p-6 text-center">
              <OriginalMCPIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p class="text-sm text-muted-foreground mb-2">
                No MCP servers configured
              </p>
              <p class="text-xs text-muted-foreground">
                Add servers to{" "}
                <code class="px-1 py-0.5 bg-muted rounded">~/.claude.json</code>
              </p>
            </div>
          }>
            <div class="space-y-4">
              <For each={groups()}>{(group) => <div>
                  { /* Group label */}
                  <p class="text-xs font-medium text-muted-foreground mb-2">
                    {group.groupName}
                  </p>
                  { /* Server rows */}
                  <div class="bg-background rounded-lg border border-border overflow-hidden">
                    <div class="divide-y divide-border">
                      <For each={group.mcpServers}>{(server) => <ServerRow server={server} isExpanded={expandedServer() === `${group.groupName}-${server.name}`} onToggle={() => handleToggleServer(`${group.groupName}-${server.name}`)} onAuth={() => handleAuth(server.name, group.projectPath)} />}</For>
                    </div>
                  </div>
                </div>}</For>
            </div>
          </Show>
        </Show>
      </div>
      { /* Bottom spacer for scroll padding */}
      <div class="h-[1px] shrink-0" />
    </div>;
 }
