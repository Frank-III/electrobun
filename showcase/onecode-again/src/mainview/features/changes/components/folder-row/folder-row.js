"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderRow = FolderRow;
var utils_1 = require("../../../../lib/utils");
var collapsible_row_1 = require("../collapsible-row");
function LevelIndicators(_a) {
    var level = _a.level;
    if (level === 0)
        return null;
    return <div class="flex self-stretch shrink-0">
			{Array.from({ length: level }).map(function (_, i) { return <div key={i} class="w-3 self-stretch border-r border-border/50"/>; })}
		</div>;
}
function FolderRowHeader(_a) {
    var name = _a.name, level = _a.level, fileCount = _a.fileCount, isGrouped = _a.isGrouped;
    return <>
			{!isGrouped && <LevelIndicators level={level}/>}
			<div class="flex items-center gap-1 flex-1 min-w-0">
				<span class={(0, utils_1.cn)("truncate", isGrouped ? "w-0 grow text-left" : "flex-1 min-w-0 text-xs text-foreground")} dir={isGrouped ? "rtl" : undefined}>
					{name}
				</span>
				{fileCount !== undefined && <span class="text-[10px] text-muted-foreground shrink-0 tabular-nums">
						{fileCount}
					</span>}
			</div>
		</>;
}
function FolderRow(_a) {
    var name = _a.name, isExpanded = _a.isExpanded, onToggle = _a.onToggle, children = _a.children, _b = _a.level, level = _b === void 0 ? 0 : _b, fileCount = _a.fileCount, _c = _a.variant, variant = _c === void 0 ? "tree" : _c;
    var isGrouped = variant === "grouped";
    return <collapsible_row_1.CollapsibleRow isExpanded={isExpanded} onToggle={onToggle} showChevron={!isGrouped} class={(0, utils_1.cn)(isGrouped && "overflow-hidden")} triggerClassName={(0, utils_1.cn)("text-xs items-stretch py-0.5", isGrouped && "text-muted-foreground")} contentClassName={(0, utils_1.cn)(isGrouped && "ml-1.5 border-l border-border pl-0.5")} header={<FolderRowHeader name={name} level={level} fileCount={fileCount} isGrouped={isGrouped}/>}>
			{children}
		</collapsible_row_1.CollapsibleRow>;
}
