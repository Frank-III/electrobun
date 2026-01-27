"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesFileFilter = ChangesFileFilter;
var solid_js_1 = require("solid-js");
var input_1 = require("../../../../components/ui/input");
var button_1 = require("../../../../components/ui/button");
var utils_1 = require("../../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
var search_combobox_1 = require("../../../../components/ui/search-combobox");
var popover_1 = require("../../../../components/ui/popover");
var tooltip_1 = require("../../../../components/ui/tooltip");
var icons_1 = require("../../../../components/ui/icons");
function ChangesFileFilter(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.placeholder, placeholder = _b === void 0 ? "Filter files..." : _b, className = _a.className, _c = _a.subChats, subChats = _c === void 0 ? [] : _c, selectedSubChatId = _a.selectedSubChatId, onSubChatFilterChange = _a.onSubChatFilterChange;
    var _d = (0, solid_js_1.createSignal)(false), isSubChatFilterOpen = _d[0], setIsSubChatFilterOpen = _d[1];
    var selectedSubChat = (0, solid_js_1.createMemo)(function () {
        if (!selectedSubChatId)
            return null;
        return subChats.find(function (sc) { return sc.id === selectedSubChatId; }) || null;
    });
    var handleSubChatSelect = function (subChat) {
        // Toggle off if same subchat selected
        if (selectedSubChatId === subChat.id) {
            onSubChatFilterChange === null || onSubChatFilterChange === void 0 ? void 0 : onSubChatFilterChange(null);
        }
        else {
            onSubChatFilterChange === null || onSubChatFilterChange === void 0 ? void 0 : onSubChatFilterChange(subChat.id);
        }
        setIsSubChatFilterOpen(false);
    };
    var handleClearSubChatFilter = function () {
        onSubChatFilterChange === null || onSubChatFilterChange === void 0 ? void 0 : onSubChatFilterChange(null);
    };
    var renderSubChatItem = function (subChat) {
        return <div class="flex items-center gap-2 flex-1 min-w-0">
				<icons_1.AgentIcon class="w-4 h-4 text-muted-foreground flex-shrink-0"/>
				<span class="text-sm truncate flex-1">
					{subChat.name || "New Chat"}
				</span>
				<span class="text-xs text-muted-foreground whitespace-nowrap">
					{subChat.fileCount} file{subChat.fileCount !== 1 ? "s" : ""}
				</span>
			</div>;
    };
    var hasSubChats = subChats.length > 0;
    return <div class={(0, utils_1.cn)("flex flex-col gap-1.5 px-2 py-1.5", className)}>
			{/* Search row */}
			<div class="flex items-center gap-1">
				{/* Search input */}
				<div class="relative flex-1">
					<lucide_solid_1.Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"/>
					<input_1.Input type="search" value={value} onChange={function (e) { return onChange(e.target.value); }} placeholder={placeholder} class="h-7 pl-7 pr-7 text-xs bg-muted/50"/>
					{value && <button type="button" onClick={function () { return onChange(""); }} class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors">
							<lucide_solid_1.X class="size-3 text-muted-foreground"/>
						</button>}
				</div>

				{/* Subchat filter button */}
				{hasSubChats && <search_combobox_1.SearchCombobox isOpen={isSubChatFilterOpen} onOpenChange={setIsSubChatFilterOpen} items={subChats} onSelect={handleSubChatSelect} placeholder="Search chats..." emptyMessage="No chats with changes" getItemValue={function (subChat) { return "".concat(subChat.name || "New Chat", " ").concat(subChat.id); }} renderItem={renderSubChatItem} side="bottom" align="end" sideOffset={4} collisionPadding={16} trigger={<tooltip_1.Tooltip delayDuration={300}>
								<tooltip_1.TooltipTrigger asChild>
									<popover_1.PopoverTrigger asChild>
										<button_1.Button variant={selectedSubChatId ? "secondary" : "ghost"} size="icon" class={(0, utils_1.cn)("h-7 w-7 p-0 flex-shrink-0 rounded-md transition-colors", selectedSubChatId && "bg-primary/10 hover:bg-primary/20")}>
											<icons_1.CircleFilterIcon class={(0, utils_1.cn)("h-4 w-4", selectedSubChatId ? "text-primary" : "text-muted-foreground")}/>
										</button_1.Button>
									</popover_1.PopoverTrigger>
								</tooltip_1.TooltipTrigger>
								<tooltip_1.TooltipContent side="bottom">
									{selectedSubChat ? "Filtering: ".concat(selectedSubChat.name || "New Chat") : "Filter by chat"}
								</tooltip_1.TooltipContent>
							</tooltip_1.Tooltip>}/>}
			</div>

			{/* Active subchat filter bar */}
			{selectedSubChat && <div class="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-muted/80 border border-border/50">
					<div class="flex items-center gap-1.5 min-w-0">
						<span class="text-[10px] text-muted-foreground flex-shrink-0 uppercase tracking-wide">
							Filtered
						</span>
						<span class="text-muted-foreground/30 flex-shrink-0">•</span>
						<span class="text-xs text-foreground/80 truncate">
							{selectedSubChat.name || "New Chat"}
						</span>
						<span class="text-[10px] text-muted-foreground flex-shrink-0">
							({selectedSubChat.fileCount})
						</span>
					</div>
					<button type="button" onClick={handleClearSubChatFilter} class="p-0.5 rounded hover:bg-foreground/10 transition-colors flex-shrink-0">
						<lucide_solid_1.X class="w-3.5 h-3.5 text-muted-foreground"/>
					</button>
				</div>}
		</div>;
}
