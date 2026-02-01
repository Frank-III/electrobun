import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../components/ui/context-menu";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { toast } from "solid-sonner";
import { createEffect, createSignal, createMemo, For, Show, Switch, Match, onCleanup, mergeProps, splitProps } from "solid-js";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../lib/desktop-rpc";
import { useChangesStore } from "../../lib/stores/changes-store";
import { usePRStatus } from "../../hooks/usePRStatus";
import { useFileChangeListener } from "../../lib/hooks/use-file-change-listener";
import type { ChangeCategory, ChangedFile } from "../../../shared/changes-types";
import { cn } from "../../lib/utils";
import { ChangesFileFilter, type SubChatFilterItem } from "./components/changes-file-filter";
import { CommitInput } from "./components/commit-input";
import { HistoryView, type CommitInfo } from "./components/history-view";
import { getStatusIndicator } from "./utils/status";
import { GitPullRequest, Eye } from "lucide-solid";
import type { ChangedFile as HistoryChangedFile } from "../../../shared/changes-types";
import { viewedFilesAtomFamily, type ViewedFileState } from "../agents/atoms";
import { Kbd } from "../../components/ui/kbd";

interface ChangesFileItemWithContextProps {
	file: ChangedFile;
	category: ChangeCategory;
	isSelected: boolean;
	isChecked: boolean;
	isViewed: boolean;
	isHighlighted: boolean;
	highlightedCount: number;
	highlightedPaths: string[];
	index: number;
	onSelect: () => void;
	onDoubleClick: () => void;
	onCheckboxChange: () => void;
	onShiftClick: (index: number) => void;
	onCopyPath: () => void;
	onCopyRelativePath: () => void;
	onRevealInFinder: () => void;
	onToggleViewed: () => void;
	onDiscard: () => void;
	onDiscardSelected: () => void;
	onIncludeSelected: () => void;
	onExcludeSelected: () => void;
	onCopySelectedPaths: () => void;
	onCopySelectedRelativePaths: () => void;
}

function ChangesFileItemWithContext(props: ChangesFileItemWithContextProps) {
	const fileName = () => props.file.path.split("/").pop() || props.file.path;
	const dirPath = () => props.file.path.includes("/") ? props.file.path.substring(0, props.file.path.lastIndexOf("/")) : "";
	const isUntracked = () => props.file.status === "untracked" || props.file.status === "added";
	const showMultiDiscard = () => props.highlightedCount > 1 && props.isHighlighted;
	return <ContextMenu>
			<ContextMenuTrigger asChild>
				<div data-file-item class={cn("flex items-center gap-2 px-2 py-1 cursor-pointer", "hover:bg-muted/80 transition-colors", props.isSelected && !props.isHighlighted && "bg-muted", props.isHighlighted && "bg-primary/10 hover:bg-primary/15")} onClick={(e) => {
		if (e.shiftKey) {
			e.preventDefault();
			props.onShiftClick(props.index);
		} else {
			props.onSelect();
		}
	}} onDoubleClick={props.onDoubleClick}>
					<Checkbox checked={props.isChecked} onCheckedChange={props.onCheckboxChange} onClick={(e) => e.stopPropagation()} class="size-4 shrink-0 border-muted-foreground/50" />
					<div class="flex-1 min-w-0 flex items-center overflow-hidden">
						<Show when={dirPath()}>
							<span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
								{dirPath()}/
							</span>
						</Show>
						<span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
							{fileName()}
						</span>
					</div>
					<div class="shrink-0 flex items-center gap-1.5">
						<Show when={props.isViewed}>
							<div class="size-4 rounded bg-emerald-500/20 flex items-center justify-center">
								<Eye class="size-2.5 text-emerald-500" />
							</div>
						</Show>
						{getStatusIndicator(props.file.status)}
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<Show when={showMultiDiscard()} fallback={<>
						<ContextMenuItem onClick={props.onCopyPath}>
							Copy Path
						</ContextMenuItem>
						<ContextMenuItem onClick={props.onCopyRelativePath}>
							Copy Relative Path
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={props.onRevealInFinder}>
							Reveal in Finder
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={props.onToggleViewed} class="justify-between">
							{props.isViewed ? "Mark as unviewed" : "Mark as viewed"}
							<Kbd>V</Kbd>
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={props.onDiscard} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
							{isUntracked() ? "Delete File..." : "Discard Changes..."}
						</ContextMenuItem>
					</>}>
					<ContextMenuItem onClick={props.onDiscardSelected} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
						Discard {props.highlightedCount} Selected Changes...
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onClick={props.onIncludeSelected}>
						Include Selected Files
					</ContextMenuItem>
					<ContextMenuItem onClick={props.onExcludeSelected}>
						Exclude Selected Files
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onClick={props.onCopySelectedPaths}>
						Copy Paths
					</ContextMenuItem>
					<ContextMenuItem onClick={props.onCopySelectedRelativePaths}>
						Copy Relative Paths
					</ContextMenuItem>
				</Show>
			</ContextMenuContent>
		</ContextMenu>;
 }
