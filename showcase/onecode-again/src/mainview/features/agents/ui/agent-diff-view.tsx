import { createEffect, createMemo, createSignal, ErrorBoundary, For, onCleanup, Show, splitProps, type Component, type JSX } from "solid-js";
// Solid-compatible stubs for React APIs used in this file (no actual deferral; can be refined later)
function useDeferredValue<T>(value: T | (() => T)): T | (() => T) {
	// If it's an accessor (function), return a memo so consumers stay reactive
	if (typeof value === "function") {
		return createMemo(() => (value as () => T)()) as () => T;
	}
	return value;
}
function startTransition(callback: () => void): void {
	callback();
}
import { createPersistedSignal } from "../../../lib/state/signal-storage";
import { agentsFocusedDiffFileAtom, filteredDiffFilesAtom, viewedFilesAtomFamily, type ViewedFileState } from "../../../lib/state/agents-store";
import { FileDiff, parsePatchFiles } from "@pierre/diffs";
import { useTheme } from "../../../lib/hooks/use-theme";
import { toast } from "solid-sonner";
import { AlertTriangle, Check, ChevronDown, Columns2, Rows2 } from "lucide-solid";
import { ClipboardIcon, ExternalLinkIcon, FolderIcon, UndoIcon } from "../../../components/ui/icons";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { getFileIconByExtension } from "../mentions/agents-file-mention";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/alert-dialog";
import { Button } from "../../../components/ui/button";
import { IconSpinner, PullRequestIcon, IconChatBubble, ExpandIcon, CollapseIcon } from "../../../components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { Kbd } from "../../../components/ui/kbd";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../../components/ui/context-menu";
// e2b API routes are used instead of useSandboxManager for agents
// import { useIsHydrated } from "@/hooks/use-is-hydrated"
const useIsHydrated = () => true;
import { cn } from "../../../lib/utils";
import { isDesktopApp } from "../../../lib/utils/platform";
import { getRpc } from "../../../lib/rpc";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { remoteApi } from "../../../lib/remote-api";

// Set to true to enable verbose diff view logging
const DEBUG_AGENT_DIFF_VIEW = false;

// Simple fast string hash (djb2 algorithm) for content change detection
function hashString(str: string): string {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) + hash + str.charCodeAt(i);
	}
	// Convert to base36 for compact string representation
	return (hash >>> 0).toString(36);
}
// Error Boundary fallback renderer for DiffView parsing errors
interface DiffErrorBoundaryProps {
	children: JSX.Element;
	fileName: string;
	/** Raw diff text to show as fallback when parsing fails */
	rawDiff?: string;
}

function DiffErrorFallback(props: { rawDiff?: string }) {
	if (props.rawDiff) {
		const lines = props.rawDiff.split("\n");
		const firstHunkIdx = lines.findIndex((l) => l.startsWith("@@"));
		const contentLines = firstHunkIdx > 0 ? lines.slice(firstHunkIdx) : lines;
		return (
			<div class="text-xs font-mono overflow-x-auto">
				<For each={contentLines}>
					{(line) => {
						let cls = "block px-3 py-px min-h-[20px]";
						if (line.startsWith("+") && !line.startsWith("+++")) {
							cls += " text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";
						} else if (line.startsWith("-") && !line.startsWith("---")) {
							cls += " text-red-600 dark:text-red-400 bg-red-500/10";
						} else if (line.startsWith("@@")) {
							cls += " text-muted-foreground bg-blue-500/5 py-1 mt-1 first:mt-0";
						}
						return <code class={cls}>{line || " "}</code>;
					}}
				</For>
			</div>
		);
	}
	return (
		<div class="flex items-center gap-2 p-4 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 rounded-md">
			<AlertTriangle class="h-4 w-4 flex-shrink-0" />
			<span>
				Failed to render diff for this file. The diff format may be
				corrupted or truncated.
			</span>
		</div>
	);
}

function DiffErrorBoundary(props: DiffErrorBoundaryProps) {
	return (
		<ErrorBoundary fallback={<DiffErrorFallback rawDiff={props.rawDiff} />}>
			{props.children}
		</ErrorBoundary>
	);
}
/** Diff view mode: split (side-by-side) or unified */
export type DiffViewMode = "split" | "unified";

