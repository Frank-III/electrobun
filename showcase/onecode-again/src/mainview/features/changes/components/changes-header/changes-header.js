"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesHeader = ChangesHeader;
var button_1 = require("../../../../components/ui/button");
var select_1 = require("../../../../components/ui/select");
var tooltip_1 = require("../../../../components/ui/tooltip");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../../icons");
var trpc_1 = require("../../../../lib/trpc");
var pr_icon_1 = require("../pr-icon");
var usePRStatus_1 = require("../../../../hooks/usePRStatus");
var changes_store_1 = require("../../../../lib/stores/changes-store");
var view_mode_toggle_1 = require("../view-mode-toggle");
function ChangesHeader(_a) {
    var _b, _c;
    var onRefresh = _a.onRefresh, viewMode = _a.viewMode, onViewModeChange = _a.onViewModeChange, worktreePath = _a.worktreePath;
    var _d = (0, solid_js_1.createSignal)(false), isManualRefresh = _d[0], setIsManualRefresh = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), timeoutRef = _e[0], setTimeoutRef = _e[1];
    var handleRefresh = function () {
        setIsManualRefresh(true);
        onRefresh();
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Stop spinning after a short delay
        timeoutRef.current = setTimeout(function () {
            setIsManualRefresh(false);
        }, 600);
    };
    // Cleanup timeout on unmount
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    });
    var _f = (0, changes_store_1.useChangesStore)(), baseBranch = _f.baseBranch, setBaseBranch = _f.setBaseBranch;
    var _g = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath }, { enabled: !!worktreePath }), branchData = _g.data, isLoading = _g.isLoading;
    var _h = (0, usePRStatus_1.usePRStatus)({
        worktreePath: worktreePath,
        refetchInterval: 1e4
    }), pr = _h.pr, isPRLoading = _h.isLoading;
    var effectiveBaseBranch = (_b = baseBranch !== null && baseBranch !== void 0 ? baseBranch : branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) !== null && _b !== void 0 ? _b : "main";
    var availableBranches = (_c = branchData === null || branchData === void 0 ? void 0 : branchData.remote) !== null && _c !== void 0 ? _c : [];
    var sortedBranches = __spreadArray([], availableBranches, true).sort(function (a, b) {
        if (a === (branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch))
            return -1;
        if (b === (branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch))
            return 1;
        return a.localeCompare(b);
    });
    var handleChange = function (value) {
        if (value === (branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) && baseBranch === null) {
            return;
        }
        setBaseBranch(value);
    };
    return <div class="flex items-center justify-between gap-1.5 px-2 py-1.5">
			<div class="flex items-center gap-1 min-w-0 flex-1">
				<span class="text-[10px] text-muted-foreground shrink-0">
					Base:
				</span>
				{isLoading || !branchData ? <span class="px-1.5 py-0.5 rounded bg-muted/50 text-foreground text-[10px] font-medium truncate">
						{effectiveBaseBranch}
					</span> : <tooltip_1.Tooltip>
						<select_1.Select value={effectiveBaseBranch} onValueChange={handleChange}>
							<tooltip_1.TooltipTrigger asChild>
								<select_1.SelectTrigger class="h-5 px-1.5 py-0 text-[10px] font-medium border-none bg-muted/50 hover:bg-muted text-foreground min-w-0 w-auto gap-0.5 rounded">
									<select_1.SelectValue />
								</select_1.SelectTrigger>
							</tooltip_1.TooltipTrigger>
							<select_1.SelectContent align="start">
								{sortedBranches.filter(function (branch) { return branch; }).map(function (branch) { return <select_1.SelectItem key={branch} value={branch} class="text-xs">
											{branch}
											{branch === branchData.defaultBranch && <span class="ml-1 text-muted-foreground">
													(default)
												</span>}
										</select_1.SelectItem>; })}
							</select_1.SelectContent>
						</select_1.Select>
						<tooltip_1.TooltipContent side="bottom" showArrow={false}>
							Change base branch
						</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip>}
			</div>
			<div class="flex items-center shrink-0">
				<view_mode_toggle_1.ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange}/>
				<tooltip_1.Tooltip>
					<tooltip_1.TooltipTrigger asChild>
						<button_1.Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isManualRefresh} class="size-6 p-0">
							<lucide_solid_1.RefreshCw class={"size-3.5 ".concat(isManualRefresh ? "animate-spin" : "")}/>
						</button_1.Button>
					</tooltip_1.TooltipTrigger>
					<tooltip_1.TooltipContent side="bottom" showArrow={false}>
						Refresh changes
					</tooltip_1.TooltipContent>
				</tooltip_1.Tooltip>

				{/* PR Status Icon */}
				{isPRLoading ? <icons_1.IconSpinner class="w-4 h-4 text-muted-foreground shrink-0"/> : pr ? <tooltip_1.Tooltip>
						<tooltip_1.TooltipTrigger asChild>
							<a href={pr.url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
								<pr_icon_1.PRIcon state={pr.state} class="w-4 h-4"/>
								<span class="text-xs text-muted-foreground font-mono">
									#{pr.number}
								</span>
							</a>
						</tooltip_1.TooltipTrigger>
						<tooltip_1.TooltipContent side="bottom" showArrow={false}>
							View PR on GitHub
						</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip> : null}
			</div>
		</div>;
}
