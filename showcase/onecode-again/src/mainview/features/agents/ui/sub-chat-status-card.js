"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubChatStatusCard = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var button_1 = require("../../../components/ui/button");
var utils_1 = require("../../../lib/utils");
var trpc_1 = require("../../../lib/trpc");
var use_file_change_listener_1 = require("../../../lib/hooks/use-file-change-listener");
var agents_file_mention_1 = require("../mentions/agents-file-mention");
var atoms_1 = require("../atoms");
// Animated dots component that cycles through ., .., ...
function AnimatedDots() {
    var _a = (0, solid_js_1.createSignal)(1), dotCount = _a[0], setDotCount = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var interval = setInterval(function () {
            setDotCount(function (prev) { return prev % 3 + 1; });
        }, 400);
        return function () { return clearInterval(interval); };
    });
    return <span class="inline-block w-[1em] text-left">{".".repeat(dotCount)}</span>;
}
exports.SubChatStatusCard = memo(function SubChatStatusCard(_a) {
    var chatId = _a.chatId, subChatId = _a.subChatId, isStreaming = _a.isStreaming, isCompacting = _a.isCompacting, changedFiles = _a.changedFiles, worktreePath = _a.worktreePath, onStop = _a.onStop, _b = _a.hasQueueCardAbove, hasQueueCardAbove = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    // Use per-chat atom family instead of legacy global atom
    var diffSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.diffSidebarOpenAtomFamily)(chatId); });
    var _d = (0, jotai_1.useAtom)(diffSidebarAtom), setDiffSidebarOpen = _d[1];
    var setFilteredDiffFiles = (0, jotai_1.useSetAtom)(atoms_1.filteredDiffFilesAtom);
    var setFilteredSubChatId = (0, jotai_1.useSetAtom)(atoms_1.filteredSubChatIdAtom);
    var setFocusedDiffFile = (0, jotai_1.useSetAtom)(atoms_1.agentsFocusedDiffFileAtom);
    // Listen for file changes from Claude Write/Edit tools
    (0, use_file_change_listener_1.useFileChangeListener)(worktreePath);
    // Fetch git status to filter out committed files
    var gitStatus = trpc_1.trpc.changes.getStatus.useQuery({
        worktreePath: worktreePath || "",
        defaultBranch: "main"
    }, {
        enabled: !!worktreePath && changedFiles.length > 0 && !isStreaming,
        staleTime: 3e4,
        placeholderData: function (prev) { return prev; }
    }).data;
    // Filter changedFiles to only include files that are still uncommitted
    var uncommittedFiles = (0, solid_js_1.createMemo)(function () {
        console.log("[StatusCard] Computing uncommittedFiles:", {
            changedFilesCount: changedFiles.length,
            changedFiles: changedFiles.map(function (f) { return f.displayPath; }),
            hasGitStatus: !!gitStatus,
            worktreePath: worktreePath,
            isStreaming: isStreaming
        });
        // If no git status yet, no worktreePath, or still streaming - show all files
        if (!gitStatus || !worktreePath || isStreaming) {
            console.log("[StatusCard] Returning all changedFiles (no filter)");
            return changedFiles;
        }
        // Build set of all uncommitted file paths from git status
        var uncommittedPaths = new Set();
        // Safely iterate - arrays might be undefined in edge cases
        if (gitStatus.staged) {
            for (var _i = 0, _a = gitStatus.staged; _i < _a.length; _i++) {
                var file = _a[_i];
                uncommittedPaths.add(file.path);
            }
        }
        if (gitStatus.unstaged) {
            for (var _b = 0, _c = gitStatus.unstaged; _b < _c.length; _b++) {
                var file = _c[_b];
                uncommittedPaths.add(file.path);
            }
        }
        if (gitStatus.untracked) {
            for (var _d = 0, _e = gitStatus.untracked; _d < _e.length; _d++) {
                var file = _e[_d];
                uncommittedPaths.add(file.path);
            }
        }
        console.log("[StatusCard] Git uncommitted paths:", Array.from(uncommittedPaths));
        // Filter changedFiles to only include files that are still uncommitted
        var filtered = changedFiles.filter(function (file) {
            var hasMatch = uncommittedPaths.has(file.displayPath);
            console.log("[StatusCard] Checking file \"".concat(file.displayPath, "\" -> hasMatch: ").concat(hasMatch));
            return hasMatch;
        });
        console.log("[StatusCard] Filtered result:", filtered.map(function (f) { return f.displayPath; }));
        return filtered;
    });
    // Calculate totals from uncommitted files only
    var totals = (0, solid_js_1.createMemo)(function () {
        var additions = 0;
        var deletions = 0;
        for (var _i = 0, uncommittedFiles_1 = uncommittedFiles; _i < uncommittedFiles_1.length; _i++) {
            var file = uncommittedFiles_1[_i];
            additions += file.additions;
            deletions += file.deletions;
        }
        return {
            additions: additions,
            deletions: deletions,
            fileCount: uncommittedFiles.length
        };
    });
    // Check if there's expandable content (only files now)
    var hasExpandableContent = uncommittedFiles.length > 0;
    // Don't show if no changed files - only show when there are files to review
    if (uncommittedFiles.length === 0) {
        console.log("[StatusCard] Returning null - no uncommitted files");
        return null;
    }
    var handleReview = function () {
        // Set filter to only show files from this sub-chat
        // Use displayPath (relative path) to match git diff paths
        var filePaths = uncommittedFiles.map(function (f) { return f.displayPath; });
        console.log("[SubChatStatusCard] handleReview:", {
            subChatId: subChatId,
            filePaths: filePaths
        });
        setFilteredDiffFiles(filePaths.length > 0 ? filePaths : null);
        // Also set subchat ID filter for ChangesPanel - use the prop, not activeSubChatId from store
        setFilteredSubChatId(subChatId);
        setDiffSidebarOpen(true);
    };
    return <div class={(0, utils_1.cn)("border border-border bg-muted/30 overflow-hidden flex flex-col border-b-0 pb-6", 
        // If queue card above - no top radius
        hasQueueCardAbove ? "rounded-none" : "rounded-t-xl")}>
      {/* Header - at top */}
      <div role="button" tabIndex={0} onClick={function () { return setIsExpanded(!isExpanded); }} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsExpanded(!isExpanded);
            }
        }} aria-expanded={isExpanded} aria-label={"".concat(isExpanded ? "Collapse" : "Expand", " status details")} class="flex items-center justify-between pr-1 pl-3 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none rounded-sm">
        <div class="flex items-center gap-2 text-xs flex-1 min-w-0">
          {/* Expand/Collapse chevron - always show */}
          <lucide_solid_1.ChevronDown class={(0, utils_1.cn)("w-4 h-4 text-muted-foreground transition-transform duration-200", !isExpanded && "-rotate-90")}/>

          {/* Streaming indicator */}
          {isStreaming && <span class="text-xs text-muted-foreground">
              {isCompacting ? "Compacting" : "Generating"}<AnimatedDots />
            </span>}

          {/* File count and stats - only show when not streaming */}
          {!isStreaming && <span class="text-xs text-muted-foreground">
              {totals.fileCount} {totals.fileCount === 1 ? "file" : "files"}
              {(totals.additions > 0 || totals.deletions > 0) && <>
                  {" "}
                  <span class="text-green-600 dark:text-green-400">
                    +{totals.additions}
                  </span>{" "}
                  <span class="text-red-600 dark:text-red-400">
                    -{totals.deletions}
                  </span>
                </>}
            </span>}
        </div>

        {/* Right side: buttons */}
        <div class="flex items-center gap-2 flex-shrink-0">
          {/* Stop button */}
          {isStreaming && onStop && <button_1.Button variant="ghost" size="sm" onClick={function (e) {
                e.stopPropagation();
                onStop();
            }} class="h-6 px-2 text-xs font-normal rounded-md transition-transform duration-150 active:scale-[0.97]">
              Stop
              <span class="text-muted-foreground/60 ml-1">⌃C</span>
            </button_1.Button>}

          {/* Review button */}
          <button_1.Button variant="secondary" size="sm" onClick={function (e) {
            e.stopPropagation();
            handleReview();
        }} class="h-6 px-3 text-xs font-medium rounded-md transition-transform duration-150 active:scale-[0.97]">
            Review
          </button_1.Button>
        </div>
      </div>

      {/* Expanded content - files */}
      <react_1.AnimatePresence initial={false}>
        {isExpanded && hasExpandableContent && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{
                duration: .2,
                ease: [
                    .23,
                    1,
                    .32,
                    1
                ]
            }} class="overflow-hidden">
            <div class="border-t border-border max-h-[200px] overflow-y-auto">
              {uncommittedFiles.map(function (file) {
                var FileIcon = (0, agents_file_mention_1.getFileIconByExtension)(file.displayPath);
                var handleFileClick = function () {
                    // Set filter to only show files from this sub-chat
                    // Use displayPath (relative path) to match git diff paths
                    var filePaths = uncommittedFiles.map(function (f) { return f.displayPath; });
                    setFilteredDiffFiles(filePaths.length > 0 ? filePaths : null);
                    // Set focus on this specific file
                    setFocusedDiffFile(file.displayPath);
                    // Open diff sidebar
                    setDiffSidebarOpen(true);
                };
                var handleKeyDown = function (e) {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleFileClick();
                    }
                };
                return <div key={file.filePath} role="button" tabIndex={0} onClick={handleFileClick} onKeyDown={handleKeyDown} aria-label={"View diff for ".concat(file.displayPath)} class="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none rounded-sm">
                    {FileIcon && <FileIcon class="w-4 h-4 flex-shrink-0 text-muted-foreground"/>}
                    <span class="truncate flex-1 text-foreground">
                      {file.displayPath}
                    </span>
                    <span class="flex-shrink-0 text-green-600 dark:text-green-400">
                      +{file.additions}
                    </span>
                    <span class="flex-shrink-0 text-red-600 dark:text-red-400">
                      -{file.deletions}
                    </span>
                  </div>;
            })}
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
});
