"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleRow = CollapsibleRow;
var collapsible_1 = require("../../../../components/ui/collapsible");
var utils_1 = require("../../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
function CollapsibleRow(_a) {
    var isExpanded = _a.isExpanded, onToggle = _a.onToggle, header = _a.header, children = _a.children, _b = _a.showChevron, showChevron = _b === void 0 ? true : _b, className = _a.className, triggerClassName = _a.triggerClassName, contentClassName = _a.contentClassName;
    return <collapsible_1.Collapsible open={isExpanded} onOpenChange={onToggle} class={(0, utils_1.cn)("min-w-0", className)}>
			<collapsible_1.CollapsibleTrigger class={(0, utils_1.cn)("w-full flex items-center gap-1.5 px-1.5 py-1 text-left rounded-sm", "hover:bg-accent/50 cursor-pointer transition-colors", triggerClassName)}>
				{showChevron && <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("size-2.5 text-muted-foreground shrink-0 transition-transform duration-150", isExpanded && "rotate-90")}/>}
				{header}
			</collapsible_1.CollapsibleTrigger>
			<collapsible_1.CollapsibleContent class={(0, utils_1.cn)("min-w-0", contentClassName)}>
				{children}
			</collapsible_1.CollapsibleContent>
		</collapsible_1.Collapsible>;
}
