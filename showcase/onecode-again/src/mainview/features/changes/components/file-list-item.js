"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileListItem = void 0;
exports.getFileName = getFileName;
exports.getFileDir = getFileDir;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var checkbox_1 = require("@/components/ui/checkbox");
var kbd_1 = require("@/components/ui/kbd");
var context_menu_1 = require("@/components/ui/context-menu");
var utils_1 = require("@/lib/utils");
var status_1 = require("../utils/status");
/**
* Shared file list item component used in both changes-view and changes-widget
* Memoized to prevent re-renders
*/
exports.FileListItem = (0, solid_js_1.memo)(function FileListItem(_a) {
    var filePath = _a.filePath, fileName = _a.fileName, dirPath = _a.dirPath, status = _a.status, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, isChecked = _a.isChecked, isViewed = _a.isViewed, isUntracked = _a.isUntracked, onSelect = _a.onSelect, onDoubleClick = _a.onDoubleClick, onCheckboxChange = _a.onCheckboxChange, onCopyPath = _a.onCopyPath, onCopyRelativePath = _a.onCopyRelativePath, onRevealInFinder = _a.onRevealInFinder, onToggleViewed = _a.onToggleViewed, onDiscard = _a.onDiscard, _c = _a.showContextMenu, showContextMenu = _c === void 0 ? true : _c;
    var content = <div data-file-item class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1 cursor-pointer", "hover:bg-muted/80 transition-colors", isSelected && "bg-muted")} onClick={onSelect} onDoubleClick={onDoubleClick}>
      <checkbox_1.Checkbox checked={isChecked} onCheckedChange={onCheckboxChange} onClick={function (e) { return e.stopPropagation(); }} class="size-4 shrink-0 border-muted-foreground/50"/>
      <div class="flex-1 min-w-0 flex items-center overflow-hidden">
        {dirPath && <span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
            {dirPath}/
          </span>}
        <span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
          {fileName}
        </span>
      </div>
      <div class="shrink-0 flex items-center gap-1.5">
        {isViewed && <div class="size-4 rounded bg-emerald-500/20 flex items-center justify-center">
            <lucide_solid_1.Eye class="size-2.5 text-emerald-500"/>
          </div>}
        {(0, status_1.getStatusIndicator)(status)}
      </div>
    </div>;
    if (!showContextMenu) {
        return content;
    }
    return <context_menu_1.ContextMenu>
      <context_menu_1.ContextMenuTrigger asChild>{content}</context_menu_1.ContextMenuTrigger>
      <context_menu_1.ContextMenuContent class="w-52">
        {onCopyPath && <context_menu_1.ContextMenuItem onClick={onCopyPath}>Copy Path</context_menu_1.ContextMenuItem>}
        {onCopyRelativePath && <context_menu_1.ContextMenuItem onClick={onCopyRelativePath}>
            Copy Relative Path
          </context_menu_1.ContextMenuItem>}
        {(onCopyPath || onCopyRelativePath) && onRevealInFinder && <context_menu_1.ContextMenuSeparator />}
        {onRevealInFinder && <context_menu_1.ContextMenuItem onClick={onRevealInFinder}>
            Reveal in Finder
          </context_menu_1.ContextMenuItem>}
        {onToggleViewed && <>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={onToggleViewed} class="justify-between">
              {isViewed ? "Mark as unviewed" : "Mark as viewed"}
              <kbd_1.Kbd>V</kbd_1.Kbd>
            </context_menu_1.ContextMenuItem>
          </>}
        {onDiscard && <>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={onDiscard} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
              {isUntracked ? "Delete File..." : "Discard Changes..."}
            </context_menu_1.ContextMenuItem>
          </>}
      </context_menu_1.ContextMenuContent>
    </context_menu_1.ContextMenu>;
});
/**
* Helper to extract file name from path
*/
function getFileName(path) {
    var parts = path.split("/");
    return parts[parts.length - 1] || path;
}
/**
* Helper to extract directory from path
*/
function getFileDir(path) {
    var parts = path.split("/");
    if (parts.length <= 1)
        return "";
    return parts.slice(0, -1).join("/");
}
