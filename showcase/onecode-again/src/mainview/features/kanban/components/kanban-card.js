"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanCard = void 0;
var solid_js_1 = require("solid-js");
var react_1 = require("motion/react");
var format_time_ago_1 = require("../../../lib/utils/format-time-ago");
var utils_1 = require("../../../lib/utils");
var icons_1 = require("../../../components/ui/icons");
var lucide_solid_1 = require("lucide-solid");
var checkbox_1 = require("../../../components/ui/checkbox");
var context_menu_1 = require("../../../components/ui/context-menu");
exports.KanbanCard = (0, solid_js_1.memo)(function KanbanCard(_a) {
    var card = _a.card, isMultiSelectMode = _a.isMultiSelectMode, onClick = _a.onClick, onCheckboxClick = _a.onCheckboxClick, onTogglePin = _a.onTogglePin, onRename = _a.onRename, onArchive = _a.onArchive, onCopyBranch = _a.onCopyBranch, onExportChat = _a.onExportChat, onCopyChat = _a.onCopyChat;
    var timeAgo = (0, format_time_ago_1.formatTimeAgo)(card.updatedAt || card.createdAt);
    // Build display text: projectName + branch (if exists)
    var displayText = card.branch ? card.projectName ? "".concat(card.projectName, " \u2022 ").concat(card.branch) : card.branch : card.projectName || "Local project";
    // Status flags
    var isLoading = card.status === "in-progress";
    var hasUnseenChanges = card.hasUnseenChanges;
    var hasPendingPlan = card.hasPendingPlan;
    var hasPendingQuestion = card.hasPendingQuestion;
    // Show status indicator if there's something to show (pin has lowest priority)
    var showStatusIndicator = hasPendingQuestion || isLoading || hasPendingPlan || hasUnseenChanges || card.isPinned;
    // Card content (shared between draft and regular cards)
    var cardContent = <div class="flex items-start gap-2.5">
      {/* Checkbox for multi-select mode */}
      {isMultiSelectMode && !card.isDraft && <div class="pt-0.5 flex-shrink-0">
          <checkbox_1.Checkbox checked={card.isSelected} onClick={function (e) { return onCheckboxClick(e, card.chatId); }} class="h-4 w-4"/>
        </div>}

      {/* Content */}
      <div class="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* First row: name + status indicator (справа!) */}
        <div class="flex items-center gap-1">
          <span class="truncate block text-sm leading-tight flex-1">
            {card.name || "New Workspace"}
          </span>

          {/* Status indicator container - справа от названия */}
          {!isMultiSelectMode && <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center relative">
              {/* Indicator - absolute, скрывается при hover */}
              {showStatusIndicator && <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                  <react_1.AnimatePresence mode="wait">
                    {hasPendingQuestion ? <react_1.motion.div key="question" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                        <icons_1.QuestionIcon class="w-2.5 h-2.5 text-blue-500"/>
                      </react_1.motion.div> : isLoading ? <react_1.motion.div key="loading" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                        <icons_1.LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground"/>
                      </react_1.motion.div> : hasPendingPlan ? <react_1.motion.div key="plan" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }} class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : hasUnseenChanges ? <react_1.motion.div key="unseen" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                        <icons_1.LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground"/>
                      </react_1.motion.div> : card.isPinned ? <react_1.motion.div key="pinned" initial={{
                        opacity: 0,
                        scale: .5
                    }} animate={{
                        opacity: 1,
                        scale: 1
                    }} exit={{
                        opacity: 0,
                        scale: .5
                    }} transition={{ duration: .15 }}>
                        <lucide_solid_1.Pin class="w-2.5 h-2.5 text-muted-foreground/60"/>
                      </react_1.motion.div> : null}
                  </react_1.AnimatePresence>
                </div>}

              {/* Archive button - absolute, appears on hover */}
              {!card.isDraft && <button type="button" onClick={function (e) {
                    e.stopPropagation();
                    onArchive(card.chatId);
                }} tabIndex={-1} class="absolute inset-0 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive workspace">
                  <icons_1.ArchiveIcon class="h-3.5 w-3.5"/>
                </button>}
            </div>}
        </div>

        {/* Second row: project/branch + stats + time */}
        <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 min-w-0">
          <span class="truncate flex-1 min-w-0">{displayText}</span>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            {card.stats && (card.stats.additions > 0 || card.stats.deletions > 0) && <>
                <span class="text-green-600 dark:text-green-400">
                  +{card.stats.additions}
                </span>
                <span class="text-red-600 dark:text-red-400">
                  -{card.stats.deletions}
                </span>
              </>}
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>;
    // Don't show context menu for drafts
    if (card.isDraft) {
        return <button type="button" onClick={onClick} class={(0, utils_1.cn)("w-full text-left py-1.5 cursor-pointer group relative", "pl-2 pr-2 rounded-md", "bg-card border border-border/50", "hover:bg-accent/50 hover:border-border", "transition-colors duration-75", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70")}>
        {cardContent}
      </button>;
    }
    return <context_menu_1.ContextMenu>
      <context_menu_1.ContextMenuTrigger asChild>
        <button type="button" onClick={onClick} class={(0, utils_1.cn)("w-full text-left py-1.5 cursor-pointer group relative", "pl-2 pr-2 rounded-md", "bg-card border border-border/50", "hover:bg-accent/50 hover:border-border", "transition-colors duration-75", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", card.isSelected && "bg-primary/10 border-primary/30")}>
          {cardContent}
        </button>
      </context_menu_1.ContextMenuTrigger>
      <context_menu_1.ContextMenuContent class="w-48">
        <context_menu_1.ContextMenuItem onClick={function () { return onTogglePin(card.chatId); }}>
          {card.isPinned ? "Unpin workspace" : "Pin workspace"}
        </context_menu_1.ContextMenuItem>
        <context_menu_1.ContextMenuItem onClick={function () { return onRename({
            id: card.chatId,
            name: card.name
        }); }}>
          Rename workspace
        </context_menu_1.ContextMenuItem>
        {card.branch && <context_menu_1.ContextMenuItem onClick={function () { return onCopyBranch(card.branch); }}>
            Copy branch name
          </context_menu_1.ContextMenuItem>}
        <context_menu_1.ContextMenuSub>
          <context_menu_1.ContextMenuSubTrigger>Export workspace</context_menu_1.ContextMenuSubTrigger>
          <context_menu_1.ContextMenuSubContent sideOffset={6} alignOffset={-4}>
            <context_menu_1.ContextMenuItem onClick={function () { return onExportChat({
            chatId: card.chatId,
            format: "markdown"
        }); }}>
              Download as Markdown
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onExportChat({
            chatId: card.chatId,
            format: "json"
        }); }}>
              Download as JSON
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onExportChat({
            chatId: card.chatId,
            format: "text"
        }); }}>
              Download as Text
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={function () { return onCopyChat({
            chatId: card.chatId,
            format: "markdown"
        }); }}>
              Copy as Markdown
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onCopyChat({
            chatId: card.chatId,
            format: "json"
        }); }}>
              Copy as JSON
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={function () { return onCopyChat({
            chatId: card.chatId,
            format: "text"
        }); }}>
              Copy as Text
            </context_menu_1.ContextMenuItem>
          </context_menu_1.ContextMenuSubContent>
        </context_menu_1.ContextMenuSub>
        {typeof window !== "undefined" && window.desktopApi && <context_menu_1.ContextMenuItem onClick={function () { var _a; return (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.newWindow({ chatId: card.chatId }); }}>
            Open in new window
          </context_menu_1.ContextMenuItem>}
        <context_menu_1.ContextMenuSeparator />
        <context_menu_1.ContextMenuItem onClick={function () { return onArchive(card.chatId); }}>
          Archive workspace
        </context_menu_1.ContextMenuItem>
      </context_menu_1.ContextMenuContent>
    </context_menu_1.ContextMenu>;
});
