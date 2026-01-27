"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffSidebarHeader = void 0;
var button_1 = require("../../../../components/ui/button");
var dropdown_menu_1 = require("../../../../components/ui/dropdown-menu");
var context_menu_1 = require("../../../../components/ui/context-menu");
var tooltip_1 = require("../../../../components/ui/tooltip");
var icons_1 = require("../../../../components/ui/icons");
var diff_view_mode_switcher_1 = require("./diff-view-mode-switcher");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var lucide_solid_2 = require("lucide-solid");
var trpc_1 = require("../../../../lib/trpc");
var utils_1 = require("../../../../lib/utils");
var usePRStatus_1 = require("../../../../hooks/usePRStatus");
var pr_icon_1 = require("../pr-icon");
var solid_sonner_1 = require("solid-sonner");
var react_1 = require("@git-diff-view/react");
function formatTimeSince(date) {
    var seconds = Math.floor((Date.now() - date.getTime()) / 1e3);
    if (seconds < 60)
        return "just now";
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return "".concat(minutes, "m ago");
    var hours = Math.floor(minutes / 60);
    if (hours < 24)
        return "".concat(hours, "h ago");
    var days = Math.floor(hours / 24);
    return "".concat(days, "d ago");
}
exports.DiffSidebarHeader = memo(function DiffSidebarHeader(_a) {
    var worktreePath = _a.worktreePath, currentBranch = _a.currentBranch, diffStats = _a.diffStats, _b = _a.sidebarWidth, sidebarWidth = _b === void 0 ? 800 : _b, _c = _a.pushCount, pushCount = _c === void 0 ? 0 : _c, _d = _a.pullCount, pullCount = _d === void 0 ? 0 : _d, _e = _a.hasUpstream, hasUpstream = _e === void 0 ? true : _e, _f = _a.isSyncStatusLoading, isSyncStatusLoading = _f === void 0 ? false : _f, _g = _a.aheadOfDefault, aheadOfDefault = _g === void 0 ? 0 : _g, _h = _a.behindDefault, behindDefault = _h === void 0 ? 0 : _h, onReview = _a.onReview, _j = _a.isReviewing, isReviewing = _j === void 0 ? false : _j, onCreatePr = _a.onCreatePr, _k = _a.isCreatingPr, isCreatingPr = _k === void 0 ? false : _k, onCreatePrWithAI = _a.onCreatePrWithAI, _l = _a.isCreatingPrWithAI, isCreatingPrWithAI = _l === void 0 ? false : _l, onMergePr = _a.onMergePr, _m = _a.isMergingPr, isMergingPr = _m === void 0 ? false : _m, onClose = _a.onClose, onRefresh = _a.onRefresh, _o = _a.hasPrNumber, hasPrNumber = _o === void 0 ? false : _o, _p = _a.isPrOpen, isPrOpen = _p === void 0 ? false : _p, _q = _a.hasMergeConflicts, hasMergeConflicts = _q === void 0 ? false : _q, onFixConflicts = _a.onFixConflicts, onExpandAll = _a.onExpandAll, onCollapseAll = _a.onCollapseAll, _r = _a.viewMode, viewMode = _r === void 0 ? react_1.DiffModeEnum.Unified : _r, onViewModeChange = _a.onViewModeChange, _s = _a.viewedCount, viewedCount = _s === void 0 ? 0 : _s, onMarkAllViewed = _a.onMarkAllViewed, onMarkAllUnviewed = _a.onMarkAllUnviewed, _t = _a.isDesktop, isDesktop = _t === void 0 ? false : _t, _u = _a.isFullscreen, isFullscreen = _u === void 0 ? false : _u, _v = _a.displayMode, displayMode = _v === void 0 ? "side-peek" : _v, onDisplayModeChange = _a.onDisplayModeChange;
    // Responsive breakpoints - progressive disclosure
    var isCompact = sidebarWidth < 350;
    var showViewModeToggle = sidebarWidth >= 450;
    var showReviewButton = sidebarWidth >= 550;
    var _w = (0, solid_js_1.createSignal)(null), lastFetchTime = _w[0], setLastFetchTime = _w[1];
    var _x = (0, solid_js_1.createSignal)(false), isRefreshing = _x[0], setIsRefreshing = _x[1];
    var _y = (0, solid_js_1.createSignal)(""), displayTime = _y[0], setDisplayTime = _y[1];
    var _z = (0, solid_js_1.createSignal)(null), timeoutRef = _z[0], setTimeoutRef = _z[1];
    var _0 = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath }, { enabled: !!worktreePath }), branchData = _0.data, refetchBranches = _0.refetch;
    // Check if current branch is the default branch (main/master)
    var isDefaultBranch = currentBranch === (branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch);
    var fetchMutation = trpc_1.trpc.changes.fetch.useMutation({ onSuccess: function () {
            setLastFetchTime(new Date());
            refetchBranches();
            onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        } });
    var pushMutation = trpc_1.trpc.changes.push.useMutation({
        onSuccess: function () {
            onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Push failed: ".concat(error.message)); }
    });
    var pullMutation = trpc_1.trpc.changes.pull.useMutation({
        onSuccess: function () {
            onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Pull failed: ".concat(error.message)); }
    });
    var forcePushMutation = trpc_1.trpc.changes.forcePush.useMutation({
        onSuccess: function () {
            onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Force push failed: ".concat(error.message)); }
    });
    var mergeFromDefaultMutation = trpc_1.trpc.changes.mergeFromDefault.useMutation({
        onSuccess: function () {
            onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Merge failed: ".concat(error.message)); }
    });
    var pr = (0, usePRStatus_1.usePRStatus)({
        worktreePath: worktreePath,
        refetchInterval: 3e4
    }).pr;
    // Update display time every minute
    (0, solid_js_1.createEffect)(function () {
        if (!lastFetchTime)
            return;
        var updateTime = function () {
            setDisplayTime(formatTimeSince(lastFetchTime));
        };
        updateTime();
        var interval = setInterval(updateTime, 6e4);
        return function () { return clearInterval(interval); };
    });
    var handleFetch = function () {
        setIsRefreshing(true);
        fetchMutation.mutate({ worktreePath: worktreePath }, { onSettled: function () {
                if (timeoutRef.current)
                    clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(function () { return setIsRefreshing(false); }, 600);
            } });
    };
    var handlePush = function () {
        pushMutation.mutate({
            worktreePath: worktreePath,
            setUpstream: !hasUpstream
        });
    };
    var handlePull = function () {
        pullMutation.mutate({
            worktreePath: worktreePath,
            autoStash: true
        });
    };
    var handleForcePush = function () {
        if (window.confirm("Are you sure you want to force push? This will overwrite the remote branch.")) {
            forcePushMutation.mutate({ worktreePath: worktreePath });
        }
    };
    var handleMergeFromDefault = function (useRebase) {
        if (useRebase === void 0) { useRebase = false; }
        mergeFromDefaultMutation.mutate({
            worktreePath: worktreePath,
            useRebase: useRebase
        });
    };
    var handleOpenPR = function () {
        if (pr === null || pr === void 0 ? void 0 : pr.url) {
            window.open(pr.url, "_blank");
        }
    };
    var handleCopyPRLink = function () {
        if (pr === null || pr === void 0 ? void 0 : pr.url) {
            navigator.clipboard.writeText(pr.url);
        }
    };
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    });
    // Check pending states
    var isPushPending = pushMutation.isPending;
    var isPullPending = pullMutation.isPending;
    var isFetchPending = isRefreshing || fetchMutation.isPending;
    var getPrimaryAction = function () {
        // 0. Loading state - show loading indicator
        if (isSyncStatusLoading) {
            return {
                label: "",
                pendingLabel: "",
                icon: <icons_1.IconFetch class="size-3.5"/>,
                handler: function () { },
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
                icon: <lucide_solid_2.Upload class="size-3.5"/>,
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
                icon: <lucide_solid_2.ArrowDown class="size-3.5"/>,
                handler: handlePull,
                tooltip: "Pull ".concat(pullCount, " commit").concat(pullCount !== 1 ? "s" : "", " from remote"),
                badge: "\u2193".concat(pullCount),
                variant: "default",
                isPending: isPullPending
            };
        }
        // 3. We have commits to push
        if (pushCount > 0) {
            return {
                label: "Push",
                pendingLabel: "Pushing...",
                icon: <lucide_solid_2.ArrowUp class="size-3.5"/>,
                handler: handlePush,
                tooltip: "Push ".concat(pushCount, " commit").concat(pushCount !== 1 ? "s" : "", " to remote"),
                badge: "\u2191".concat(pushCount),
                variant: "default",
                isPending: isPushPending
            };
        }
        // 4. PR exists - Open PR as primary
        if (pr) {
            return {
                label: "Open PR",
                icon: <icons_1.ExternalLinkIcon class="size-3.5"/>,
                handler: handleOpenPR,
                tooltip: "Open Pull Request #".concat(pr.number),
                variant: "ghost"
            };
        }
        // 5. No PR, branch is synced - Create PR if ahead of default, otherwise Fetch
        if (hasUpstream && !pr) {
            // Show Create PR if we have commits ahead of default branch (not on default branch)
            if (aheadOfDefault > 0 && !isDefaultBranch && onCreatePr) {
                return {
                    label: "Create PR",
                    pendingLabel: "Creating...",
                    icon: <lucide_solid_2.GitPullRequest class="size-3.5"/>,
                    handler: onCreatePr,
                    tooltip: "Create Pull Request (".concat(aheadOfDefault, " commit").concat(aheadOfDefault !== 1 ? "s" : "", " ahead of ").concat((branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) || "main", ")"),
                    badge: "\u2191".concat(aheadOfDefault),
                    variant: "default",
                    isPending: isCreatingPr
                };
            }
            // Otherwise show Fetch
            return {
                label: "Fetch",
                pendingLabel: "Fetching...",
                icon: <icons_1.IconFetch class="size-3.5"/>,
                handler: handleFetch,
                tooltip: lastFetchTime ? "Last fetched ".concat(displayTime) : "Check for updates",
                variant: "ghost",
                isPending: isFetchPending
            };
        }
        // 6. Fallback - Fetch
        return {
            label: "Fetch",
            pendingLabel: "Fetching...",
            icon: <icons_1.IconFetch class="size-3.5"/>,
            handler: handleFetch,
            tooltip: "Check for updates",
            variant: "ghost",
            isPending: isFetchPending
        };
    };
    var primaryAction = getPrimaryAction();
    // Override primary action when fetching from dropdown
    var displayAction = isFetchPending && !primaryAction.isPending ? {
        label: "Fetching",
        pendingLabel: "Fetching...",
        icon: <icons_1.IconFetch class="size-3.5"/>,
        handler: function () { },
        tooltip: "Fetching from remote...",
        variant: primaryAction.variant,
        isPending: true
    } : primaryAction;
    return <div class="relative flex items-center justify-between h-10 px-2 border-b border-border/50 bg-background flex-shrink-0">
			{/* Drag region for window dragging */}
			{isDesktop && !isFullscreen && <div class="absolute inset-0 z-0" style={{ WebkitAppRegion: "drag" }}/>}
			{/* Left side: Close button + Branch selector */}
			<div class="relative z-10 flex items-center gap-1 min-w-0 flex-shrink" style={{ WebkitAppRegion: "no-drag" }}>
				{/* Close button - X icon for dialog/fullpage modes, chevron for sidebar */}
				<button_1.Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10" onClick={onClose}>
					{displayMode === "side-peek" ? <icons_1.IconCloseSidebarRight class="size-4 text-muted-foreground"/> : <lucide_solid_2.X class="size-4 text-muted-foreground"/>}
				</button_1.Button>

				{/* Display mode switcher (side-peek, center-peek, full-page) */}
				{onDisplayModeChange && <diff_view_mode_switcher_1.DiffViewModeSwitcher mode={displayMode} onModeChange={onDisplayModeChange}/>}

				{/* Branch name display (branch switching will be added later) */}
				<div class="h-6 px-2 gap-1 text-xs font-medium min-w-0 flex items-center">
					<LuGitBranch class="size-3.5 shrink-0 opacity-70"/>
					<span class="truncate max-w-[120px] text-foreground">
						{currentBranch || "No branch"}
					</span>
				</div>

				{/* PR Status badge */}
				{pr && <context_menu_1.ContextMenu>
						<context_menu_1.ContextMenuTrigger asChild>
							<a href={pr.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 h-6 px-2 rounded-md hover:bg-foreground/10 transition-colors">
								<pr_icon_1.PRIcon state={pr.state} class="size-3.5"/>
								<span class="text-xs text-muted-foreground font-mono">
									#{pr.number}
								</span>
							</a>
						</context_menu_1.ContextMenuTrigger>
						<context_menu_1.ContextMenuContent>
							<context_menu_1.ContextMenuItem onClick={handleOpenPR} class="text-xs">
								Open in browser
							</context_menu_1.ContextMenuItem>
							<context_menu_1.ContextMenuItem onClick={handleCopyPRLink} class="text-xs">
								Copy link
							</context_menu_1.ContextMenuItem>
						</context_menu_1.ContextMenuContent>
					</context_menu_1.ContextMenu>}
			</div>

			{/* Right side: Review + View mode toggle + Primary action (split button) + Secondary action + Overflow menu */}
			<div class="relative z-10 flex items-center gap-1 flex-shrink-0" style={{ WebkitAppRegion: "no-drag" }}>
				{/* Review button - visible when there's enough space */}
				{showReviewButton && diffStats.hasChanges && onReview && <tooltip_1.Tooltip>
						<tooltip_1.TooltipTrigger asChild>
							<button_1.Button variant="ghost" size="sm" onClick={onReview} disabled={isReviewing} class="h-6 px-2 gap-1 text-xs hover:bg-foreground/10">
								{isReviewing ? <icons_1.IconSpinner class="size-3.5"/> : <icons_1.IconReview class="size-3.5"/>}
								<span>Review</span>
							</button_1.Button>
						</tooltip_1.TooltipTrigger>
						<tooltip_1.TooltipContent side="bottom">Review changes with AI</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip>}

				{/* Primary action button (solo when Fetch/Open PR, split when Push/Pull/Create PR) */}
				{displayAction.label === "Fetch" || displayAction.label === "Fetching" || displayAction.label === "Open PR" ? <tooltip_1.Tooltip>
						<tooltip_1.TooltipTrigger asChild>
							<button onClick={displayAction.handler} disabled={displayAction.isPending || displayAction.disabled} class={(0, utils_1.cn)("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70", "disabled:pointer-events-none disabled:opacity-50", "h-6 px-2 gap-1 text-xs rounded-md focus:z-10 overflow-hidden", "transition-all duration-200 ease-out", displayAction.variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]" : "hover:bg-accent hover:text-accent-foreground")}>
								<span class="flex items-center gap-1 transition-opacity duration-150 min-w-0">
									{displayAction.isPending ? <>
											<icons_1.IconSpinner class="size-3.5 ml-0.5 shrink-0"/>
											{displayAction.pendingLabel && <span class="mr-0.5 truncate">{displayAction.pendingLabel}</span>}
											{displayAction.badge && <span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
													{displayAction.badge}
												</span>}
										</> : <>
											<span class="shrink-0">{displayAction.icon}</span>
											{displayAction.label && <span class="truncate">{displayAction.label}</span>}
											{displayAction.badge && <span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
													{displayAction.badge}
												</span>}
										</>}
								</span>
							</button>
						</tooltip_1.TooltipTrigger>
						<tooltip_1.TooltipContent side="bottom">{displayAction.tooltip}</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip> : <div class="inline-flex -space-x-px rounded-md">
						<tooltip_1.Tooltip>
							<tooltip_1.TooltipTrigger asChild>
								<button onClick={displayAction.handler} disabled={displayAction.isPending || displayAction.disabled} class={(0, utils_1.cn)("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70", "disabled:pointer-events-none disabled:opacity-50", "h-6 px-2 gap-1 text-xs rounded-l-md rounded-r-none focus:z-10 overflow-hidden", "transition-all duration-200 ease-out", displayAction.variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]" : "hover:bg-accent hover:text-accent-foreground")}>
									<span class="flex items-center gap-1 transition-opacity duration-150 min-w-0">
										{displayAction.isPending ? <>
												<icons_1.IconSpinner class="size-3.5 ml-0.5 shrink-0"/>
												{displayAction.pendingLabel && <span class="mr-0.5 truncate">{displayAction.pendingLabel}</span>}
												{displayAction.badge && <span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
														{displayAction.badge}
													</span>}
											</> : <>
												<span class="shrink-0">{displayAction.icon}</span>
												{displayAction.label && <span class="truncate">{displayAction.label}</span>}
												{displayAction.badge && <span class="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-medium ml-1 shrink-0">
														{displayAction.badge}
													</span>}
											</>}
									</span>
								</button>
							</tooltip_1.TooltipTrigger>
							<tooltip_1.TooltipContent side="bottom">{displayAction.tooltip}</tooltip_1.TooltipContent>
						</tooltip_1.Tooltip>

						{/* Dropdown trigger for git operations */}
						<dropdown_menu_1.DropdownMenu>
							<dropdown_menu_1.DropdownMenuTrigger asChild>
								<button_1.Button variant={displayAction.variant === "default" ? "default" : "ghost"} size="sm" disabled={displayAction.isPending} class={(0, utils_1.cn)("h-6 w-6 p-0 rounded-l-none rounded-r-md focus:z-10", displayAction.variant === "ghost" && "hover:bg-accent hover:text-accent-foreground shadow-none")} aria-label="More git options">
									<lucide_solid_1.ChevronDown class="size-3"/>
								</button_1.Button>
							</dropdown_menu_1.DropdownMenuTrigger>
							<dropdown_menu_1.DropdownMenuContent align="end" class="w-52">
								{/* Fetch - available when primary action is NOT Fetch */}
								<dropdown_menu_1.DropdownMenuItem onClick={handleFetch} disabled={isFetchPending} class="text-xs">
									<lucide_solid_1.RefreshCw class={(0, utils_1.cn)("mr-2 size-3.5", isFetchPending && "animate-spin")}/>
									<div class="flex-1">
										<div>Fetch origin</div>
										<div class="text-[10px] text-muted-foreground">
											{lastFetchTime ? "Last fetched ".concat(displayTime) : "Check for updates"}
										</div>
									</div>
								</dropdown_menu_1.DropdownMenuItem>

								{/* Force Push - only when history diverged (remote has commits we don't have locally) */}
								{hasUpstream && pullCount > 0 && <dropdown_menu_1.DropdownMenuItem onClick={handleForcePush} disabled={forcePushMutation.isPending} class="text-xs data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400 [&_div]:data-[highlighted]:text-red-400/70">
										<icons_1.IconForcePush class="mr-2 size-3.5"/>
										<div class="flex-1">
											<div>Force push</div>
											<div class="text-[10px] text-muted-foreground/70">
												Overwrite remote (dangerous)
											</div>
										</div>
									</dropdown_menu_1.DropdownMenuItem>}

								{/* Merge/Rebase from default branch */}
								{!isDefaultBranch && hasUpstream && <>
										<dropdown_menu_1.DropdownMenuSeparator />
										<dropdown_menu_1.DropdownMenuItem onClick={function () { return handleMergeFromDefault(false); }} disabled={mergeFromDefaultMutation.isPending || behindDefault === 0} class="text-xs">
											<lucide_solid_2.GitMerge class="mr-2 size-3.5"/>
											<div class="flex-1">
												<div>Merge from {(branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) || "main"}</div>
												<div class="text-[10px] text-muted-foreground">
													{behindDefault > 0 ? "".concat(behindDefault, " commit").concat(behindDefault !== 1 ? "s" : "", " to merge") : "Already up to date"}
												</div>
											</div>
											{behindDefault > 0 && <span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
													↓{behindDefault}
												</span>}
										</dropdown_menu_1.DropdownMenuItem>
										<dropdown_menu_1.DropdownMenuItem onClick={function () { return handleMergeFromDefault(true); }} disabled={mergeFromDefaultMutation.isPending || behindDefault === 0} class="text-xs">
											<lucide_solid_2.GitMerge class="mr-2 size-3.5"/>
											<div class="flex-1">
												<div>Rebase on {(branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) || "main"}</div>
												<div class="text-[10px] text-muted-foreground">
													{behindDefault > 0 ? "Replay on top of ".concat(behindDefault, " commit").concat(behindDefault !== 1 ? "s" : "") : "Already up to date"}
												</div>
											</div>
											{behindDefault > 0 && <span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
													↓{behindDefault}
												</span>}
										</dropdown_menu_1.DropdownMenuItem>
									</>}

								{/* PR actions separator */}
								{(hasUpstream && !pr && onCreatePr && !isDefaultBranch && primaryAction.label !== "Create PR" || hasUpstream && !pr && onCreatePrWithAI && !isDefaultBranch || pr || hasPrNumber && isPrOpen && onMergePr) && <dropdown_menu_1.DropdownMenuSeparator />}

								{/* Create PR */}
								{hasUpstream && !pr && onCreatePr && !isDefaultBranch && primaryAction.label !== "Create PR" && <dropdown_menu_1.DropdownMenuItem onClick={onCreatePr} disabled={isCreatingPr || aheadOfDefault === 0} class="text-xs">
										<lucide_solid_2.GitPullRequest class="mr-2 size-3.5"/>
										<div class="flex-1">
											<div>{isCreatingPr ? "Creating..." : "Create Pull Request"}</div>
											{aheadOfDefault === 0 && <div class="text-[10px] text-muted-foreground">
													No commits to merge into {(branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) || "main"}
												</div>}
										</div>
										{aheadOfDefault > 0 && <span class="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium ml-2">
												↑{aheadOfDefault}
											</span>}
									</dropdown_menu_1.DropdownMenuItem>}

								{/* Create PR with AI */}
								{hasUpstream && !pr && onCreatePrWithAI && !isDefaultBranch && <dropdown_menu_1.DropdownMenuItem onClick={onCreatePrWithAI} disabled={isCreatingPrWithAI} class="text-xs">
										<lucide_solid_2.GitPullRequest class="mr-2 size-3.5"/>
										<div class="flex-1">
											<div>{isCreatingPrWithAI ? "Creating..." : "Create PR with AI"}</div>
											<div class="text-[10px] text-muted-foreground">
												Let AI create and push PR
											</div>
										</div>
									</dropdown_menu_1.DropdownMenuItem>}

								{/* Open PR */}
								{pr && primaryAction.label !== "Open PR" && <dropdown_menu_1.DropdownMenuItem onClick={handleOpenPR} class="text-xs">
										<icons_1.ExternalLinkIcon class="mr-2 size-3.5"/>
										<span>Open Pull Request #{pr.number}</span>
									</dropdown_menu_1.DropdownMenuItem>}

								{/* Merge PR */}
								{hasPrNumber && isPrOpen && onMergePr && !hasMergeConflicts && <dropdown_menu_1.DropdownMenuItem onClick={onMergePr} disabled={isMergingPr} class="text-xs">
										<lucide_solid_2.GitMerge class="mr-2 size-3.5"/>
										<span>{isMergingPr ? "Merging..." : "Merge Pull Request"}</span>
									</dropdown_menu_1.DropdownMenuItem>}

								{/* Fix Conflicts */}
								{hasPrNumber && isPrOpen && hasMergeConflicts && onFixConflicts && <dropdown_menu_1.DropdownMenuItem onClick={onFixConflicts} class="text-xs text-yellow-600 dark:text-yellow-500">
										<lucide_solid_2.GitMerge class="mr-2 size-3.5"/>
										<span>Fix Merge Conflicts</span>
									</dropdown_menu_1.DropdownMenuItem>}
							</dropdown_menu_1.DropdownMenuContent>
						</dropdown_menu_1.DropdownMenu>
					</div>}

				{/* View mode toggle - visible when there's enough space */}
				{showViewModeToggle && onViewModeChange && <div class="inline-flex rounded-md border border-input">
						<button_1.Button variant={viewMode === react_1.DiffModeEnum.Split ? "secondary" : "ghost"} size="sm" onClick={function () { return onViewModeChange(react_1.DiffModeEnum.Split); }} class={(0, utils_1.cn)("h-6 w-6 p-0 rounded-r-none border-0", viewMode !== react_1.DiffModeEnum.Split && "hover:bg-foreground/10")} title="Split view">
							<lucide_solid_2.Columns2 class="size-3.5"/>
						</button_1.Button>
						<button_1.Button variant={viewMode === react_1.DiffModeEnum.Unified ? "secondary" : "ghost"} size="sm" onClick={function () { return onViewModeChange(react_1.DiffModeEnum.Unified); }} class={(0, utils_1.cn)("h-6 w-6 p-0 rounded-l-none border-0 border-l border-input", viewMode !== react_1.DiffModeEnum.Unified && "hover:bg-foreground/10")} title="Unified view">
							<lucide_solid_2.Rows2 class="size-3.5"/>
						</button_1.Button>
					</div>}

				{/* Overflow menu (three dots) - view options, expand/collapse, hidden items */}
				<dropdown_menu_1.DropdownMenu>
					<dropdown_menu_1.DropdownMenuTrigger asChild>
						<button_1.Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10">
							<lucide_solid_2.MoreHorizontal class="size-4 text-muted-foreground"/>
						</button_1.Button>
					</dropdown_menu_1.DropdownMenuTrigger>
					<dropdown_menu_1.DropdownMenuContent align="end" class="w-48">
						{/* Review - shown here when button is hidden */}
						{!showReviewButton && diffStats.hasChanges && onReview && <dropdown_menu_1.DropdownMenuItem onClick={onReview} disabled={isReviewing} class="text-xs">
								<icons_1.IconReview class="mr-2 size-3.5"/>
								<span>{isReviewing ? "Reviewing..." : "Review changes"}</span>
							</dropdown_menu_1.DropdownMenuItem>}

						{/* Separator only if we have hidden review above */}
						{!showReviewButton && diffStats.hasChanges && onReview && <dropdown_menu_1.DropdownMenuSeparator />}

						{/* Refresh diff view */}
						{onRefresh && <dropdown_menu_1.DropdownMenuItem onClick={onRefresh} class="text-xs">
								<lucide_solid_1.RefreshCw class="mr-2 size-3.5"/>
								<span>Refresh diff view</span>
							</dropdown_menu_1.DropdownMenuItem>}

						{/* Separator after refresh if view mode submenu follows */}
						{onRefresh && !showViewModeToggle && onViewModeChange && <dropdown_menu_1.DropdownMenuSeparator />}

						{/* View mode submenu - only shown when toggle is hidden */}
						{!showViewModeToggle && onViewModeChange && <>
								<dropdown_menu_1.DropdownMenuSub>
									<dropdown_menu_1.DropdownMenuSubTrigger class="text-xs">
										<lucide_solid_2.Eye class="mr-2 size-3.5"/>
										<span>View</span>
									</dropdown_menu_1.DropdownMenuSubTrigger>
									<dropdown_menu_1.DropdownMenuSubContent>
										<dropdown_menu_1.DropdownMenuItem onClick={function () { return onViewModeChange(react_1.DiffModeEnum.Split); }} class={(0, utils_1.cn)("text-xs", viewMode === react_1.DiffModeEnum.Split && "bg-muted")}>
											<lucide_solid_2.Columns2 class="mr-2 size-3.5"/>
											<span>Split view</span>
										</dropdown_menu_1.DropdownMenuItem>
										<dropdown_menu_1.DropdownMenuItem onClick={function () { return onViewModeChange(react_1.DiffModeEnum.Unified); }} class={(0, utils_1.cn)("text-xs", viewMode === react_1.DiffModeEnum.Unified && "bg-muted")}>
											<lucide_solid_2.Rows2 class="mr-2 size-3.5"/>
											<span>Unified view</span>
										</dropdown_menu_1.DropdownMenuItem>
									</dropdown_menu_1.DropdownMenuSubContent>
								</dropdown_menu_1.DropdownMenuSub>
								<dropdown_menu_1.DropdownMenuSeparator />
							</>}

						{/* Expand/Collapse all */}
						{onExpandAll && <dropdown_menu_1.DropdownMenuItem onClick={onExpandAll} class="text-xs">
								<lucide_solid_2.ChevronsUpDown class="mr-2 size-3.5"/>
								<span>Expand all</span>
							</dropdown_menu_1.DropdownMenuItem>}
						{onCollapseAll && <dropdown_menu_1.DropdownMenuItem onClick={onCollapseAll} class="text-xs">
								<lucide_solid_2.ChevronsDownUp class="mr-2 size-3.5"/>
								<span>Collapse all</span>
							</dropdown_menu_1.DropdownMenuItem>}

						{/* Mark all as viewed/unviewed */}
						{(onMarkAllViewed || onMarkAllUnviewed) && (onExpandAll || onCollapseAll) && <dropdown_menu_1.DropdownMenuSeparator />}
						{onMarkAllViewed && <dropdown_menu_1.DropdownMenuItem onClick={onMarkAllViewed} class="text-xs">
								<lucide_solid_2.Check class="mr-2 size-3.5"/>
								<span>Mark all as viewed</span>
							</dropdown_menu_1.DropdownMenuItem>}
						{onMarkAllUnviewed && viewedCount > 0 && <dropdown_menu_1.DropdownMenuItem onClick={onMarkAllUnviewed} class="text-xs">
								<lucide_solid_2.Square class="mr-2 size-3.5"/>
								<span>Mark all as unviewed</span>
							</dropdown_menu_1.DropdownMenuItem>}
					</dropdown_menu_1.DropdownMenuContent>
				</dropdown_menu_1.DropdownMenu>
			</div>
		</div>;
});
