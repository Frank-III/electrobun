"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsedCommitBar = CollapsedCommitBar;
var button_1 = require("../../../../components/ui/button");
var tooltip_1 = require("../../../../components/ui/tooltip");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../../components/ui/icons");
var utils_1 = require("../../../../lib/utils");
function CollapsedCommitBar(_a) {
    var fileCount = _a.fileCount, stagedCount = _a.stagedCount, currentBranch = _a.currentBranch, onToggle = _a.onToggle, onCommit = _a.onCommit, _b = _a.isCommitting, isCommitting = _b === void 0 ? false : _b;
    var canCommit = stagedCount > 0;
    var getCommitLabel = function () {
        if (stagedCount > 0 && currentBranch) {
            return "Commit ".concat(stagedCount, " to ").concat(currentBranch);
        }
        if (currentBranch) {
            return "Commit to ".concat(currentBranch);
        }
        return "Commit";
    };
    var getTooltip = function () {
        if (stagedCount === 0)
            return "No staged changes";
        if (isCommitting)
            return "AI is generating commit...";
        return "Commit staged changes with AI-generated message";
    };
    return <div class="flex flex-col border-t border-border/50 bg-background flex-shrink-0">
			{/* Header trigger row - click to expand/collapse */}
			<button type="button" onClick={onToggle} class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1.5 w-full", "hover:bg-muted/50 transition-colors", "text-left")}>
				<lucide_solid_1.ChevronUp class="size-3.5 text-muted-foreground flex-shrink-0"/>
				<span class="text-xs font-medium">Changes</span>
				<span class="text-xs text-muted-foreground">
					({fileCount} file{fileCount !== 1 ? "s" : ""})
				</span>
			</button>

			{/* Full-width Commit button */}
			<div class="px-2 pb-2">
				<tooltip_1.Tooltip>
					<tooltip_1.TooltipTrigger asChild>
						<button_1.Button variant="default" size="sm" class="w-full h-7 text-xs gap-1.5" onClick={onCommit} disabled={!canCommit || isCommitting}>
							{isCommitting && <icons_1.IconSpinner class="size-3.5"/>}
							{getCommitLabel()}
						</button_1.Button>
					</tooltip_1.TooltipTrigger>
					<tooltip_1.TooltipContent side="top">{getTooltip()}</tooltip_1.TooltipContent>
				</tooltip_1.Tooltip>
			</div>
		</div>;
}
