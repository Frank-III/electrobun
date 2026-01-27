"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryView = void 0;
var solid_js_1 = require("solid-js");
var trpc_1 = require("../../../../lib/trpc");
var date_1 = require("../../utils/date");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../../../lib/utils");
var status_1 = require("../../utils/status");
var context_menu_1 = require("../../../../components/ui/context-menu");
var solid_sonner_1 = require("solid-sonner");
exports.HistoryView = memo(function HistoryView(_a) {
    var worktreePath = _a.worktreePath, selectedCommitHash = _a.selectedCommitHash, selectedFilePath = _a.selectedFilePath, onCommitSelect = _a.onCommitSelect, onFileSelect = _a.onFileSelect, pushCount = _a.pushCount;
    var _b = trpc_1.trpc.changes.getHistory.useQuery({
        worktreePath: worktreePath,
        limit: 50
    }, {
        enabled: !!worktreePath,
        staleTime: 3e4
    }), commits = _b.data, isLoading = _b.isLoading, refetchHistory = _b.refetch;
    // Check if worktree is registered
    var isWorktreeRegistered = trpc_1.trpc.changes.isWorktreeRegistered.useQuery({ worktreePath: worktreePath }, { enabled: !!worktreePath }).data;
    // Fetch files for selected commit
    var _c = trpc_1.trpc.changes.getCommitFiles.useQuery({
        worktreePath: worktreePath,
        commitHash: selectedCommitHash
    }, {
        enabled: !!worktreePath && !!selectedCommitHash,
        staleTime: 6e4
    }), commitFiles = _c.data, isLoadingFiles = _c.isLoading, filesError = _c.error, refetchFiles = _c.refetch;
    // Auto-select first commit when history loads (if none selected)
    (0, solid_js_1.createEffect)(function () {
        if (commits && commits.length > 0 && !selectedCommitHash && onCommitSelect) {
            onCommitSelect(commits[0]);
        }
    });
    // Auto-select first file when commit files load
    (0, solid_js_1.createEffect)(function () {
        if (commitFiles && commitFiles.length > 0 && selectedCommitHash && !selectedFilePath && onFileSelect) {
            onFileSelect(commitFiles[0], selectedCommitHash);
        }
    });
    // Refetch history and commit files when window gains focus
    (0, solid_js_1.createEffect)(function () {
        if (!worktreePath)
            return;
        var handleWindowFocus = function () {
            // Refetch commit history
            refetchHistory();
            // Refetch commit files if a commit is selected
            if (selectedCommitHash) {
                refetchFiles();
            }
        };
        window.addEventListener("focus", handleWindowFocus);
        return function () { return window.removeEventListener("focus", handleWindowFocus); };
    });
    var handleCommitClick = function (commit) {
        onCommitSelect === null || onCommitSelect === void 0 ? void 0 : onCommitSelect(commit);
    };
    var handleFileClick = function (file) {
        if (selectedCommitHash) {
            onFileSelect === null || onFileSelect === void 0 ? void 0 : onFileSelect(file, selectedCommitHash);
        }
    };
    if (isLoading) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				Loading...
			</div>;
    }
    if (!(commits === null || commits === void 0 ? void 0 : commits.length)) {
        return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				No commits yet
			</div>;
    }
    return <div class="flex-1 overflow-y-auto">
			{/* Worktree not registered warning */}
			{isWorktreeRegistered === false && worktreePath && <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs">
					Worktree not registered. Cannot load commit files.
				</div>}

			{/* Commits list - only commits, files are shown in right panel */}
			{commits.map(function (commit, index) { return <HistoryCommitItem key={commit.hash} commit={commit} isSelected={selectedCommitHash === commit.hash} isUnpushed={index < (pushCount || 0)} onClick={function () { return handleCommitClick(commit); }}/>; })}
		</div>;
});
var HistoryCommitItem = memo(function HistoryCommitItem(_a) {
    var commit = _a.commit, isSelected = _a.isSelected, isUnpushed = _a.isUnpushed, onClick = _a.onClick;
    var timeAgo = (0, solid_js_1.createMemo)(function () { return (0, date_1.formatRelativeDate)(new Date(commit.date)); });
    var handleCopySha = function () {
        navigator.clipboard.writeText(commit.hash);
        solid_sonner_1.toast.success("Copied SHA to clipboard");
    };
    var handleOpenOnRemote = function () {
        // TODO: Get repository URL and construct commit URL
        // For now, just show a toast
        solid_sonner_1.toast.info("Open on remote - not implemented yet");
    };
    return <context_menu_1.ContextMenu>
			<context_menu_1.ContextMenuTrigger asChild>
				<div class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors", "hover:bg-muted/50 border-b border-border/30 last:border-b-0", isSelected && "bg-muted")} onClick={onClick}>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-medium truncate">{commit.message}</div>
						<div class="text-xs text-muted-foreground flex items-center gap-1">
							<span class="font-mono">{commit.shortHash}</span>
							<span>·</span>
							<span class="truncate">{commit.author}</span>
							<span>·</span>
							<span class="shrink-0">{timeAgo}</span>
						</div>
					</div>
					{isUnpushed && <div class="flex items-center justify-center w-7 h-6 rounded bg-primary/10 shrink-0">
							<lucide_solid_1.ArrowUp class="size-3.5 text-primary"/>
						</div>}
				</div>
			</context_menu_1.ContextMenuTrigger>
			<context_menu_1.ContextMenuContent class="w-48">
				<context_menu_1.ContextMenuItem onClick={handleCopySha}>
					Copy SHA
				</context_menu_1.ContextMenuItem>
				<context_menu_1.ContextMenuItem onClick={handleOpenOnRemote} disabled={isUnpushed}>
					Open on Remote
				</context_menu_1.ContextMenuItem>
			</context_menu_1.ContextMenuContent>
		</context_menu_1.ContextMenu>;
});
var CommitFileItem = memo(function CommitFileItem(_a) {
    var file = _a.file, isSelected = _a.isSelected, onClick = _a.onClick;
    var fileName = file.path.split("/").pop() || file.path;
    var dirPath = file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";
    return <div class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors", "hover:bg-muted/80", isSelected && "bg-muted")} onClick={onClick}>
			<lucide_solid_1.FileText class="size-3.5 text-muted-foreground shrink-0 ml-5"/>
			<div class="flex-1 min-w-0 flex items-center overflow-hidden">
				{dirPath && <span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
						{dirPath}/
					</span>}
				<span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
					{fileName}
				</span>
			</div>
			<div class="shrink-0">{(0, status_1.getStatusIndicator)(file.status)}</div>
		</div>;
});
