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
exports.AgentEditTool = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var use_code_theme_1 = require("../../../lib/hooks/use-code-theme");
var shiki_theme_loader_1 = require("../../../lib/themes/shiki-theme-loader");
var icons_1 = require("../../../components/ui/icons");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var tooltip_1 = require("../../../components/ui/tooltip");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_interrupted_1 = require("./agent-tool-interrupted");
var agent_tool_utils_1 = require("./agent-tool-utils");
var agents_file_mention_1 = require("../mentions/agents-file-mention");
var atoms_1 = require("../atoms");
var utils_1 = require("../../../lib/utils");
// Removed local highlighter - using centralized loader from lib/themes/shiki-theme-loader
// Get language from filename
function getLanguageFromFilename(filename) {
    var _a;
    var ext = ((_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    var langMap = {
        ts: "typescript",
        tsx: "tsx",
        js: "javascript",
        jsx: "jsx",
        py: "python",
        go: "go",
        rs: "rust",
        html: "html",
        css: "css",
        json: "json",
        md: "markdown",
        sh: "bash",
        bash: "bash"
    };
    return langMap[ext] || "plaintext";
}
// Calculate diff stats from structuredPatch
function calculateDiffStatsFromPatch(patches) {
    if (!patches || patches.length === 0)
        return null;
    var addedLines = 0;
    var removedLines = 0;
    for (var _i = 0, patches_1 = patches; _i < patches_1.length; _i++) {
        var patch = patches_1[_i];
        // Skip patches without lines array
        if (!patch.lines)
            continue;
        for (var _a = 0, _b = patch.lines; _a < _b.length; _a++) {
            var line = _b[_a];
            if (line.startsWith("+"))
                addedLines++;
            else if (line.startsWith("-"))
                removedLines++;
        }
    }
    return {
        addedLines: addedLines,
        removedLines: removedLines
    };
}
// Get all diff lines from structuredPatch
function getDiffLines(patches) {
    var result = [];
    if (!patches)
        return result;
    for (var _i = 0, patches_2 = patches; _i < patches_2.length; _i++) {
        var patch = patches_2[_i];
        for (var _a = 0, _b = patch.lines; _a < _b.length; _a++) {
            var line = _b[_a];
            if (line.startsWith("+")) {
                result.push({
                    type: "added",
                    content: line.slice(1)
                });
            }
            else if (line.startsWith("-")) {
                result.push({
                    type: "removed",
                    content: line.slice(1)
                });
            }
            else if (line.startsWith(" ")) {
                result.push({
                    type: "context",
                    content: line.slice(1)
                });
            }
        }
    }
    return result;
}
// Hook to batch-highlight all diff lines at once
// During streaming, skip highlighting entirely to maximize FPS
function useBatchHighlight(lines, language, themeId, isStreaming) {
    var _this = this;
    if (isStreaming === void 0) { isStreaming = false; }
    var _a = (0, solid_js_1.createSignal)(function () { return new Map(); }), highlightedMap = _a[0], setHighlightedMap = _a[1];
    // Create stable key from lines content to detect changes
    // Only compute when NOT streaming to avoid expensive join during animation
    var linesKey = (0, solid_js_1.createMemo)(function () { return isStreaming ? "" : lines.map(function (l) { return l.content; }).join("\n"); });
    (0, solid_js_1.createEffect)(function () {
        // Skip highlighting during streaming - show plain text for better FPS
        if (isStreaming) {
            return;
        }
        if (lines.length === 0) {
            setHighlightedMap(new Map());
            return;
        }
        var cancelled = false;
        var highlightAll = function () { return __awaiter(_this, void 0, void 0, function () {
            var results, i, content, highlighted, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        results = new Map();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < lines.length)) return [3 /*break*/, 4];
                        // Check if cancelled between iterations to allow early exit
                        if (cancelled)
                            return [2 /*return*/];
                        content = lines[i].content || " ";
                        return [4 /*yield*/, (0, shiki_theme_loader_1.highlightCode)(content, language, themeId)];
                    case 2:
                        highlighted = _a.sent();
                        results.set(i, highlighted);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!cancelled) {
                            setHighlightedMap(results);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("Failed to highlight code:", error_1);
                        // On error, leave map empty (fallback to plain text)
                        if (!cancelled) {
                            setHighlightedMap(new Map());
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        // Debounce highlighting after streaming completes
        var timer = setTimeout(highlightAll, 50);
        return function () {
            cancelled = true;
            clearTimeout(timer);
        };
    });
    return highlightedMap;
}
// Memoized component for rendering a single diff line
// Uses custom comparator to compare line content instead of object reference
var DiffLineRow = memo(function DiffLineRow(_a) {
    var line = _a.line, highlightedHtml = _a.highlightedHtml;
    return <div class={(0, utils_1.cn)("px-2.5 py-0.5", line.type === "removed" && "bg-red-500/10 dark:bg-red-500/15 border-l-2 border-red-500/50", line.type === "added" && "bg-green-500/10 dark:bg-green-500/15 border-l-2 border-green-500/50", line.type === "context" && "border-l-2 border-transparent")}>
        {highlightedHtml ? <span class="whitespace-pre-wrap break-all [&_.shiki]:bg-transparent [&_pre]:bg-transparent [&_code]:bg-transparent" dangerouslySetInnerHTML={{ __html: highlightedHtml }}/> : <span class={(0, utils_1.cn)("whitespace-pre-wrap break-all", line.type === "removed" && "text-red-700 dark:text-red-300", line.type === "added" && "text-green-700 dark:text-green-300", line.type === "context" && "text-muted-foreground")}>
            {line.content || " "}
          </span>}
      </div>;
}, 
// Custom comparator: compare line content and type, not object reference
function (prevProps, nextProps) { return prevProps.line.type === nextProps.line.type && prevProps.line.content === nextProps.line.content && prevProps.highlightedHtml === nextProps.highlightedHtml; });
exports.AgentEditTool = memo(function AgentEditTool(_a) {
    var _b, _c, _d, _e, _f;
    var part = _a.part, messageId = _a.messageId, partIndex = _a.partIndex, chatStatus = _a.chatStatus;
    var _g = (0, solid_js_1.createSignal)(false), isOutputExpanded = _g[0], setIsOutputExpanded = _g[1];
    var _h = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus), isPending = _h.isPending, isInterrupted = _h.isInterrupted;
    var codeTheme = (0, use_code_theme_1.useCodeTheme)();
    // Atoms for opening diff sidebar and focusing on file
    var setDiffSidebarOpen = (0, jotai_1.useSetAtom)(atoms_1.agentsDiffSidebarOpenAtom);
    var setFocusedDiffFile = (0, jotai_1.useSetAtom)(atoms_1.agentsFocusedDiffFileAtom);
    // Determine tool type
    var isWriteMode = part.type === "tool-Write";
    var toolPrefix = isWriteMode ? "tool-Write" : "tool-Edit";
    // Only consider streaming if chat is actively streaming (prevents spinner hang on stop)
    // Include "submitted" status - this is when request was sent but streaming hasn't started yet
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isInputStreaming = part.state === "input-streaming" && isActivelyStreaming;
    var filePath = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.file_path) || "";
    var oldString = ((_c = part.input) === null || _c === void 0 ? void 0 : _c.old_string) || "";
    var newString = ((_d = part.input) === null || _d === void 0 ? void 0 : _d.new_string) || "";
    // For Write mode, content is in input.content
    var writeContent = ((_e = part.input) === null || _e === void 0 ? void 0 : _e.content) || "";
    // Get structuredPatch from output (only available when complete)
    var structuredPatch = (_f = part.output) === null || _f === void 0 ? void 0 : _f.structuredPatch;
    // Extract filename from path
    var filename = filePath ? filePath.split("/").pop() || "file" : "";
    // Get clean display path (remove sandbox prefix to show project-relative path)
    var displayPath = (0, solid_js_1.createMemo)(function () {
        if (!filePath)
            return "";
        // Remove common sandbox prefixes
        var prefixes = [
            "/project/sandbox/repo/",
            "/project/sandbox/",
            "/project/",
            "/workspace/"
        ];
        for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
            var prefix = prefixes_1[_i];
            if (filePath.startsWith(prefix)) {
                return filePath.slice(prefix.length);
            }
        }
        // Handle worktree paths: /Users/.../.21st/worktrees/{chatId}/{subChatId}/relativePath
        var worktreeMatch = filePath.match(/\.21st\/worktrees\/[^/]+\/[^/]+\/(.+)$/);
        if (worktreeMatch) {
            return worktreeMatch[1];
        }
        // If path starts with /, try to find a reasonable root
        if (filePath.startsWith("/")) {
            // Look for common project roots
            var parts = filePath.split("/");
            var rootIndicators_1 = [
                "apps",
                "packages",
                "src",
                "lib",
                "components"
            ];
            var rootIndex = parts.findIndex(function (p) { return rootIndicators_1.includes(p); });
            if (rootIndex > 0) {
                return parts.slice(rootIndex).join("/");
            }
        }
        return filePath;
    });
    // Handler to open diff sidebar and focus on this file
    var handleOpenInDiff = function () {
        if (!displayPath)
            return;
        setDiffSidebarOpen(true);
        setFocusedDiffFile(displayPath);
    };
    // Memoized click handlers to prevent inline function re-creation
    var handleHeaderClick = function () {
        if (!isPending && !isInputStreaming) {
            setIsOutputExpanded(function (prev) { return !prev; });
        }
    };
    var handleFilenameClick = function (e) {
        if (displayPath) {
            e.stopPropagation();
            handleOpenInDiff();
        }
    };
    var handleExpandButtonClick = function (e) {
        e.stopPropagation();
        setIsOutputExpanded(function (prev) { return !prev; });
    };
    var handleContentClick = function () {
        if (!isOutputExpanded && !isPending && !isInputStreaming) {
            setIsOutputExpanded(true);
        }
    };
    // Get file icon component and language
    // Pass true to not show default icon for unknown file types
    var FileIcon = filename ? (0, agents_file_mention_1.getFileIconByExtension)(filename, true) : null;
    var language = filename ? getLanguageFromFilename(filename) : "plaintext";
    // Calculate diff stats - prefer from patch, fallback to simple count
    // For Write mode, count all lines as added
    // For Edit mode without structuredPatch, count new_string lines as preview
    var diffStats = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (isWriteMode) {
            var content = writeContent || ((_a = part.output) === null || _a === void 0 ? void 0 : _a.content) || "";
            var addedLines = content ? content.split("\n").length : 0;
            return {
                addedLines: addedLines,
                removedLines: 0
            };
        }
        if (structuredPatch) {
            return calculateDiffStatsFromPatch(structuredPatch);
        }
        // Fallback: count new_string lines as preview (for input-available state)
        if (newString) {
            return {
                addedLines: newString.split("\n").length,
                removedLines: 0
            };
        }
        return null;
    });
    // Get diff lines for display (memoized)
    // For Write mode, treat all lines as added
    // For Edit mode without structuredPatch, show new_string as preview
    var diffLines = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (isWriteMode) {
            var content = writeContent || ((_a = part.output) === null || _a === void 0 ? void 0 : _a.content) || "";
            if (!content)
                return [];
            return content.split("\n").map(function (line) { return ({
                type: "added",
                content: line
            }); });
        }
        // If we have structuredPatch, use it for proper diff display
        if (structuredPatch) {
            return getDiffLines(structuredPatch);
        }
        // Fallback: show new_string as preview (for input-available state before execution)
        if (newString) {
            return newString.split("\n").map(function (line) { return ({
                type: "added",
                content: line
            }); });
        }
        return [];
    });
    // For streaming state, get content being streamed
    var streamingContent = (0, solid_js_1.createMemo)(function () {
        if (!isInputStreaming)
            return null;
        if (isWriteMode) {
            return writeContent;
        }
        return newString;
    });
    // Throttle streaming content updates for better FPS
    // Only update the displayed content every 100ms during streaming
    var _j = (0, solid_js_1.createSignal)(null), throttledStreamingContent = _j[0], setThrottledStreamingContent = _j[1];
    var _k = (0, solid_js_1.createSignal)(0), lastStreamingUpdateRef = _k[0], setLastStreamingUpdateRef = _k[1];
    (0, solid_js_1.createEffect)(function () {
        if (!isInputStreaming) {
            setThrottledStreamingContent(null);
            return;
        }
        var now = Date.now();
        var timeSinceLastUpdate = now - lastStreamingUpdateRef.current;
        // Throttle to ~10 updates per second (100ms intervals)
        if (timeSinceLastUpdate >= 100) {
            lastStreamingUpdateRef.current = now;
            setThrottledStreamingContent(streamingContent);
        }
        else {
            // Schedule update for remaining time
            var timer_1 = setTimeout(function () {
                lastStreamingUpdateRef.current = Date.now();
                setThrottledStreamingContent(streamingContent);
            }, 100 - timeSinceLastUpdate);
            return function () { return clearTimeout(timer_1); };
        }
    });
    // Convert streaming content to diff lines
    // Up to 3 lines: show from top; more than 3 lines: show last N lines for autoscroll effect
    var _l = (0, solid_js_1.createMemo)(function () {
        var content = throttledStreamingContent;
        if (!content)
            return {
                streamingLines: [],
                shouldAlignBottom: false
            };
        var lines = content.split("\n");
        var totalLines = lines.length;
        // If 3 or fewer lines, show all from top
        // If more than 3, show last 15 lines for autoscroll effect
        var displayedLines = totalLines <= 3 ? lines : lines.slice(-15);
        return {
            streamingLines: displayedLines.map(function (line) { return ({
                type: "added",
                content: line
            }); }),
            shouldAlignBottom: totalLines > 3
        };
    }), streamingLines = _l.streamingLines, shouldAlignBottom = _l.shouldAlignBottom;
    // Use streaming lines when streaming, otherwise use diff lines
    // IMPORTANT: Must be memoized to prevent infinite render loop!
    // Without useMemo, activeLines gets a new reference on every render, which triggers
    // firstChangeIndex -> displayLines -> useBatchHighlight -> setHighlightedMap -> re-render
    var activeLines = (0, solid_js_1.createMemo)(function () { return isInputStreaming && streamingLines.length > 0 ? streamingLines : diffLines; });
    // Find index of first change line (added or removed) to focus on when collapsed
    // Prioritize added lines, but fall back to removed lines if no additions exist
    var firstChangeIndex = (0, solid_js_1.createMemo)(function () {
        var firstAdded = activeLines.findIndex(function (line) { return line.type === "added"; });
        if (firstAdded !== -1)
            return firstAdded;
        // No additions - look for first removal instead
        return activeLines.findIndex(function (line) { return line.type === "removed"; });
    });
    // Reorder lines for collapsed view: show from first change line (memoized)
    var displayLines = (0, solid_js_1.createMemo)(function () { return !isOutputExpanded && firstChangeIndex > 0 ? __spreadArray(__spreadArray([], activeLines.slice(firstChangeIndex), true), activeLines.slice(0, firstChangeIndex), true) : activeLines; });
    // Batch highlight all lines at once (instead of N×useEffect)
    // Pass isInputStreaming to use longer debounce during streaming for better FPS
    var highlightedMap = useBatchHighlight(displayLines, language, codeTheme, isInputStreaming);
    // Check if we have VISIBLE content to show
    // For streaming, only show content area if we have some content to display
    // Use throttled content check during streaming for consistent render behavior
    var hasVisibleContent = displayLines.length > 0 || isInputStreaming && (throttledStreamingContent || newString || writeContent);
    // Header title based on mode and state (used only in minimal view)
    var headerAction = (0, solid_js_1.createMemo)(function () {
        if (isWriteMode) {
            return isInputStreaming ? "Creating" : "Created";
        }
        return isInputStreaming ? "Editing" : "Edited";
    });
    // Show minimal view (no background/border) until we have the full file path
    // This prevents showing a large empty component while path is being streamed
    if (!filePath) {
        // If interrupted without file path, show interrupted state
        if (isInterrupted) {
            return <agent_tool_interrupted_1.AgentToolInterrupted toolName={isWriteMode ? "Write" : "Edit"}/>;
        }
        return <div class="flex items-center gap-1.5 px-2 py-0.5">
        <span class="text-xs text-muted-foreground">
          {isPending ? <text_shimmer_1.TextShimmer as="span" duration={1.2}>
              {headerAction}
            </text_shimmer_1.TextShimmer> : headerAction}
        </span>
      </div>;
    }
    return <div data-message-id={messageId} data-part-index={partIndex} data-part-type={toolPrefix} data-tool-file-path={displayPath} class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - clickable to expand, fixed height to prevent layout shift */}
      <div onClick={hasVisibleContent ? handleHeaderClick : undefined} class={(0, utils_1.cn)("flex items-center justify-between pl-2.5 pr-0.5 h-7", hasVisibleContent && !isPending && !isInputStreaming && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div onClick={handleFilenameClick} class={(0, utils_1.cn)("flex items-center gap-1.5 text-xs truncate flex-1 min-w-0", displayPath && "cursor-pointer hover:text-foreground")}>
          {FileIcon && <FileIcon class="w-2.5 h-2.5 flex-shrink-0 text-muted-foreground"/>}
          {/* Filename with shimmer during progress */}
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              {isPending || isInputStreaming ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="truncate">
                  {filename}
                </text_shimmer_1.TextShimmer> : <span class="truncate text-foreground">{filename}</span>}
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="top" class="px-2 py-1.5 max-w-none flex items-center justify-center">
              <span class="font-mono text-[10px] text-muted-foreground whitespace-nowrap leading-none">
                {displayPath}
              </span>
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>

        {/* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Diff stats or spinner */}
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isPending || isInputStreaming ? <icons_1.IconSpinner class="w-3 h-3"/> : diffStats ? <>
                <span class="text-green-600 dark:text-green-400">
                  +{diffStats.addedLines}
                </span>
                {diffStats.removedLines > 0 && <span class="text-red-600 dark:text-red-400">
                    -{diffStats.removedLines}
                  </span>}
              </> : null}
          </div>

          {/* Expand/Collapse button - show when has visible content and not streaming */}
          {/* Always render container for consistent spacing */}
          <div class="w-6 h-6 flex items-center justify-center">
            {hasVisibleContent && !isPending && !isInputStreaming && <button onClick={handleExpandButtonClick} class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95">
                <div class="relative w-4 h-4">
                  <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isOutputExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
                  <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isOutputExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
                </div>
              </button>}
          </div>
        </div>
      </div>

      {/* Content - git-style diff with syntax highlighting */}
      {hasVisibleContent && <div onClick={handleContentClick} class={(0, utils_1.cn)("border-t border-border transition-colors duration-150 font-mono text-xs", isOutputExpanded ? "max-h-[200px] overflow-y-auto" : "h-[72px] overflow-hidden", !isOutputExpanded && !isPending && !isInputStreaming && "cursor-pointer hover:bg-muted/50", 
            // When streaming with > 3 lines, use flex to push content to bottom
            isInputStreaming && shouldAlignBottom && "flex flex-col justify-end")}>
          {/* Display lines - either streaming content or completed diff */}
          {displayLines.length > 0 ? <div class={(0, utils_1.cn)(isInputStreaming && shouldAlignBottom && "flex-shrink-0")}>
              {displayLines.map(function (line, idx) { return <DiffLineRow key={"".concat(line.type, "-").concat(idx)} line={line} highlightedHtml={highlightedMap.get(idx)}/>; })}
            </div> : throttledStreamingContent || newString ? <div class={(0, utils_1.cn)("px-2.5 py-1.5 text-green-700 dark:text-green-300 whitespace-pre-wrap break-all", isInputStreaming && shouldAlignBottom && "flex-shrink-0")}>
              {isInputStreaming && !isOutputExpanded ? (throttledStreamingContent || newString).slice(-500) : throttledStreamingContent || newString}
            </div> : null}
        </div>}
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
