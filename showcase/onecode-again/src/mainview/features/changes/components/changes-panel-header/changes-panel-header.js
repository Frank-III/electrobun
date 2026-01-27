"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesPanelHeader = ChangesPanelHeader;
var button_1 = require("../../../../components/ui/button");
var dropdown_menu_1 = require("../../../../components/ui/dropdown-menu");
var tooltip_1 = require("../../../../components/ui/tooltip");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var trpc_1 = require("../../../../lib/trpc");
var utils_1 = require("../../../../lib/utils");
var usePRStatus_1 = require("../../../../hooks/usePRStatus");
var pr_icon_1 = require("../pr-icon");
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
function ChangesPanelHeader(_a) {
    var _b;
    var worktreePath = _a.worktreePath, currentBranch = _a.currentBranch, layoutMode = _a.layoutMode;
    var _c = (0, solid_js_1.createSignal)(null), lastFetchTime = _c[0], setLastFetchTime = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), isRefreshing = _d[0], setIsRefreshing = _d[1];
    var _e = (0, solid_js_1.createSignal)(""), displayTime = _e[0], setDisplayTime = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), timeoutRef = _f[0], setTimeoutRef = _f[1];
    var _g = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath }, { enabled: !!worktreePath }), branchData = _g.data, refetchBranches = _g.refetch;
    var fetchMutation = trpc_1.trpc.changes.fetch.useMutation({ onSuccess: function () {
            setLastFetchTime(new Date());
            refetchBranches();
        } });
    var checkoutMutation = trpc_1.trpc.changes.checkout.useMutation({ onSuccess: function () {
            refetchBranches();
        } });
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
    var handleBranchSelect = function (branch) {
        if (branch === currentBranch)
            return;
        checkoutMutation.mutate({
            worktreePath: worktreePath,
            branch: branch
        });
    };
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    });
    var branches = (_b = branchData === null || branchData === void 0 ? void 0 : branchData.local) !== null && _b !== void 0 ? _b : [];
    var isCompact = layoutMode === "compact";
    return <div class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1.5 flex-1 min-w-0", isCompact && "px-1.5 py-1")}>
			{/* Branch selector */}
			<dropdown_menu_1.DropdownMenu>
				<tooltip_1.Tooltip>
					<tooltip_1.TooltipTrigger asChild>
						<dropdown_menu_1.DropdownMenuTrigger asChild>
							<button_1.Button variant="ghost" size="sm" class={(0, utils_1.cn)("h-6 px-2 gap-1.5 text-xs font-medium min-w-0", isCompact && "h-5 px-1.5 gap-1 text-[10px]")}>
								<lucide_solid_1.GitBranch class={(0, utils_1.cn)("size-3.5 shrink-0", isCompact && "size-3")}/>
								<span class="truncate max-w-[120px]">
									{currentBranch || "No branch"}
								</span>
								<lucide_solid_1.ChevronDown class={(0, utils_1.cn)("size-3 shrink-0 opacity-50", isCompact && "size-2.5")}/>
							</button_1.Button>
						</dropdown_menu_1.DropdownMenuTrigger>
					</tooltip_1.TooltipTrigger>
					<tooltip_1.TooltipContent side="bottom">Switch branch</tooltip_1.TooltipContent>
				</tooltip_1.Tooltip>
				<dropdown_menu_1.DropdownMenuContent align="start" class="w-48">
					{branches.map(function (branchInfo) { return <dropdown_menu_1.DropdownMenuItem key={branchInfo.branch} onClick={function () { return handleBranchSelect(branchInfo.branch); }} class={(0, utils_1.cn)("text-xs", branchInfo.branch === currentBranch && "bg-accent")}>
							<lucide_solid_1.GitBranch class="mr-2 size-3.5"/>
							<span class="truncate">{branchInfo.branch}</span>
							{branchInfo.branch === (branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) && <span class="ml-auto text-[10px] text-muted-foreground">
									default
								</span>}
						</dropdown_menu_1.DropdownMenuItem>; })}
					{branches.length > 0 && <dropdown_menu_1.DropdownMenuSeparator />}
					<dropdown_menu_1.DropdownMenuItem onClick={function () {
            // TODO: Implement create branch dialog
        }} class="text-xs">
						<lucide_solid_1.GitBranch class="mr-2 size-3.5"/>
						Create new branch...
					</dropdown_menu_1.DropdownMenuItem>
				</dropdown_menu_1.DropdownMenuContent>
			</dropdown_menu_1.DropdownMenu>

			{/* Right side: PR status + Fetch */}
			<div class="flex items-center gap-1">
				{/* PR Status */}
				{pr && <tooltip_1.Tooltip>
						<tooltip_1.TooltipTrigger asChild>
							<a href={pr.url} target="_blank" rel="noopener noreferrer" class={(0, utils_1.cn)("flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent transition-colors", isCompact && "px-1")}>
								<pr_icon_1.PRIcon state={pr.state} class={(0, utils_1.cn)("size-3.5", isCompact && "size-3")}/>
								{!isCompact && <span class="text-[10px] text-muted-foreground font-mono">
										#{pr.number}
									</span>}
							</a>
						</tooltip_1.TooltipTrigger>
						<tooltip_1.TooltipContent side="bottom">
							PR #{pr.number}: {pr.title}
						</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip>}

				{/* Fetch button */}
				<tooltip_1.Tooltip>
					<tooltip_1.TooltipTrigger asChild>
						<button_1.Button variant="ghost" size="sm" onClick={handleFetch} disabled={isRefreshing || fetchMutation.isPending} class={(0, utils_1.cn)("h-6 px-2 gap-1.5 text-xs", isCompact && "h-5 px-1.5 gap-1")}>
							<lucide_solid_1.RefreshCw class={(0, utils_1.cn)("size-3.5", (isRefreshing || fetchMutation.isPending) && "animate-spin", isCompact && "size-3")}/>
							{layoutMode !== "compact" && <span class="text-[10px] text-muted-foreground">
									{displayTime || "Fetch"}
								</span>}
						</button_1.Button>
					</tooltip_1.TooltipTrigger>
					<tooltip_1.TooltipContent side="bottom">
						{lastFetchTime ? "Last fetched ".concat(displayTime) : "Fetch from remote"}
					</tooltip_1.TooltipContent>
				</tooltip_1.Tooltip>
			</div>
		</div>;
}