interface ChangesViewProps {
	worktreePath: string;
	selectedFilePath?: string | null;
	onFileSelect?: (file: ChangedFile, category: ChangeCategory, commitHash?: string) => void;
	onFileOpenPinned?: (file: ChangedFile, category: ChangeCategory, commitHash?: string) => void;
	/** Callback to create a PR (sends prompt to chat) */
	onCreatePr?: () => void;
	/** Called after a successful commit to reset diff view state */
	onCommitSuccess?: () => void;
	/** Available subchats for filtering */
	subChats?: SubChatFilterItem[];
	/** Currently selected subchat ID for filtering (passed from Review button) */
	initialSubChatFilter?: string | null;
	/** Chat ID for AI-generated commit messages */
	chatId?: string;
	/** Selected commit hash for History tab */
	selectedCommitHash?: string | null;
	/** Callback when commit is selected in History tab */
	onCommitSelect?: (commit: CommitInfo | null) => void;
	/** Callback when file is selected in commit History */
	onCommitFileSelect?: (file: HistoryChangedFile, commitHash: string) => void;
	/** Callback when active tab changes (Changes/History) */
	onActiveTabChange?: (tab: "changes" | "history") => void;
	/** Number of commits ahead of upstream (for unpushed indicator) */
	pushCount?: number;
}
export function ChangesView(props: ChangesViewProps) {
	const merged = mergeProps({ subChats: [], initialSubChatFilter: null }, props);
	const [local] = splitProps(merged, ["worktreePath", "selectedFilePath", "onFileSelect", "onFileOpenPinned", "onCreatePr", "onCommitSuccess", "subChats", "initialSubChatFilter", "chatId", "selectedCommitHash", "onCommitSelect", "onCommitFileSelect", "onActiveTabChange", "pushCount"]);
	const onFileSelectProp = local.onFileSelect;
	useFileChangeListener(local.worktreePath);
	// Viewed files state from agents diff view (for showing eye icon and toggling)
	const [viewedFiles, setViewedFiles] = viewedFilesAtomFamily(local.chatId || "");
	const { baseBranch } = useChangesStore();
	const branchDataQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", local.worktreePath || ""] as const,
		queryFn: () => desktopRpc.changes.getBranches({ worktreePath: local.worktreePath || "" }),
		enabled: !!local.worktreePath,
	}));
	const branchData = () => branchDataQuery.data;
	const effectiveBaseBranch = () => baseBranch ?? branchData()?.defaultBranch ?? "main";

	const statusQuery = useQuery(() => ({
		queryKey: ["changes", "getStatus", local.worktreePath || "", effectiveBaseBranch()] as const,
		queryFn: () =>
			desktopRpc.changes.getStatus({
				worktreePath: local.worktreePath || "",
				defaultBranch: effectiveBaseBranch(),
			}),
		enabled: !!local.worktreePath,
		refetchOnWindowFocus: true,
	}));
	const status = () => statusQuery.data;
	const isLoading = () => statusQuery.isLoading;
	const refetch = () => statusQuery.refetch();
	const { pr, refetch: refetchPRStatus } = usePRStatus({
		worktreePath: local.worktreePath,
		refetchInterval: 1e4
	});
	const handleRefresh = () => {
		refetch();
		refetchPRStatus();
	};
	// Handle successful commit - reset local state and notify parent
	const handleCommitSuccess = () => {
		// Reset selection state so new files will be auto-selected
		setHasInitializedSelection(false);
		setSelectedForCommit(new Set());
		// Notify parent to reset diff view selection
		local.onCommitSuccess?.();
	};
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (input: { path: string }) => desktopRpc.external.openInFinder.mutate(input),
	}));
	const openInEditorMutation = useMutation(() => ({
		mutationFn: (input: { path: string; cwd?: string }) =>
			desktopRpc.external.openFileInEditor(input),
	}));
	const discardChangesMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; filePath: string }) =>
			desktopRpc.changes.discardChanges.mutate(input),
		onSuccess: () => {
			toast.success("Changes discarded");
			refetch();
		},
		onError: (error) => toast.error(`Failed to discard changes: ${error.message}`),
	}));
	const deleteUntrackedMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; filePath: string }) =>
			desktopRpc.changes.deleteUntracked.mutate(input),
		onSuccess: () => {
			toast.success("File deleted");
			refetch();
		},
		onError: (error) => toast.error(`Failed to delete file: ${error.message}`),
	}));
	const discardMultipleChangesMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; filePaths: string[] }) =>
			desktopRpc.changes.discardMultipleChanges.mutate(input),
		onSuccess: () => {
			toast.success("Changes discarded");
			refetch();
		},
		onError: (error) => toast.error(`Failed to discard changes: ${error.message}`),
	}));
	const deleteMultipleUntrackedMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; filePaths: string[] }) =>
			desktopRpc.changes.deleteMultipleUntracked.mutate(input),
		onSuccess: () => {
			toast.success("Files deleted");
			refetch();
		},
		onError: (error) => toast.error(`Failed to delete files: ${error.message}`),
	}));
	// Discard confirmation dialog state - single file
	const [discardFile, setDiscardFile] = createSignal<ChangedFile | null>(null);
	// Discard confirmation dialog state - multiple files
	const [discardFiles, setDiscardFiles] = createSignal<ChangedFile[] | null>(null);
	const { selectFile, getSelectedFile } = useChangesStore();
	const selectedFileState = getSelectedFile(local.worktreePath || "");
	const selectedFile = local.selectedFilePath !== undefined ? local.selectedFilePath ? { path: local.selectedFilePath } as ChangedFile : null : selectedFileState?.file ?? null;
	const [fileFilter, setFileFilter] = createSignal("");
	const [subChatFilter, setSubChatFilter] = createSignal<string | null>(local.initialSubChatFilter);
	const [activeTab, setActiveTab] = createSignal<"changes" | "history">("changes");
	let fileListRef: HTMLDivElement | undefined;
	// Update subchat filter when initialSubChatFilter changes (e.g., from Review button)
	createEffect(() => {
		setSubChatFilter(local.initialSubChatFilter);
	});
	// Local selection state - tracks which files are selected for commit (checkboxes)
	const [selectedForCommit, setSelectedForCommit] = createSignal(new Set());
	const [hasInitializedSelection, setHasInitializedSelection] = createSignal(false);
	// Highlighted files state - for multi-select operations like discard (Shift+Click)
	// This is separate from selectedForCommit (checkboxes)
	// Anchor for Shift+Click is the currently selected file (selectedFile) - the one showing in diff view
	const [highlightedFiles, setHighlightedFiles] = createSignal(new Set());
	// Reset filters when worktreePath changes, but preserve initialSubChatFilter
	createEffect(() => {
		setFileFilter("");
		// Don't reset subChatFilter to null - use initialSubChatFilter instead
		// This preserves the filter when component remounts (e.g., when diff sidebar opens)
		setSubChatFilter(local.initialSubChatFilter);
		setHasInitializedSelection(false);
		setSelectedForCommit(new Set());
		setHighlightedFiles(new Set());
	});
	const allFiles = createMemo(() => {
		const s = status();
		if (!s) return [];
		const files: Array<{ file: ChangedFile; category: ChangeCategory }> = [];
		for (const file of s.staged) {
			files.push({ file, category: "staged" });
		}
		for (const file of s.unstaged) {
			files.push({ file, category: "unstaged" });
		}
		for (const file of s.untracked) {
			files.push({ file, category: "unstaged" });
		}
		files.sort((a, b) => a.file.path.localeCompare(b.file.path));
		return files;
	});
	// Initialize selection - select all files by default when data loads
	createEffect(() => {
		if (!hasInitializedSelection() && allFiles().length > 0) {
			const allPaths = new Set(allFiles().map((f) => f.file.path));
			setSelectedForCommit(allPaths);
			setHasInitializedSelection(true);
		}
	});
	// Get file paths for selected subchat filter
	const subChatFilterPaths = createMemo(() => {
		if (!subChatFilter()) return null;
		const subChat = local.subChats.find((sc) => sc.id === subChatFilter());
		return subChat?.filePaths || null;
	});
	// Apply filters (text filter + subchat filter)
	const filteredFiles = createMemo(() => {
		let result = allFiles();
		// Apply subchat filter first
		const filterPaths = subChatFilterPaths();
		if (filterPaths) {
			result = result.filter(({ file }) => filterPaths.some((filterPath) => file.path === filterPath || file.path.endsWith(filterPath) || filterPath.endsWith(file.path)));
		}
		// Then apply text filter
		if (fileFilter().trim()) {
			result = result.filter(({ file }) => file.path.toLowerCase().includes(fileFilter().toLowerCase()));
		}
		return result;
	});
	const filteredCount = () => filteredFiles().length;
	const totalCount = () => allFiles().length;
	// Counts for commit selection (checkboxes)
	const selectedCount = () => filteredFiles().filter((f) => selectedForCommit().has(f.file.path)).length;
	const allSelected = () => filteredCount() > 0 && selectedCount() === filteredCount();
	const someSelected = () => selectedCount() > 0 && selectedCount() < filteredCount();
	// Count for highlighted files (shift+click selection for discard)
	const highlightedCount = () => highlightedFiles().size;
	// Handle file click - selects file for diff view and clears highlighting
	const handleFileSelect = (file: ChangedFile, category: ChangeCategory) => {
		if (!local.worktreePath) return;
		selectFile(local.worktreePath, file, category, null);
		onFileSelectProp?.(file, category);
		// Clear multi-select highlighting on regular click
		setHighlightedFiles(new Set());
	};
	const handleFileDoubleClick = (file: ChangedFile, category: ChangeCategory) => {
		if (!local.worktreePath) return;
		selectFile(local.worktreePath, file, category, null);
		local.onFileOpenPinned?.(file, category);
	};
	// Toggle individual file for commit (checkbox) - doesn't affect highlighting
	const handleCheckboxChange = (filePath: string) => {
		setSelectedForCommit((prev) => {
			const next = new Set(prev);
			if (next.has(filePath)) {
				next.delete(filePath);
			} else {
				next.add(filePath);
			}
			return next;
		});
	};
	// Shift+Click range selection handler for highlighting (multi-select for discard)
	// Uses the currently selected file (the one showing in diff view) as anchor
	const handleShiftClick = (clickedIndex: number) => {
		// Find anchor index from currently selected file (the one showing diff)
		const files = filteredFiles();
		const anchorIndex = selectedFile ? files.findIndex((f) => f.file.path === selectedFile.path) : -1;
		if (anchorIndex === -1) {
			// No anchor - just highlight this one file
			const file = files[clickedIndex];
			if (file) {
				setHighlightedFiles(new Set([file.file.path]));
			}
			return;
		}
		// Highlight range from anchor to clicked (inclusive)
		const startIndex = Math.min(anchorIndex, clickedIndex);
		const endIndex = Math.max(anchorIndex, clickedIndex);
		const newHighlighted = new Set<string>();
		for (let i = startIndex; i <= endIndex; i++) {
			const file = files[i];
			if (file) {
				newHighlighted.add(file.file.path);
			}
		}
		setHighlightedFiles(newHighlighted);
	};
	// Get highlighted file paths as array (for context menu actions)
	const highlightedPaths = createMemo(() => {
		return filteredFiles().filter((f) => highlightedFiles().has(f.file.path)).map((f) => f.file.path);
	});
	// Include highlighted files in commit (check their checkboxes)
	const handleIncludeSelected = () => {
		setSelectedForCommit((prev) => {
			const next = new Set(prev);
			for (const path of highlightedFiles()) {
				next.add(path);
			}
			return next;
		});
	};
	// Exclude highlighted files from commit (uncheck their checkboxes)
	const handleExcludeSelected = () => {
		setSelectedForCommit((prev) => {
			const next = new Set(prev);
			for (const path of highlightedFiles()) {
				next.delete(path);
			}
			return next;
		});
	};
	// Copy paths of highlighted files
	const handleCopySelectedPaths = (worktreePath: string) => {
		const paths = highlightedPaths().map((p) => `${worktreePath}/${p}`);
		navigator.clipboard.writeText(paths.join("\n"));
		toast.success(`Copied ${paths.length} paths`);
	};
	// Copy relative paths of highlighted files
	const handleCopySelectedRelativePaths = () => {
		const hp = highlightedPaths();
		navigator.clipboard.writeText(hp.join("\n"));
		toast.success(`Copied ${hp.length} paths`);
	};
	// Toggle all files selection
	const handleSelectAllChange = () => {
		if (allSelected()) {
			// Deselect all filtered files
			setSelectedForCommit((prev) => {
				const next = new Set(prev);
				for (const { file } of filteredFiles()) {
					next.delete(file.path);
				}
				return next;
			});
		} else {
			// Select all filtered files
			setSelectedForCommit((prev) => {
				const next = new Set(prev);
				for (const { file } of filteredFiles()) {
					next.add(file.path);
				}
				return next;
			});
		}
	};
	// Keyboard navigation handler for arrow up/down
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
		e.preventDefault();
		const files = filteredFiles();
		if (files.length === 0) return;
		const currentIndex = files.findIndex(({ file }) => file.path === selectedFile?.path);
		let newIndex: number;
		if (currentIndex === -1) {
			newIndex = 0;
		} else if (e.key === "ArrowDown") {
			newIndex = Math.min(currentIndex + 1, files.length - 1);
		} else {
			newIndex = Math.max(currentIndex - 1, 0);
		}
		const newFile = files[newIndex];
		if (newFile) {
			handleFileSelect(newFile.file, newFile.category);
			if (fileListRef) {
				const items = fileListRef.querySelectorAll("[data-file-item]");
				const targetItem = items[newIndex] as HTMLElement | undefined;
				targetItem?.scrollIntoView({ block: "nearest" });
			}
		}
	};
	// Get selected file paths for commit - only from filtered files (visible in current view)
	// This ensures that when filtering by subchat, only the visible selected files are committed
	const selectedFilePaths = createMemo(() => {
		return filteredFiles().filter((f) => selectedForCommit().has(f.file.path)).map((f) => f.file.path);
	});
	// Check if a file is marked as viewed in the diff view
	// Key format matches agent-diff-view.tsx: `${oldPath}->${newPath}`
	// Must be defined before early returns to maintain hooks order
	const isFileMarkedAsViewed = (filePath: string): boolean => {
		// For new files: /dev/null->{path}
		// For modified files: {path}->{path}
		// For deleted files: {path}->/dev/null
		// We check all possible key formats
		const possibleKeys = [
			`${filePath}->${filePath}`,
			`/dev/null->${filePath}`,
			`${filePath}->/dev/null`
		];
		const files = viewedFiles();
		for (const key of possibleKeys) {
			const viewedState = files[key];
			if (viewedState?.viewed) {
				return true;
			}
		}
		return false;
	};
	// Toggle viewed state for a file in the list
	const toggleFileViewed = (filePath: string) => {
		// Try to find existing key
		const possibleKeys = [
			`${filePath}->${filePath}`,
			`/dev/null->${filePath}`,
			`${filePath}->/dev/null`
		];
		const files = viewedFiles();
		let existingKey: string | null = null;
		for (const key of possibleKeys) {
			if (files[key]) {
				existingKey = key;
				break;
			}
		}
		// Use existing key or default to modified format
		const fileKey = existingKey || `${filePath}->${filePath}`;
		const currentState = files[fileKey];
		const isCurrentlyViewed = currentState?.viewed || false;
		setViewedFiles({
			...files,
			[fileKey]: {
				viewed: !isCurrentlyViewed,
				contentHash: currentState?.contentHash || ""
			}
		});
	};
	// Handler for discarding highlighted files (multi-file discard via Shift+Click)
	const handleDiscardSelected = () => {
		const filesToDiscard = filteredFiles().filter((f) => highlightedFiles().has(f.file.path)).map((f) => f.file);
		if (filesToDiscard.length > 0) {
			setDiscardFiles(filesToDiscard);
		}
	};
	// Handle single file discard confirmation
	const handleConfirmDiscard = () => {
		const file = discardFile();
		if (!file || !local.worktreePath) return;
		const isUntracked = file.status === "untracked" || file.status === "added";
		if (isUntracked) {
			deleteUntrackedMutation.mutate({
				worktreePath: local.worktreePath,
				filePath: file.path
			});
		} else {
			discardChangesMutation.mutate({
				worktreePath: local.worktreePath,
				filePath: file.path
			});
		}
		setDiscardFile(null);
	};
	// Handle multi-file discard confirmation
	const handleConfirmMultiDiscard = () => {
		const files = discardFiles();
		if (!files || files.length === 0 || !local.worktreePath) return;
		// Split files by type - untracked/added need deletion, others need checkout
		const untrackedFiles = files.filter((f: ChangedFile) => f.status === "untracked" || f.status === "added");
		const trackedFiles = files.filter((f: ChangedFile) => f.status !== "untracked" && f.status !== "added");
		// Discard tracked files (git checkout)
		if (trackedFiles.length > 0) {
			discardMultipleChangesMutation.mutate({
				worktreePath: local.worktreePath,
				filePaths: trackedFiles.map((f: ChangedFile) => f.path)
			});
		}
		// Delete untracked files
		if (untrackedFiles.length > 0) {
			deleteMultipleUntrackedMutation.mutate({
				worktreePath: local.worktreePath,
				filePaths: untrackedFiles.map((f: ChangedFile) => f.path)
			});
		}
		// Clear commit selection and highlighting for discarded files
		setSelectedForCommit((prev) => {
			const next = new Set(prev);
			for (const file of files) {
				next.delete(file.path);
			}
			return next;
		});
		setHighlightedFiles(new Set());
		setDiscardFiles(null);
	};
	// Context menu handlers
	const handleCopyPath = (filePath: string) => {
		const absolutePath = `${local.worktreePath}/${filePath}`;
		navigator.clipboard.writeText(absolutePath);
	};
	const handleCopyRelativePath = (filePath: string) => {
		navigator.clipboard.writeText(filePath);
	};
	const handleRevealInFinder = (filePath: string) => {
		const absolutePath = `${local.worktreePath}/${filePath}`;
		openInFinderMutation.mutate({ path: absolutePath });
	};
	const handleOpenInEditor = (filePath: string) => {
		const absolutePath = `${local.worktreePath}/${filePath}`;
		openInEditorMutation.mutate({
			path: absolutePath,
			cwd: local.worktreePath
		});
	};
	// Use Switch/Match for proper SolidJS reactivity (if/return doesn't re-run on signal changes)
	return (
		<Switch fallback={<>
			<div class="flex flex-col h-full">
				<Tabs value={activeTab()} onValueChange={(v: string) => {
		const newTab = v as "changes" | "history";
					setActiveTab(newTab);
					// Notify parent about tab change
					local.onActiveTabChange?.(newTab);
					// Reset selected commit when switching to Changes tab
					if (v === "changes" && local.onCommitSelect) {
						local.onCommitSelect(null);
					}
				}} class="flex flex-col h-full">
					{	/* Tab triggers */}
					<TabsList class="h-8 px-2 bg-transparent border-b border-border/50 rounded-none justify-start gap-1 shrink-0">
						<TabsTrigger value="changes" class="h-6 px-2.5 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:shadow-none">
							Changes
						</TabsTrigger>
						<TabsTrigger value="history" class="h-6 px-2.5 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:shadow-none">
							History
						</TabsTrigger>
					</TabsList>

					{ /* Changes tab content */}
					<TabsContent value="changes" class="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
						{ /* Filter */}
						<ChangesFileFilter value={fileFilter()} onChange={setFileFilter} subChats={local.subChats} selectedSubChatId={subChatFilter()} onSubChatFilterChange={setSubChatFilter} />

						{ /* Select all header */}
						<div class="flex items-center gap-2 px-2 py-1.5 border-b border-border/50">
							<Checkbox checked={someSelected() ? "indeterminate" : allSelected()} onCheckedChange={handleSelectAllChange} class="size-4 border-muted-foreground/50" />
							<span class="text-xs text-muted-foreground">
								{selectedCount()} of {totalCount()} file{totalCount() !== 1 ? "s" : ""} selected
							</span>
						</div>

						{ /* File list */}
						<Show when={totalCount() > 0} fallback={<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">No changes detected</div>}>
							<Show when={filteredCount() > 0} fallback={<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">No files match filter</div>}>
								<div ref={el => fileListRef = el} class="flex-1 overflow-y-auto outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
									<For each={filteredFiles()}>
									{({ file, category }, index) => <ChangesFileItemWithContext file={file} category={category} isSelected={selectedFile?.path === file.path} isChecked={selectedForCommit().has(file.path)} isViewed={isFileMarkedAsViewed(file.path)} isHighlighted={highlightedFiles().has(file.path)} highlightedCount={highlightedCount()} highlightedPaths={highlightedPaths()} index={index()} onSelect={() => {
										handleFileSelect(file, category);
										fileListRef?.focus();
									}} onDoubleClick={() => handleFileDoubleClick(file, category)} onCheckboxChange={() => handleCheckboxChange(file.path)} onShiftClick={handleShiftClick} onCopyPath={() => handleCopyPath(file.path)} onCopyRelativePath={() => handleCopyRelativePath(file.path)} onRevealInFinder={() => handleRevealInFinder(file.path)} onToggleViewed={() => toggleFileViewed(file.path)} onDiscard={() => setDiscardFile(file)} onDiscardSelected={handleDiscardSelected} onIncludeSelected={handleIncludeSelected} onExcludeSelected={handleExcludeSelected} onCopySelectedPaths={() => handleCopySelectedPaths(local.worktreePath)} onCopySelectedRelativePaths={handleCopySelectedRelativePaths} />}
								</For>
							</div>
						</Show>
					</Show>

						{	/* Commit input */}
					<CommitInput worktreePath={local.worktreePath} hasStagedChanges={selectedCount() > 0} onRefresh={handleRefresh} onCommitSuccess={handleCommitSuccess} stagedCount={selectedCount()} currentBranch={status()?.branch} selectedFilePaths={selectedFilePaths()} chatId={local.chatId} />
					</TabsContent>

					{ /* History tab content */}
					<TabsContent value="history" class="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
					<HistoryView worktreePath={local.worktreePath} selectedCommitHash={local.selectedCommitHash} selectedFilePath={local.selectedFilePath} onCommitSelect={local.onCommitSelect} onFileSelect={local.onCommitFileSelect} pushCount={local.pushCount} />
					</TabsContent>
				</Tabs>
			</div>

			{ /* Discard confirmation dialog - single file */}
			<AlertDialog open={!!discardFile()} onOpenChange={(open) => !open && setDiscardFile(null)}>
				<AlertDialogContent class="w-[340px]">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{discardFile()?.status === "untracked" || discardFile()?.status === "added" ? `Delete "${discardFile()?.path.split("/").pop()}"?` : `Discard changes to "${discardFile()?.path.split("/").pop()}"?`}
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription class="px-5 pb-5">
						{discardFile()?.status === "untracked" || discardFile()?.status === "added" ? "This will permanently delete this file. This action cannot be undone." : "This will revert all changes to this file. This action cannot be undone."}
					</AlertDialogDescription>
					<AlertDialogFooter>
						<Button variant="outline" size="sm" onClick={() => setDiscardFile(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
							{discardFile()?.status === "untracked" || discardFile()?.status === "added" ? "Delete" : "Discard"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{ /* Discard confirmation dialog - multiple files */}
			<AlertDialog open={!!discardFiles()} onOpenChange={(open) => !open && setDiscardFiles(null)}>
				<AlertDialogContent class="w-[400px]">
					<AlertDialogHeader>
						<AlertDialogTitle>
							Discard {discardFiles()?.length} Selected Changes?
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription asChild>
						<div class="px-5 pb-5">
							<p class="mb-2">Are you sure you want to discard all changes to:</p>
							<ul class="max-h-40 overflow-y-auto text-xs font-mono bg-muted/50 rounded-md p-2 space-y-0.5">
								<For each={discardFiles() ?? []}>
									{(f) => <li class="truncate text-muted-foreground">{f.path}</li>}
								</For>
							</ul>
						</div>
					</AlertDialogDescription>
					<AlertDialogFooter>
						<Button variant="outline" size="sm" onClick={() => setDiscardFiles(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleConfirmMultiDiscard}>
							Discard
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>}>
			<Match when={!local.worktreePath}>
				<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
					No worktree path available
				</div>
			</Match>
			<Match when={isLoading()}>
				<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
					Loading changes...
				</div>
			</Match>
			<Match when={!status()}>
				<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
					Unable to load changes
				</div>
			</Match>
		</Switch>
	);
}
