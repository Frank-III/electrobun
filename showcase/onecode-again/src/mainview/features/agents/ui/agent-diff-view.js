"use client";
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.AgentDiffView = exports.splitUnifiedDiffByFile = exports.diffViewModeAtom = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var signal_storage_1 = require("../../../lib/state/signal-storage");
var atoms_1 = require("../atoms");
var react_1 = require("@git-diff-view/react");
require("@git-diff-view/react/styles/diff-view-pure.css");
var use_theme_1 = require("../../../lib/hooks/use-theme");
var solid_sonner_1 = require("solid-sonner");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var react_virtual_1 = require("@tanstack/react-virtual");
var agents_file_mention_1 = require("../mentions/agents-file-mention");
var alert_dialog_1 = require("../../../components/ui/alert-dialog");
var button_1 = require("../../../components/ui/button");
var icons_2 = require("../../../components/ui/icons");
var tooltip_1 = require("../../../components/ui/tooltip");
var kbd_1 = require("../../../components/ui/kbd");
var context_menu_1 = require("../../../components/ui/context-menu");
// e2b API routes are used instead of useSandboxManager for agents
// import { useIsHydrated } from "@/hooks/use-is-hydrated"
var useIsHydrated = function () { return true; };
var utils_1 = require("../../../lib/utils");
var platform_1 = require("../../../lib/utils/platform");
var trpc_1 = require("../../../lib/trpc");
var remote_api_1 = require("../../../lib/remote-api");
var diff_view_highlighter_1 = require("../../../lib/themes/diff-view-highlighter");
var use_code_theme_1 = require("../../../lib/hooks/use-code-theme");
// Simple fast string hash (djb2 algorithm) for content change detection
function hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
    }
    // Convert to base36 for compact string representation
    return (hash >>> 0).toString(36);
}
var DiffErrorBoundary = /** @class */ (function (_super) {
    __extends(DiffErrorBoundary, _super);
    function DiffErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            hasError: false,
            error: null,
            prevRawDiff: props.rawDiff
        };
        return _this;
    }
    DiffErrorBoundary.getDerivedStateFromError = function (error) {
        return {
            hasError: true,
            error: error
        };
    };
    DiffErrorBoundary.getDerivedStateFromProps = function (props, state) {
        // Reset error state when rawDiff changes (different file)
        if (props.rawDiff !== state.prevRawDiff) {
            return {
                hasError: false,
                error: null,
                prevRawDiff: props.rawDiff
            };
        }
        return null;
    };
    DiffErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        // Error already captured in state, no need to log
    };
    DiffErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            // Show raw diff as fallback when library fails to parse
            if (this.props.rawDiff) {
                var lines = this.props.rawDiff.split("\n");
                // Find first hunk header to skip diff metadata
                var firstHunkIdx = lines.findIndex(function (l) { return l.startsWith("@@"); });
                var contentLines = firstHunkIdx > 0 ? lines.slice(firstHunkIdx) : lines;
                return <div class="text-xs font-mono overflow-x-auto">
            {contentLines.map(function (line, i) {
                        var className = "block px-3 py-px min-h-[20px]";
                        if (line.startsWith("+") && !line.startsWith("+++")) {
                            className += " text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";
                        }
                        else if (line.startsWith("-") && !line.startsWith("---")) {
                            className += " text-red-600 dark:text-red-400 bg-red-500/10";
                        }
                        else if (line.startsWith("@@")) {
                            className += " text-muted-foreground bg-blue-500/5 py-1 mt-1 first:mt-0";
                        }
                        return <code key={i} class={className}>{line || " "}</code>;
                    })}
          </div>;
            }
            return <div class="flex items-center gap-2 p-4 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 rounded-md">
          <lucide_solid_1.AlertTriangle class="h-4 w-4 flex-shrink-0"/>
          <span>
            Failed to render diff for this file. The diff format may be
            corrupted or truncated.
          </span>
        </div>;
        }
        return this.props.children;
    };
    return DiffErrorBoundary;
}(Component));
// Suppress @git-diff-view mismatch warnings globally in development
// These warnings are caused by the library's internal validation which runs even in pure diff mode
// The validation compares composed file content with diff hunks, but since we use pure diff mode
// (content: null), the library composes content from diff which may have slight formatting differences
if (typeof window !== "undefined") {
    var originalWarn_1 = console.warn;
    console.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = args[0];
        if (typeof message === "string" && message.includes("mismatch")) {
            return;
        }
        originalWarn_1.apply(console, args);
    };
}
exports.diffViewModeAtom = (0, signal_storage_1.createStoredSignal)("agents-diff:view-mode", react_1.DiffModeEnum.Unified);
// Validate if a diff hunk has valid structure
// This is a lenient validator - only reject clearly malformed diffs
// Don't count lines strictly since edge cases are hard to handle
var validateDiffHunk = function (diffText) {
    if (!diffText || diffText.trim().length === 0) {
        return {
            valid: false,
            reason: "empty diff"
        };
    }
    var lines = diffText.split("\n");
    var hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/;
    // Find the --- and +++ lines
    var minusLineIdx = lines.findIndex(function (l) { return l.startsWith("--- "); });
    var plusLineIdx = lines.findIndex(function (l) { return l.startsWith("+++ "); });
    // Must have both header lines
    if (minusLineIdx === -1 || plusLineIdx === -1) {
        return {
            valid: false,
            reason: "missing header lines"
        };
    }
    // +++ must come after ---
    if (plusLineIdx <= minusLineIdx) {
        return {
            valid: false,
            reason: "header order wrong"
        };
    }
    // Check for special cases that don't have hunks
    if (diffText.includes("new mode") || diffText.includes("old mode") || diffText.includes("rename from") || diffText.includes("rename to") || diffText.includes("Binary files")) {
        return { valid: true };
    }
    // Must have at least one hunk header after +++ line
    var hasHunk = false;
    for (var i = plusLineIdx + 1; i < lines.length; i++) {
        if (hunkHeaderRegex.test(lines[i])) {
            hasHunk = true;
            break;
        }
    }
    if (!hasHunk) {
        return {
            valid: false,
            reason: "no hunk headers found"
        };
    }
    // Trust the diff format - the DiffView library will handle parsing
    // If it fails, the error boundary will catch it
    return { valid: true };
};
var splitUnifiedDiffByFile = function (diffText) {
    var normalized = diffText.replace(/\r\n/g, "\n");
    var lines = normalized.split("\n");
    var blocks = [];
    var current = [];
    var pushCurrent = function () {
        var text = current.join("\n").trim();
        if (text && (text.startsWith("diff --git ") || text.startsWith("--- ") || text.startsWith("+++ ") || text.startsWith("Binary files ") || text.includes("\n+++ ") || text.includes("\nBinary files "))) {
            blocks.push(text);
        }
        current = [];
    };
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.startsWith("diff --git ") && current.length > 0) {
            pushCurrent();
        }
        current.push(line);
    }
    pushCurrent();
    return blocks.map(function (blockText, index) {
        var blockLines = blockText.split("\n");
        var oldPath = "";
        var newPath = "";
        var isBinary = false;
        var additions = 0;
        var deletions = 0;
        for (var _i = 0, blockLines_1 = blockLines; _i < blockLines_1.length; _i++) {
            var line = blockLines_1[_i];
            if (line.startsWith("Binary files ") && line.endsWith(" differ")) {
                isBinary = true;
            }
            if (line.startsWith("--- ")) {
                var raw = line.slice(4).trim();
                oldPath = raw.startsWith("a/") ? raw.slice(2) : raw;
            }
            if (line.startsWith("+++ ")) {
                var raw = line.slice(4).trim();
                newPath = raw.startsWith("b/") ? raw.slice(2) : raw;
            }
            if (line.startsWith("+") && !line.startsWith("+++ ")) {
                additions += 1;
            }
            else if (line.startsWith("-") && !line.startsWith("--- ")) {
                deletions += 1;
            }
        }
        var key = oldPath || newPath ? "".concat(oldPath, "->").concat(newPath) : "file-".concat(index);
        var validation = isBinary ? { valid: true } : validateDiffHunk(blockText);
        var isValid = validation.valid;
        return {
            key: key,
            oldPath: oldPath,
            newPath: newPath,
            diffText: blockText,
            isBinary: isBinary,
            additions: additions,
            deletions: deletions,
            isValid: isValid
        };
    });
};
exports.splitUnifiedDiffByFile = splitUnifiedDiffByFile;
// Custom comparator to prevent unnecessary re-renders
var fileDiffCardAreEqual = function (prev, next) {
    // Key comparison - file identity
    if (prev.file.key !== next.file.key)
        return false;
    // Diff content changes should re-render even when the file key is stable.
    if (prev.file.diffText !== next.file.diffText)
        return false;
    // State that affects rendering
    if (prev.isCollapsed !== next.isCollapsed)
        return false;
    if (prev.isFullExpanded !== next.isFullExpanded)
        return false;
    if (prev.hasContent !== next.hasContent)
        return false;
    if (prev.isLoadingContent !== next.isLoadingContent)
        return false;
    if (prev.diffMode !== next.diffMode)
        return false;
    if (prev.isLight !== next.isLight)
        return false;
    // Highlighter presence
    if (prev.shikiHighlighter === null !== (next.shikiHighlighter === null))
        return false;
    // Worktree path for context menu
    if (prev.worktreePath !== next.worktreePath)
        return false;
    // Viewed state
    if (prev.isViewed !== next.isViewed)
        return false;
    if (prev.showViewed !== next.showViewed)
        return false;
    return true;
};
var FileDiffCard = memo(function FileDiffCard(_a) {
    var _this = this;
    var file = _a.file, data = _a.data, isLight = _a.isLight, isCollapsed = _a.isCollapsed, toggleCollapsed = _a.toggleCollapsed, isFullExpanded = _a.isFullExpanded, toggleFullExpanded = _a.toggleFullExpanded, hasContent = _a.hasContent, isLoadingContent = _a.isLoadingContent, diffMode = _a.diffMode, shikiHighlighter = _a.shikiHighlighter, worktreePath = _a.worktreePath, onDiscardFile = _a.onDiscardFile, isViewed = _a.isViewed, onToggleViewed = _a.onToggleViewed, _b = _a.showViewed, showViewed = _b === void 0 ? true : _b;
    var _c = (0, solid_js_1.createSignal)(null), diffViewRef = _c[0], setDiffViewRef = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), diffCardRef = _d[0], setDiffCardRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(isFullExpanded), prevExpandedRef = _e[0], setPrevExpandedRef = _e[1];
    // tRPC mutations for file operations
    var openInFinderMutation = trpc_1.trpcClient.external.openInFinder.mutate;
    var openInEditorMutation = trpc_1.trpcClient.external.openFileInEditor.mutate;
    // Expand/collapse all hunks when button is clicked
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (prevExpandedRef.current === isFullExpanded)
            return;
        prevExpandedRef.current = isFullExpanded;
        var diffFile = (_a = diffViewRef.current) === null || _a === void 0 ? void 0 : _a.getDiffFileInstance();
        if (!diffFile)
            return;
        var mode = diffMode === react_1.DiffModeEnum.Split ? "split" : "unified";
        // Use requestAnimationFrame to prevent ResizeObserver loop
        // The expand/collapse causes layout changes that trigger virtualizer's ResizeObserver
        requestAnimationFrame(function () {
            try {
                if (isFullExpanded) {
                    diffFile.onAllExpand(mode);
                    diffFile.initSyntax();
                    diffFile.notifyAll();
                }
                else {
                    diffFile.onAllCollapse(mode);
                }
            }
            catch (_a) { }
        });
    });
    // Extract filename and directory from path
    var displayPath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath && file.oldPath !== "/dev/null" ? file.oldPath : file.key;
    var fileName = displayPath.split("/").pop() || displayPath;
    var dirPath = displayPath.includes("/") ? displayPath.substring(0, displayPath.lastIndexOf("/")) : null;
    var isNewFile = file.oldPath === "/dev/null" && file.newPath;
    var isDeletedFile = file.newPath === "/dev/null" && file.oldPath;
    // Absolute path for file operations
    var absolutePath = worktreePath ? "".concat(worktreePath, "/").concat(displayPath) : null;
    var handleCopyPath = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!absolutePath) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.clipboard.writeText(absolutePath)];
                case 1:
                    _a.sent();
                    solid_sonner_1.toast.success("Copied to clipboard", { description: absolutePath });
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyRelativePath = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.clipboard.writeText(displayPath)];
                case 1:
                    _a.sent();
                    solid_sonner_1.toast.success("Copied to clipboard", { description: displayPath });
                    return [2 /*return*/];
            }
        });
    }); };
    var handleRevealInFinder = function () {
        if (absolutePath) {
            openInFinderMutation(absolutePath);
        }
    };
    var handleOpenInEditor = function () {
        if (absolutePath && worktreePath) {
            openInEditorMutation({
                path: absolutePath,
                cwd: worktreePath
            });
        }
    };
    var handleDiscard = function () {
        if (onDiscardFile) {
            onDiscardFile(displayPath);
        }
    };
    var headerContent = <header class={(0, utils_1.cn)("group pl-3 pr-2 py-1 font-mono text-xs bg-muted cursor-pointer", 
        // Sticky header within the scroll container
        "sticky top-0 z-10", "border-b transition-colors", "hover:bg-accent/50", isCollapsed ? "border-b-transparent" : "border-b-border")} onClick={function () { return toggleCollapsed(file.key); }} role="button" tabIndex={0} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCollapsed(file.key);
            }
        }} aria-expanded={!isCollapsed}>
        <div class="flex items-center gap-2">
          {/* Collapse toggle + file info */}
          <div class="flex-1 flex items-center gap-2 text-left min-w-0 min-h-[22px]">
            {/* Icon container with hover swap */}
            {(function () {
            var FileIcon = (0, agents_file_mention_1.getFileIconByExtension)(fileName);
            return <div class="relative w-3.5 h-3.5 shrink-0">
                  {FileIcon && <FileIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-all duration-200", "group-hover:opacity-0 group-hover:scale-75")}/>}
                  <lucide_solid_1.ChevronDown class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-all duration-200", "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100", isCollapsed && "-rotate-90")}/>
                </div>;
        })()}

            {/* File name + path + status */}
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="font-medium text-foreground shrink-0">
                {fileName}
              </span>
              {dirPath && <span class="text-muted-foreground truncate text-[11px] min-w-0">
                  {dirPath}
                </span>}
              {isNewFile && <span class="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
                  (new)
                </span>}
              {isDeletedFile && <span class="shrink-0 text-[11px] text-red-600 dark:text-red-400">
                  (deleted)
                </span>}
            </div>

            {/* Stats */}
            <span class="shrink-0 font-mono text-[11px] tabular-nums whitespace-nowrap">
              {file.additions > 0 && <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                  +{file.additions}
                </span>}
              {file.deletions > 0 && <span class="text-red-600 dark:text-red-400">
                  -{file.deletions}
                </span>}
            </span>
          </div>

          {/* Expand/Collapse full file button - only show if content is available */}
          {!isCollapsed && !file.isBinary && hasContent && <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button type="button" onClick={function (e) {
                e.stopPropagation();
                toggleFullExpanded(file.key);
            }} class={(0, utils_1.cn)("shrink-0 p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95", isFullExpanded && "bg-accent")} aria-pressed={isFullExpanded}>
                  <div class="relative w-3.5 h-3.5">
                    <icons_2.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isFullExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
                    <icons_2.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isFullExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
                  </div>
                </button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="left">
                {isFullExpanded ? "Show changes only" : "Show full file"}
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>}
          {/* Show loading spinner while content is being fetched */}
          {!isCollapsed && !file.isBinary && !hasContent && isLoadingContent && <div class="shrink-0 p-1">
                <icons_2.IconSpinner class="w-3.5 h-3.5 text-muted-foreground"/>
              </div>}

          {/* Viewed checkbox with label - GitHub style (hidden for sandboxes) */}
          {showViewed && <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button type="button" onClick={function (e) {
                e.stopPropagation();
                onToggleViewed(file.key, file.diffText);
            }} class={(0, utils_1.cn)("shrink-0 h-6 pl-1 pr-1.5 rounded-md flex items-center gap-1 transition-all duration-150 text-xs font-medium", isViewed ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")} aria-pressed={isViewed}>
                  <div class={(0, utils_1.cn)("size-4 rounded flex items-center justify-center transition-all duration-150", isViewed ? "bg-primary text-primary-foreground" : "border border-muted-foreground/40")}>
                    {isViewed && <lucide_solid_1.Check class="size-3" strokeWidth={2.5}/>}
                  </div>
                  <span>Viewed</span>
                </button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="bottom">
                {isViewed ? "Mark as unviewed" : "Mark as viewed"}
                <kbd_1.Kbd>V</kbd_1.Kbd>
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>}
        </div>
      </header>;
    return <div ref={diffCardRef} class="bg-background rounded-lg border border-border overflow-clip" data-diff-file-path={file.newPath || file.oldPath}>
      {worktreePath ? <context_menu_1.ContextMenu>
          <context_menu_1.ContextMenuTrigger asChild>
            {headerContent}
          </context_menu_1.ContextMenuTrigger>
          <context_menu_1.ContextMenuContent class="w-56">
            <context_menu_1.ContextMenuItem onClick={handleCopyPath} class="text-xs">
              <icons_1.ClipboardIcon class="mr-2 size-3.5"/>
              Copy File Path
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={handleCopyRelativePath} class="text-xs">
              <icons_1.ClipboardIcon class="mr-2 size-3.5"/>
              Copy Relative File Path
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={handleRevealInFinder} class="text-xs">
              <icons_1.FolderIcon class="mr-2 size-3.5"/>
              Reveal in Finder
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuItem onClick={handleOpenInEditor} class="text-xs">
              <icons_1.ExternalLinkIcon class="mr-2 size-3.5"/>
              Open in Editor
            </context_menu_1.ContextMenuItem>
            <context_menu_1.ContextMenuSeparator />
            <context_menu_1.ContextMenuItem onClick={function () { return onToggleViewed(file.key, file.diffText); }} class="text-xs justify-between">
              {isViewed ? "Mark as unviewed" : "Mark as viewed"}
              <kbd_1.Kbd>V</kbd_1.Kbd>
            </context_menu_1.ContextMenuItem>
            {onDiscardFile && !isDeletedFile && <>
                <context_menu_1.ContextMenuSeparator />
                <context_menu_1.ContextMenuItem onClick={handleDiscard} class="text-xs data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
                  Discard Changes
                </context_menu_1.ContextMenuItem>
              </>}
          </context_menu_1.ContextMenuContent>
        </context_menu_1.ContextMenu> : headerContent}

      {/* Content area */}
      {!isCollapsed && <div>
          {file.isBinary ? <div class="px-3 py-2 text-xs text-muted-foreground">
              Binary file diff can't be rendered.
            </div> : !file.isValid ? <div class="flex items-center gap-2 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
              <lucide_solid_1.AlertTriangle class="h-3.5 w-3.5 flex-shrink-0"/>
              <span>
                Diff format appears truncated or corrupted. Unable to render
                this file's changes.
              </span>
            </div> : <div class="agent-diff-wrapper">
              <DiffErrorBoundary fileName={file.newPath || file.oldPath} rawDiff={file.diffText}>
                <react_1.DiffView ref={diffViewRef} data={data} diffViewTheme={isLight ? "light" : "dark"} diffViewMode={diffMode} diffViewHighlight={!!shikiHighlighter} diffViewWrap={false} registerHighlighter={shikiHighlighter !== null && shikiHighlighter !== void 0 ? shikiHighlighter : undefined}/>
              </DiffErrorBoundary>
            </div>}
        </div>}
    </div>;
}, fileDiffCardAreEqual);
// DEBUG: Render counter
var renderCount = 0;
exports.AgentDiffView = forwardRef(function AgentDiffView(_a, ref) {
    var _this = this;
    var chatId = _a.chatId, sandboxId = _a.sandboxId, worktreePath = _a.worktreePath, repository = _a.repository, onStatsChange = _a.onStatsChange, initialDiff = _a.initialDiff, initialParsedFiles = _a.initialParsedFiles, prefetchedFileContents = _a.prefetchedFileContents, _b = _a.showFooter, showFooter = _b === void 0 ? true : _b, externalOnCreatePr = _a.onCreatePr, externalIsCreatingPr = _a.isCreatingPr, _c = _a.isMobile, isMobile = _c === void 0 ? false : _c, onClose = _a.onClose, onCollapsedStateChange = _a.onCollapsedStateChange, onSelectNextFile = _a.onSelectNextFile, onViewedCountChange = _a.onViewedCountChange, initialSelectedFile = _a.initialSelectedFile;
    // DEBUG: Log renders
    renderCount++;
    console.log("[AgentDiffView] RENDER #".concat(renderCount), {
        chatId: chatId,
        sandboxId: sandboxId,
        initialDiff: initialDiff === null || initialDiff === void 0 ? void 0 : initialDiff.slice(0, 50),
        initialParsedFiles: initialParsedFiles === null || initialParsedFiles === void 0 ? void 0 : initialParsedFiles.length
    });
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var isHydrated = useIsHydrated();
    var codeThemeId = (0, use_code_theme_1.useCodeTheme)();
    // Shiki highlighter for syntax highlighting in diff view
    var _d = (0, solid_js_1.createSignal)(null), shikiHighlighter = _d[0], setShikiHighlighter = _d[1];
    // Update diff view theme when code theme changes
    (0, solid_js_1.createEffect)(function () {
        (0, diff_view_highlighter_1.setDiffViewTheme)(codeThemeId);
    });
    // Load shiki highlighter AFTER first paint - critical for instant sidebar opening
    // The getDiffHighlighter() call can block main thread for ~1s even if preloaded
    (0, solid_js_1.createEffect)(function () {
        var cancelled = false;
        // Wait for first paint before even starting to load highlighter
        // This ensures the diff sidebar is visible immediately
        requestAnimationFrame(function () {
            if (cancelled)
                return;
            requestAnimationFrame(function () {
                if (cancelled)
                    return;
                // Now we're after paint, safe to load highlighter
                var start = performance.now();
                (0, diff_view_highlighter_1.getDiffHighlighter)().then(function (highlighter) {
                    var elapsed = performance.now() - start;
                    if (!cancelled) {
                        setShikiHighlighter(highlighter);
                    }
                }).catch(function (err) {
                    console.error("Failed to load diff highlighter:", err);
                });
            });
        });
        return function () {
            cancelled = true;
        };
    });
    var _e = (0, solid_js_1.createSignal)(initialDiff !== null && initialDiff !== void 0 ? initialDiff : null), diff = _e[0], setDiff = _e[1];
    // Loading if initialDiff not provided, or if it's null AND no parsed files array provided
    // Note: empty array [] means "no changes", null/undefined means "still loading"
    var _f = (0, solid_js_1.createSignal)(initialDiff === undefined || initialDiff === null && !Array.isArray(initialParsedFiles)), isLoadingDiff = _f[0], setIsLoadingDiff = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), diffError = _g[0], setDiffError = _g[1];
    // Use local state for collapsed - faster than atom for frequent updates
    var _h = (0, solid_js_1.createSignal)({}), collapsedByFileKey = _h[0], setCollapsedByFileKey = _h[1];
    var _j = (0, solid_js_1.createSignal)({}), fullExpandedByFileKey = _j[0], setFullExpandedByFileKey = _j[1];
    var _k = (0, jotai_1.useAtom)(exports.diffViewModeAtom), diffMode = _k[0], setDiffMode = _k[1];
    // Discard changes state and mutation
    var _l = (0, solid_js_1.createSignal)(null), discardFilePath = _l[0], setDiscardFilePath = _l[1];
    var handleDiscardFile = function (filePath) {
        setDiscardFilePath(filePath);
    };
    // Viewed files state for tracking reviewed files (GitHub-style)
    var _m = (0, jotai_1.useAtom)((0, atoms_1.viewedFilesAtomFamily)(chatId)), viewedFiles = _m[0], setViewedFiles = _m[1];
    // Undo stack for viewed actions (stores previous viewedFiles states)
    var _o = (0, solid_js_1.createSignal)([]), viewedUndoStackRef = _o[0], setViewedUndoStackRef = _o[1];
    // Check if file is viewed (and content hasn't changed since marking as viewed)
    var isFileViewed = function (fileKey, diffText) {
        var viewedState = viewedFiles[fileKey];
        if (!(viewedState === null || viewedState === void 0 ? void 0 : viewedState.viewed))
            return false;
        // If content hash changed, file is no longer "viewed"
        return viewedState.contentHash === hashString(diffText);
    };
    // Pre-fetched file contents for expand functionality
    // Use prefetched data if available, otherwise start empty
    var _p = (0, solid_js_1.createSignal)(prefetchedFileContents !== null && prefetchedFileContents !== void 0 ? prefetchedFileContents : {}), fileContents = _p[0], setFileContents = _p[1];
    var _q = (0, solid_js_1.createSignal)(false), isLoadingFileContents = _q[0], setIsLoadingFileContents = _q[1];
    // Sync with prefetched file contents when they arrive after mount
    (0, solid_js_1.createEffect)(function () {
        if (prefetchedFileContents && Object.keys(prefetchedFileContents).length > 0) {
            setFileContents(prefetchedFileContents);
        }
    });
    // Focused file for scroll-to functionality
    var focusedDiffFile = (0, jotai_1.useAtomValue)(atoms_1.agentsFocusedDiffFileAtom);
    var setFocusedDiffFile = (0, jotai_1.useSetAtom)(atoms_1.agentsFocusedDiffFileAtom);
    var _r = (0, solid_js_1.createSignal)(null), scrollContainerRef = _r[0], setScrollContainerRef = _r[1];
    // Height for collapsed header (file name + stats)
    var COLLAPSED_HEIGHT = 44;
    // Estimated height for expanded diff
    var EXPANDED_HEIGHT_ESTIMATE = 300;
    // Fetch diff on mount (only if initialDiff not provided)
    (0, solid_js_1.createEffect)(function () {
        // Skip fetch if initialDiff was provided with actual content or parsed files
        if (initialDiff !== undefined) {
            setDiff(initialDiff);
            // Only mark as not loading if we have actual data or parsed files array
            // Note: empty array [] means "no changes", null/undefined means "still loading"
            var parentStillLoading = initialDiff === null && !Array.isArray(initialParsedFiles);
            setIsLoadingDiff(parentStillLoading);
            return;
        }
        var fetchDiff = function () { return __awaiter(_this, void 0, void 0, function () {
            var result, diffContent, error_1, response, data, diffContent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!sandboxId && chatId)) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsLoadingDiff(true);
                        return [4 /*yield*/, trpc_1.trpcClient.chats.getDiff.query({ chatId: chatId })];
                    case 2:
                        result = _a.sent();
                        diffContent = result.diff || "";
                        setDiff(diffContent.trim() ? diffContent : "");
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        setDiffError(error_1 instanceof Error ? error_1.message : "Failed to fetch diff");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoadingDiff(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                    case 6:
                        // Web: use sandbox API
                        if (!sandboxId) {
                            setDiffError("Sandbox ID is required");
                            setIsLoadingDiff(false);
                            return [2 /*return*/];
                        }
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 10, 11, 12]);
                        setIsLoadingDiff(true);
                        return [4 /*yield*/, fetch("/api/agents/sandbox/".concat(sandboxId, "/diff"))];
                    case 8:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch diff: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 9:
                        data = _a.sent();
                        diffContent = data.diff || "";
                        if (diffContent.trim()) {
                            setDiff(diffContent);
                        }
                        else {
                            setDiff("");
                        }
                        return [3 /*break*/, 12];
                    case 10:
                        error_2 = _a.sent();
                        setDiffError(error_2 instanceof Error ? error_2.message : "Failed to fetch diff");
                        return [3 /*break*/, 12];
                    case 11:
                        setIsLoadingDiff(false);
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        fetchDiff();
    });
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var diffContent, result, response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoadingDiff(true);
                    setDiffError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    diffContent = "";
                    if (!(chatId && !sandboxId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, trpc_1.trpcClient.chats.getDiff.query({ chatId: chatId })];
                case 2:
                    result = _a.sent();
                    diffContent = result.diff || "";
                    return [3 /*break*/, 6];
                case 3:
                    if (!sandboxId) return [3 /*break*/, 6];
                    return [4 /*yield*/, fetch("/api/agents/sandbox/".concat(sandboxId, "/diff"))];
                case 4:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch diff: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    diffContent = data.diff || "";
                    _a.label = 6;
                case 6:
                    if (diffContent.trim()) {
                        setDiff(diffContent);
                    }
                    else {
                        setDiff("");
                    }
                    return [3 /*break*/, 9];
                case 7:
                    error_3 = _a.sent();
                    setDiffError(error_3 instanceof Error ? error_3.message : "Failed to fetch diff");
                    return [3 /*break*/, 9];
                case 8:
                    setIsLoadingDiff(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var isLight = isHydrated ? resolvedTheme() !== "dark" : true;
    // Read filter for sub-chat specific file filtering
    var filteredDiffFiles = (0, jotai_1.useAtomValue)(atoms_1.filteredDiffFilesAtom);
    var setFilteredDiffFiles = (0, jotai_1.useSetAtom)(atoms_1.filteredDiffFilesAtom);
    // Clear filter when component unmounts (not during close animation, only on actual unmount)
    (0, solid_js_1.createEffect)(function () {
        return function () {
            setFilteredDiffFiles(null);
        };
    });
    var allFileDiffs = (0, solid_js_1.createMemo)(function () {
        // Use pre-parsed files if provided (avoids duplicate parsing)
        if (initialParsedFiles && initialParsedFiles.length > 0) {
            return initialParsedFiles;
        }
        // Fall back to parsing raw diff
        if (!diff)
            return [];
        try {
            return (0, exports.splitUnifiedDiffByFile)(diff);
        }
        catch (_a) {
            return [];
        }
    });
    // Filter files if filteredDiffFiles is set (for sub-chat Review)
    // Use initialSelectedFile as fallback for first render before atom updates
    var effectiveFilter = filteredDiffFiles !== null && filteredDiffFiles !== void 0 ? filteredDiffFiles : (initialSelectedFile ? [initialSelectedFile] : null);
    var fileDiffs = (0, solid_js_1.createMemo)(function () {
        // First, filter out invalid files without proper paths (file-N keys indicate parse failure)
        var validFiles = allFileDiffs.filter(function (file) {
            // Skip files that failed to parse (have generic file-N keys and no real paths)
            if (file.key.startsWith("file-") && !file.oldPath && !file.newPath) {
                return false;
            }
            // Also skip files with only /dev/null paths (shouldn't happen but be safe)
            if (file.oldPath === "/dev/null" && file.newPath === "/dev/null") {
                return false;
            }
            return true;
        });
        // Filter out /dev/null from filter paths (it's not a real file path)
        var validFilterPaths = (effectiveFilter === null || effectiveFilter === void 0 ? void 0 : effectiveFilter.filter(function (p) { return p && p !== "/dev/null"; })) || [];
        if (validFilterPaths.length === 0) {
            return validFiles;
        }
        // Filter to only show files matching the filter paths
        return validFiles.filter(function (file) {
            // Use the actual file path (prefer newPath for new/modified, oldPath for deleted)
            var filePath = file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
            // Match by exact path or by path suffix (to handle sandbox path prefixes)
            return validFilterPaths.some(function (filterPath) { return filePath === filterPath || filePath.endsWith(filterPath) || filterPath.endsWith(filePath); });
        });
    });
    // Handle discard confirmation
    var handleConfirmDiscard = function () { return __awaiter(_this, void 0, void 0, function () {
        var file, isNewFile, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!discardFilePath || !worktreePath)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    file = fileDiffs.find(function (f) {
                        var path = f.newPath !== "/dev/null" ? f.newPath : f.oldPath;
                        return path === discardFilePath;
                    });
                    isNewFile = (file === null || file === void 0 ? void 0 : file.oldPath) === "/dev/null";
                    if (!isNewFile) return [3 /*break*/, 3];
                    return [4 /*yield*/, trpc_1.trpcClient.changes.deleteUntracked.mutate({
                            worktreePath: worktreePath,
                            filePath: discardFilePath
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, trpc_1.trpcClient.changes.discardChanges.mutate({
                        worktreePath: worktreePath,
                        filePath: discardFilePath
                    })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    solid_sonner_1.toast.success("Changes discarded");
                    // Refresh the diff
                    handleRefresh();
                    return [3 /*break*/, 8];
                case 6:
                    error_4 = _a.sent();
                    solid_sonner_1.toast.error("Failed to discard: ".concat(error_4 instanceof Error ? error_4.message : "Unknown error"));
                    return [3 /*break*/, 8];
                case 7:
                    setDiscardFilePath(null);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Expand/collapse all functions - exposed via ref for parent control
    // Uses batched updates to avoid blocking UI with many files
    var expandAll = function () {
        // For small number of files, expand all at once
        if (fileDiffs.length <= 10) {
            startTransition(function () {
                var expandedState = {};
                for (var _i = 0, fileDiffs_1 = fileDiffs; _i < fileDiffs_1.length; _i++) {
                    var file = fileDiffs_1[_i];
                    expandedState[file.key] = false;
                }
                setCollapsedByFileKey(expandedState);
            });
            return;
        }
        // For many files, expand in batches to avoid UI freeze
        var BATCH_SIZE = 5;
        var currentBatch = 0;
        var expandBatch = function () {
            var start = currentBatch * BATCH_SIZE;
            var end = Math.min(start + BATCH_SIZE, fileDiffs.length);
            if (start >= fileDiffs.length)
                return;
            startTransition(function () {
                setCollapsedByFileKey(function (prev) {
                    var next = __assign({}, prev);
                    for (var i = start; i < end; i++) {
                        var file = fileDiffs[i];
                        if (file)
                            next[file.key] = false;
                    }
                    return next;
                });
            });
            currentBatch++;
            if (currentBatch * BATCH_SIZE < fileDiffs.length) {
                // Use requestAnimationFrame for next batch to allow UI to breathe
                requestAnimationFrame(function () { return setTimeout(expandBatch, 0); });
            }
        };
        expandBatch();
    };
    var collapseAll = function () {
        // Collapse is fast - no batching needed
        startTransition(function () {
            var collapsedState = {};
            for (var _i = 0, fileDiffs_2 = fileDiffs; _i < fileDiffs_2.length; _i++) {
                var file = fileDiffs_2[_i];
                collapsedState[file.key] = true;
            }
            setCollapsedByFileKey(collapsedState);
        });
    };
    // Check if all files are collapsed/expanded
    var isAllCollapsed = function () {
        if (fileDiffs.length === 0)
            return true;
        return fileDiffs.every(function (file) { return collapsedByFileKey[file.key] === true; });
    };
    var isAllExpanded = function () {
        if (fileDiffs.length === 0)
            return true;
        return fileDiffs.every(function (file) { return !collapsedByFileKey[file.key]; });
    };
    // Get count of viewed files (with matching content hash)
    var getViewedCount = function () {
        return fileDiffs.filter(function (file) { return isFileViewed(file.key, file.diffText); }).length;
    };
    // Mark all files as viewed and collapse them
    var markAllViewed = function () {
        var newViewedState = {};
        var newCollapsedState = {};
        for (var _i = 0, fileDiffs_3 = fileDiffs; _i < fileDiffs_3.length; _i++) {
            var file = fileDiffs_3[_i];
            newViewedState[file.key] = {
                viewed: true,
                contentHash: hashString(file.diffText)
            };
            newCollapsedState[file.key] = true;
        }
        setViewedFiles(newViewedState);
        setCollapsedByFileKey(newCollapsedState);
    };
    // Mark all files as unviewed and expand them
    var markAllUnviewed = function () {
        setViewedFiles({});
        var newCollapsedState = {};
        for (var _i = 0, fileDiffs_4 = fileDiffs; _i < fileDiffs_4.length; _i++) {
            var file = fileDiffs_4[_i];
            newCollapsedState[file.key] = false;
        }
        setCollapsedByFileKey(newCollapsedState);
    };
    // Expose expand/collapse methods to parent via ref
    useImperativeHandle(ref, function () { return ({
        expandAll: expandAll,
        collapseAll: collapseAll,
        isAllCollapsed: isAllCollapsed,
        isAllExpanded: isAllExpanded,
        getViewedCount: getViewedCount,
        markAllViewed: markAllViewed,
        markAllUnviewed: markAllUnviewed
    }); }, [
        expandAll,
        collapseAll,
        isAllCollapsed,
        isAllExpanded,
        getViewedCount,
        markAllViewed,
        markAllUnviewed
    ]);
    // Notify parent when collapsed state changes
    var _s = (0, solid_js_1.createSignal)(null), prevCollapseStateRef = _s[0], setPrevCollapseStateRef = _s[1];
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        var newState = {
            allCollapsed: isAllCollapsed(),
            allExpanded: isAllExpanded()
        };
        // Only notify if state actually changed
        if (((_a = prevCollapseStateRef.current) === null || _a === void 0 ? void 0 : _a.allCollapsed) !== newState.allCollapsed || ((_b = prevCollapseStateRef.current) === null || _b === void 0 ? void 0 : _b.allExpanded) !== newState.allExpanded) {
            prevCollapseStateRef.current = newState;
            onCollapsedStateChange === null || onCollapsedStateChange === void 0 ? void 0 : onCollapsedStateChange(newState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable, excluding to prevent loops
    });
    // Notify parent when viewed count changes
    var _t = (0, solid_js_1.createSignal)(null), prevViewedCountRef = _t[0], setPrevViewedCountRef = _t[1];
    (0, solid_js_1.createEffect)(function () {
        var count = getViewedCount();
        if (prevViewedCountRef.current !== count) {
            prevViewedCountRef.current = count;
            onViewedCountChange === null || onViewedCountChange === void 0 ? void 0 : onViewedCountChange(count);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable, excluding to prevent loops
    });
    // Auto-expand all files with lazy batching for performance
    // Track if we've already initialized the collapsed state for this set of files
    var _u = (0, solid_js_1.createSignal)(""), prevFileKeysRef = _u[0], setPrevFileKeysRef = _u[1];
    var _v = (0, solid_js_1.createSignal)(false), isExpandingRef = _v[0], setIsExpandingRef = _v[1];
    (0, solid_js_1.createEffect)(function () {
        // Generate a unique key for the current file set
        var currentFileKeys = fileDiffs.map(function (f) { return f.key; }).join(",");
        // Only update if the file set changed and we're not already expanding
        if (currentFileKeys !== prevFileKeysRef.current && !isExpandingRef.current) {
            prevFileKeysRef.current = currentFileKeys;
            // For small number of files, expand all at once
            if (fileDiffs.length <= 10) {
                startTransition(function () {
                    var expandedState = {};
                    for (var _i = 0, fileDiffs_5 = fileDiffs; _i < fileDiffs_5.length; _i++) {
                        var file = fileDiffs_5[_i];
                        expandedState[file.key] = false;
                    }
                    setCollapsedByFileKey(expandedState);
                });
                return;
            }
            // For many files, expand in batches to avoid UI freeze
            isExpandingRef.current = true;
            var BATCH_SIZE_1 = 5;
            var currentBatch_1 = 0;
            var expandBatch_1 = function () {
                var start = currentBatch_1 * BATCH_SIZE_1;
                var end = Math.min(start + BATCH_SIZE_1, fileDiffs.length);
                if (start >= fileDiffs.length) {
                    isExpandingRef.current = false;
                    return;
                }
                startTransition(function () {
                    setCollapsedByFileKey(function (prev) {
                        var next = __assign({}, prev);
                        for (var i = start; i < end; i++) {
                            var file = fileDiffs[i];
                            if (file)
                                next[file.key] = false;
                        }
                        return next;
                    });
                });
                currentBatch_1++;
                if (currentBatch_1 * BATCH_SIZE_1 < fileDiffs.length) {
                    // Use requestAnimationFrame for next batch to allow UI to breathe
                    requestAnimationFrame(function () { return setTimeout(expandBatch_1, 0); });
                }
                else {
                    isExpandingRef.current = false;
                }
            };
            expandBatch_1();
        }
    });
    var diffViewDataByKey = (0, solid_js_1.createMemo)(function () {
        var _a, _b, _c;
        var langMap = {
            ts: "typescript",
            tsx: "typescript",
            js: "javascript",
            jsx: "javascript",
            css: "css",
            json: "json",
            md: "markdown",
            html: "html"
        };
        var record = {};
        for (var _i = 0, fileDiffs_6 = fileDiffs; _i < fileDiffs_6.length; _i++) {
            var file = fileDiffs_6[_i];
            // Use server-provided flags if available, otherwise detect from paths
            var isNewFile = (_a = file.isNewFile) !== null && _a !== void 0 ? _a : file.oldPath === "/dev/null";
            var isDeletedFile = (_b = file.isDeletedFile) !== null && _b !== void 0 ? _b : file.newPath === "/dev/null";
            // Use server-provided fileLang if available, otherwise detect from extension
            var fileLang = file.fileLang;
            if (fileLang === undefined) {
                var actualPath = isNewFile ? file.newPath : isDeletedFile ? file.oldPath : file.newPath || file.oldPath;
                var ext = ((_c = (actualPath || "").split(".").pop()) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "";
                fileLang = langMap[ext] || ext || null;
            }
            // PURE DIFF MODE: Always use null for content to avoid mismatch warnings
            // The @git-diff-view library validates content against diff when content is provided,
            // but the working directory may have changed since the diff was generated,
            // causing expensive validation warnings that block the UI thread.
            // Using null for both old/new content enables pure diff mode where the library
            // only renders the diff hunks without validation.
            // Normalize diff text: ensure proper ending for the parser
            // The library fails on diffs that end with just "+" or "-" (empty line changes)
            var normalizedDiff = file.diffText;
            // Remove trailing empty lines that might confuse the parser
            normalizedDiff = normalizedDiff.replace(/\n+$/, "\n");
            // If diff ends with an empty addition/deletion line, add a newline marker
            if (normalizedDiff.endsWith("\n+\n") || normalizedDiff.endsWith("\n-\n")) {
                normalizedDiff = normalizedDiff.slice(0, -1);
            }
            // Handle case where diff ends with just + or - on last line
            var lines = normalizedDiff.split("\n");
            var lastLine = lines[lines.length - 1];
            if (lastLine === "+" || lastLine === "-") {
                lines[lines.length - 1] = lastLine + " ";
                normalizedDiff = lines.join("\n");
            }
            record[file.key] = {
                oldFile: {
                    fileName: isNewFile ? null : file.oldPath || null,
                    fileLang: fileLang,
                    content: null
                },
                newFile: {
                    fileName: isDeletedFile ? null : file.newPath || null,
                    fileLang: fileLang,
                    content: null
                },
                hunks: [normalizedDiff]
            };
        }
        return record;
    });
    // Use deferred value for diff data to prevent UI blocking during tab switches
    // This allows the tab change to happen immediately while diff rendering is deferred
    var deferredDiffViewData = useDeferredValue(diffViewDataByKey);
    var deferredFileDiffs = useDeferredValue(fileDiffs);
    var isDiffStale = deferredFileDiffs !== fileDiffs;
    // Pre-fetch file contents when diff is loaded (for expand functionality)
    // Delayed to allow UI to render first, then fetch in background
    // Limited to prevent overwhelming the system with too many parallel requests
    var MAX_PREFETCH_FILES = 20;
    (0, solid_js_1.createEffect)(function () {
        // Desktop: use worktreePath, Web: use sandboxId
        console.log("[AgentDiffView] File content effect:", {
            fileDiffsCount: fileDiffs.length,
            isLoadingFileContents: isLoadingFileContents,
            worktreePath: !!worktreePath,
            sandboxId: sandboxId,
            existingContents: Object.keys(fileContents).length
        });
        if (fileDiffs.length === 0 || isLoadingFileContents)
            return;
        if (!worktreePath && !sandboxId)
            return;
        // Skip if we already have enough contents
        var existingContentCount = Object.keys(fileContents).length;
        if (existingContentCount >= Math.min(fileDiffs.length, MAX_PREFETCH_FILES))
            return;
        console.log("[AgentDiffView] Will fetch file contents...");
        var fetchAllContents = function () { return __awaiter(_this, void 0, void 0, function () {
            var filesToProcess, filesToFetch, results, newContents, _i, _a, _b, key, result, results, newContents, _c, results_1, result, error_5;
            var _this = this;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        setIsLoadingFileContents(true);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 8]);
                        filesToProcess = fileDiffs.slice(0, MAX_PREFETCH_FILES);
                        filesToFetch = filesToProcess.map(function (file) {
                            var filePath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
                            if (!filePath || filePath === "/dev/null")
                                return null;
                            return {
                                key: file.key,
                                filePath: filePath
                            };
                        }).filter(function (f) { return f !== null; });
                        if (filesToFetch.length === 0) {
                            setIsLoadingFileContents(false);
                            return [2 /*return*/];
                        }
                        if (!worktreePath) return [3 /*break*/, 3];
                        return [4 /*yield*/, trpc_1.trpcClient.changes.readMultipleWorkingFiles.query({
                                worktreePath: worktreePath,
                                files: filesToFetch
                            })];
                    case 2:
                        results = _e.sent();
                        newContents = {};
                        for (_i = 0, _a = Object.entries(results); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], result = _b[1];
                            if (result.ok) {
                                newContents[key] = result.content;
                            }
                        }
                        setFileContents(newContents);
                        return [3 /*break*/, 5];
                    case 3:
                        if (!sandboxId) return [3 /*break*/, 5];
                        // Sandbox: use remoteApi on desktop, relative fetch on web
                        console.log("[AgentDiffView] Fetching file contents for sandbox, isDesktop:", (0, platform_1.isDesktopApp)());
                        return [4 /*yield*/, Promise.allSettled(filesToFetch.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var data, response, data;
                                var key = _b.key, filePath = _b.filePath;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!(0, platform_1.isDesktopApp)()) return [3 /*break*/, 2];
                                            return [4 /*yield*/, remote_api_1.remoteApi.getSandboxFile(sandboxId, filePath)];
                                        case 1:
                                            data = _c.sent();
                                            return [2 /*return*/, {
                                                    key: key,
                                                    content: data.content
                                                }];
                                        case 2: return [4 /*yield*/, Promise.race([fetch("/api/agents/sandbox/".concat(sandboxId, "/files?path=").concat(encodeURIComponent(filePath))), new Promise(function (_, reject) { return setTimeout(function () { return reject(new Error("Timeout")); }, 5e3); })])];
                                        case 3:
                                            response = _c.sent();
                                            if (!response.ok)
                                                throw new Error("Failed to fetch file");
                                            return [4 /*yield*/, response.json()];
                                        case 4:
                                            data = _c.sent();
                                            return [2 /*return*/, {
                                                    key: key,
                                                    content: data.content
                                                }];
                                    }
                                });
                            }); }))];
                    case 4:
                        results = _e.sent();
                        console.log("[AgentDiffView] File content results:", results.length, "files");
                        newContents = {};
                        for (_c = 0, results_1 = results; _c < results_1.length; _c++) {
                            result = results_1[_c];
                            if (result.status === "fulfilled" && ((_d = result.value) === null || _d === void 0 ? void 0 : _d.content)) {
                                newContents[result.value.key] = result.value.content;
                            }
                        }
                        console.log("[AgentDiffView] Setting file contents:", Object.keys(newContents).length, "files");
                        setFileContents(newContents);
                        _e.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_5 = _e.sent();
                        console.error("Failed to prefetch file contents:", error_5);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoadingFileContents(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        fetchAllContents();
    });
    var toggleFileCollapsed = function (fileKey) {
        setCollapsedByFileKey(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fileKey] = !prev[fileKey], _a)));
        });
    };
    var toggleFileFullExpanded = function (fileKey) {
        setFullExpandedByFileKey(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[fileKey] = !prev[fileKey], _a)));
        });
    };
    // Virtualizer for efficient rendering of many files
    // Use deferred file list to prevent UI blocking during updates
    var virtualizer = (0, react_virtual_1.useVirtualizer)({
        count: deferredFileDiffs.length,
        getScrollElement: function () { return scrollContainerRef.current; },
        estimateSize: function (index) {
            var file = deferredFileDiffs[index];
            if (!file)
                return COLLAPSED_HEIGHT;
            var isCollapsed = !!collapsedByFileKey[file.key];
            if (isCollapsed) {
                return COLLAPSED_HEIGHT;
            }
            // Estimate based on line count
            var lineCount = file.additions + file.deletions;
            return Math.min(Math.max(lineCount * 22 + COLLAPSED_HEIGHT, 150), 800);
        },
        overscan: 3
    });
    // Toggle viewed state for a file
    // When marking as viewed, auto-navigate to the next UNVIEWED file
    // Uses allFileDiffs (unfiltered list) for navigation since filtered list may only contain current file
    var handleToggleViewed = function (fileKey, diffText) {
        var _a;
        var currentHash = hashString(diffText);
        var isCurrentlyViewed = isFileViewed(fileKey, diffText);
        var willBeViewed = !isCurrentlyViewed;
        // Save to undo stack before changing
        viewedUndoStackRef.current.push({
            fileKey: fileKey,
            previousState: viewedFiles[fileKey]
        });
        // Limit undo stack size to 50
        if (viewedUndoStackRef.current.length > 50) {
            viewedUndoStackRef.current.shift();
        }
        // Build new viewed state
        var newViewedFiles = __assign(__assign({}, viewedFiles), (_a = {}, _a[fileKey] = {
            viewed: willBeViewed,
            contentHash: currentHash
        }, _a));
        setViewedFiles(newViewedFiles);
        // Helper to check if file is viewed using new state (not stale closure)
        var isFileViewedWithNewState = function (fKey, fDiffText) {
            var viewedState = newViewedFiles[fKey];
            if (!(viewedState === null || viewedState === void 0 ? void 0 : viewedState.viewed))
                return false;
            return viewedState.contentHash === hashString(fDiffText);
        };
        // When marking as viewed, find and select next UNVIEWED file
        // Use allFileDiffs (unfiltered) for navigation, since filtered list may only show current file
        if (willBeViewed && onSelectNextFile) {
            var currentIndex = allFileDiffs.findIndex(function (f) { return f.key === fileKey; });
            if (currentIndex === -1)
                return;
            // Find next unviewed file after current position
            var nextUnviewedFile = null;
            for (var i = currentIndex + 1; i < allFileDiffs.length; i++) {
                var file = allFileDiffs[i];
                if (file && !isFileViewedWithNewState(file.key, file.diffText)) {
                    nextUnviewedFile = file;
                    break;
                }
            }
            // If no unviewed file found after current, wrap around and search from beginning
            if (!nextUnviewedFile) {
                for (var i = 0; i < currentIndex; i++) {
                    var file = allFileDiffs[i];
                    if (file && !isFileViewedWithNewState(file.key, file.diffText)) {
                        nextUnviewedFile = file;
                        break;
                    }
                }
            }
            // If found an unviewed file, select it
            if (nextUnviewedFile) {
                // Get the actual file path (newPath for new/modified files, oldPath for deleted files)
                var filePath = nextUnviewedFile.newPath && nextUnviewedFile.newPath !== "/dev/null" ? nextUnviewedFile.newPath : nextUnviewedFile.oldPath;
                if (filePath && filePath !== "/dev/null") {
                    // Select next file - this will update the filter and diff view
                    onSelectNextFile(filePath);
                }
            }
        }
    };
    // Undo last viewed action
    var undoLastViewed = function () {
        var _a;
        var lastAction = viewedUndoStackRef.current.pop();
        if (!lastAction)
            return false;
        var fileKey = lastAction.fileKey, previousState = lastAction.previousState;
        if (previousState === undefined) {
            // File wasn't in viewedFiles before - remove it
            var newViewedFiles = __assign({}, viewedFiles);
            delete newViewedFiles[fileKey];
            setViewedFiles(newViewedFiles);
        }
        else {
            // Restore previous state
            setViewedFiles(__assign(__assign({}, viewedFiles), (_a = {}, _a[fileKey] = previousState, _a)));
        }
        // Navigate back to the file that was undone
        var file = allFileDiffs.find(function (f) { return f.key === fileKey; });
        if (file && onSelectNextFile) {
            var filePath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
            if (filePath && filePath !== "/dev/null") {
                onSelectNextFile(filePath);
            }
        }
        return true;
    };
    // Use ALL files for stats, not filtered ones (to avoid overwriting parent's stats when filtering)
    var totalAdditions = allFileDiffs.reduce(function (sum, f) { return sum + f.additions; }, 0);
    var totalDeletions = allFileDiffs.reduce(function (sum, f) { return sum + f.deletions; }, 0);
    // Report stats to parent - only when we have actual data and NO filter active
    // When filtering is active, parent already has correct stats from fetchDiffStats
    var _w = (0, solid_js_1.createSignal)(null), prevStatsRef = _w[0], setPrevStatsRef = _w[1];
    (0, solid_js_1.createEffect)(function () {
        var _a, _b, _c, _d;
        console.log("[AgentDiffView] onStatsChange useEffect running", {
            filteredDiffFiles: filteredDiffFiles === null || filteredDiffFiles === void 0 ? void 0 : filteredDiffFiles.length,
            allFileDiffsLength: allFileDiffs.length,
            isLoadingDiff: isLoadingDiff,
            totalAdditions: totalAdditions,
            totalDeletions: totalDeletions,
            prevStats: prevStatsRef.current
        });
        // Don't report stats when filtering is active - parent already has correct totals
        if (filteredDiffFiles && filteredDiffFiles.length > 0) {
            console.log("[AgentDiffView] Early return: filtering active");
            return;
        }
        if (allFileDiffs.length === 0 && !isLoadingDiff) {
            // Don't report empty stats - let parent's fetchDiffStats be the source of truth
            console.log("[AgentDiffView] Early return: no files and not loading");
            return;
        }
        // Only notify if stats actually changed
        if (((_a = prevStatsRef.current) === null || _a === void 0 ? void 0 : _a.fileCount) === allFileDiffs.length && ((_b = prevStatsRef.current) === null || _b === void 0 ? void 0 : _b.additions) === totalAdditions && ((_c = prevStatsRef.current) === null || _c === void 0 ? void 0 : _c.deletions) === totalDeletions && ((_d = prevStatsRef.current) === null || _d === void 0 ? void 0 : _d.isLoading) === isLoadingDiff) {
            console.log("[AgentDiffView] Early return: stats unchanged");
            return;
        }
        console.log("[AgentDiffView] CALLING onStatsChange!", {
            fileCount: allFileDiffs.length,
            additions: totalAdditions,
            deletions: totalDeletions,
            isLoading: isLoadingDiff
        });
        prevStatsRef.current = {
            fileCount: allFileDiffs.length,
            additions: totalAdditions,
            deletions: totalDeletions,
            isLoading: isLoadingDiff
        };
        onStatsChange === null || onStatsChange === void 0 ? void 0 : onStatsChange({
            fileCount: allFileDiffs.length,
            additions: totalAdditions,
            deletions: totalDeletions,
            isLoading: isLoadingDiff,
            hasChanges: allFileDiffs.length > 0
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onStatsChange is stable setState, excluding to prevent loops
    });
    // DEBUG: Detect when diff view should render but doesn't
    // This helps diagnose issues where changes exist but diff view shows "No changes detected"
    (0, solid_js_1.createEffect)(function () {
        var _a;
        // Only run diagnostic after initial load is complete
        if (isLoadingDiff)
            return;
        var hasRawDiff = diff && diff.trim().length > 0;
        var hasParsedFiles = initialParsedFiles && initialParsedFiles.length > 0;
        var hasAllFiles = allFileDiffs.length > 0;
        var hasFilteredFiles = fileDiffs.length > 0;
        var hasVirtualItems = virtualizer.getVirtualItems().length > 0;
        // Case 1: We have raw diff but no parsed files
        if (hasRawDiff && !hasAllFiles) {
            console.error("[DiffView Debug] Raw diff exists but parsing failed:", {
                diffLength: diff === null || diff === void 0 ? void 0 : diff.length,
                diffPreview: diff === null || diff === void 0 ? void 0 : diff.slice(0, 200)
            });
        }
        // Case 2: We have parsed files but filter excludes all of them
        if (hasAllFiles && !hasFilteredFiles && effectiveFilter) {
            console.error("[DiffView Debug] All files filtered out:", {
                allFilesCount: allFileDiffs.length,
                allFilePaths: allFileDiffs.map(function (f) { return f.newPath || f.oldPath; }),
                filter: effectiveFilter
            });
        }
        // Case 3: We have filtered files but virtualizer shows nothing
        if (hasFilteredFiles && !hasVirtualItems) {
            console.error("[DiffView Debug] Files exist but virtualizer renders nothing:", {
                filteredFilesCount: fileDiffs.length,
                scrollContainerExists: !!scrollContainerRef.current,
                scrollContainerHeight: (_a = scrollContainerRef.current) === null || _a === void 0 ? void 0 : _a.clientHeight,
                virtualizerTotalSize: virtualizer.getTotalSize()
            });
        }
        // Case 4: Initial data provided but not being used
        if (hasParsedFiles && !hasAllFiles) {
            console.error("[DiffView Debug] initialParsedFiles provided but not used:", {
                initialParsedFilesCount: initialParsedFiles === null || initialParsedFiles === void 0 ? void 0 : initialParsedFiles.length,
                initialParsedFilesPaths: initialParsedFiles === null || initialParsedFiles === void 0 ? void 0 : initialParsedFiles.map(function (f) { return f.newPath || f.oldPath; })
            });
        }
    });
    // Scroll to focused file when atom changes (works with virtualized list)
    (0, solid_js_1.createEffect)(function () {
        if (!focusedDiffFile || isLoadingDiff) {
            return;
        }
        // Find the file index in the list
        var fileIndex = -1;
        // Try exact match first
        fileIndex = fileDiffs.findIndex(function (f) { return f.newPath === focusedDiffFile || f.oldPath === focusedDiffFile; });
        // If not found, try matching by file ending
        if (fileIndex === -1) {
            fileIndex = fileDiffs.findIndex(function (f) {
                var path = f.newPath || f.oldPath || "";
                return path.endsWith(focusedDiffFile) || focusedDiffFile.endsWith(path);
            });
        }
        if (fileIndex >= 0) {
            // Expand the file if it's collapsed first
            var file_1 = fileDiffs[fileIndex];
            if (file_1 && collapsedByFileKey[file_1.key]) {
                setCollapsedByFileKey(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[file_1.key] = false, _a)));
                });
            }
            // Use virtualizer's scrollToIndex for proper scrolling
            virtualizer.scrollToIndex(fileIndex, { align: "start" });
            // Add highlight effect after scroll completes
            setTimeout(function () {
                var container = scrollContainerRef.current;
                if (container) {
                    var fileCard_1 = container.querySelector("[data-diff-file-path=\"".concat(focusedDiffFile, "\"]"));
                    if (fileCard_1) {
                        fileCard_1.style.transition = "box-shadow 0.3s ease";
                        fileCard_1.style.boxShadow = "0 0 0 2px hsl(var(--primary)), 0 0 12px hsl(var(--primary) / 0.3)";
                        setTimeout(function () {
                            fileCard_1.style.boxShadow = "";
                        }, 1500);
                    }
                }
            }, 100);
        }
        // Clear the focused file atom
        setFocusedDiffFile(null);
    });
    // Keyboard shortcut: V to mark current file as viewed
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var _a, _b;
            // Use e.code for physical key position (works with any keyboard layout)
            if (e.code !== "KeyV")
                return;
            if (e.metaKey || e.ctrlKey || e.altKey)
                return;
            // Don't trigger if typing in input/textarea
            var target = e.target;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }
            // Find currently visible file and toggle its viewed state
            // Use the first visible file in the virtualizer viewport
            var visibleItems = virtualizer.getVirtualItems();
            if (visibleItems.length === 0)
                return;
            var firstVisibleIndex = (_b = (_a = visibleItems[0]) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1;
            if (firstVisibleIndex < 0)
                return;
            var file = deferredFileDiffs[firstVisibleIndex];
            if (file) {
                e.preventDefault();
                handleToggleViewed(file.key, file.diffText);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Keyboard shortcut: Cmd+Z to undo last viewed action
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            // Use e.code for physical key position (works with any keyboard layout)
            if (e.code !== "KeyZ")
                return;
            if (!e.metaKey || e.shiftKey || e.altKey)
                return;
            // Don't trigger if typing in input/textarea
            var target = e.target;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }
            // Try to undo - if successful, prevent default
            if (undoLastViewed()) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    if (!isHydrated) {
        return <div class="flex h-full items-center justify-center">
          <icons_2.IconSpinner class="w-4 h-4"/>
        </div>;
    }
    return <div class={(0, utils_1.cn)("flex flex-col bg-background overflow-hidden min-w-0", isMobile ? "h-full w-full" : "h-full")}>
        {/* Mobile Header */}
        {isMobile && <div class="flex-shrink-0 bg-background/95 backdrop-blur border-b h-11 min-h-[44px] max-h-[44px]" data-mobile-diff-header style={{ WebkitAppRegion: "drag" }}>
            <div class="flex h-full items-center px-2 gap-2" style={{ WebkitAppRegion: "no-drag" }}>
              {/* Back to chat button */}
              <button_1.Button variant="ghost" size="icon" onClick={onClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
                <icons_2.IconChatBubble class="h-4 w-4"/>
                <span class="sr-only">Back to chat</span>
              </button_1.Button>

              {/* Stats - centered */}
              <div class="flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {!isLoadingDiff && fileDiffs.length > 0 && <>
                    <span class="font-mono">
                      {fileDiffs.length} file{fileDiffs.length !== 1 ? "s" : ""}
                    </span>
                    {(totalAdditions > 0 || totalDeletions > 0) && <>
                        <span class="text-emerald-600 dark:text-emerald-400">
                          +{totalAdditions}
                        </span>
                        <span class="text-red-600 dark:text-red-400">
                          -{totalDeletions}
                        </span>
                      </>}
                  </>}
              </div>

              {/* Split/Unified toggle */}
              <div class="relative bg-muted rounded-md h-7 p-0.5 flex">
                <div class="absolute inset-y-0.5 rounded bg-background shadow transition-all duration-200 ease-in-out" style={{
                width: "calc(50% - 2px)",
                left: diffMode === react_1.DiffModeEnum.Split ? "2px" : "calc(50%)"
            }}/>
                <button onClick={function () { return setDiffMode(react_1.DiffModeEnum.Split); }} class="relative z-[2] px-1.5 flex items-center justify-center transition-colors duration-200 rounded text-muted-foreground" title="Split view">
                  <lucide_solid_1.Columns2 class="h-3.5 w-3.5"/>
                </button>
                <button onClick={function () { return setDiffMode(react_1.DiffModeEnum.Unified); }} class="relative z-[2] px-1.5 flex items-center justify-center transition-colors duration-200 rounded text-muted-foreground" title="Unified view">
                  <lucide_solid_1.Rows2 class="h-3.5 w-3.5"/>
                </button>
              </div>
            </div>
          </div>}

        {/* Content */}
        <div ref={scrollContainerRef} class="relative flex-1 overflow-auto p-2 select-text">
          {/* Sticky cover to hide content scrolling above cards */}
          <div class="sticky top-0 left-0 right-0 h-0 z-20 pointer-events-none" aria-hidden="true">
            <div class="absolute -top-2 left-0 right-0 h-2 bg-background"/>
          </div>


          {isLoadingDiff || isLoadingFileContents && fileDiffs.length === 0 ? <div class="flex items-center justify-center h-full">
              <icons_2.IconSpinner class="w-4 h-4"/>
            </div> : diffError ? <div class="flex flex-col items-center justify-center h-full text-center px-4">
              <p class="text-sm text-red-500 mb-2">{diffError}</p>
              <button_1.Button variant="outline" size="sm" onClick={handleRefresh}>
                Try again
              </button_1.Button>
            </div> : deferredFileDiffs.length > 0 ? <div style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
                opacity: isDiffStale ? .7 : 1,
                transition: "opacity 150ms ease-out"
            }}>
              {virtualizer.getVirtualItems().map(function (virtualRow) {
                var file = deferredFileDiffs[virtualRow.index];
                var data = deferredDiffViewData[file.key];
                // Skip rendering if data not ready (during deferred update)
                if (!data)
                    return null;
                return <div key={file.key} data-index={virtualRow.index} ref={virtualizer.measureElement} style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: "translateY(".concat(virtualRow.start, "px)")
                    }}>
                    <div class="pb-2">
                      <FileDiffCard file={file} data={data} isLight={isLight} isCollapsed={!!collapsedByFileKey[file.key]} toggleCollapsed={toggleFileCollapsed} isFullExpanded={!!fullExpandedByFileKey[file.key]} toggleFullExpanded={toggleFileFullExpanded} hasContent={!!fileContents[file.key]} isLoadingContent={isLoadingFileContents} diffMode={diffMode} shikiHighlighter={shikiHighlighter} worktreePath={worktreePath} onDiscardFile={handleDiscardFile} isViewed={isFileViewed(file.key, file.diffText)} onToggleViewed={handleToggleViewed} showViewed={!!worktreePath}/>
                    </div>
                  </div>;
            })}
            </div> : <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center h-full">
              No changes detected
            </div>}
        </div>

        {/* Discard confirmation dialog */}
        <alert_dialog_1.AlertDialog open={!!discardFilePath} onOpenChange={function (open) { return !open && setDiscardFilePath(null); }}>
          <alert_dialog_1.AlertDialogContent class="w-[340px]">
            <alert_dialog_1.AlertDialogHeader>
              <alert_dialog_1.AlertDialogTitle>
                Discard changes to "{discardFilePath === null || discardFilePath === void 0 ? void 0 : discardFilePath.split("/").pop()}"?
              </alert_dialog_1.AlertDialogTitle>
            </alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogDescription class="px-5 pb-5">
              This will revert all changes to this file. This action cannot be undone.
            </alert_dialog_1.AlertDialogDescription>
            <alert_dialog_1.AlertDialogFooter>
              <button_1.Button variant="outline" size="sm" onClick={function () { return setDiscardFilePath(null); }}>
                Cancel
              </button_1.Button>
              <button_1.Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
                Discard
              </button_1.Button>
            </alert_dialog_1.AlertDialogFooter>
          </alert_dialog_1.AlertDialogContent>
        </alert_dialog_1.AlertDialog>
      </div>;
});
