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
exports.SubChatsQuickSwitchDialog = SubChatsQuickSwitchDialog;
var solid_js_1 = require("solid-js");
var react_1 = require("motion/react");
var web_1 = require("solid-js/web");
var jotai_1 = require("../../../lib/state/jotai");
var utils_1 = require("../../../lib/utils");
var atoms_1 = require("../atoms");
var icons_1 = require("../../../components/ui/icons");
var format_time_ago_1 = require("../utils/format-time-ago");
// Sub-chat card for quick switch
function SubChatCard(_a) {
    var subChat = _a.subChat, isSelected = _a.isSelected, isLoading = _a.isLoading, hasUnseenChanges = _a.hasUnseenChanges, fileChanges = _a.fileChanges, onMouseEnter = _a.onMouseEnter;
    var mode = subChat.mode || "agent";
    var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
    // Calculate totals from file changes
    var stats = (0, solid_js_1.createMemo)(function () {
        if (!fileChanges || fileChanges.length === 0)
            return null;
        var additions = 0;
        var deletions = 0;
        for (var _i = 0, fileChanges_1 = fileChanges; _i < fileChanges_1.length; _i++) {
            var file = fileChanges_1[_i];
            additions += file.additions;
            deletions += file.deletions;
        }
        return {
            fileCount: fileChanges.length,
            additions: additions,
            deletions: deletions
        };
    });
    return <div onMouseEnter={onMouseEnter} class={(0, utils_1.cn)("relative rounded-2xl overflow-hidden min-w-[160px] max-w-[180px] p-2 cursor-pointer", isSelected ? "bg-primary shadow-lg" : "bg-transparent")}>
      <div class="flex items-start gap-2.5">
        {/* Mode icon with badge */}
        <div class="pt-0.5 relative flex-shrink-0 h-4 w-4">
          {mode === "plan" ? <icons_1.PlanIcon class={(0, utils_1.cn)("w-4 h-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/> : <icons_1.AgentIcon class={(0, utils_1.cn)("w-4 h-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/>}
          {/* Badge in bottom-right corner */}
          {(isLoading || hasUnseenChanges) && <div class={(0, utils_1.cn)("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isSelected ? "bg-primary" : "bg-background")}>
              {isLoading ? <icons_1.IconSpinner class={(0, utils_1.cn)("w-2.5 h-2.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/> : <div class="w-2 h-2 rounded-full bg-[#307BD0]"/>}
            </div>}
        </div>
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Sub-chat name */}
          <span class={(0, utils_1.cn)("truncate block text-sm leading-tight", isSelected ? "text-primary-foreground" : "text-foreground")}>
            {subChat.name || "New Chat"}
          </span>
          {/* Time and stats */}
          <div class="flex items-center gap-1.5 text-[11px]">
            <span class={(0, utils_1.cn)(isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
              {timeAgo}
            </span>
            {stats && <>
                <span class={(0, utils_1.cn)(isSelected ? "text-primary-foreground/40" : "text-muted-foreground/40")}>
                  ·
                </span>
                <span class={(0, utils_1.cn)(isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
                  {stats.fileCount} {stats.fileCount === 1 ? "file" : "files"}
                </span>
                {(stats.additions > 0 || stats.deletions > 0) && <>
                    <span class={(0, utils_1.cn)(isSelected ? "text-primary-foreground/80" : "text-green-600 dark:text-green-400")}>
                      +{stats.additions}
                    </span>
                    <span class={(0, utils_1.cn)(isSelected ? "text-primary-foreground/80" : "text-red-600 dark:text-red-400")}>
                      -{stats.deletions}
                    </span>
                  </>}
              </>}
          </div>
        </div>
      </div>
    </div>;
}
function SubChatsQuickSwitchDialog(_a) {
    var isOpen = _a.isOpen, subChats = _a.subChats, selectedIndex = _a.selectedIndex, onHover = _a.onHover;
    if (typeof window === "undefined")
        return null;
    // Derive loading sub-chat IDs
    var loadingSubChats = (0, jotai_1.useAtomValue)(atoms_1.loadingSubChatsAtom);
    var loadingSubChatIds = (0, solid_js_1.createMemo)(function () { return new Set(__spreadArray([], loadingSubChats.keys(), true)); });
    // Unseen changes
    var unseenChanges = (0, jotai_1.useAtomValue)(atoms_1.agentsSubChatUnseenChangesAtom);
    // File changes per sub-chat
    var subChatFiles = (0, jotai_1.useAtomValue)(atoms_1.subChatFilesAtom);
    return (0, web_1.createPortal)(<react_1.AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <div class="fixed inset-0 z-[10000]"/>

          {/* Dialog */}
          <div class="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
            <div class="pointer-events-auto">
              <div class="max-w-5xl mx-auto">
                {/* Sub-chat List or Empty State */}
                {subChats.length === 0 ? <div class="px-4 py-12 text-center bg-background rounded-xl border-[0.5px]">
                    <p class="text-sm text-muted-foreground">
                      No chats in this agent
                    </p>
                  </div> : <div class="flex gap-3 overflow-x-auto p-3 bg-background rounded-3xl border-[0.5px]" style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.07), 0 0px 16px 0 rgba(0,0,0,0.04), 0 -8px 24px 0 rgba(0,0,0,0.03)" }}>
                    {subChats.map(function (subChat, index) {
                    var isSelected = index === selectedIndex;
                    var isLoading = loadingSubChatIds.has(subChat.id);
                    var hasUnseenChanges = unseenChanges().has(subChat.id);
                    var fileChanges = subChatFiles.get(subChat.id) || [];
                    return <SubChatCard key={subChat.id} subChat={subChat} isSelected={isSelected} isLoading={isLoading} hasUnseenChanges={hasUnseenChanges} fileChanges={fileChanges} onMouseEnter={function () { return onHover === null || onHover === void 0 ? void 0 : onHover(index); }}/>;
                })}
                  </div>}
              </div>
            </div>
          </div>
        </>}
    </react_1.AnimatePresence>, document.body);
}
