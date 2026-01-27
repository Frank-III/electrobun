"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySection = CategorySection;
var collapsible_1 = require("../../../../components/ui/collapsible");
var utils_1 = require("../../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
function CategorySection(_a) {
    var title = _a.title, count = _a.count, isExpanded = _a.isExpanded, onToggle = _a.onToggle, children = _a.children, actions = _a.actions;
    if (count === 0) {
        return null;
    }
    return <collapsible_1.Collapsible open={isExpanded} onOpenChange={onToggle} class="min-w-0 overflow-hidden">
			{/* Section header */}
			<div class="flex items-center min-w-0">
				<collapsible_1.CollapsibleTrigger class={(0, utils_1.cn)("flex-1 flex items-center gap-1.5 px-2 py-1.5 text-left min-w-0", "hover:bg-accent/30 cursor-pointer transition-colors")}>
					<lucide_solid_1.ChevronRight class={(0, utils_1.cn)("size-3 text-muted-foreground shrink-0 transition-transform duration-150", isExpanded && "rotate-90")}/>
					<span class="text-xs font-medium truncate">{title}</span>
					<span class="text-[10px] text-muted-foreground shrink-0">
						{count}
					</span>
				</collapsible_1.CollapsibleTrigger>
				{actions && <div class="pr-1.5 shrink-0">{actions}</div>}
			</div>

			{/* Section content */}
			<collapsible_1.CollapsibleContent class="px-0.5 pb-1 min-w-0 overflow-hidden">
				{children}
			</collapsible_1.CollapsibleContent>
		</collapsible_1.Collapsible>;
}
