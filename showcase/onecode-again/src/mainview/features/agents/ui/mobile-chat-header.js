"use client";
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
exports.MobileChatHeader = MobileChatHeader;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var button_1 = require("../../../components/ui/button");
var utils_1 = require("../../../lib/utils");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var popover_1 = require("../../../components/ui/popover");
var search_combobox_1 = require("../../../components/ui/search-combobox");
var format_time_ago_1 = require("../utils/format-time-ago");
function MobileChatHeader(_a) {
    var onCreateNew = _a.onCreateNew, onBackToChats = _a.onBackToChats, onOpenPreview = _a.onOpenPreview, _b = _a.canOpenPreview, canOpenPreview = _b === void 0 ? false : _b, onOpenDiff = _a.onOpenDiff, _c = _a.canOpenDiff, canOpenDiff = _c === void 0 ? false : _c, diffStats = _a.diffStats, onOpenTerminal = _a.onOpenTerminal, _d = _a.canOpenTerminal, canOpenTerminal = _d === void 0 ? false : _d, _e = _a.isArchived, isArchived = _e === void 0 ? false : _e, onRestore = _a.onRestore, onOpenLocally = _a.onOpenLocally, _f = _a.showOpenLocally, showOpenLocally = _f === void 0 ? false : _f;
    var activeSubChatId = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.activeSubChatId; });
    var allSubChats = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.allSubChats; });
    var loadingSubChatsAtomValue = (0, jotai_1.useAtomValue)(atoms_1.loadingSubChatsAtom);
    var _g = (0, solid_js_1.createSignal)(false), isHistoryOpen = _g[0], setIsHistoryOpen = _g[1];
    // Find active sub-chat metadata
    var activeSubChat = (0, solid_js_1.createMemo)(function () {
        return allSubChats.find(function (sc) { return sc.id === activeSubChatId; });
    });
    var isLoading = activeSubChatId ? loadingSubChatsAtomValue.has(activeSubChatId) : false;
    var mode = (activeSubChat === null || activeSubChat === void 0 ? void 0 : activeSubChat.mode) || "agent";
    // Sort sub-chats by most recent first for history
    var sortedSubChats = (0, solid_js_1.createMemo)(function () { return __spreadArray([], allSubChats, true).sort(function (a, b) {
        var aT = new Date(a.updated_at || a.created_at || "0").getTime();
        var bT = new Date(b.updated_at || b.created_at || "0").getTime();
        return bT - aT;
    }); });
    var onSwitchFromHistory = function (subChatId) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var isAlreadyOpen = state.openSubChatIds.includes(subChatId);
        if (!isAlreadyOpen) {
            state.addToOpenSubChats(subChatId);
        }
        state.setActiveSubChat(subChatId);
    };
    var handleSelectFromHistory = function (subChat) {
        onSwitchFromHistory(subChat.id);
        setIsHistoryOpen(false);
    };
    return <div class="flex items-center gap-1.5 h-7 w-full min-w-0" style={{ WebkitAppRegion: "drag" }}>
      {/* Burger button - opens all projects */}
      {onBackToChats && <button_1.Button variant="ghost" size="icon" onClick={onBackToChats} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="All projects" style={{ WebkitAppRegion: "no-drag" }}>
          <lucide_solid_1.AlignJustify class="h-4 w-4"/>
        </button_1.Button>}

      {/* Active chat trigger - opens history (shrinks to content, max-width limited) */}
      <search_combobox_1.SearchCombobox isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} items={sortedSubChats} onSelect={handleSelectFromHistory} placeholder="Search chats..." emptyMessage="No results" align="start" side="bottom" sideOffset={8} getItemValue={function (subChat) { return "".concat(subChat.name || "New Chat", " ").concat(subChat.id); }} renderItem={function (subChat) {
            var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
            var isActive = subChat.id === activeSubChatId;
            return <div class={(0, utils_1.cn)("flex items-center gap-2 flex-1 min-w-0", isActive && "font-medium")}>
              <span class="text-sm truncate">
                {subChat.name || "New Chat"}
              </span>
              <span class="text-sm text-muted-foreground whitespace-nowrap">
                {timeAgo}
              </span>
            </div>;
        }} trigger={<popover_1.PopoverTrigger asChild>
            <button class={(0, utils_1.cn)("flex items-center gap-1.5 h-7 px-2 rounded-md text-sm", "bg-muted/50 hover:bg-muted transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", "min-w-0 max-w-[50vw] shrink")} style={{ WebkitAppRegion: "no-drag" }}>
              {/* Icon */}
              <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                {isLoading ? <icons_1.IconSpinner class="w-3.5 h-3.5 text-muted-foreground"/> : mode === "plan" ? <icons_1.PlanIcon class="w-3.5 h-3.5 text-muted-foreground"/> : <icons_1.AgentIcon class="w-3.5 h-3.5 text-muted-foreground"/>}
              </div>

              {/* Name */}
              <span class="truncate text-left">
                {(activeSubChat === null || activeSubChat === void 0 ? void 0 : activeSubChat.name) || "New Chat"}
              </span>

              {/* Chevron */}
              <lucide_solid_1.ChevronDown class="w-3 h-3 text-muted-foreground flex-shrink-0"/>
            </button>
          </popover_1.PopoverTrigger>}/>

      {/* Spacer to push buttons to the right */}
      <div class="flex-1"/>

      {/* Action buttons - always on the right */}
      <div class="flex items-center gap-1 flex-shrink-0" style={{ WebkitAppRegion: "no-drag" }}>
        {/* Open Locally - only for sandbox chats */}
        {showOpenLocally && onOpenLocally && <button_1.Button variant="default" size="sm" onClick={onOpenLocally} class="h-7 px-2.5 gap-1.5 text-xs font-medium">
            <lucide_solid_1.FolderDown class="h-3.5 w-3.5"/>
            Open Locally
          </button_1.Button>}

        {/* Create new */}
        <button_1.Button variant="ghost" size="icon" onClick={onCreateNew} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
          <lucide_solid_1.Plus class="h-4 w-4"/>
        </button_1.Button>

        {/* Terminal button */}
        {onOpenTerminal && canOpenTerminal && <button_1.Button variant="ghost" size="icon" onClick={onOpenTerminal} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
            <icons_1.CustomTerminalIcon class="h-4 w-4"/>
          </button_1.Button>}

        {/* Diff button */}
        {onOpenDiff && canOpenDiff && <button_1.Button variant="ghost" size="icon" onClick={onOpenDiff} disabled={!(diffStats === null || diffStats === void 0 ? void 0 : diffStats.hasChanges) || (diffStats === null || diffStats === void 0 ? void 0 : diffStats.isLoading)} class={(0, utils_1.cn)("h-7 w-7 p-0 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md", (diffStats === null || diffStats === void 0 ? void 0 : diffStats.hasChanges) && !(diffStats === null || diffStats === void 0 ? void 0 : diffStats.isLoading) ? "hover:bg-foreground/10" : "text-muted-foreground")}>
            {(diffStats === null || diffStats === void 0 ? void 0 : diffStats.isLoading) ? <icons_1.IconSpinner class="h-4 w-4"/> : <icons_1.DiffIcon class="h-4 w-4"/>}
          </button_1.Button>}

        {/* Preview button */}
        {onOpenPreview && canOpenPreview && <button_1.Button variant="ghost" size="icon" onClick={onOpenPreview} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
            <lucide_solid_1.Play class="h-4 w-4"/>
          </button_1.Button>}

        {/* Restore button - only when viewing archived workspace */}
        {isArchived && onRestore && <button_1.Button variant="ghost" onClick={onRestore} class="h-7 px-2 gap-1.5 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md flex items-center">
            <icons_1.IconTextUndo class="h-4 w-4"/>
            <span class="text-xs">Restore</span>
          </button_1.Button>}
      </div>
    </div>;
}
