"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangesView = ChangesView;
var checkbox_1 = require("../../components/ui/checkbox");
var button_1 = require("../../components/ui/button");
var context_menu_1 = require("../../components/ui/context-menu");
var alert_dialog_1 = require("../../components/ui/alert-dialog");
var tabs_1 = require("../../components/ui/tabs");
var solid_sonner_1 = require("solid-sonner");
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var trpc_1 = require("../../lib/trpc");
var changes_store_1 = require("../../lib/stores/changes-store");
var usePRStatus_1 = require("../../hooks/usePRStatus");
var use_file_change_listener_1 = require("../../lib/hooks/use-file-change-listener");
var utils_1 = require("../../lib/utils");
var changes_file_filter_1 = require("./components/changes-file-filter");
var commit_input_1 = require("./components/commit-input");
var history_view_1 = require("./components/history-view");
var status_1 = require("./utils/status");
var lucide_solid_1 = require("lucide-solid");
var atoms_1 = require("../agents/atoms");
var kbd_1 = require("../../components/ui/kbd");
// Memoized file item component with context menu to prevent re-renders
var ChangesFileItemWithContext = memo(function ChangesFileItemWithContext(_a) {
    var file = _a.file, category = _a.category, isSelected = _a.isSelected, isChecked = _a.isChecked, isViewed = _a.isViewed, isHighlighted = _a.isHighlighted, highlightedCount = _a.highlightedCount, highlightedPaths = _a.highlightedPaths, index = _a.index, onSelect = _a.onSelect, onDoubleClick = _a.onDoubleClick, onCheckboxChange = _a.onCheckboxChange, onShiftClick = _a.onShiftClick, onCopyPath = _a.onCopyPath, onCopyRelativePath = _a.onCopyRelativePath, onRevealInFinder = _a.onRevealInFinder, onToggleViewed = _a.onToggleViewed, onDiscard = _a.onDiscard, onDiscardSelected = _a.onDiscardSelected, onIncludeSelected = _a.onIncludeSelected, onExcludeSelected = _a.onExcludeSelected, onCopySelectedPaths = _a.onCopySelectedPaths, onCopySelectedRelativePaths = _a.onCopySelectedRelativePaths;
    var fileName = file.path.split("/").pop() || file.path;
    var dirPath = file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";
    var isUntracked = file.status === "untracked" || file.status === "added";
    // Show multi-discard when multiple files are highlighted (shift+click selected)
    var showMultiDiscard = highlightedCount > 1 && isHighlighted;
    return <context_menu_1.ContextMenu>
			<context_menu_1.ContextMenuTrigger asChild>
				<div data-file-item class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1 cursor-pointer", "hover:bg-muted/80 transition-colors", isSelected && !isHighlighted && "bg-muted", isHighlighted && "bg-primary/10 hover:bg-primary/15")} onClick={function (e) {
            if (e.shiftKey) {
                e.preventDefault();
                onShiftClick(index);
            }
            else {
                onSelect();
            }
        }} onDoubleClick={onDoubleClick}>
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
						{(0, status_1.getStatusIndicator)(file.status)}
					</div>
				</div>
			</context_menu_1.ContextMenuTrigger>
			<context_menu_1.ContextMenuContent class="w-64">
				{showMultiDiscard ? <>
						{/* Multi-select context menu */}
						<context_menu_1.ContextMenuItem onClick={onDiscardSelected} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
							Discard {highlightedCount} Selected Changes...
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuSeparator />
						<context_menu_1.ContextMenuItem onClick={onIncludeSelected}>
							Include Selected Files
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuItem onClick={onExcludeSelected}>
							Exclude Selected Files
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuSeparator />
						<context_menu_1.ContextMenuItem onClick={onCopySelectedPaths}>
							Copy Paths
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuItem onClick={onCopySelectedRelativePaths}>
							Copy Relative Paths
						</context_menu_1.ContextMenuItem>
					</> : <>
						{/* Single file context menu */}
						<context_menu_1.ContextMenuItem onClick={onCopyPath}>
							Copy Path
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuItem onClick={onCopyRelativePath}>
							Copy Relative Path
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuSeparator />
						<context_menu_1.ContextMenuItem onClick={onRevealInFinder}>
							Reveal in Finder
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuSeparator />
						<context_menu_1.ContextMenuItem onClick={onToggleViewed} class="justify-between">
							{isViewed ? "Mark as unviewed" : "Mark as viewed"}
							<kbd_1.Kbd>V</kbd_1.Kbd>
						</context_menu_1.ContextMenuItem>
						<context_menu_1.ContextMenuSeparator />
						<context_menu_1.ContextMenuItem onClick={onDiscard} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
							{isUntracked ? "Delete File..." : "Discard Changes..."}
						</context_menu_1.ContextMenuItem>
					</>}
			</context_menu_1.ContextMenuContent>
		</context_menu_1.ContextMenu>;
});
function ChangesView(_a) {
    var _b, _c;
    var worktreePath = _a.worktreePath, selectedFilePath = _a.selectedFilePath, onFileSelectProp = _a.onFileSelect, onFileOpenPinned = _a.onFileOpenPinned, onCreatePr = _a.onCreatePr, onCommitSuccess = _a.onCommitSuccess, _d = _a.subChats, subChats = _d === void 0 ? [] : _d, _e = _a.initialSubChatFilter, initialSubChatFilter = _e === void 0 ? null : _e, chatId = _a.chatId, selectedCommitHash = _a.selectedCommitHash, onCommitSelect = _a.onCommitSelect, onCommitFileSelect = _a.onCommitFileSelect, onActiveTabChange = _a.onActiveTabChange, pushCount = _a.pushCount;
    (0, use_file_change_listener_1.useFileChangeListener)(worktreePath);
    // Viewed files state from agents diff view (for showing eye icon and toggling)
    var _f = (0, jotai_1.useAtom)((0, atoms_1.viewedFilesAtomFamily)(chatId || "")), viewedFiles = _f[0], setViewedFiles = _f[1];
    var baseBranch = (0, changes_store_1.useChangesStore)().baseBranch;
    var branchData = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath || "" }, { enabled: !!worktreePath }).data;
    var effectiveBaseBranch = (_b = baseBranch !== null && baseBranch !== void 0 ? baseBranch : branchData === null || branchData === void 0 ? void 0 : branchData.defaultBranch) !== null && _b !== void 0 ? _b : "main";
    var _g = trpc_1.trpc.changes.getStatus.useQuery({
        worktreePath: worktreePath || "",
        defaultBranch: effectiveBaseBranch
    }, {
        enabled: !!worktreePath,
        refetchOnWindowFocus: true
    }), status = _g.data, isLoading = _g.isLoading, refetch = _g.refetch;
    var _h = (0, usePRStatus_1.usePRStatus)({
        worktreePath: worktreePath,
        refetchInterval: 1e4
    }), pr = _h.pr, refetchPRStatus = _h.refetch;
    var handleRefresh = function () {
        refetch();
        refetchPRStatus();
    };
    // Handle successful commit - reset local state and notify parent
    var handleCommitSuccess = function () {
        // Reset selection state so new files will be auto-selected
        setHasInitializedSelection(false);
        setSelectedForCommit(new Set());
        // Notify parent to reset diff view selection
        onCommitSuccess === null || onCommitSuccess === void 0 ? void 0 : onCommitSuccess();
    };
    // External actions
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    var openInEditorMutation = trpc_1.trpc.external.openFileInEditor.useMutation();
    // Discard changes - single file
    var discardChangesMutation = trpc_1.trpc.changes.discardChanges.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Changes discarded");
            refetch();
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Failed to discard changes: ".concat(error.message));
        }
    });
    var deleteUntrackedMutation = trpc_1.trpc.changes.deleteUntracked.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("File deleted");
            refetch();
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Failed to delete file: ".concat(error.message));
        }
    });
    // Discard changes - multiple files (batch)
    var discardMultipleChangesMutation = trpc_1.trpc.changes.discardMultipleChanges.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Changes discarded");
            refetch();
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Failed to discard changes: ".concat(error.message));
        }
    });
    var deleteMultipleUntrackedMutation = trpc_1.trpc.changes.deleteMultipleUntracked.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Files deleted");
            refetch();
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Failed to delete files: ".concat(error.message));
        }
    });
    // Discard confirmation dialog state - single file
    var _j = (0, solid_js_1.createSignal)(null), discardFile = _j[0], setDiscardFile = _j[1];
    // Discard confirmation dialog state - multiple files
    var _k = (0, solid_js_1.createSignal)(null), discardFiles = _k[0], setDiscardFiles = _k[1];
    var _l = (0, changes_store_1.useChangesStore)(), selectFile = _l.selectFile, getSelectedFile = _l.getSelectedFile;
    var selectedFileState = getSelectedFile(worktreePath || "");
    var selectedFile = selectedFilePath !== undefined ? selectedFilePath ? { path: selectedFilePath } : null : (_c = selectedFileState === null || selectedFileState === void 0 ? void 0 : selectedFileState.file) !== null && _c !== void 0 ? _c : null;
    var _m = (0, solid_js_1.createSignal)(""), fileFilter = _m[0], setFileFilter = _m[1];
    var _o = (0, solid_js_1.createSignal)(initialSubChatFilter), subChatFilter = _o[0], setSubChatFilter = _o[1];
    var _p = (0, solid_js_1.createSignal)("changes"), activeTab = _p[0], setActiveTab = _p[1];
    var _q = (0, solid_js_1.createSignal)(null), fileListRef = _q[0], setFileListRef = _q[1];
    // Update subchat filter when initialSubChatFilter changes (e.g., from Review button)
    (0, solid_js_1.createEffect)(function () {
        setSubChatFilter(initialSubChatFilter);
    });
    // Local selection state - tracks which files are selected for commit (checkboxes)
    var _r = (0, solid_js_1.createSignal)(new Set()), selectedForCommit = _r[0], setSelectedForCommit = _r[1];
    var _s = (0, solid_js_1.createSignal)(false), hasInitializedSelection = _s[0], setHasInitializedSelection = _s[1];
    // Highlighted files state - for multi-select operations like discard (Shift+Click)
    // This is separate from selectedForCommit (checkboxes)
    // Anchor for Shift+Click is the currently selected file (selectedFile) - the one showing in diff view
    var _t = (0, solid_js_1.createSignal)(new Set()), highlightedFiles = _t[0], setHighlightedFiles = _t[1];
    // Reset filters when worktreePath changes, but preserve initialSubChatFilter
    (0, solid_js_1.createEffect)(function () {
        setFileFilter("");
        // Don't reset subChatFilter to null - use initialSubChatFilter instead
        // This preserves the filter when component remounts (e.g., when diff sidebar opens)
        setSubChatFilter(initialSubChatFilter);
        setHasInitializedSelection(false);
        setSelectedForCommit(new Set());
        setHighlightedFiles(new Set());
    });
    // Combine all files into a flat list
    var allFiles = (0, solid_js_1.createMemo)(function () {
        if (!status)
            return [];
        var files = [];
        // Staged files
        for (var _i = 0, _a = status.staged; _i < _a.length; _i++) {
            var file = _a[_i];
            files.push({
                file: file,
                category: "staged"
            });
        }
        // Unstaged files
        for (var _b = 0, _c = status.unstaged; _b < _c.length; _b++) {
            var file = _c[_b];
            files.push({
                file: file,
                category: "unstaged"
            });
        }
        // Untracked files
        for (var _d = 0, _e = status.untracked; _d < _e.length; _d++) {
            var file = _e[_d];
            files.push({
                file: file,
                category: "unstaged"
            });
        }
        // Sort by full path alphabetically
        files.sort(function (a, b) { return a.file.path.localeCompare(b.file.path); });
        return files;
    });
    // Initialize selection - select all files by default when data loads
    (0, solid_js_1.createEffect)(function () {
        if (!hasInitializedSelection && allFiles.length > 0) {
            var allPaths = new Set(allFiles.map(function (f) { return f.file.path; }));
            setSelectedForCommit(allPaths);
            setHasInitializedSelection(true);
        }
    });
    // Get file paths for selected subchat filter
    var subChatFilterPaths = (0, solid_js_1.createMemo)(function () {
        if (!subChatFilter)
            return null;
        var subChat = subChats.find(function (sc) { return sc.id === subChatFilter; });
        return (subChat === null || subChat === void 0 ? void 0 : subChat.filePaths) || null;
    });
    // Apply filters (text filter + subchat filter)
    var filteredFiles = (0, solid_js_1.createMemo)(function () {
        var result = allFiles;
        // Apply subchat filter first
        if (subChatFilterPaths) {
            result = result.filter(function (_a) {
                var file = _a.file;
                return subChatFilterPaths.some(function (filterPath) { return file.path === filterPath || file.path.endsWith(filterPath) || filterPath.endsWith(file.path); });
            });
        }
        // Then apply text filter
        if (fileFilter.trim()) {
            result = result.filter(function (_a) {
                var file = _a.file;
                return file.path.toLowerCase().includes(fileFilter.toLowerCase());
            });
        }
        return result;
    });
    var filteredCount = filteredFiles.length;
    var totalCount = allFiles.length;
    // Counts for commit selection (checkboxes)
    var selectedCount = filteredFiles.filter(function (f) { return selectedForCommit.has(f.file.path); }).length;
    var allSelected = filteredCount > 0 && selectedCount === filteredCount;
    var someSelected = selectedCount > 0 && selectedCount < filteredCount;
    // Count for highlighted files (shift+click selection for discard)
    var highlightedCount = highlightedFiles.size;
    // Handle file click - selects file for diff view and clears highlighting
    var handleFileSelect = function (file, category) {
        if (!worktreePath)
            return;
        selectFile(worktreePath, file, category, null);
        onFileSelectProp === null || onFileSelectProp === void 0 ? void 0 : onFileSelectProp(file, category);
        // Clear multi-select highlighting on regular click
        setHighlightedFiles(new Set());
    };
    var handleFileDoubleClick = function (file, category) {
        if (!worktreePath)
            return;
        selectFile(worktreePath, file, category, null);
        onFileOpenPinned === null || onFileOpenPinned === void 0 ? void 0 : onFileOpenPinned(file, category);
    };
    // Toggle individual file for commit (checkbox) - doesn't affect highlighting
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
    // Shift+Click range selection handler for highlighting (multi-select for discard)
    // Uses the currently selected file (the one showing in diff view) as anchor
    var handleShiftClick = function (clickedIndex) {
        // Find anchor index from currently selected file (the one showing diff)
        var anchorIndex = selectedFile ? filteredFiles.findIndex(function (f) { return f.file.path === selectedFile.path; }) : -1;
        if (anchorIndex === -1) {
            // No anchor - just highlight this one file
            var file = filteredFiles[clickedIndex];
            if (file) {
                setHighlightedFiles(new Set([file.file.path]));
            }
            return;
        }
        // Highlight range from anchor to clicked (inclusive)
        var startIndex = Math.min(anchorIndex, clickedIndex);
        var endIndex = Math.max(anchorIndex, clickedIndex);
        var newHighlighted = new Set();
        for (var i = startIndex; i <= endIndex; i++) {
            var file = filteredFiles[i];
            if (file) {
                newHighlighted.add(file.file.path);
            }
        }
        setHighlightedFiles(newHighlighted);
    };
    // Get highlighted file paths as array (for context menu actions)
    var highlightedPaths = (0, solid_js_1.createMemo)(function () {
        return filteredFiles.filter(function (f) { return highlightedFiles.has(f.file.path); }).map(function (f) { return f.file.path; });
    });
    // Include highlighted files in commit (check their checkboxes)
    var handleIncludeSelected = function () {
        setSelectedForCommit(function (prev) {
            var next = new Set(prev);
            for (var _i = 0, highlightedFiles_1 = highlightedFiles; _i < highlightedFiles_1.length; _i++) {
                var path = highlightedFiles_1[_i];
                next.add(path);
            }
            return next;
        });
    };
    // Exclude highlighted files from commit (uncheck their checkboxes)
    var handleExcludeSelected = function () {
        setSelectedForCommit(function (prev) {
            var next = new Set(prev);
            for (var _i = 0, highlightedFiles_2 = highlightedFiles; _i < highlightedFiles_2.length; _i++) {
                var path = highlightedFiles_2[_i];
                next.delete(path);
            }
            return next;
        });
    };
    // Copy paths of highlighted files
    var handleCopySelectedPaths = function (worktreePath) {
        var paths = highlightedPaths.map(function (p) { return "".concat(worktreePath, "/").concat(p); });
        navigator.clipboard.writeText(paths.join("\n"));
        solid_sonner_1.toast.success("Copied ".concat(paths.length, " paths"));
    };
    // Copy relative paths of highlighted files
    var handleCopySelectedRelativePaths = function () {
        navigator.clipboard.writeText(highlightedPaths.join("\n"));
        solid_sonner_1.toast.success("Copied ".concat(highlightedPaths.length, " paths"));
    };
    // Toggle all files selection
    var handleSelectAllChange = function () {
        if (allSelected) {
            // Deselect all filtered files
            setSelectedForCommit(function (prev) {
                var next = new Set(prev);
                for (var _i = 0, filteredFiles_1 = filteredFiles; _i < filteredFiles_1.length; _i++) {
                    var file = filteredFiles_1[_i].file;
                    next.delete(file.path);
                }
                return next;
            });
        }
        else {
            // Select all filtered files
            setSelectedForCommit(function (prev) {
                var next = new Set(prev);
                for (var _i = 0, filteredFiles_2 = filteredFiles; _i < filteredFiles_2.length; _i++) {
                    var file = filteredFiles_2[_i].file;
                    next.add(file.path);
                }
                return next;
            });
        }
    };
    // Keyboard navigation handler for arrow up/down
    var handleKeyDown = function (e) {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown")
            return;
        e.preventDefault();
        if (filteredFiles.length === 0)
            return;
        var currentIndex = filteredFiles.findIndex(function (_a) {
            var file = _a.file;
            return file.path === (selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.path);
        });
        var newIndex;
        if (currentIndex === -1) {
            newIndex = 0;
        }
        else if (e.key === "ArrowDown") {
            newIndex = Math.min(currentIndex + 1, filteredFiles.length - 1);
        }
        else {
            newIndex = Math.max(currentIndex - 1, 0);
        }
        var newFile = filteredFiles[newIndex];
        if (newFile) {
            handleFileSelect(newFile.file, newFile.category);
            var container = fileListRef.current;
            if (container) {
                var items = container.querySelectorAll("[data-file-item]");
                var targetItem = items[newIndex];
                targetItem === null || targetItem === void 0 ? void 0 : targetItem.scrollIntoView({ block: "nearest" });
            }
        }
    };
    // Get selected file paths for commit - only from filtered files (visible in current view)
    // This ensures that when filtering by subchat, only the visible selected files are committed
    var selectedFilePaths = (0, solid_js_1.createMemo)(function () {
        return filteredFiles.filter(function (f) { return selectedForCommit.has(f.file.path); }).map(function (f) { return f.file.path; });
    });
    // Check if a file is marked as viewed in the diff view
    // Key format matches agent-diff-view.tsx: `${oldPath}->${newPath}`
    // Must be defined before early returns to maintain hooks order
    var isFileMarkedAsViewed = function (filePath) {
        // For new files: /dev/null->{path}
        // For modified files: {path}->{path}
        // For deleted files: {path}->/dev/null
        // We check all possible key formats
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
    // Toggle viewed state for a file in the list
    var toggleFileViewed = function (filePath) {
        var _a;
        // Try to find existing key
        var possibleKeys = [
            "".concat(filePath, "->").concat(filePath),
            "/dev/null->".concat(filePath),
            "".concat(filePath, "->/dev/null")
        ];
        var existingKey = null;
        for (var _i = 0, possibleKeys_2 = possibleKeys; _i < possibleKeys_2.length; _i++) {
            var key = possibleKeys_2[_i];
            if (viewedFiles[key]) {
                existingKey = key;
                break;
            }
        }
        // Use existing key or default to modified format
        var fileKey = existingKey || "".concat(filePath, "->").concat(filePath);
        var currentState = viewedFiles[fileKey];
        var isCurrentlyViewed = (currentState === null || currentState === void 0 ? void 0 : currentState.viewed) || false;
        setViewedFiles(__assign(__assign({}, viewedFiles), (_a = {}, _a[fileKey] = {
            viewed: !isCurrentlyViewed,
            contentHash: (currentState === null || currentState === void 0 ? void 0 : currentState.contentHash) || ""
        }, _a)));
    };
    // Handler for discarding highlighted files (multi-file discard via Shift+Click)
    var handleDiscardSelected = function () {
        var filesToDiscard = filteredFiles.filter(function (f) { return highlightedFiles.has(f.file.path); }).map(function (f) { return f.file; });
        if (filesToDiscard.length > 0) {
            setDiscardFiles(filesToDiscard);
        }
    };
    if (!worktreePath) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
				No worktree path available
			</div>;
    }
    if (isLoading) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
				Loading changes...
			</div>;
    }
    if (!status) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
				Unable to load changes
			</div>;
    }
    // Handle single file discard confirmation
    var handleConfirmDiscard = function () {
        if (!discardFile || !worktreePath)
            return;
        var isUntracked = discardFile.status === "untracked" || discardFile.status === "added";
        if (isUntracked) {
            deleteUntrackedMutation.mutate({
                worktreePath: worktreePath,
                filePath: discardFile.path
            });
        }
        else {
            discardChangesMutation.mutate({
                worktreePath: worktreePath,
                filePath: discardFile.path
            });
        }
        setDiscardFile(null);
    };
    // Handle multi-file discard confirmation
    var handleConfirmMultiDiscard = function () {
        if (!discardFiles || discardFiles.length === 0 || !worktreePath)
            return;
        // Split files by type - untracked/added need deletion, others need checkout
        var untrackedFiles = discardFiles.filter(function (f) { return f.status === "untracked" || f.status === "added"; });
        var trackedFiles = discardFiles.filter(function (f) { return f.status !== "untracked" && f.status !== "added"; });
        // Discard tracked files (git checkout)
        if (trackedFiles.length > 0) {
            discardMultipleChangesMutation.mutate({
                worktreePath: worktreePath,
                filePaths: trackedFiles.map(function (f) { return f.path; })
            });
        }
        // Delete untracked files
        if (untrackedFiles.length > 0) {
            deleteMultipleUntrackedMutation.mutate({
                worktreePath: worktreePath,
                filePaths: untrackedFiles.map(function (f) { return f.path; })
            });
        }
        // Clear commit selection and highlighting for discarded files
        setSelectedForCommit(function (prev) {
            var next = new Set(prev);
            for (var _i = 0, discardFiles_1 = discardFiles; _i < discardFiles_1.length; _i++) {
                var file = discardFiles_1[_i];
                next.delete(file.path);
            }
            return next;
        });
        setHighlightedFiles(new Set());
        setDiscardFiles(null);
    };
    // Context menu handlers
    var handleCopyPath = function (filePath) {
        var absolutePath = "".concat(worktreePath, "/").concat(filePath);
        navigator.clipboard.writeText(absolutePath);
    };
    var handleCopyRelativePath = function (filePath) {
        navigator.clipboard.writeText(filePath);
    };
    var handleRevealInFinder = function (filePath) {
        var absolutePath = "".concat(worktreePath, "/").concat(filePath);
        openInFinderMutation.mutate(absolutePath);
    };
    var handleOpenInEditor = function (filePath) {
        var absolutePath = "".concat(worktreePath, "/").concat(filePath);
        openInEditorMutation.mutate({
            path: absolutePath,
            cwd: worktreePath
        });
    };
    return <>
			<div class="flex flex-col h-full">
				<tabs_1.Tabs value={activeTab} onValueChange={function (v) {
            var newTab = v;
            setActiveTab(newTab);
            // Notify parent about tab change
            onActiveTabChange === null || onActiveTabChange === void 0 ? void 0 : onActiveTabChange(newTab);
            // Reset selected commit when switching to Changes tab
            if (v === "changes" && onCommitSelect) {
                onCommitSelect(null);
            }
        }} class="flex flex-col h-full">
					{/* Tab triggers */}
					<tabs_1.TabsList class="h-8 px-2 bg-transparent border-b border-border/50 rounded-none justify-start gap-1 shrink-0">
						<tabs_1.TabsTrigger value="changes" class="h-6 px-2.5 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:shadow-none">
							Changes
						</tabs_1.TabsTrigger>
						<tabs_1.TabsTrigger value="history" class="h-6 px-2.5 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:shadow-none">
							History
						</tabs_1.TabsTrigger>
					</tabs_1.TabsList>

					{/* Changes tab content */}
					<tabs_1.TabsContent value="changes" class="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
						{/* Filter */}
						<changes_file_filter_1.ChangesFileFilter value={fileFilter} onChange={setFileFilter} subChats={subChats} selectedSubChatId={subChatFilter} onSubChatFilterChange={setSubChatFilter}/>

						{/* Select all header */}
						<div class="flex items-center gap-2 px-2 py-1.5 border-b border-border/50">
							<checkbox_1.Checkbox checked={someSelected ? "indeterminate" : allSelected} onCheckedChange={handleSelectAllChange} class="size-4 border-muted-foreground/50"/>
							<span class="text-xs text-muted-foreground">
								{selectedCount} of {totalCount} file{totalCount !== 1 ? "s" : ""} selected
							</span>
						</div>

						{/* File list */}
						{totalCount === 0 ? <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
								No changes detected
							</div> : filteredCount === 0 ? <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
								No files match filter
							</div> : <div ref={fileListRef} class="flex-1 overflow-y-auto outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
								{filteredFiles.map(function (_a, index) {
                var file = _a.file, category = _a.category;
                return <ChangesFileItemWithContext key={file.path} file={file} category={category} isSelected={(selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.path) === file.path} isChecked={selectedForCommit.has(file.path)} isViewed={isFileMarkedAsViewed(file.path)} isHighlighted={highlightedFiles.has(file.path)} highlightedCount={highlightedCount} highlightedPaths={highlightedPaths} index={index} onSelect={function () {
                        var _a;
                        handleFileSelect(file, category);
                        (_a = fileListRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    }} onDoubleClick={function () { return handleFileDoubleClick(file, category); }} onCheckboxChange={function () { return handleCheckboxChange(file.path); }} onShiftClick={handleShiftClick} onCopyPath={function () { return handleCopyPath(file.path); }} onCopyRelativePath={function () { return handleCopyRelativePath(file.path); }} onRevealInFinder={function () { return handleRevealInFinder(file.path); }} onToggleViewed={function () { return toggleFileViewed(file.path); }} onDiscard={function () { return setDiscardFile(file); }} onDiscardSelected={handleDiscardSelected} onIncludeSelected={handleIncludeSelected} onExcludeSelected={handleExcludeSelected} onCopySelectedPaths={function () { return handleCopySelectedPaths(worktreePath); }} onCopySelectedRelativePaths={handleCopySelectedRelativePaths}/>;
            })}
							</div>}

						{/* Commit input */}
						<commit_input_1.CommitInput worktreePath={worktreePath} hasStagedChanges={selectedCount > 0} onRefresh={handleRefresh} onCommitSuccess={handleCommitSuccess} stagedCount={selectedCount} currentBranch={status.branch} selectedFilePaths={selectedFilePaths} chatId={chatId}/>
					</tabs_1.TabsContent>

					{/* History tab content */}
					<tabs_1.TabsContent value="history" class="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
						<history_view_1.HistoryView worktreePath={worktreePath} selectedCommitHash={selectedCommitHash} selectedFilePath={selectedFilePath} onCommitSelect={onCommitSelect} onFileSelect={onCommitFileSelect} pushCount={pushCount}/>
					</tabs_1.TabsContent>
				</tabs_1.Tabs>
			</div>

			{/* Discard confirmation dialog - single file */}
			<alert_dialog_1.AlertDialog open={!!discardFile} onOpenChange={function (open) { return !open && setDiscardFile(null); }}>
				<alert_dialog_1.AlertDialogContent class="w-[340px]">
					<alert_dialog_1.AlertDialogHeader>
						<alert_dialog_1.AlertDialogTitle>
							{(discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "untracked" || (discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "added" ? "Delete \"".concat(discardFile === null || discardFile === void 0 ? void 0 : discardFile.path.split("/").pop(), "\"?") : "Discard changes to \"".concat(discardFile === null || discardFile === void 0 ? void 0 : discardFile.path.split("/").pop(), "\"?")}
						</alert_dialog_1.AlertDialogTitle>
					</alert_dialog_1.AlertDialogHeader>
					<alert_dialog_1.AlertDialogDescription class="px-5 pb-5">
						{(discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "untracked" || (discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "added" ? "This will permanently delete this file. This action cannot be undone." : "This will revert all changes to this file. This action cannot be undone."}
					</alert_dialog_1.AlertDialogDescription>
					<alert_dialog_1.AlertDialogFooter>
						<button_1.Button variant="outline" size="sm" onClick={function () { return setDiscardFile(null); }}>
							Cancel
						</button_1.Button>
						<button_1.Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
							{(discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "untracked" || (discardFile === null || discardFile === void 0 ? void 0 : discardFile.status) === "added" ? "Delete" : "Discard"}
						</button_1.Button>
					</alert_dialog_1.AlertDialogFooter>
				</alert_dialog_1.AlertDialogContent>
			</alert_dialog_1.AlertDialog>

			{/* Discard confirmation dialog - multiple files */}
			<alert_dialog_1.AlertDialog open={!!discardFiles} onOpenChange={function (open) { return !open && setDiscardFiles(null); }}>
				<alert_dialog_1.AlertDialogContent class="w-[400px]">
					<alert_dialog_1.AlertDialogHeader>
						<alert_dialog_1.AlertDialogTitle>
							Discard {discardFiles === null || discardFiles === void 0 ? void 0 : discardFiles.length} Selected Changes?
						</alert_dialog_1.AlertDialogTitle>
					</alert_dialog_1.AlertDialogHeader>
					<alert_dialog_1.AlertDialogDescription asChild>
						<div class="px-5 pb-5">
							<p class="mb-2">Are you sure you want to discard all changes to:</p>
							<ul class="max-h-40 overflow-y-auto text-xs font-mono bg-muted/50 rounded-md p-2 space-y-0.5">
								{discardFiles === null || discardFiles === void 0 ? void 0 : discardFiles.map(function (f) { return <li key={f.path} class="truncate text-muted-foreground">
										{f.path}
									</li>; })}
							</ul>
						</div>
					</alert_dialog_1.AlertDialogDescription>
					<alert_dialog_1.AlertDialogFooter>
						<button_1.Button variant="outline" size="sm" onClick={function () { return setDiscardFiles(null); }}>
							Cancel
						</button_1.Button>
						<button_1.Button variant="destructive" size="sm" onClick={handleConfirmMultiDiscard}>
							Discard
						</button_1.Button>
					</alert_dialog_1.AlertDialogFooter>
				</alert_dialog_1.AlertDialogContent>
			</alert_dialog_1.AlertDialog>
		</>;
}
