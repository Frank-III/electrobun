"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewModeToggle = ViewModeToggle;
var button_1 = require("../../../../components/ui/button");
var tooltip_1 = require("../../../../components/ui/tooltip");
var lucide_solid_1 = require("lucide-solid");
function ViewModeToggle(_a) {
    var viewMode = _a.viewMode, onViewModeChange = _a.onViewModeChange;
    var handleToggle = function () {
        onViewModeChange(viewMode === "grouped" ? "tree" : "grouped");
    };
    return <tooltip_1.Tooltip>
			<tooltip_1.TooltipTrigger asChild>
				<button_1.Button variant="ghost" size="icon" onClick={handleToggle} class="size-6 p-0" aria-label={viewMode === "grouped" ? "Grouped view" : "Tree view"}>
					{viewMode === "grouped" ? <lucide_solid_1.Folder class="size-3.5"/> : <lucide_solid_1.FolderTree class="size-3.5"/>}
				</button_1.Button>
			</tooltip_1.TooltipTrigger>
			<tooltip_1.TooltipContent side="bottom" showArrow={false}>
				{viewMode === "grouped" ? "Switch to tree view" : "Switch to grouped view"}
			</tooltip_1.TooltipContent>
		</tooltip_1.Tooltip>;
}
