import { Button } from "../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "../../../../components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../../components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { IconCloseSidebarRight, IconFetch, IconForcePush, IconSpinner, AgentIcon, CircleFilterIcon, IconReview, ExternalLinkIcon } from "../../../../components/ui/icons";
import { DiffViewModeSwitcher } from "./diff-view-mode-switcher";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import type { JSX } from "solid-js";
import { RefreshCw, ChevronDown, GitBranch, ArrowDown, ArrowUp, Check, ChevronsDownUp, ChevronsUpDown, Columns2, Eye, GitMerge, GitPullRequest, MoreHorizontal, Rows2, Square, Upload, X } from "lucide-solid";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../../lib/desktop-rpc";
import { cn } from "../../../../lib/utils";
import { usePRStatus } from "../../../../hooks/usePRStatus";
import { PRIcon } from "../pr-icon";
import { toast } from "solid-sonner";
import type { DiffViewMode } from "../../../../agents/ui/agent-diff-view";
interface DiffStats {
	isLoading: boolean;
	hasChanges: boolean;
	fileCount: number;
	additions: number;
	deletions: number;
}
interface DiffSidebarHeaderProps {
	worktreePath: string;
	currentBranch: string;
	diffStats: DiffStats;
	// Sidebar width for responsive layout
	sidebarWidth?: number;
	// Sync state
	pushCount?: number;
	pullCount?: number;
	hasUpstream?: boolean;
	isSyncStatusLoading?: boolean;
	// Commits relative to default branch
	aheadOfDefault?: number;
	behindDefault?: number;
	// Actions
	onReview?: () => void;
	isReviewing?: boolean;
	onCreatePr?: () => void;
	isCreatingPr?: boolean;
	onCreatePrWithAI?: () => void;
	isCreatingPrWithAI?: boolean;
	onMergePr?: () => void;
	isMergingPr?: boolean;
	onClose: () => void;
	onRefresh?: () => void;
	// PR state
	hasPrNumber?: boolean;
	isPrOpen?: boolean;
	/** Whether PR has merge conflicts - shows warning and disables merge */
	hasMergeConflicts?: boolean;
	/** Handler for fixing merge conflicts - sends prompt to AI */
	onFixConflicts?: () => void;
	// Diff view controls
	onExpandAll?: () => void;
	onCollapseAll?: () => void;
	viewMode?: DiffViewMode;
	onViewModeChange?: (mode: DiffViewMode) => void;
	// Viewed files controls
	viewedCount?: number;
	onMarkAllViewed?: () => void;
	onMarkAllUnviewed?: () => void;
	// Desktop window drag region
	isDesktop?: boolean;
	isFullscreen?: boolean;
	// Diff view display mode (side-peek, center-peek, full-page)
	displayMode?: "side-peek" | "center-peek" | "full-page";
	onDisplayModeChange?: (mode: "side-peek" | "center-peek" | "full-page") => void;
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
interface DiffSidebarHeaderComponentProps extends DiffSidebarHeaderProps {}

export function DiffSidebarHeader(props: DiffSidebarHeaderComponentProps) {
	const { worktreePath, currentBranch, diffStats, sidebarWidth = 800, pushCount = 0, pullCount = 0, hasUpstream = true, isSyncStatusLoading = false, aheadOfDefault = 0, behindDefault = 0, onReview, isReviewing = false, onCreatePr, isCreatingPr = false, onCreatePrWithAI, isCreatingPrWithAI = false, onMergePr, isMergingPr = false, onClose, onRefresh, hasPrNumber = false, isPrOpen = false, hasMergeConflicts = false, onFixConflicts, onExpandAll, onCollapseAll, viewMode = "unified" as DiffViewMode, onViewModeChange, viewedCount = 0, onMarkAllViewed, onMarkAllUnviewed, isDesktop = false, isFullscreen = false, displayMode = "side-peek", onDisplayModeChange } = props;
	// Responsive breakpoints - progressive disclosure
	const isCompact = sidebarWidth < 350;
	const showViewModeToggle = sidebarWidth >= 450;
	const showReviewButton = sidebarWidth >= 550;
	const [lastFetchTime, setLastFetchTime] = createSignal<Date | null>(null);
	const [isRefreshing, setIsRefreshing] = createSignal(false);
	const [displayTime, setDisplayTime] = createSignal("");
	let timeoutRef: ReturnType<typeof setTimeout> | undefined;
	const branchDataQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", worktreePath] as const,
		queryFn: () => desktopRpc.changes.getBranches({ worktreePath }),
		enabled: !!worktreePath,
	}));
	const branchData = () => branchDataQuery.data;
	const refetchBranches = () => branchDataQuery.refetch();
	const isDefaultBranch = () => currentBranch === branchData()?.defaultBranch;

	const fetchMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string }) => desktopRpc.changes.fetch.mutate(input),
		onSuccess: () => {
			setLastFetchTime(new Date());
			refetchBranches();
			onRefresh?.();
		},
	}));
	const pushMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; setUpstream?: boolean }) =>
			desktopRpc.changes.push.mutate(input),
		onSuccess: () => onRefresh?.(),
		onError: (error) => toast.error(`Push failed: ${error.message}`),
	}));
	const pullMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; autoStash?: boolean }) =>
			desktopRpc.changes.pull.mutate(input),
		onSuccess: () => onRefresh?.(),
		onError: (error) => toast.error(`Pull failed: ${error.message}`),
	}));
	const forcePushMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string }) =>
			desktopRpc.changes.forcePush.mutate(input),
		onSuccess: () => onRefresh?.(),
		onError: (error: { message: string }) =>
			toast.error(`Force push failed: ${error.message}`),
	}));
	const mergeFromDefaultMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; useRebase?: boolean }) =>
			desktopRpc.changes.mergeFromDefault.mutate(input),
		onSuccess: () => onRefresh?.(),
		onError: (error: { message: string }) =>
			toast.error(`Merge failed: ${error.message}`),
	}));
	const { pr } = usePRStatus({
		worktreePath,
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
		fetchMutation.mutate({ worktreePath }, { onSettled: () => {
			if (timeoutRef) clearTimeout(timeoutRef);
			timeoutRef = setTimeout(() => setIsRefreshing(false), 600);
		} });
	};
	const handlePush = () => {
		pushMutation.mutate({ worktreePath, setUpstream: !hasUpstream });
	};
	const handlePull = () => {
		pullMutation.mutate({ worktreePath, autoStash: true });
	};
	const handleForcePush = () => {
		if (window.confirm("Are you sure you want to force push? This will overwrite the remote branch.")) {
			forcePushMutation.mutate({ worktreePath });
		}
	};
	const handleMergeFromDefault = (useRebase = false) => {
		mergeFromDefaultMutation.mutate({
			worktreePath,
			useRebase
		});
	};
	const handleOpenPR = () => {
		if (pr?.url) {
			window.open(pr.url, "_blank");
		}
	};
	const handleCopyPRLink = () => {
		if (pr?.url) {
			navigator.clipboard.writeText(pr.url);
		}
	};
	onCleanup(() => {
		if (timeoutRef) clearTimeout(timeoutRef);
	});
	// Check pending states
	const isPushPending = pushMutation.isPending;
	const isPullPending = pullMutation.isPending;
	const isFetchPending = isRefreshing() || fetchMutation.isPending;
	// ============ NEW BUTTON LOGIC ============
	// Priority:
	// 1. !hasUpstream → Publish Branch
	// 2. pushCount > 0 → Push (with pullCount > 0 showing Pull first)
	// 3. pullCount > 0 → Pull
	// 4. hasPR → Open PR
	// 5. hasUpstream && !hasPR → Create PR (secondary) or Fetch (primary)
	// 6. Default → Fetch
interface ActionButton {
		label: string;
		pendingLabel?: string;
		icon: JSX.Element;
		handler: () => void;
		tooltip: string;
		badge?: string;
		variant?: "default" | "ghost" | "outline";
		isPending?: boolean;
		disabled?: boolean;
	}
	const getPrimaryAction = (): ActionButton => {
		// 0. Loading state - show loading indicator
		if (isSyncStatusLoading) {
			return {
				label: "",
				pendingLabel: "",
				icon: <IconFetch class="size-3.5" />,
				handler: () => {},
				tooltip: "Loading sync status...",
				variant: "ghost",
				isPending: true,
				disabled: true
			};
		}
		// 1. Branch not published - must publish first
		if (!hasUpstream) {
			return {
				label: "Publish",
				pendingLabel: "Publishing...",
				icon: <Upload class="size-3.5" />,
				handler: handlePush,
				tooltip: "Publish branch to remote",
				variant: "default",
				isPending: isPushPending
			};
		}
		// 2. Remote has changes we need to pull first
		if (pullCount > 0) {
			return {
				label: "Pull",
				pendingLabel: "Pulling...",
				icon: <ArrowDown class="size-3.5" />,
				handler: handlePull,
				tooltip: `Pull ${pullCount} commit${pullCount !== 1 ? "s" : ""} from remote`,
				badge: `↓${pullCount}`,
				variant: "default",
				isPending: isPullPending
			};
		}
		// 3. We have commits to push
		if (pushCount > 0) {
			return {
				label: "Push",
				pendingLabel: "Pushing...",
				icon: <ArrowUp class="size-3.5" />,
				handler: handlePush,
				tooltip: `Push ${pushCount} commit${pushCount !== 1 ? "s" : ""} to remote`,
				badge: `↑${pushCount}`,
				variant: "default",
				isPending: isPushPending
			};
		}
		// 4. PR exists - Open PR as primary
		if (pr) {
			return {
				label: "Open PR",
				icon: <ExternalLinkIcon class="size-3.5" />,
				handler: handleOpenPR,
				tooltip: `Open Pull Request #${pr.number}`,
				variant: "ghost"
			};
		}
		// 5. No PR, branch is synced - Create PR if ahead of default, otherwise Fetch
		if (hasUpstream && !pr) {
			// Show Create PR if we have commits ahead of default branch (not on default branch)
			if (aheadOfDefault > 0 && !isDefaultBranch() && onCreatePr) {
				return {
					label: "Create PR",
					pendingLabel: "Creating...",
					icon: <GitPullRequest class="size-3.5" />,
					handler: onCreatePr,
					tooltip: `Create Pull Request (${aheadOfDefault} commit${aheadOfDefault !== 1 ? "s" : ""} ahead of ${branchData()?.defaultBranch || "main"})`,
					badge: `↑${aheadOfDefault}`,
					variant: "default",
					isPending: isCreatingPr
				};
			}
			// Otherwise show Fetch
			return {
				label: "Fetch",
				pendingLabel: "Fetching...",
				icon: <IconFetch class="size-3.5" />,
				handler: handleFetch,
				tooltip: lastFetchTime() ? `Last fetched ${displayTime()}` : "Check for updates",
				variant: "ghost",
				isPending: isFetchPending
			};
		}
		// 6. Fallback - Fetch
		return {
			label: "Fetch",
			pendingLabel: "Fetching...",
			icon: <IconFetch class="size-3.5" />,
			handler: handleFetch,
			tooltip: "Check for updates",
			variant: "ghost",
			isPending: isFetchPending
		};
	};
	const primaryAction = getPrimaryAction();
	// Override primary action when fetching from dropdown
	const displayAction: ActionButton = isFetchPending && !primaryAction.isPending ? {
		label: "Fetching",
		pendingLabel: "Fetching...",
		icon: <IconFetch class="size-3.5" />,
		handler: () => {},
		tooltip: "Fetching from remote...",
		variant: primaryAction.variant,
		isPending: true
	} : primaryAction;
	return <div class="relative flex items-center justify-between h-10 px-2 border-b border-border/50 bg-background flex-shrink-0">
			{	/* Drag region for window dragging */}
			<Show when={isDesktop && !isFullscreen}>
				<div class="absolute inset-0 z-0" style={{ WebkitAppRegion: "drag" }} />
			</Show>
			{ /* Left side: Close button + Branch selector */}
			<div class="relative z-10 flex items-center gap-1 min-w-0 flex-shrink" style={{ WebkitAppRegion: "no-drag" }}>
				{ /* Close button - X icon for dialog/fullpage modes, chevron for sidebar */}
				<Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10" onClick={onClose}>
					<Show
						when={displayMode === "side-peek"}
						fallback={<X class="size-4 text-muted-foreground" />}
					>
						<IconCloseSidebarRight class="size-4 text-muted-foreground" />
					</Show>
				</Button>

				{ /* Display mode switcher (side-peek, center-peek, full-page) */}
				<Show when={onDisplayModeChange}>
					<DiffViewModeSwitcher mode={displayMode} onModeChange={onDisplayModeChange} />
				</Show>

				{ /* Branch name display (branch switching will be added later) */}
				<div class="h-6 px-2 gap-1 text-xs font-medium min-w-0 flex items-center">
					<LuGitBranch class="size-3.5 shrink-0 opacity-70" />
					<span class="truncate max-w-[120px] text-foreground">
						{currentBranch || "No branch"}
					</span>
				</div>

				{ /* PR Status badge */}
				<Show when={pr}>
					<ContextMenu>
						<ContextMenuTrigger asChild>
							<a href={pr.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 h-6 px-2 rounded-md hover:bg-foreground/10 transition-colors">
								<PRIcon state={pr.state} class="size-3.5" />
								<span class="text-xs text-muted-foreground font-mono">
									#{pr.number}
								</span>
							</a>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem onClick={handleOpenPR} class="text-xs">
								Open in browser
							</ContextMenuItem>
							<ContextMenuItem onClick={handleCopyPRLink} class="text-xs">
								Copy link
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Show>
			</div>

			{ /* Right side: Review + View mode toggle + Primary action (split button) + Secondary action + Overflow menu */}
			<div class="relative z-10 flex items-center gap-1 flex-shrink-0" style={{ WebkitAppRegion: "no-drag" }}>
				{ /* Review button - visible when there's enough space */}
				<Show when={showReviewButton && diffStats.hasChanges && onReview}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="sm" onClick={onReview} disabled={isReviewing} class="h-6 px-2 gap-1 text-xs hover:bg-foreground/10">
								<Show when={isReviewing} fallback={<IconReview class="size-3.5" />}>
									<IconSpinner class="size-3.5" />
								</Show>
								<span>Review</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Review changes with AI</TooltipContent>
					</Tooltip>
				</Show>

				{ /* Primary action button (solo when Fetch/Open PR, split when Push/Pull/Create PR) */}
				<Show
					when={displayAction.label === "Fetch" || displayAction.label === "Fetching" || displayAction.label === "Open PR"}
					fallback={<div class="inline-flex -space-x-px rounded-md">
						<Tooltip>
							<TooltipTrigger asChild>
								<button onClick={displayAction.handler} disabled={displayAction.isPending || displayAction.disabled} class={cn("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70", "disabled:pointer-events-none disabled:opacity-50", "h-6 px-2 gap-1 text-xs rounded-l-md rounded-r-none focus:z-10 overflow-hidden", "transition-all duration-200 ease-out", displayAction.variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]" : "hover:bg-accent hover:text-accent-foreground")}>
									<span class="flex items-center gap-1 transition-opacity duration-150 min-w-0">
										<Show
											when={displayAction.isPending}
											fallback={<>
												<span class="shrink-0">{displayAction.icon}</span>
												<Show when={displayAction.label}>
													<span class="truncate">{displayAction.label}</span>
												</Show>
												<Show when={displayAction.badge}>
													<span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
														{displayAction.badge}
													</span>
												</Show>
											</>}
										>
											<IconSpinner class="size-3.5 ml-0.5 shrink-0" />
											<Show when={displayAction.pendingLabel}>
												<span class="mr-0.5 truncate">{displayAction.pendingLabel}</span>
											</Show>
											<Show when={displayAction.badge}>
												<span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
													{displayAction.badge}
												</span>
											</Show>
										</Show>
									</span>
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">{displayAction.tooltip}</TooltipContent>
						</Tooltip>

						{ /* Dropdown trigger for git operations */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={displayAction.variant === "default" ? "default" : "ghost"} size="sm" disabled={displayAction.isPending} class={cn("h-6 w-6 p-0 rounded-l-none rounded-r-md focus:z-10", displayAction.variant === "ghost" && "hover:bg-accent hover:text-accent-foreground shadow-none")} aria-label="More git options">
									<ChevronDown class="size-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" class="w-52">
								{ /* Fetch - available when primary action is NOT Fetch */}
								<DropdownMenuItem onClick={handleFetch} disabled={isFetchPending} class="text-xs">
									<RefreshCw class={cn("mr-2 size-3.5", isFetchPending && "animate-spin")} />
									<div class="flex-1">
										<div>Fetch origin</div>
											<div class="text-[10px] text-muted-foreground">
												<Show when={lastFetchTime()} fallback="Check for updates">
													{`Last fetched ${displayTime()}`}
												</Show>
											</div>
									</div>
								</DropdownMenuItem>

								{ /* Force Push - only when history diverged (remote has commits we don't have locally) */}
								<Show when={hasUpstream && pullCount > 0}>
									<DropdownMenuItem onClick={handleForcePush} disabled={forcePushMutation.isPending} class="text-xs data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400 [&_div]:data-[highlighted]:text-red-400/70">
										<IconForcePush class="mr-2 size-3.5" />
										<div class="flex-1">
											<div>Force push</div>
											<div class="text-[10px] text-muted-foreground/70">
												Overwrite remote (dangerous)
											</div>
										</div>
									</DropdownMenuItem>
								</Show>

								{ /* Merge/Rebase from default branch */}
								<Show when={!isDefaultBranch() && hasUpstream}>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => handleMergeFromDefault(false)} disabled={mergeFromDefaultMutation.isPending || behindDefault === 0} class="text-xs">
										<GitMerge class="mr-2 size-3.5" />
										<div class="flex-1">
											<div>Merge from {branchData()?.defaultBranch || "main"}</div>
											<div class="text-[10px] text-muted-foreground">
												<Show when={behindDefault > 0} fallback="Already up to date">
													{`${behindDefault} commit${behindDefault !== 1 ? "s" : ""} to merge`}
												</Show>
											</div>
										</div>
										<Show when={behindDefault > 0}>
											<span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
												↓{behindDefault}
											</span>
										</Show>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleMergeFromDefault(true)} disabled={mergeFromDefaultMutation.isPending || behindDefault === 0} class="text-xs">
										<GitMerge class="mr-2 size-3.5" />
										<div class="flex-1">
											<div>Rebase on {branchData()?.defaultBranch || "main"}</div>
											<div class="text-[10px] text-muted-foreground">
												<Show when={behindDefault > 0} fallback="Already up to date">
													{`Replay on top of ${behindDefault} commit${behindDefault !== 1 ? "s" : ""}`}
												</Show>
											</div>
										</div>
										<Show when={behindDefault > 0}>
											<span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
												↓{behindDefault}
											</span>
										</Show>
									</DropdownMenuItem>
								</Show>

								{ /* PR actions separator */}
								<Show when={hasUpstream && !pr && onCreatePr && !isDefaultBranch() && primaryAction.label !== "Create PR" || hasUpstream && !pr && onCreatePrWithAI && !isDefaultBranch() || pr || hasPrNumber && isPrOpen && onMergePr}>
									<DropdownMenuSeparator />
								</Show>

								{ /* Create PR */}
								<Show when={hasUpstream && !pr && onCreatePr && !isDefaultBranch() && primaryAction.label !== "Create PR"}>
									<DropdownMenuItem onClick={onCreatePr} disabled={isCreatingPr || aheadOfDefault === 0} class="text-xs">
										<GitPullRequest class="mr-2 size-3.5" />
										<div class="flex-1">
											<div>
												<Show when={isCreatingPr} fallback="Create Pull Request">
													Creating...
												</Show>
											</div>
											<Show when={aheadOfDefault === 0}>
												<div class="text-[10px] text-muted-foreground">
													No commits to merge into {branchData()?.defaultBranch || "main"}
												</div>
											</Show>
										</div>
										<Show when={aheadOfDefault > 0}>
											<span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
												↑{aheadOfDefault}
											</span>
										</Show>
									</DropdownMenuItem>
								</Show>

								{ /* Create PR with AI */}
								<Show when={hasUpstream && !pr && onCreatePrWithAI && !isDefaultBranch()}>
									<DropdownMenuItem onClick={onCreatePrWithAI} disabled={isCreatingPrWithAI} class="text-xs">
										<GitPullRequest class="mr-2 size-3.5" />
										<div class="flex-1">
											<div>
												<Show when={isCreatingPrWithAI} fallback="Create PR with AI">
													Creating...
												</Show>
											</div>
											<div class="text-[10px] text-muted-foreground">
												Let AI create and push PR
											</div>
										</div>
									</DropdownMenuItem>
								</Show>

								{ /* Open PR */}
								<Show when={pr && primaryAction.label !== "Open PR"}>
									<DropdownMenuItem onClick={handleOpenPR} class="text-xs">
										<ExternalLinkIcon class="mr-2 size-3.5" />
										<span>Open Pull Request #{pr.number}</span>
									</DropdownMenuItem>
								</Show>

								{ /* Merge PR */}
								<Show when={hasPrNumber && isPrOpen && onMergePr && !hasMergeConflicts}>
									<DropdownMenuItem onClick={onMergePr} disabled={isMergingPr} class="text-xs">
										<GitMerge class="mr-2 size-3.5" />
										<span>
											<Show when={isMergingPr} fallback="Merge Pull Request">
												Merging...
											</Show>
										</span>
									</DropdownMenuItem>
								</Show>

								{ /* Fix Conflicts */}
								<Show when={hasPrNumber && isPrOpen && hasMergeConflicts && onFixConflicts}>
									<DropdownMenuItem onClick={onFixConflicts} class="text-xs text-yellow-600 dark:text-yellow-500">
										<GitMerge class="mr-2 size-3.5" />
										<span>Fix Merge Conflicts</span>
									</DropdownMenuItem>
								</Show>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>}
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<button onClick={displayAction.handler} disabled={displayAction.isPending || displayAction.disabled} class={cn("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70", "disabled:pointer-events-none disabled:opacity-50", "h-6 px-2 gap-1 text-xs rounded-md focus:z-10 overflow-hidden", "transition-all duration-200 ease-out", displayAction.variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]" : "hover:bg-accent hover:text-accent-foreground")}>
								<span class="flex items-center gap-1 transition-opacity duration-150 min-w-0">
									<Show
										when={displayAction.isPending}
										fallback={<>
											<span class="shrink-0">{displayAction.icon}</span>
											<Show when={displayAction.label}>
												<span class="truncate">{displayAction.label}</span>
											</Show>
											<Show when={displayAction.badge}>
												<span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
													{displayAction.badge}
												</span>
											</Show>
										</>}
									>
										<IconSpinner class="size-3.5 ml-0.5 shrink-0" />
										<Show when={displayAction.pendingLabel}>
											<span class="mr-0.5 truncate">{displayAction.pendingLabel}</span>
										</Show>
										<Show when={displayAction.badge}>
											<span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
												{displayAction.badge}
											</span>
										</Show>
									</Show>
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom">{displayAction.tooltip}</TooltipContent>
					</Tooltip>
				</Show>

				{ /* View mode toggle - visible when there's enough space */}
				<Show when={showViewModeToggle && onViewModeChange}>
					<div class="inline-flex rounded-md border border-input">
						<Button variant={viewMode === "split" ? "secondary" : "ghost"} size="sm" onClick={() => onViewModeChange("split")} class={cn("h-6 w-6 p-0 rounded-r-none border-0", viewMode !== "split" && "hover:bg-foreground/10")} title="Split view">
							<Columns2 class="size-3.5" />
						</Button>
						<Button variant={viewMode === "unified" ? "secondary" : "ghost"} size="sm" onClick={() => onViewModeChange("unified")} class={cn("h-6 w-6 p-0 rounded-l-none border-0 border-l border-input", viewMode !== "unified" && "hover:bg-foreground/10")} title="Unified view">
							<Rows2 class="size-3.5" />
						</Button>
					</div>
				</Show>

				{ /* Overflow menu (three dots) - view options, expand/collapse, hidden items */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10">
							<MoreHorizontal class="size-4 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="w-48">
						{ /* Review - shown here when button is hidden */}
						<Show when={!showReviewButton && diffStats.hasChanges && onReview}>
							<DropdownMenuItem onClick={onReview} disabled={isReviewing} class="text-xs">
								<IconReview class="mr-2 size-3.5" />
								<span>
									<Show when={isReviewing} fallback="Review changes">
										Reviewing...
									</Show>
								</span>
							</DropdownMenuItem>
						</Show>

						{ /* Separator only if we have hidden review above */}
						<Show when={!showReviewButton && diffStats.hasChanges && onReview}>
							<DropdownMenuSeparator />
						</Show>

						{ /* Refresh diff view */}
						<Show when={onRefresh}>
							<DropdownMenuItem onClick={onRefresh} class="text-xs">
								<RefreshCw class="mr-2 size-3.5" />
								<span>Refresh diff view</span>
							</DropdownMenuItem>
						</Show>

						{ /* Separator after refresh if view mode submenu follows */}
						<Show when={onRefresh && !showViewModeToggle && onViewModeChange}>
							<DropdownMenuSeparator />
						</Show>

						{ /* View mode submenu - only shown when toggle is hidden */}
						<Show when={!showViewModeToggle && onViewModeChange}>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger class="text-xs">
									<Eye class="mr-2 size-3.5" />
									<span>View</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => onViewModeChange("split")} class={cn("text-xs", viewMode === "split" && "bg-muted")}>
										<Columns2 class="mr-2 size-3.5" />
										<span>Split view</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onViewModeChange("unified")} class={cn("text-xs", viewMode === "unified" && "bg-muted")}>
										<Rows2 class="mr-2 size-3.5" />
										<span>Unified view</span>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
						</Show>

						{ /* Expand/Collapse all */}
						<Show when={onExpandAll}>
							<DropdownMenuItem onClick={onExpandAll} class="text-xs">
								<ChevronsUpDown class="mr-2 size-3.5" />
								<span>Expand all</span>
							</DropdownMenuItem>
						</Show>
						<Show when={onCollapseAll}>
							<DropdownMenuItem onClick={onCollapseAll} class="text-xs">
								<ChevronsDownUp class="mr-2 size-3.5" />
								<span>Collapse all</span>
							</DropdownMenuItem>
						</Show>

						{ /* Mark all as viewed/unviewed */}
						<Show when={(onMarkAllViewed || onMarkAllUnviewed) && (onExpandAll || onCollapseAll)}>
							<DropdownMenuSeparator />
						</Show>
						<Show when={onMarkAllViewed}>
							<DropdownMenuItem onClick={onMarkAllViewed} class="text-xs">
								<Check class="mr-2 size-3.5" />
								<span>Mark all as viewed</span>
							</DropdownMenuItem>
						</Show>
						<Show when={onMarkAllUnviewed && viewedCount > 0}>
							<DropdownMenuItem onClick={onMarkAllUnviewed} class="text-xs">
								<Square class="mr-2 size-3.5" />
								<span>Mark all as unviewed</span>
							</DropdownMenuItem>
						</Show>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>;
 }
