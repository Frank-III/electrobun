import { Button } from "../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { createEffect, createSignal, onCleanup, For, Show } from "solid-js";
import { RefreshCw, ChevronDown, GitBranch, GitPullRequest } from "lucide-solid";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../../lib/desktop-rpc";
import { cn } from "../../../../lib/utils";
import { usePRStatus } from "../../../../hooks/usePRStatus";
import { PRIcon } from "../pr-icon";
type LayoutMode = "compact" | "standard" | "wide" | "full";
interface ChangesPanelHeaderProps {
	worktreePath: string;
	currentBranch: string;
	layoutMode: LayoutMode;
}
function formatTimeSince(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1e3);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}
export function ChangesPanelHeader(props: ChangesPanelHeaderProps) {
	const [lastFetchTime, setLastFetchTime] = createSignal<Date | null>(null);
	const [isRefreshing, setIsRefreshing] = createSignal(false);
	const [displayTime, setDisplayTime] = createSignal("");
	let timeoutRef: ReturnType<typeof setTimeout> | undefined;
	const branchDataQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", props.worktreePath] as const,
		queryFn: () => desktopRpc.changes.getBranches({ worktreePath: props.worktreePath }),
		enabled: !!props.worktreePath,
	}));
	const branchData = () => branchDataQuery.data;
	const refetchBranches = () => branchDataQuery.refetch();
	const fetchMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string }) =>
			desktopRpc.changes.fetch.mutate(input),
		onSuccess: () => {
			setLastFetchTime(new Date());
			refetchBranches();
		},
	}));
	const checkoutMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; branch: string }) =>
			desktopRpc.changes.checkout.mutate(input),
		onSuccess: () => refetchBranches(),
	}));
	const { pr } = usePRStatus({
		worktreePath: props.worktreePath,
		refetchInterval: 3e4
	});
	// Update display time every minute
	createEffect(() => {
		const time = lastFetchTime();
		if (!time) return;
		const updateTime = () => {
			setDisplayTime(formatTimeSince(time));
		};
		updateTime();
		const interval = setInterval(updateTime, 6e4);
		onCleanup(() => clearInterval(interval));
	});
	const handleFetch = () => {
		setIsRefreshing(true);
		fetchMutation.mutate(
			{ worktreePath: props.worktreePath },
			{
				onSettled: () => {
					if (timeoutRef) clearTimeout(timeoutRef);
					timeoutRef = setTimeout(() => setIsRefreshing(false), 600);
				},
			},
		);
	};
	const handleBranchSelect = (branch: string) => {
		if (branch === props.currentBranch) return;
		checkoutMutation.mutate({ worktreePath: props.worktreePath, branch });
	};
	onCleanup(() => {
		if (timeoutRef) clearTimeout(timeoutRef);
	});
	const branches = () => branchData()?.local ?? [];
	const isCompact = props.layoutMode === "compact";
	return <div class={cn("flex items-center gap-2 px-2 py-1.5 flex-1 min-w-0", isCompact && "px-1.5 py-1")}>
			{	/* Branch selector */}
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" class={cn("h-6 px-2 gap-1.5 text-xs font-medium min-w-0", isCompact && "h-5 px-1.5 gap-1 text-[10px]")}>
								<GitBranch class={cn("size-3.5 shrink-0", isCompact && "size-3")} />
								<span class="truncate max-w-[120px]">
									{props.currentBranch || "No branch"}
								</span>
								<ChevronDown class={cn("size-3 shrink-0 opacity-50", isCompact && "size-2.5")} />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="bottom">Switch branch</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="start" class="w-48">
					<For each={branches()}>
						{(branchInfo) => <DropdownMenuItem onClick={() => handleBranchSelect(branchInfo.branch)} class={cn("text-xs", branchInfo.branch === currentBranch && "bg-accent")}>
							<GitBranch class="mr-2 size-3.5" />
							<span class="truncate">{branchInfo.branch}</span>
							<Show when={branchInfo.branch === branchData()?.defaultBranch}>
								<span class="ml-auto text-[10px] text-muted-foreground">default</span>
							</Show>
						</DropdownMenuItem>}
					</For>
					<Show when={branches().length > 0}>
						<DropdownMenuSeparator />
					</Show>
					<DropdownMenuItem onClick={() => {
						// TODO: Implement create branch dialog
					}} class="text-xs">
						<GitBranch class="mr-2 size-3.5" />
						Create new branch...
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{	/* Right side: PR status + Fetch */}
			<div class="flex items-center gap-1">
				{ /* PR Status */}
				<Show when={pr}>
					{(prData) => <Tooltip>
						<TooltipTrigger asChild>
							<a href={prData().url} target="_blank" rel="noopener noreferrer" class={cn("flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent transition-colors", isCompact && "px-1")}>
								<PRIcon state={prData().state} class={cn("size-3.5", isCompact && "size-3")} />
								<Show when={!isCompact}>
									<span class="text-[10px] text-muted-foreground font-mono">#{prData().number}</span>
								</Show>
							</a>
						</TooltipTrigger>
						<TooltipContent side="bottom">PR #{prData().number}: {prData().title}</TooltipContent>
					</Tooltip>}
				</Show>

				{ /* Fetch button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="sm" onClick={handleFetch} disabled={isRefreshing() || fetchMutation.isPending} class={cn("h-6 px-2 gap-1.5 text-xs", isCompact && "h-5 px-1.5 gap-1")}>
							<RefreshCw class={cn("size-3.5", (isRefreshing() || fetchMutation.isPending) && "animate-spin", isCompact && "size-3")} />
							<Show when={!isCompact}>
												<span class="text-[10px] text-muted-foreground">{displayTime() || "Fetch"}</span>
											</Show>
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										{lastFetchTime() ? `Last fetched ${displayTime()}` : "Fetch from remote"}
									</TooltipContent>
								</Tooltip>
							</div>
							</div>;
							}
