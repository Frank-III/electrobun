import { createSignal, createEffect, For, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpRight } from "lucide-solid";
import { DiffIcon } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useResolvedHotkeyDisplay } from "@/lib/hotkeys";
import { viewedFilesAtomFamily } from "@/features/agents/atoms";
import { FileListItem, getFileName, getFileDir } from "@/features/changes/components/file-list-item";
import { useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "@/lib/desktop-rpc";
import type { ParsedDiffFile } from "../types";
interface ChangesWidgetProps {
	chatId: string;
	worktreePath?: string | null;
	diffStats?: {
		additions: number;
		deletions: number;
		fileCount: number;
	} | null;
	parsedFileDiffs?: ParsedDiffFile[] | null;
	onCommit?: (selectedPaths: string[]) => void;
	isCommitting?: boolean;
	onExpand?: () => void;
	/** Called when a file is clicked - should open diff sidebar with this file selected */
	onFileSelect?: (filePath: string) => void;
	/** Diff display mode - affects tooltip text */
	diffDisplayMode?: "side-peek" | "center-peek" | "full-page";
}
/**
* Map parsed diff file status to FileStatus type for getStatusIndicator
*/
function getFileStatus(file: ParsedDiffFile): "added" | "modified" | "deleted" | "renamed" {
	if (file.isNewFile) return "added";
	if (file.isDeletedFile) return "deleted";
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
export function ChangesWidget({ chatId, worktreePath, diffStats, parsedFileDiffs, onCommit, isCommitting = false, onExpand, onFileSelect, diffDisplayMode = "side-peek" }: ChangesWidgetProps) {
	// Data is now cached at the ActiveChat level via workspaceDiffCacheAtomFamily
	// So parsedFileDiffs and diffStats persist across workspace switches
	const displayFiles = parsedFileDiffs ?? [];
	const displayStats = diffStats;
	const hasChanges = displayStats && displayStats.fileCount > 0;
	// Get tooltip text based on diff display mode
	const expandTooltip = diffDisplayMode === "side-peek" ? "Open in sidebar" : diffDisplayMode === "center-peek" ? "Open in dialog" : "Open fullscreen";
	// Resolved hotkey for tooltip
	const openDiffHotkey = useResolvedHotkeyDisplay("open-diff");
	// Viewed files state (same atom as diff sidebar)
	const [viewedFiles] = viewedFilesAtomFamily(chatId);
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (input: { path: string }) => desktopRpc.external.openInFinder.mutate(input),
	}));
	// Selection state - all files selected by default
	const [selectedForCommit, setSelectedForCommit] = createSignal(new Set());
	const [hasInitializedSelection, setHasInitializedSelection] = createSignal(false);
	// Helper to get display path (handles /dev/null for deleted files)
	const getDisplayPath = (file: ParsedDiffFile): string => {
		if (file.newPath && file.newPath !== "/dev/null") {
			return file.newPath;
		}
		if (file.oldPath && file.oldPath !== "/dev/null") {
			return file.oldPath;
		}
		return file.newPath || file.oldPath;
	};
	// Initialize selection - select all files by default when data loads
	createEffect(() => {
		if (!hasInitializedSelection() && displayFiles.length > 0) {
			const allPaths = new Set(displayFiles.map((f) => getDisplayPath(f)));
			setSelectedForCommit(allPaths);
			setHasInitializedSelection(true);
		}
	});
	// Reset selection when files change significantly
	createEffect(() => {
		if (displayFiles.length === 0) {
			setHasInitializedSelection(false);
			setSelectedForCommit(new Set());
		}
	});
	// Check if file is marked as viewed
	const isFileMarkedAsViewed = (filePath: string): boolean => {
		const possibleKeys = [
			`${filePath}->${filePath}`,
			`/dev/null->${filePath}`,
			`${filePath}->/dev/null`
		];
		for (const key of possibleKeys) {
			const viewedState = viewedFiles[key];
			if (viewedState?.viewed) {
				return true;
			}
		}
		return false;
	};
	// Toggle individual file selection
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
	// Selection stats - use getDisplayPath consistently for all path operations
	const selectedCount = displayFiles.filter((f) => selectedForCommit.has(getDisplayPath(f))).length;
	const allSelected = displayFiles.length > 0 && selectedCount === displayFiles.length;
	const someSelected = selectedCount > 0 && selectedCount < displayFiles.length;
	// Toggle all files selection
	const handleSelectAllChange = () => {
		if (allSelected) {
			setSelectedForCommit(new Set());
		} else {
			const allPaths = new Set(displayFiles.map((f) => getDisplayPath(f)));
			setSelectedForCommit(allPaths);
		}
	};
	// Handle commit
	const handleCommit = () => {
		const selectedPaths = displayFiles.filter((f) => selectedForCommit.has(getDisplayPath(f))).map((f) => getDisplayPath(f));
		onCommit?.(selectedPaths);
	};
	return <div class="mx-2 mb-2">
      <div class={cn("rounded-lg border border-border/50 overflow-hidden")}>
        {	/* Widget Header with stats - fixed height h-8 for consistency */}
        <div class="flex items-center gap-2 px-2 h-8 select-none group bg-muted/30">
          { /* Icon */}
          <DiffIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

          { /* Title */}
          <span class="text-xs font-medium text-foreground">Changes</span>

          { /* Stats in header - total lines changed */}
          <Show when={hasChanges && displayStats}>
              <span class="text-xs text-muted-foreground">
                <span class="text-green-500">+{displayStats!.additions}</span>
                {" "}
                <span class="text-red-500">-{displayStats!.deletions}</span>
              </span>
            </Show>

          { /* Spacer */}
          <div class="flex-1" />

          { /* Expand to sidebar button */}
          <Show when={onExpand}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label="Expand changes">
                    <ArrowUpRight class="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {expandTooltip}
                  <Show when={openDiffHotkey}><Kbd>{openDiffHotkey}</Kbd></Show>
                </TooltipContent>
              </Tooltip>
            </Show>
        </div>

        { /* Content */}
        {hasChanges ? <>
            { /* Select all header - like in changes-view */}
            <div class="flex items-center gap-2 px-2 py-1.5 border-b border-border/50">
              <Checkbox checked={someSelected ? "indeterminate" : allSelected} onCheckedChange={handleSelectAllChange} class="size-4 border-muted-foreground/50" />
              <span class="text-xs text-muted-foreground">
                {selectedCount} of {displayFiles.length} file
                {displayFiles.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            { /* File list - using shared FileListItem component */}
            <div class="max-h-[300px] overflow-y-auto">
              <For each={displayFiles}>
                {(file) => {
                  const filePath = getDisplayPath(file);
                  const absolutePath = worktreePath ? `${worktreePath}/${filePath}` : null;
                  return (
                    <FileListItem
                      filePath={filePath}
                      fileName={getFileName(filePath)}
                      dirPath={getFileDir(filePath)}
                      status={getFileStatus(file)}
                      isChecked={selectedForCommit.has(filePath)}
                      isViewed={isFileMarkedAsViewed(filePath)}
                      isUntracked={file.isNewFile ?? false}
                      showContextMenu={!!worktreePath}
                      onSelect={() => {
                        if (onFileSelect) {
                          onFileSelect(filePath);
                        } else {
                          onExpand?.();
                        }
                      }}
                      onCheckboxChange={() => handleCheckboxChange(filePath)}
                      onCopyPath={absolutePath ? async () => {
                        await navigator.clipboard.writeText(absolutePath);
                      } : undefined}
                      onCopyRelativePath={async () => {
                        await navigator.clipboard.writeText(filePath);
                      }}
                      onRevealInFinder={absolutePath ? () => {
                        openInFinderMutation.mutate({ path: absolutePath });
                      } : undefined}
                    />
                  );
                }}
              </For>
            </div>

            {	/* Action buttons */}
            <div class="flex gap-2 p-2 border-t border-border/50">
              { /* Commit button */}
              <Show when={onCommit}>
                <Button variant="default" size="sm" class="flex-1 h-7 text-xs" onClick={handleCommit} disabled={isCommitting || selectedCount === 0}>
                  {isCommitting ? "Committing..." : `Commit ${selectedCount} file${selectedCount !== 1 ? "s" : ""}`}
                </Button>
              </Show>

              { /* View diff button */}
              <Button variant="outline" size="sm" class={cn("h-7 text-xs", onCommit ? "flex-1" : "w-full")} onClick={() => onExpand?.()}>
                View Diff
              </Button>
            </div>
          </> : <div class="text-xs text-muted-foreground px-2 py-2">
            No changes
          </div>}
      </div>
    </div>;
}