export type ParsedDiffFile = {
	key: string;
	oldPath: string;
	newPath: string;
	diffText: string;
	isBinary: boolean;
	additions: number;
	deletions: number;
	isValid?: boolean;
	// Extended fields from server-side parsing (optional for backwards compat)
	fileLang?: string | null;
	isNewFile?: boolean;
	isDeletedFile?: boolean;
};
export const diffViewModeAtom = createPersistedSignal<DiffViewMode>("agents-diff:view-mode", "unified");
// Validate if a diff hunk has valid structure
// This is a lenient validator - only reject clearly malformed diffs
// Don't count lines strictly since edge cases are hard to handle
const validateDiffHunk = (diffText: string): {
	valid: boolean;
	reason?: string;
} => {
	if (!diffText || diffText.trim().length === 0) {
		return {
			valid: false,
			reason: "empty diff"
		};
	}
	const lines = diffText.split("\n");
	const hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/;
	// Find the --- and +++ lines
	const minusLineIdx = lines.findIndex((l) => l.startsWith("--- "));
	const plusLineIdx = lines.findIndex((l) => l.startsWith("+++ "));
	// Must have both header lines
	if (minusLineIdx === -1 || plusLineIdx === -1) {
		return {
			valid: false,
			reason: `missing header lines`
		};
	}
	// +++ must come after ---
	if (plusLineIdx <= minusLineIdx) {
		return {
			valid: false,
			reason: `header order wrong`
		};
	}
	// Check for special cases that don't have hunks
	if (diffText.includes("new mode") || diffText.includes("old mode") || diffText.includes("rename from") || diffText.includes("rename to") || diffText.includes("Binary files")) {
		return { valid: true };
	}
	// Must have at least one hunk header after +++ line
	let hasHunk = false;
	for (let i = plusLineIdx + 1; i < lines.length; i++) {
		if (hunkHeaderRegex.test(lines[i]!)) {
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
export const splitUnifiedDiffByFile = (diffText: string): ParsedDiffFile[] => {
	const normalized = diffText.replace(/\r\n/g, "\n");
	const lines = normalized.split("\n");
	const blocks: string[] = [];
	let current: string[] = [];
	const pushCurrent = () => {
		const text = current.join("\n").trim();
		if (text && (text.startsWith("diff --git ") || text.startsWith("--- ") || text.startsWith("+++ ") || text.startsWith("Binary files ") || text.includes("\n+++ ") || text.includes("\nBinary files "))) {
			blocks.push(text);
		}
		current = [];
	};
	for (const line of lines) {
		if (line.startsWith("diff --git ") && current.length > 0) {
			pushCurrent();
		}
		current.push(line);
	}
	pushCurrent();
	return blocks.map((blockText, index) => {
		const blockLines = blockText.split("\n");
		let oldPath = "";
		let newPath = "";
		let isBinary = false;
		let additions = 0;
		let deletions = 0;
		for (const line of blockLines) {
			if (line.startsWith("Binary files ") && line.endsWith(" differ")) {
				isBinary = true;
			}
			if (line.startsWith("--- ")) {
				const raw = line.slice(4).trim();
				oldPath = raw.startsWith("a/") ? raw.slice(2) : raw;
			}
			if (line.startsWith("+++ ")) {
				const raw = line.slice(4).trim();
				newPath = raw.startsWith("b/") ? raw.slice(2) : raw;
			}
			if (line.startsWith("+") && !line.startsWith("+++ ")) {
				additions += 1;
			} else if (line.startsWith("-") && !line.startsWith("--- ")) {
				deletions += 1;
			}
		}
		const key = oldPath || newPath ? `${oldPath}->${newPath}` : `file-${index}`;
		const validation = isBinary ? { valid: true } : validateDiffHunk(blockText);
		const isValid = validation.valid;
		return {
			key,
			oldPath,
			newPath,
			diffText: blockText,
			isBinary,
			additions,
			deletions,
			isValid
		};
	});
};
/** Normalize diff text for Pierre parsePatchFiles (trailing newline, fix empty +/- lines) */
function normalizeDiffTextForPierre(diffText: string): string {
	let normalized = diffText.replace(/\n+$/, "\n");
	if (normalized.endsWith("\n+\n") || normalized.endsWith("\n-\n")) {
		normalized = normalized.slice(0, -1);
	}
	const lines = normalized.split("\n");
	const lastLine = lines[lines.length - 1];
	if (lastLine === "+" || lastLine === "-") {
		lines[lines.length - 1] = lastLine + " ";
		normalized = lines.join("\n");
	}
	return normalized;
}

interface FileDiffCardProps {
	file: ParsedDiffFile;
	isLight: boolean;
	isCollapsed: boolean;
	toggleCollapsed: (fileKey: string) => void;
	isFullExpanded: boolean;
	toggleFullExpanded: (fileKey: string) => void;
	hasContent: boolean;
	isLoadingContent: boolean;
	diffMode: DiffViewMode;
	/** Worktree path for file operations */
	worktreePath?: string;
	/** Callback to discard changes for this file */
	onDiscardFile?: (filePath: string) => void;
	/** Whether this file has been marked as viewed */
	isViewed: boolean;
	/** Callback to toggle viewed state */
	onToggleViewed: (fileKey: string, diffText: string) => void;
	/** Whether to show the viewed checkbox (hide for sandboxes) */
	showViewed?: boolean;
}

function FileDiffCard({ file, isLight, isCollapsed, toggleCollapsed, isFullExpanded, toggleFullExpanded, hasContent, isLoadingContent, diffMode, worktreePath, onDiscardFile, isViewed, onToggleViewed, showViewed = true }: FileDiffCardProps) {
	const [diffCardRef, setDiffCardRef] = createSignal<HTMLDivElement | null>(null);
	const [pierreContainerRef, setPierreContainerRef] = createSignal<HTMLDivElement | null>(null);
	// RPC for file operations
	const openInFinderMutation = (input: { path: string }) => getRpc().openInFinder(input);
	const openInEditorMutation = (input: { path: string; cwd?: string }) => getRpc().openFileInEditor(input);

	// Mount Pierre FileDiff (Vanilla JS) into container; re-run when file, theme, or mode change. Re-render when isFullExpanded toggles to get collapsed state.
	createEffect(() => {
		const container = pierreContainerRef();
		const diffText = file.diffText;
		const style = diffMode === "split" ? "split" : "unified";
		const theme = isLight ? "pierre-light" : "pierre-dark";
		const fullExpanded = isFullExpanded;
		if (!container || !diffText) return;
		let instance: InstanceType<typeof FileDiff> | null = null;
		try {
			const normalized = normalizeDiffTextForPierre(diffText);
			const patches = parsePatchFiles(normalized);
			const fileDiffMeta = patches[0]?.files[0];
			if (!fileDiffMeta) return;
			instance = new FileDiff({
				theme,
				diffStyle: style,
				expandUnchanged: fullExpanded,
			} as any);
			(instance as any).collapsedContextThreshold = fullExpanded ? 999999 : 1;
			instance.render({ fileDiff: fileDiffMeta, containerWrapper: container });
		} catch (err) {
			console.warn("[AgentDiffView] Pierre FileDiff render failed:", err);
		}
		onCleanup(() => {
			if (instance) {
				instance.cleanUp();
			}
		});
	});
	// Extract filename and directory from path
	const displayPath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath && file.oldPath !== "/dev/null" ? file.oldPath : file.key;
	const fileName = displayPath.split("/").pop() || displayPath;
	const dirPath = displayPath.includes("/") ? displayPath.substring(0, displayPath.lastIndexOf("/")) : null;
	const isNewFile = file.oldPath === "/dev/null" && file.newPath;
	const isDeletedFile = file.newPath === "/dev/null" && file.oldPath;
	// Absolute path for file operations
	const absolutePath = worktreePath ? `${worktreePath}/${displayPath}` : null;
	const handleCopyPath = async () => {
		if (absolutePath) {
			await navigator.clipboard.writeText(absolutePath);
			toast.success("Copied to clipboard", { description: absolutePath });
		}
	};
	const handleCopyRelativePath = async () => {
		await navigator.clipboard.writeText(displayPath);
		toast.success("Copied to clipboard", { description: displayPath });
	};
	const handleRevealInFinder = () => {
		if (absolutePath) {
			openInFinderMutation({ path: absolutePath });
		}
	};
	const handleOpenInEditor = () => {
		if (absolutePath && worktreePath) {
			openInEditorMutation({
				path: absolutePath,
				cwd: worktreePath
			});
		}
	};
	const handleDiscard = () => {
		if (onDiscardFile) {
			onDiscardFile(displayPath);
		}
	};
	const headerContent = <header class={cn(
		"group pl-3 pr-2 py-1 font-mono text-xs bg-muted cursor-pointer",
		// Sticky header within the scroll container
		"sticky top-0 z-10",
		"border-b transition-colors",
		"hover:bg-accent/50",
		isCollapsed ? "border-b-transparent" : "border-b-border"
	)} onClick={() => toggleCollapsed(file.key)} role="button" tabIndex={0} onKeyDown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleCollapsed(file.key);
		}
	}} aria-expanded={!isCollapsed}>
        <div class="flex items-center gap-2">
          {	/* Collapse toggle + file info */}
          <div class="flex-1 flex items-center gap-2 text-left min-w-0 min-h-[22px]">
            { /* Icon container with hover swap */}
            {(() => {
 const FileIcon = getFileIconByExtension(fileName) as Component<{ class?: string }> | null;
		return <div class="relative w-3.5 h-3.5 shrink-0">
                  {FileIcon ? <FileIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-all duration-200", "group-hover:opacity-0 group-hover:scale-75")} /> : null}
                  <ChevronDown class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-all duration-200", "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100", isCollapsed && "-rotate-90")} />
                </div>;
	})()}

            {	/* File name + path + status */}
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="font-medium text-foreground shrink-0">
                {fileName}
              </span>
                            <Show when={dirPath}><span class="text-muted-foreground truncate text-[11px] min-w-0">
                  {dirPath}
                </span></Show>
                            <Show when={isNewFile}><span class="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
                  (new)
                </span></Show>
                            <Show when={isDeletedFile}><span class="shrink-0 text-[11px] text-red-600 dark:text-red-400">
                  (deleted)
                </span></Show>
            </div>

            { /* Stats */}
            <span class="shrink-0 font-mono text-[11px] tabular-nums whitespace-nowrap">
                            <Show when={file.additions > 0}><span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                  +{file.additions}
                </span></Show>
                            <Show when={file.deletions > 0}><span class="text-red-600 dark:text-red-400">
                  -{file.deletions}
                </span></Show>
            </span>
          </div>

          { /* Expand/Collapse full file button - only show if content is available */}
                    <Show when={!isCollapsed && !file.isBinary && hasContent}><Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={(e) => {
 e.stopPropagation();
		toggleFullExpanded(file.key);
	}} class={cn("shrink-0 p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95", isFullExpanded && "bg-accent")} aria-pressed={isFullExpanded}>
                  <div class="relative w-3.5 h-3.5">
                    <ExpandIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isFullExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
                    <CollapseIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isFullExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isFullExpanded ? "Show changes only" : "Show full file"}
              </TooltipContent>
            </Tooltip></Show>
          {	/* Show loading spinner while content is being fetched */}
                    <Show when={!isCollapsed && !file.isBinary && !hasContent && isLoadingContent}><div class="shrink-0 p-1">
                <IconSpinner class="w-3.5 h-3.5 text-muted-foreground" />
              </div></Show>

          { /* Viewed checkbox with label - GitHub style (hidden for sandboxes) */}
                    <Show when={showViewed}><Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={(e) => {
 e.stopPropagation();
		onToggleViewed(file.key, file.diffText);
	}} class={cn("shrink-0 h-6 pl-1 pr-1.5 rounded-md flex items-center gap-1 transition-all duration-150 text-xs font-medium", isViewed ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")} aria-pressed={isViewed}>
                  <div class={cn("size-4 rounded flex items-center justify-center transition-all duration-150", isViewed ? "bg-primary text-primary-foreground" : "border border-muted-foreground/40")}>
                    <Show when={isViewed}><Check class="size-3" stroke-width={2.5} /></Show>
                  </div>
                  <span>Viewed</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isViewed ? "Mark as unviewed" : "Mark as viewed"}
                <Kbd>V</Kbd>
              </TooltipContent>
            </Tooltip></Show>
        </div>
      </header>;
	return <div ref={diffCardRef} class="bg-background rounded-lg border border-border overflow-clip" data-diff-file-path={file.newPath || file.oldPath}>
            <Show when={worktreePath} fallback={headerContent}><ContextMenu>
          <ContextMenuTrigger asChild>
            {headerContent}
          </ContextMenuTrigger>
          <ContextMenuContent class="w-56">
            <ContextMenuItem onClick={handleCopyPath} class="text-xs">
              <ClipboardIcon class="mr-2 size-3.5" />
              Copy File Path
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyRelativePath} class="text-xs">
              <ClipboardIcon class="mr-2 size-3.5" />
              Copy Relative File Path
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleRevealInFinder} class="text-xs">
              <FolderIcon class="mr-2 size-3.5" />
              Reveal in Finder
            </ContextMenuItem>
            <ContextMenuItem onClick={handleOpenInEditor} class="text-xs">
              <ExternalLinkIcon class="mr-2 size-3.5" />
              Open in Editor
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onToggleViewed(file.key, file.diffText)} class="text-xs justify-between">
              {isViewed ? "Mark as unviewed" : "Mark as viewed"}
              <Kbd>V</Kbd>
            </ContextMenuItem>
            <Show when={onDiscardFile && !isDeletedFile}>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDiscard} class="text-xs data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
                  Discard Changes
                </ContextMenuItem>
              </Show>
          </ContextMenuContent>
        </ContextMenu></Show>

      {	/* Content area */}
      <Show when={!isCollapsed}><div>
          <Show when={file.isBinary} fallback={
            <Show when={file.isValid} fallback={<div class="flex items-center gap-2 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
              <AlertTriangle class="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Diff format appears truncated or corrupted. Unable to render
                this file's changes.
              </span>
            </div>}>
              <div class="agent-diff-wrapper min-h-[80px]" ref={setPierreContainerRef} data-diff-mount />
            </Show>
          }>
            <div class="px-3 py-2 text-xs text-muted-foreground">
              Binary file diff can't be rendered.
            </div>
          </Show>
        </div></Show>
    </div>;
}
export interface DiffStats {
	fileCount: number;
	additions: number;
	deletions: number;
	isLoading: boolean;
	hasChanges: boolean;
}
interface AgentDiffViewProps {
	chatId: string;
	sandboxId: string;
	/** Worktree path for local file access (desktop only) */
	worktreePath?: string;
	repository?: string;
	onStatsChange?: (stats: DiffStats) => void;
	/** Pre-loaded diff content to avoid duplicate fetch */
	initialDiff?: string | null;
	/** Pre-parsed file diffs to avoid duplicate parsing (takes precedence over initialDiff) */
	initialParsedFiles?: ParsedDiffFile[] | null;
	/** Pre-fetched file contents for instant expand (desktop only) */
	prefetchedFileContents?: Record<string, string>;
	/** Whether to show the footer with Create PR button (default: true) */
	showFooter?: boolean;
	/** Callback to create PR - if provided, used instead of internal mutation */
	onCreatePr?: () => void;
	/** Whether PR is being created (for external control) */
	isCreatingPr?: boolean;
	/** Mobile mode - shows mobile-specific header */
	isMobile?: boolean;
	/** Callback to close the diff view (for mobile back button) */
	onClose?: () => void;
	/** Callback when collapsed state changes - reports if all collapsed/all expanded */
	onCollapsedStateChange?: (state: {
		allCollapsed: boolean;
		allExpanded: boolean;
	}) => void;
	/** Callback to select next file in the file list (when marking as viewed) */
	onSelectNextFile?: (filePath: string) => void;
	/** Callback when viewed count changes (for stable header updates) */
	onViewedCountChange?: (count: number) => void;
	/** Initial selected file path - used to filter on first render before atom updates */
	initialSelectedFile?: string | null;
	/** Ref callback for exposing methods to parent */
	ref?: (handle: AgentDiffViewRef) => void;
}
/** Ref handle for controlling AgentDiffView from parent */
export interface AgentDiffViewRef {
	expandAll: () => void;
	collapseAll: () => void;
	isAllCollapsed: () => boolean;
	isAllExpanded: () => boolean;
	// Viewed files methods
	getViewedCount: () => number;
	markAllViewed: () => void;
	markAllUnviewed: () => void;
}
// DEBUG: Render counter
let renderCount = 0;
export function AgentDiffView(props: AgentDiffViewProps) {
	const [local, _rest] = splitProps(props, [
		"chatId", "sandboxId", "worktreePath", "repository", "onStatsChange",
		"initialDiff", "initialParsedFiles", "prefetchedFileContents", "showFooter",
		"onCreatePr", "isCreatingPr", "isMobile", "onClose", "onCollapsedStateChange",
		"onSelectNextFile", "onViewedCountChange", "initialSelectedFile", "ref"
	]);
	const showFooter = () => local.showFooter ?? true;
	const externalOnCreatePr = () => local.onCreatePr;
	const externalIsCreatingPr = () => local.isCreatingPr;
	const isMobile = () => local.isMobile ?? false;
	// DEBUG: Log renders
	renderCount++;
	if (DEBUG_AGENT_DIFF_VIEW) console.log(`[AgentDiffView] RENDER #${renderCount}`, {
		chatId: local.chatId,
		sandboxId: local.sandboxId,
		initialDiff: local.initialDiff?.slice(0, 50),
		initialParsedFiles: local.initialParsedFiles?.length
	});
	const { resolvedTheme } = useTheme();
	const isHydrated = useIsHydrated();
	const [diff, setDiff] = createSignal(local.initialDiff ?? null);
	// Loading if initialDiff not provided, or if it's null AND no parsed files array provided
	// Note: empty array [] means "no changes", null/undefined means "still loading"
	const [isLoadingDiff, setIsLoadingDiff] = createSignal(local.initialDiff === undefined || local.initialDiff === null && !Array.isArray(local.initialParsedFiles));
	const [diffError, setDiffError] = createSignal<string | null>(null);
	// Use local state for collapsed - faster than atom for frequent updates
	const [collapsedByFileKey, setCollapsedByFileKey] = createSignal<Record<string, boolean>>({});
	const [fullExpandedByFileKey, setFullExpandedByFileKey] = createSignal<Record<string, boolean>>({});
	const [diffMode, setDiffMode] = diffViewModeAtom;
	// Discard changes state and mutation
	const [discardFilePath, setDiscardFilePath] = createSignal<string | null>(null);
	const handleDiscardFile = (filePath: string) => {
		setDiscardFilePath(filePath);
	};
	// Viewed files state for tracking reviewed files (GitHub-style)
	const [viewedFiles, setViewedFiles] = viewedFilesAtomFamily(local.chatId);
	// Undo stack for viewed actions (stores previous viewedFiles states)
	const [viewedUndoStackRef, setViewedUndoStackRef] = createSignal<Array<{
		fileKey: string;
		previousState: ViewedFileState | undefined;
	}>>([]);
	// Check if file is viewed (and content hasn't changed since marking as viewed)
	const isFileViewed = (fileKey: string, diffText: string): boolean => {
		const viewedState = viewedFiles()[fileKey];
		if (!viewedState?.viewed) return false;
		// If content hash changed, file is no longer "viewed"
		return viewedState.contentHash === hashString(diffText);
	};
	// Pre-fetched file contents for expand functionality
	// Use prefetched data if available, otherwise start empty
	const [fileContents, setFileContents] = createSignal<Record<string, string>>(local.prefetchedFileContents ?? {});
	const [isLoadingFileContents, setIsLoadingFileContents] = createSignal(false);
	// Sync with prefetched file contents when they arrive after mount
	createEffect(() => {
		if (local.prefetchedFileContents && Object.keys(local.prefetchedFileContents).length > 0) {
			setFileContents(local.prefetchedFileContents);
		}
	});
	// Focused file for scroll-to functionality
	const focusedDiffFile = agentsFocusedDiffFileAtom[0];
	const setFocusedDiffFile = agentsFocusedDiffFileAtom[1];
	const [scrollContainerRef, setScrollContainerRef] = createSignal<HTMLDivElement | null>(null);
	// Height for collapsed header (file name + stats)
	const COLLAPSED_HEIGHT = 44;
	// Estimated height for expanded diff
	const EXPANDED_HEIGHT_ESTIMATE = 300;
	// Fetch diff on mount (only if initialDiff not provided)
	createEffect(() => {
		// Skip fetch if initialDiff was provided with actual content or parsed files
		if (local.initialDiff !== undefined) {
			setDiff(local.initialDiff);
			// Only mark as not loading if we have actual data or parsed files array
			// Note: empty array [] means "no changes", null/undefined means "still loading"
			const parentStillLoading = local.initialDiff === null && !Array.isArray(local.initialParsedFiles);
			setIsLoadingDiff(parentStillLoading);
			return;
		}
		const fetchDiff = async () => {
			// Desktop: use tRPC if no sandboxId
			if (!local.sandboxId && local.chatId) {
				try {
					setIsLoadingDiff(true);
					const result = await desktopRpc.chats.getDiff({ chatId: local.chatId });
					const diffContent = result.diff || "";
					setDiff(diffContent.trim() ? diffContent : "");
				} catch (error) {
					setDiffError(error instanceof Error ? error.message : "Failed to fetch diff");
				} finally {
					setIsLoadingDiff(false);
				}
				return;
			}
			// Web: use sandbox API
			if (!local.sandboxId) {
				setDiffError("Sandbox ID is required");
				setIsLoadingDiff(false);
				return;
			}
			try {
				setIsLoadingDiff(true);
				const response = await fetch(`/api/agents/sandbox/${local.sandboxId}/diff`);
				if (!response.ok) {
					throw new Error(`Failed to fetch diff: ${response.statusText}`);
				}
				const data = await response.json();
				const diffContent = data.diff || "";
				if (diffContent.trim()) {
					setDiff(diffContent);
				} else {
					setDiff("");
				}
			} catch (error) {
				setDiffError(error instanceof Error ? error.message : "Failed to fetch diff");
			} finally {
				setIsLoadingDiff(false);
			}
		};
		fetchDiff();
	});
	const handleRefresh = async () => {
		setIsLoadingDiff(true);
		setDiffError(null);
		try {
			let diffContent = "";
			// Desktop: use tRPC to get diff from worktree
		if (local.chatId && !local.sandboxId) {
			const result = await desktopRpc.chats.getDiff({ chatId: local.chatId });
			diffContent = result.diff || "";
		} else if (local.sandboxId) {
			const response = await fetch(`/api/agents/sandbox/${local.sandboxId}/diff`);
			if (!response.ok) {
				throw new Error(`Failed to fetch diff: ${response.statusText}`);
			}
				const data = await response.json();
				diffContent = data.diff || "";
			}
			if (diffContent.trim()) {
				setDiff(diffContent);
			} else {
				setDiff("");
			}
		} catch (error) {
			setDiffError(error instanceof Error ? error.message : "Failed to fetch diff");
		} finally {
			setIsLoadingDiff(false);
		}
	};
	const isLight = isHydrated ? resolvedTheme() !== "dark" : true;
	// Read filter for sub-chat specific file filtering
	const filteredDiffFiles = filteredDiffFilesAtom[0];
	const setFilteredDiffFiles = filteredDiffFilesAtom[1];
	// Clear filter when component unmounts (not during close animation, only on actual unmount)
	onCleanup(() => {
		setFilteredDiffFiles(null);
	});
	const allFileDiffs = createMemo(() => {
		// Use pre-parsed files if provided (avoids duplicate parsing)
		if (local.initialParsedFiles && local.initialParsedFiles.length > 0) {
			return local.initialParsedFiles;
		}
		// Fall back to parsing raw diff
		const diffVal = diff();
		if (!diffVal) return [];
		try {
			return splitUnifiedDiffByFile(diffVal);
		} catch {
			return [];
		}
	});
	// Filter files if filteredDiffFiles is set (for sub-chat Review)
	// Use initialSelectedFile as fallback for first render before atom updates
	const effectiveFilter = filteredDiffFiles() ?? (local.initialSelectedFile ? [local.initialSelectedFile] : null);
	const fileDiffs = createMemo(() => {
		// First, filter out invalid files without proper paths (file-N keys indicate parse failure)
		const validFiles = allFileDiffs().filter((file: ParsedDiffFile) => {
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
		const validFilterPaths = effectiveFilter?.filter((p: string) => p && p !== "/dev/null") || [];
		if (validFilterPaths.length === 0) {
			return validFiles;
		}
		// Filter to only show files matching the filter paths
		return validFiles.filter((file: ParsedDiffFile) => {
			// Use the actual file path (prefer newPath for new/modified, oldPath for deleted)
			const filePath = file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
			// Match by exact path or by path suffix (to handle sandbox path prefixes)
			return validFilterPaths.some((filterPath: string) => filePath === filterPath || filePath.endsWith(filterPath) || filterPath.endsWith(filePath));
		});
	});
	// Handle discard confirmation
	const handleConfirmDiscard = async () => {
		if (!discardFilePath() || !local.worktreePath) return;
		try {
			// Check if this is a new file (untracked) - needs delete instead of discard
			const file = fileDiffs().find((f: ParsedDiffFile) => {
				const path = f.newPath !== "/dev/null" ? f.newPath : f.oldPath;
				return path === discardFilePath();
			});
			const isNewFile = file?.oldPath === "/dev/null";
			if (isNewFile) {
				await desktopRpc.changes.deleteUntracked.mutate({
					worktreePath: local.worktreePath,
					filePath: discardFilePath()!,
				});
			} else {
				await desktopRpc.changes.discardChanges.mutate({
					worktreePath: local.worktreePath,
					filePath: discardFilePath()!,
				});
			}
			toast.success("Changes discarded");
			// Refresh the diff
			handleRefresh();
		} catch (error) {
			toast.error(`Failed to discard: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setDiscardFilePath(null);
		}
	};
	// Expand/collapse all functions - exposed via ref for parent control
	// Uses batched updates to avoid blocking UI with many files
	const expandAll = () => {
		// For small number of files, expand all at once
		if (fileDiffs().length <= 10) {
			startTransition(() => {
				const expandedState: Record<string, boolean> = {};
				for (const file of fileDiffs()) {
					expandedState[file.key] = false;
				}
				setCollapsedByFileKey(expandedState);
			});
			return;
		}
		// For many files, expand in batches to avoid UI freeze
		const BATCH_SIZE = 5;
		let currentBatch = 0;
		const expandBatch = () => {
			const start = currentBatch * BATCH_SIZE;
			const end = Math.min(start + BATCH_SIZE, fileDiffs().length);
			if (start >= fileDiffs().length) return;
			startTransition(() => {
				setCollapsedByFileKey((prev) => {
					const next = { ...prev };
					for (let i = start; i < end; i++) {
						const file = fileDiffs()[i];
						if (file) next[file.key] = false;
					}
					return next;
				});
			});
			currentBatch++;
			if (currentBatch * BATCH_SIZE < fileDiffs().length) {
				// Use requestAnimationFrame for next batch to allow UI to breathe
				requestAnimationFrame(() => setTimeout(expandBatch, 0));
			}
		};
		expandBatch();
	};
	const collapseAll = () => {
		// Collapse is fast - no batching needed
		startTransition(() => {
			const collapsedState: Record<string, boolean> = {};
			for (const file of fileDiffs()) {
				collapsedState[file.key] = true;
			}
			setCollapsedByFileKey(collapsedState);
		});
	};
	// Check if all files are collapsed/expanded
	const isAllCollapsed = () => {
		if (fileDiffs().length === 0) return true;
		return fileDiffs().every((file: ParsedDiffFile) => collapsedByFileKey()[file.key] === true);
	};
	const isAllExpanded = () => {
		if (fileDiffs().length === 0) return true;
		return fileDiffs().every((file: ParsedDiffFile) => !collapsedByFileKey()[file.key]);
	};
	// Get count of viewed files (with matching content hash)
	const getViewedCount = () => {
		return fileDiffs().filter((file: ParsedDiffFile) => isFileViewed(file.key, file.diffText)).length;
	};
	// Mark all files as viewed and collapse them
	const markAllViewed = () => {
		const newViewedState: Record<string, ViewedFileState> = {};
		const newCollapsedState: Record<string, boolean> = {};
		for (const file of fileDiffs()) {
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
	const markAllUnviewed = () => {
		setViewedFiles({});
		const newCollapsedState: Record<string, boolean> = {};
		for (const file of fileDiffs()) {
			newCollapsedState[file.key] = false;
		}
		setCollapsedByFileKey(newCollapsedState);
	};
	// Expose expand/collapse methods to parent via ref callback
	const handle: AgentDiffViewRef = {
		expandAll,
		collapseAll,
		isAllCollapsed,
		isAllExpanded,
		getViewedCount,
		markAllViewed,
		markAllUnviewed
	};
	local.ref?.(handle);
	// Notify parent when collapsed state changes
	const [prevCollapseStateRef, setPrevCollapseStateRef] = createSignal<{
		allCollapsed: boolean;
		allExpanded: boolean;
	} | null>(null);
	createEffect(() => {
		const newState = {
			allCollapsed: isAllCollapsed(),
			allExpanded: isAllExpanded()
		};
		// Only notify if state actually changed
		const prev = prevCollapseStateRef();
		if (prev?.allCollapsed !== newState.allCollapsed || prev?.allExpanded !== newState.allExpanded) {
			setPrevCollapseStateRef(newState);
			local.onCollapsedStateChange?.(newState);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable, excluding to prevent loops
	});
	// Notify parent when viewed count changes
	const [prevViewedCountRef, setPrevViewedCountRef] = createSignal<number | null>(null);
	createEffect(() => {
		const count = getViewedCount();
		if (prevViewedCountRef() !== count) {
			setPrevViewedCountRef(count);
			local.onViewedCountChange?.(count);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable, excluding to prevent loops
	});
	// Auto-expand all files with lazy batching for performance
	// Track if we've already initialized the collapsed state for this set of files
	const [prevFileKeysRef, setPrevFileKeysRef] = createSignal<string>("");
	const [isExpandingRef, setIsExpandingRef] = createSignal(false);
	createEffect(() => {
		// Generate a unique key for the current file set
		const currentFileKeys = fileDiffs().map((f: ParsedDiffFile) => f.key).join(",");
		// Only update if the file set changed and we're not already expanding
		if (currentFileKeys !== prevFileKeysRef() && !isExpandingRef()) {
			setPrevFileKeysRef(currentFileKeys);
			// For small number of files, expand all at once
			if (fileDiffs().length <= 10) {
				startTransition(() => {
					const expandedState: Record<string, boolean> = {};
					for (const file of fileDiffs()) {
						expandedState[file.key] = false;
					}
					setCollapsedByFileKey(expandedState);
				});
				return;
			}
			// For many files, expand in batches to avoid UI freeze
			setIsExpandingRef(true);
			const BATCH_SIZE = 5;
			let currentBatch = 0;
			const expandBatch = () => {
				const start = currentBatch * BATCH_SIZE;
				const end = Math.min(start + BATCH_SIZE, fileDiffs().length);
				if (start >= fileDiffs().length) {
					setIsExpandingRef(false);
					return;
				}
				startTransition(() => {
					setCollapsedByFileKey((prev) => {
						const next = { ...prev };
						for (let i = start; i < end; i++) {
							const file = fileDiffs()[i];
							if (file) next[file.key] = false;
						}
						return next;
					});
				});
				currentBatch++;
				if (currentBatch * BATCH_SIZE < fileDiffs().length) {
					// Use requestAnimationFrame for next batch to allow UI to breathe
					requestAnimationFrame(() => setTimeout(expandBatch, 0));
				} else {
					setIsExpandingRef(false);
				}
			};
			expandBatch();
		}
	});
	// Use deferred value for file list to prevent UI blocking during tab switches
	const deferredFileDiffs = useDeferredValue(fileDiffs) as () => ParsedDiffFile[];
	const isDiffStale = () => deferredFileDiffs() !== fileDiffs();
	// Pre-fetch file contents when diff is loaded (for expand functionality)
	// Delayed to allow UI to render first, then fetch in background
	// Limited to prevent overwhelming the system with too many parallel requests
	const MAX_PREFETCH_FILES = 20;
	createEffect(() => {
		// Desktop: use worktreePath, Web: use sandboxId
		if (DEBUG_AGENT_DIFF_VIEW) {
			console.log("[AgentDiffView] File content effect:", {
				fileDiffsCount: fileDiffs().length,
				isLoadingFileContents: isLoadingFileContents(),
				worktreePath: !!local.worktreePath,
				sandboxId: local.sandboxId,
				existingContents: Object.keys(fileContents).length
			});
		}
		if (fileDiffs().length === 0 || isLoadingFileContents()) return;
		if (!local.worktreePath && !local.sandboxId) return;
		// Skip if we already have enough contents
		const existingContentCount = Object.keys(fileContents()).length;
		if (existingContentCount >= Math.min(fileDiffs().length, MAX_PREFETCH_FILES)) return;
		if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Will fetch file contents...");
		const fetchAllContents = async () => {
			setIsLoadingFileContents(true);
			try {
				// Limit files to prefetch to prevent overwhelming the system
				const filesToProcess = fileDiffs().slice(0, MAX_PREFETCH_FILES);
				// Build list of files to fetch (filter out /dev/null)
				const filesToFetch = filesToProcess.map((file: ParsedDiffFile) => {
					const filePath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
					if (!filePath || filePath === "/dev/null") return null;
					return {
						key: file.key,
						filePath
					};
				}).filter((f: { key: string; filePath: string } | null): f is {
					key: string;
					filePath: string;
				} => f !== null);
				if (filesToFetch.length === 0) {
					setIsLoadingFileContents(false);
					return;
				}
				// Desktop: fetch each file via RPC (no batch readMultipleWorkingFiles in Electrobun RPC)
				if (local.worktreePath) {
					const settled = await Promise.allSettled(
						filesToFetch.map(async ({ key, filePath }) => {
							try {
								const content = await getRpc().filesRead({ filePath });
								return { key, ok: true as const, content };
							} catch {
								return { key, ok: false as const, content: "" };
							}
						}),
					);
					const newContents: Record<string, string> = {};
					for (const result of settled) {
						if (result.status === "fulfilled" && result.value.ok) {
							newContents[result.value.key] = result.value.content;
						}
					}
					setFileContents(newContents);
				} else if (local.sandboxId) {
					// Sandbox: use remoteApi on desktop, relative fetch on web
					if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Fetching file contents for sandbox, isDesktop:", isDesktopApp());
					const results = await Promise.allSettled(filesToFetch.map(async ({ key, filePath }) => {
						if (isDesktopApp()) {
							// Desktop: use signedFetch via remoteApi
							const data = await remoteApi.getSandboxFile(local.sandboxId!, filePath);
							return {
								key,
								content: data.content
							};
						} else {
							// Web: use relative fetch
							const response = await Promise.race([fetch(`/api/agents/sandbox/${local.sandboxId}/files?path=${encodeURIComponent(filePath)}`), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5e3))]);
							if (!response.ok) throw new Error("Failed to fetch file");
							const data = await response.json();
							return {
								key,
								content: data.content
							};
						}
					}));
					if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] File content results:", results.length, "files");
					const newContents: Record<string, string> = {};
					for (const result of results) {
						if (result.status === "fulfilled" && result.value?.content) {
							newContents[result.value.key] = result.value.content;
						}
					}
					if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Setting file contents:", Object.keys(newContents).length, "files");
					setFileContents(newContents);
				}
			} catch (error) {
				console.error("Failed to prefetch file contents:", error);
			} finally {
				setIsLoadingFileContents(false);
			}
		};
		fetchAllContents();
	});
	const toggleFileCollapsed = (fileKey: string) => {
		setCollapsedByFileKey((prev) => ({
			...prev,
			[fileKey]: !prev[fileKey]
		}));
	};
	const toggleFileFullExpanded = (fileKey: string) => {
		setFullExpandedByFileKey((prev) => ({
			...prev,
			[fileKey]: !prev[fileKey]
		}));
	};
	// Virtualizer for efficient rendering of many files (Solid)
	const virtualizer = createVirtualizer({
		get count() {
			return deferredFileDiffs().length;
		},
		getScrollElement: () => scrollContainerRef(),
		estimateSize: (index) => {
			const files = deferredFileDiffs();
			const file = files[index];
			if (!file) return COLLAPSED_HEIGHT;
			const collapsed = collapsedByFileKey();
			const isCollapsed = !!collapsed[file.key];
			if (isCollapsed) return COLLAPSED_HEIGHT;
			const lineCount = file.additions + file.deletions;
			return Math.min(Math.max(lineCount * 22 + COLLAPSED_HEIGHT, 150), 800);
		},
		overscan: 3
	});
	// Toggle viewed state for a file
	// When marking as viewed, auto-navigate to the next UNVIEWED file
	// Uses allFileDiffs (unfiltered list) for navigation since filtered list may only contain current file
	const handleToggleViewed = (fileKey: string, diffText: string) => {
		const currentHash = hashString(diffText);
		const isCurrentlyViewed = isFileViewed(fileKey, diffText);
		const willBeViewed = !isCurrentlyViewed;
		// Save to undo stack before changing
		setViewedUndoStackRef((prev) => {
			const newStack = [...prev, { fileKey, previousState: viewedFiles()[fileKey] }];
			// Limit undo stack size to 50
			return newStack.length > 50 ? newStack.slice(1) : newStack;
		});
		// Build new viewed state
		const newViewedFiles = {
			...viewedFiles(),
			[fileKey]: {
				viewed: willBeViewed,
				contentHash: currentHash
			}
		};
		setViewedFiles(newViewedFiles);
		// Helper to check if file is viewed using new state (not stale closure)
		const isFileViewedWithNewState = (fKey: string, fDiffText: string): boolean => {
			const viewedState = newViewedFiles[fKey];
			if (!viewedState?.viewed) return false;
			return viewedState.contentHash === hashString(fDiffText);
		};
		// When marking as viewed, find and select next UNVIEWED file
		// Use allFileDiffs (unfiltered) for navigation, since filtered list may only show current file
		if (willBeViewed && local.onSelectNextFile) {
			const currentIndex = allFileDiffs().findIndex((f: ParsedDiffFile) => f.key === fileKey);
			if (currentIndex === -1) return;
			// Find next unviewed file after current position
			let nextUnviewedFile: ParsedDiffFile | null = null;
			for (let i = currentIndex + 1; i < allFileDiffs().length; i++) {
				const file = allFileDiffs()[i];
				if (file && !isFileViewedWithNewState(file.key, file.diffText)) {
					nextUnviewedFile = file;
					break;
				}
			}
			// If no unviewed file found after current, wrap around and search from beginning
			if (!nextUnviewedFile) {
				for (let i = 0; i < currentIndex; i++) {
					const file = allFileDiffs()[i];
					if (file && !isFileViewedWithNewState(file.key, file.diffText)) {
						nextUnviewedFile = file;
						break;
					}
				}
			}
			// If found an unviewed file, select it
			if (nextUnviewedFile) {
				// Get the actual file path (newPath for new/modified files, oldPath for deleted files)
				const filePath = nextUnviewedFile.newPath && nextUnviewedFile.newPath !== "/dev/null" ? nextUnviewedFile.newPath : nextUnviewedFile.oldPath;
				if (filePath && filePath !== "/dev/null") {
					// Select next file - this will update the filter and diff view
					local.onSelectNextFile(filePath);
				}
			}
		}
	};
	// Undo last viewed action
	const undoLastViewed = () => {
		const stack = viewedUndoStackRef();
		if (stack.length === 0) return false;
		const lastAction = stack[stack.length - 1];
		setViewedUndoStackRef(stack.slice(0, -1));
		const { fileKey, previousState } = lastAction;
		if (previousState === undefined) {
			// File wasn't in viewedFiles before - remove it
			const newViewedFiles = { ...viewedFiles() };
			delete newViewedFiles[fileKey];
			setViewedFiles(newViewedFiles);
		} else {
			// Restore previous state
			setViewedFiles({
				...viewedFiles(),
				[fileKey]: previousState
			});
		}
		// Navigate back to the file that was undone
		const file = allFileDiffs().find((f: ParsedDiffFile) => f.key === fileKey);
		if (file && local.onSelectNextFile) {
			const filePath = file.newPath && file.newPath !== "/dev/null" ? file.newPath : file.oldPath;
			if (filePath && filePath !== "/dev/null") {
				local.onSelectNextFile(filePath);
			}
		}
		return true;
	};
	// Use ALL files for stats, not filtered ones (to avoid overwriting parent's stats when filtering)
	const totalAdditions = allFileDiffs().reduce((sum: number, f: ParsedDiffFile) => sum + f.additions, 0);
	const totalDeletions = allFileDiffs().reduce((sum: number, f: ParsedDiffFile) => sum + f.deletions, 0);
	// Report stats to parent - only when we have actual data and NO filter active
	// When filtering is active, parent already has correct stats from fetchDiffStats
	const [prevStatsRef, setPrevStatsRef] = createSignal<{
		fileCount: number;
		additions: number;
		deletions: number;
		isLoading: boolean;
	} | null>(null);
	createEffect(() => {
		if (DEBUG_AGENT_DIFF_VIEW) {
			console.log("[AgentDiffView] onStatsChange useEffect running", {
				filteredDiffFiles: filteredDiffFiles()?.length,
				allFileDiffsLength: allFileDiffs().length,
				isLoadingDiff: isLoadingDiff(),
				totalAdditions,
				totalDeletions,
				prevStats: prevStatsRef()
			});
		}
		// Don't report stats when filtering is active - parent already has correct totals
		if (filteredDiffFiles() && filteredDiffFiles()!.length > 0) {
			if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Early return: filtering active");
			return;
		}
		if (allFileDiffs().length === 0 && !isLoadingDiff()) {
			// Don't report empty stats - let parent's fetchDiffStats be the source of truth
			if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Early return: no files and not loading");
			return;
		}
		// Only notify if stats actually changed
		const prev = prevStatsRef();
		if (prev?.fileCount === allFileDiffs().length && prev?.additions === totalAdditions && prev?.deletions === totalDeletions && prev?.isLoading === isLoadingDiff()) {
			if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] Early return: stats unchanged");
			return;
		}
		if (DEBUG_AGENT_DIFF_VIEW) console.log("[AgentDiffView] CALLING onStatsChange!", {
			fileCount: allFileDiffs().length,
			additions: totalAdditions,
			deletions: totalDeletions,
			isLoading: isLoadingDiff()
		});
		setPrevStatsRef({
			fileCount: allFileDiffs().length,
			additions: totalAdditions,
			deletions: totalDeletions,
			isLoading: isLoadingDiff()
		});
		local.onStatsChange?.({
			fileCount: allFileDiffs().length,
			additions: totalAdditions,
			deletions: totalDeletions,
			isLoading: isLoadingDiff(),
			hasChanges: allFileDiffs().length > 0
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps -- onStatsChange is stable setState, excluding to prevent loops
	});
	// DEBUG: Detect when diff view should render but doesn't
	// This helps diagnose issues where changes exist but diff view shows "No changes detected"
	createEffect(() => {
		// Only run diagnostic after initial load is complete
		if (isLoadingDiff()) return;
		const diffVal = diff();
		const hasRawDiff = diffVal && diffVal.trim().length > 0;
		const hasParsedFiles = local.initialParsedFiles && local.initialParsedFiles.length > 0;
		const hasAllFiles = allFileDiffs().length > 0;
		const hasFilteredFiles = fileDiffs().length > 0;
		const hasVirtualItems = virtualizer.getVirtualItems().length > 0;
		// Case 1: We have raw diff but no parsed files
		if (hasRawDiff && !hasAllFiles) {
			console.error("[DiffView Debug] Raw diff exists but parsing failed:", {
				diffLength: diffVal?.length,
				diffPreview: diffVal?.slice(0, 200)
			});
		}
		// Case 2: We have parsed files but filter excludes all of them
		if (hasAllFiles && !hasFilteredFiles && effectiveFilter) {
			console.error("[DiffView Debug] All files filtered out:", {
				allFilesCount: allFileDiffs().length,
				allFilePaths: allFileDiffs().map((f: ParsedDiffFile) => f.newPath || f.oldPath),
				filter: effectiveFilter
			});
		}
		// Case 3: We have filtered files but virtualizer shows nothing
		if (hasFilteredFiles && !hasVirtualItems) {
			console.error("[DiffView Debug] Files exist but virtualizer renders nothing:", {
				filteredFilesCount: fileDiffs().length,
				scrollContainerExists: !!scrollContainerRef(),
				scrollContainerHeight: scrollContainerRef()?.clientHeight,
				virtualizerTotalSize: virtualizer.getTotalSize()
			});
		}
		// Case 4: Initial data provided but not being used
		if (hasParsedFiles && !hasAllFiles) {
			console.error("[DiffView Debug] initialParsedFiles provided but not used:", {
				initialParsedFilesCount: local.initialParsedFiles?.length,
				initialParsedFilesPaths: local.initialParsedFiles?.map((f) => f.newPath || f.oldPath)
			});
		}
	});
	// Scroll to focused file when atom changes (works with virtualized list)
	createEffect(() => {
		const focused = focusedDiffFile();
		if (!focused || isLoadingDiff()) {
			return;
		}
		// Find the file index in the list
		let fileIndex = -1;
		// Try exact match first
		fileIndex = fileDiffs().findIndex((f: ParsedDiffFile) => f.newPath === focused || f.oldPath === focused);
		// If not found, try matching by file ending
		if (fileIndex === -1) {
			fileIndex = fileDiffs().findIndex((f: ParsedDiffFile) => {
				const path = f.newPath || f.oldPath || "";
				return path.endsWith(focused) || focused.endsWith(path);
			});
		}
		if (fileIndex >= 0) {
			// Expand the file if it's collapsed first
			const file = fileDiffs()[fileIndex];
			if (file && collapsedByFileKey()[file.key]) {
				setCollapsedByFileKey((prev) => ({
					...prev,
					[file.key]: false
				}));
			}
			// Use virtualizer's scrollToIndex for proper scrolling
			virtualizer.scrollToIndex(fileIndex, { align: "start" });
			// Add highlight effect after scroll completes
			setTimeout(() => {
				const container = scrollContainerRef();
				if (container) {
					const fileCard = container.querySelector(`[data-diff-file-path="${focused}"]`) as HTMLElement | null;
					if (fileCard) {
						fileCard.style.transition = "box-shadow 0.3s ease";
						fileCard.style.boxShadow = "0 0 0 2px hsl(var(--primary)), 0 0 12px hsl(var(--primary) / 0.3)";
						setTimeout(() => {
							fileCard.style.boxShadow = "";
						}, 1500);
					}
				}
			}, 100);
		}
		// Clear the focused file atom
		setFocusedDiffFile(null);
	});
	// Keyboard shortcut: V to mark current file as viewed
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Use e.code for physical key position (works with any keyboard layout)
			if (e.code !== "KeyV") return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			// Don't trigger if typing in input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return;
			}
			// Find currently visible file and toggle its viewed state
			// Use the first visible file in the virtualizer viewport
			const visibleItems = virtualizer.getVirtualItems();
			if (visibleItems.length === 0) return;
			const firstVisibleIndex = visibleItems[0]?.index ?? -1;
			if (firstVisibleIndex < 0) return;
			const file = deferredFileDiffs()[firstVisibleIndex];
			if (file) {
				e.preventDefault();
				handleToggleViewed(file.key, file.diffText);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Keyboard shortcut: Cmd+Z to undo last viewed action
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Use e.code for physical key position (works with any keyboard layout)
			if (e.code !== "KeyZ") return;
			if (!e.metaKey || e.shiftKey || e.altKey) return;
			// Don't trigger if typing in input/textarea
			const target = e.target as HTMLElement;
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
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	if (!isHydrated) {
		return <div class="flex h-full items-center justify-center">
          <IconSpinner class="w-4 h-4" />
        </div>;
	}
	return <div class={cn("flex flex-col bg-background overflow-hidden min-w-0", isMobile() ? "h-full w-full" : "h-full")}>
                {	/* Mobile Header */}
		<Show when={isMobile()}><div class="flex-shrink-0 bg-background/95 backdrop-blur border-b h-11 min-h-[44px] max-h-[44px]" data-mobile-diff-header style={{ "-webkit-app-region": "drag" } as any}>
            <div class="flex h-full items-center px-2 gap-2" style={{ "-webkit-app-region": "no-drag" } as any}>
              { /* Back to chat button */}
				<Button variant="ghost" size="icon" onClick={local.onClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
                <IconChatBubble class="h-4 w-4" />
                <span class="sr-only">Back to chat</span>
              </Button>

              { /* Stats - centered */}
              <div class="flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Show when={!isLoadingDiff() && fileDiffs().length > 0}>
                    <span class="font-mono">
                      {fileDiffs().length} file{fileDiffs().length !== 1 ? "s" : ""}
                    </span>
                    <Show when={totalAdditions > 0 || totalDeletions > 0}>
                        <span class="text-emerald-600 dark:text-emerald-400">
                          +{totalAdditions}
                        </span>
                        <span class="text-red-600 dark:text-red-400">
                          -{totalDeletions}
                        </span>
                      </Show>
                  </Show>
              </div>

              { /* Split/Unified toggle */}
              <div class="relative bg-muted rounded-md h-7 p-0.5 flex">
                <div class="absolute inset-y-0.5 rounded bg-background shadow transition-all duration-200 ease-in-out" style={{
                width: "calc(50% - 2px)",
                left: diffMode() === "split" ? "2px" : "calc(50%)"
                }} />
                <button onClick={() => setDiffMode("split")} class="relative z-[2] px-1.5 flex items-center justify-center transition-colors duration-200 rounded text-muted-foreground" title="Split view">
                  <Columns2 class="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setDiffMode("unified")} class="relative z-[2] px-1.5 flex items-center justify-center transition-colors duration-200 rounded text-muted-foreground" title="Unified view">
                  <Rows2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div></Show>

        {	/* Content */}
        <div ref={setScrollContainerRef} class="relative flex-1 overflow-auto p-2 select-text">
          { /* Sticky cover to hide content scrolling above cards */}
          <div class="sticky top-0 left-0 right-0 h-0 z-20 pointer-events-none" aria-hidden="true">
            <div class="absolute -top-2 left-0 right-0 h-2 bg-background" />
          </div>


          <Show when={isLoadingDiff() || isLoadingFileContents() && fileDiffs().length === 0} fallback={
            <Show when={diffError()} fallback={
              <Show when={deferredFileDiffs().length > 0} fallback={<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center h-full">
              No changes detected
            </div>}>
                <div style={{
 height: `${virtualizer.getTotalSize()}px`,
		width: "100%",
		position: "relative",
		opacity: isDiffStale() ? .7 : 1,
		transition: "opacity 150ms ease-out"
	}}>
              <For each={virtualizer.getVirtualItems()}>{(virtualRow) => {
		const file = deferredFileDiffs()[virtualRow.index]!;
		return <div data-index={virtualRow.index} ref={(node) => node && virtualizer.measureElement(node)} style={{
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			transform: `translateY(${virtualRow.start}px)`
		}}>
                    <div class="pb-2">
						<FileDiffCard file={file} isLight={isLight} isCollapsed={!!collapsedByFileKey()[file.key]} toggleCollapsed={toggleFileCollapsed} isFullExpanded={!!fullExpandedByFileKey()[file.key]} toggleFullExpanded={toggleFileFullExpanded} hasContent={!!fileContents()[file.key]} isLoadingContent={isLoadingFileContents()} diffMode={diffMode()} worktreePath={local.worktreePath} onDiscardFile={handleDiscardFile} isViewed={isFileViewed(file.key, file.diffText)} onToggleViewed={handleToggleViewed} showViewed={!!local.worktreePath} />
                    </div>
                  </div>;
	}}</For>
            </div>
              </Show>
            }>
              <div class="flex flex-col items-center justify-center h-full text-center px-4">
              <p class="text-sm text-red-500 mb-2">{diffError()}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try again
              </Button>
            </div>
            </Show>
          }>
            <div class="flex items-center justify-center h-full">
              <IconSpinner class="w-4 h-4" />
            </div>
          </Show>
        </div>

        {	/* Discard confirmation dialog */}
        <AlertDialog open={!!discardFilePath()} onOpenChange={(open) => !open && setDiscardFilePath(null)}>
          <AlertDialogContent class="w-[340px]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Discard changes to "{discardFilePath()?.split("/").pop()}"?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription class="px-5 pb-5">
              This will revert all changes to this file. This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDiscardFilePath(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
                Discard
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>;
}
