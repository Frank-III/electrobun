"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesWidget = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("@/components/ui/icons");
var tooltip_1 = require("@/components/ui/tooltip");
var kbd_1 = require("@/components/ui/kbd");
var utils_1 = require("@/lib/utils");
var hotkeys_1 = require("@/lib/hotkeys");
var atoms_1 = require("@/features/agents/atoms");
var file_list_item_1 = require("@/features/changes/components/file-list-item");
var trpc_1 = require("@/lib/trpc");
/**
* Map parsed diff file status to FileStatus type for getStatusIndicator
*/
function getFileStatus(file) {
    if (file.isNewFile)
        return "added";
    if (file.isDeletedFile)
        return "deleted";
    // Check for rename: oldPath and newPath are different and neither is /dev/null
    if (file.oldPath && file.newPath && file.oldPath !== "/dev/null" && file.newPath !== "/dev/null" && file.oldPath !== file.newPath) {
        return "renamed";
    }
    return "modified";
}
/**
* Changes Widget for Overview Sidebar
* Shows file list exactly like the Changes tab in diff sidebar
* Memoized to prevent unnecessary re-renders when parent updates
*/
exports.ChangesWidget = memo(function ChangesWidget(_a) {
    var _this = this;
    var chatId = _a.chatId, worktreePath = _a.worktreePath, diffStats = _a.diffStats, parsedFileDiffs = _a.parsedFileDiffs, onCommit = _a.onCommit, _b = _a.isCommitting, isCommitting = _b === void 0 ? false : _b, onExpand = _a.onExpand, onFileSelect = _a.onFileSelect, _c = _a.diffDisplayMode, diffDisplayMode = _c === void 0 ? "side-peek" : _c;
    // Data is now cached at the ActiveChat level via workspaceDiffCacheAtomFamily
    // So parsedFileDiffs and diffStats persist across workspace switches
    var displayFiles = parsedFileDiffs !== null && parsedFileDiffs !== void 0 ? parsedFileDiffs : [];
    var displayStats = diffStats;
    var hasChanges = displayStats && displayStats.fileCount > 0;
    // Get tooltip text based on diff display mode
    var expandTooltip = diffDisplayMode === "side-peek" ? "Open in sidebar" : diffDisplayMode === "center-peek" ? "Open in dialog" : "Open fullscreen";
    // Resolved hotkey for tooltip
    var openDiffHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("open-diff");
    // Viewed files state (same atom as diff sidebar)
    var viewedFiles = (0, jotai_1.useAtom)((0, atoms_1.viewedFilesAtomFamily)(chatId))[0];
    // Mutations for context menu actions
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    // Selection state - all files selected by default
    var _d = (0, solid_js_1.createSignal)(new Set()), selectedForCommit = _d[0], setSelectedForCommit = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), hasInitializedSelection = _e[0], setHasInitializedSelection = _e[1];
    // Helper to get display path (handles /dev/null for deleted files)
    var getDisplayPath = function (file) {
        if (file.newPath && file.newPath !== "/dev/null") {
            return file.newPath;
        }
        if (file.oldPath && file.oldPath !== "/dev/null") {
            return file.oldPath;
        }
        return file.newPath || file.oldPath;
    };
    // Initialize selection - select all files by default when data loads
    (0, solid_js_1.createEffect)(function () {
        if (!hasInitializedSelection && displayFiles.length > 0) {
            var allPaths = new Set(displayFiles.map(function (f) { return getDisplayPath(f); }));
            setSelectedForCommit(allPaths);
            setHasInitializedSelection(true);
        }
    });
    // Reset selection when files change significantly
    (0, solid_js_1.createEffect)(function () {
        if (displayFiles.length === 0) {
            setHasInitializedSelection(false);
            setSelectedForCommit(new Set());
        }
    });
    // Check if file is marked as viewed
    var isFileMarkedAsViewed = function (filePath) {
        var possibleKeys = [
            "".concat(filePath, "->").concat(filePath),
            "/dev/null->".concat(filePath),
            "".concat(filePath, "->/dev/null")
        ];
        for (var _i = 0, possibleKeys_1 = possibleKeys; _i < possibleKeys_1.length; _i++) {
            var key = possibleKeys_1[_i];
            var viewedState = viewedFiles[key];
            if (viewedState === null || viewedState === void 0 ? void 0 : viewedState.viewed) {
                return true;
            }
        }
        return false;
    };
    // Toggle individual file selection
    var handleCheckboxChange = function (filePath) {
        setSelectedForCommit(function (prev) {
            var next = new Set(prev);
            if (next.has(filePath)) {
                next.delete(filePath);
            }
            else {
                next.add(filePath);
            }
            return next;
        });
    };
    // Selection stats - use getDisplayPath consistently for all path operations
    var selectedCount = displayFiles.filter(function (f) { return selectedForCommit.has(getDisplayPath(f)); }).length;
    var allSelected = displayFiles.length > 0 && selectedCount === displayFiles.length;
    var someSelected = selectedCount > 0 && selectedCount < displayFiles.length;
    // Toggle all files selection
    var handleSelectAllChange = function () {
        if (allSelected) {
            setSelectedForCommit(new Set());
        }
        else {
            var allPaths = new Set(displayFiles.map(function (f) { return getDisplayPath(f); }));
            setSelectedForCommit(allPaths);
        }
    };
    // Handle commit
    var handleCommit = function () {
        var selectedPaths = displayFiles.filter(function (f) { return selectedForCommit.has(getDisplayPath(f)); }).map(function (f) { return getDisplayPath(f); });
        onCommit === null || onCommit === void 0 ? void 0 : onCommit(selectedPaths);
    };
    return <div class="mx-2 mb-2">
      <div class={(0, utils_1.cn)("rounded-lg border border-border/50 overflow-hidden")}>
        {/* Widget Header with stats - fixed height h-8 for consistency */}
        <div class="flex items-center gap-2 px-2 h-8 select-none group bg-muted/30">
          {/* Icon */}
          <icons_1.DiffIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>

          {/* Title */}
          <span class="text-xs font-medium text-foreground">Changes</span>

          {/* Stats in header - total lines changed */}
          {hasChanges && displayStats && <span class="text-xs text-muted-foreground">
              <span class="text-green-500">+{displayStats.additions}</span>
              {" "}
              <span class="text-red-500">-{displayStats.deletions}</span>
            </span>}

          {/* Spacer */}
          <div class="flex-1"/>

          {/* Expand to sidebar button */}
          {onExpand && <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button variant="ghost" size="icon" onClick={onExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label="Expand changes">
                  <lucide_solid_1.ArrowUpRight class="h-3 w-3"/>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="left">
                {expandTooltip}
                {openDiffHotkey && <kbd_1.Kbd>{openDiffHotkey}</kbd_1.Kbd>}
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>}
        </div>

        {/* Content */}
        {hasChanges ? <>
            {/* Select all header - like in changes-view */}
            <div class="flex items-center gap-2 px-2 py-1.5 border-b border-border/50">
              <checkbox_1.Checkbox checked={someSelected ? "indeterminate" : allSelected} onCheckedChange={handleSelectAllChange} class="size-4 border-muted-foreground/50"/>
              <span class="text-xs text-muted-foreground">
                {selectedCount} of {displayFiles.length} file
                {displayFiles.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            {/* File list - using shared FileListItem component */}
            <div class="max-h-[300px] overflow-y-auto">
              {displayFiles.map(function (file) {
                var _a;
                var filePath = getDisplayPath(file);
                var absolutePath = worktreePath ? "".concat(worktreePath, "/").concat(filePath) : null;
                return <file_list_item_1.FileListItem key={file.key} filePath={filePath} fileName={(0, file_list_item_1.getFileName)(filePath)} dirPath={(0, file_list_item_1.getFileDir)(filePath)} status={getFileStatus(file)} isChecked={selectedForCommit.has(filePath)} isViewed={isFileMarkedAsViewed(filePath)} isUntracked={(_a = file.isNewFile) !== null && _a !== void 0 ? _a : false} showContextMenu={!!worktreePath} onSelect={function () {
                        if (onFileSelect) {
                            onFileSelect(filePath);
                        }
                        else {
                            onExpand === null || onExpand === void 0 ? void 0 : onExpand();
                        }
                    }} onCheckboxChange={function () { return handleCheckboxChange(filePath); }} onCopyPath={absolutePath ? function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, navigator.clipboard.writeText(absolutePath)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); } : undefined} onCopyRelativePath={function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, navigator.clipboard.writeText(filePath)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }} onRevealInFinder={absolutePath ? function () {
                        openInFinderMutation.mutate(absolutePath);
                    } : undefined}/>;
            })}
            </div>

            {/* Action buttons */}
            <div class="flex gap-2 p-2 border-t border-border/50">
              {/* Commit button */}
              {onCommit && <button_1.Button variant="default" size="sm" class="flex-1 h-7 text-xs" onClick={handleCommit} disabled={isCommitting || selectedCount === 0}>
                  {isCommitting ? "Committing..." : "Commit ".concat(selectedCount, " file").concat(selectedCount !== 1 ? "s" : "")}
                </button_1.Button>}

              {/* View diff button */}
              <button_1.Button variant="outline" size="sm" class={(0, utils_1.cn)("h-7 text-xs", onCommit ? "flex-1" : "w-full")} onClick={function () { return onExpand === null || onExpand === void 0 ? void 0 : onExpand(); }}>
                View Diff
              </button_1.Button>
            </div>
          </> : <div class="text-xs text-muted-foreground px-2 py-2">
            No changes
          </div>}
      </div>
    </div>;
});
