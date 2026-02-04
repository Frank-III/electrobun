import { createSignal, createMemo, createEffect, onCleanup, For, Show } from "solid-js";
import { ChevronDown } from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { useFileChangeListener } from "../../../lib/hooks/use-file-change-listener";
import { getFileIconByExtension } from "../mentions/agents-file-mention";
import { diffSidebarOpenAtomFamily, agentsFocusedDiffFileAtom, filteredDiffFilesAtom, filteredSubChatIdAtom, type SubChatFileChange } from "../atoms";
// Animated dots component that cycles through ., .., ...
function AnimatedDots() {
	const [dotCount, setDotCount] = createSignal(1);
	createEffect(() => {
		const interval = setInterval(() => {
			setDotCount((prev) => prev % 3 + 1);
		}, 400);
		onCleanup(() => clearInterval(interval));
	});
	return <span class="inline-block w-[1em] text-left">{".".repeat(dotCount())}</span>;
}
interface SubChatStatusCardProps {
	chatId: string;
	subChatId: string;
	isStreaming: boolean;
	isCompacting?: boolean;
	changedFiles: SubChatFileChange[];
	worktreePath?: string | null;
	onStop?: () => void;
	/** Whether there's a queue card above this one - affects border radius */
	hasQueueCardAbove?: boolean;
}
export function SubChatStatusCard(props: SubChatStatusCardProps) {
	const [isExpanded, setIsExpanded] = createSignal(false);
	const hasQueueCardAbove = () => props.hasQueueCardAbove ?? false;
	// Use per-chat atom family instead of legacy global atom
	const diffSidebarAtom = createMemo(() => diffSidebarOpenAtomFamily(props.chatId));
	const setDiffSidebarOpen = (value: boolean | ((prev: boolean) => boolean)) => {
		diffSidebarAtom()[1](value);
	};
	const setFilteredDiffFiles = filteredDiffFilesAtom[1];
	const setFilteredSubChatId = filteredSubChatIdAtom[1];
	const setFocusedDiffFile = agentsFocusedDiffFileAtom[1];
	// Listen for file changes from Claude Write/Edit tools
	useFileChangeListener(() => props.worktreePath);
	// Fetch git status to filter out committed files
	const gitStatusQuery = useQuery(() => ({
		queryKey: ["changes", "getStatus", props.worktreePath] as const,
		queryFn: () => desktopRpc.changes.getStatus({ worktreePath: props.worktreePath || "", defaultBranch: "main" }),
		enabled: !!props.worktreePath && props.changedFiles.length > 0 && !props.isStreaming,
		staleTime: 3e4,
		placeholderData: (prev) => prev,
	}));
	const gitStatus = () => gitStatusQuery.data;
	// Filter changedFiles to only include files that are still uncommitted
	const uncommittedFiles = createMemo(() => {
		const status = gitStatus();
		console.log(`[StatusCard] Computing uncommittedFiles:`, {
			changedFilesCount: props.changedFiles.length,
			changedFiles: props.changedFiles.map((f) => f.displayPath),
			hasGitStatus: !!status,
			worktreePath: props.worktreePath,
			isStreaming: props.isStreaming,
		});
		// If no git status yet, no worktreePath, or still streaming - show all files
		if (!status || !props.worktreePath || props.isStreaming) {
			console.log(`[StatusCard] Returning all changedFiles (no filter)`);
			return props.changedFiles;
		}
		// Build set of all uncommitted file paths from git status
		const uncommittedPaths = new Set<string>();
		if (status.staged) {
			for (const file of status.staged) {
				uncommittedPaths.add(file.path);
			}
		}
		if (status.unstaged) {
			for (const file of status.unstaged) {
				uncommittedPaths.add(file.path);
			}
		}
		if (status.untracked) {
			for (const file of status.untracked) {
				uncommittedPaths.add(file.path);
			}
		}
		console.log(`[StatusCard] Git uncommitted paths:`, Array.from(uncommittedPaths));
		// Filter changedFiles to only include files that are still uncommitted
		const filtered = props.changedFiles.filter((file) => {
			const hasMatch = uncommittedPaths.has(file.displayPath);
			console.log(`[StatusCard] Checking file "${file.displayPath}" -> hasMatch: ${hasMatch}`);
			return hasMatch;
		});
		console.log(`[StatusCard] Filtered result:`, filtered.map((f) => f.displayPath));
		return filtered;
	});
	// Calculate totals from uncommitted files only
	const totals = createMemo(() => {
		const files = uncommittedFiles();
		let additions = 0;
		let deletions = 0;
		for (const file of files) {
			additions += file.additions;
			deletions += file.deletions;
		}
		return {
			additions,
			deletions,
			fileCount: files.length,
		};
	});
	// Check if there's expandable content (only files now)
	const hasExpandableContent = createMemo(() => uncommittedFiles().length > 0);
	// Don't show if no changed files - only show when there are files to review
	if (uncommittedFiles().length === 0) {
		console.log(`[StatusCard] Returning null - no uncommitted files`);
		return null;
	}
	const handleReview = () => {
		// Set filter to only show files from this sub-chat
		// Use displayPath (relative path) to match git diff paths
		const filePaths = uncommittedFiles().map((f) => f.displayPath);
		console.log("[SubChatStatusCard] handleReview:", {
			subChatId: props.subChatId,
			filePaths
		});
		setFilteredDiffFiles(filePaths.length > 0 ? filePaths : null);
		// Also set subchat ID filter for ChangesPanel - use the prop, not activeSubChatId from store
		setFilteredSubChatId(props.subChatId);
		setDiffSidebarOpen(true);
	};
	return <div class={cn(
		"border border-border bg-muted/30 overflow-hidden flex flex-col border-b-0 pb-6",
		// If queue card above - no top radius
		hasQueueCardAbove() ? "rounded-none" : "rounded-t-xl"
	)}>
      {	/* Header - at top */}
		<div role="button" tabIndex={0} onClick={() => setIsExpanded((prev) => !prev)} onKeyDown={(e) => {
 if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setIsExpanded((prev) => !prev);
		}
	}} aria-expanded={isExpanded()} aria-label={`${isExpanded() ? "Collapse" : "Expand"} status details`} class="flex items-center justify-between pr-1 pl-3 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none rounded-sm">
        <div class="flex items-center gap-2 text-xs flex-1 min-w-0">
          {	/* Expand/Collapse chevron - always show */}
			<ChevronDown class={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", !isExpanded() && "-rotate-90")} />

          { /* Streaming indicator */}
          <Show when={props.isStreaming}>
            <span class="text-xs text-muted-foreground">
              {props.isCompacting ? "Compacting" : "Generating"}<AnimatedDots />
            </span>
          </Show>

          { /* File count and stats - only show when not streaming */}
			  <Show when={!props.isStreaming}>
            <span class="text-xs text-muted-foreground">
					{totals().fileCount} {totals().fileCount === 1 ? "file" : "files"}
					<Show when={totals().additions > 0 || totals().deletions > 0}>
                {" "}
                <span class="text-green-600 dark:text-green-400">
						+{totals().additions}
                </span>{" "}
                <span class="text-red-600 dark:text-red-400">
						-{totals().deletions}
                </span>
              </Show>
            </span>
          </Show>
        </div>

        { /* Right side: buttons */}
        <div class="flex items-center gap-2 flex-shrink-0">
          { /* Stop button */}
          <Show when={props.isStreaming && props.onStop}>
            <Button variant="ghost" size="sm" onClick={(e) => {
 e.stopPropagation();
		props.onStop!();
	}} class="h-6 px-2 text-xs font-normal rounded-md transition-transform duration-150 active:scale-[0.97]">
              Stop
              <span class="text-muted-foreground/60 ml-1">⌃C</span>
            </Button>
          </Show>

          {	/* Review button */}
          <Button variant="secondary" size="sm" onClick={(e) => {
 e.stopPropagation();
		handleReview();
	}} class="h-6 px-3 text-xs font-medium rounded-md transition-transform duration-150 active:scale-[0.97]">
            Review
          </Button>
        </div>
      </div>

      {	/* Expanded content - files */}
      <Presence>
		<Show when={isExpanded() && hasExpandableContent()}>
          <Motion.div initial={{
 height: 0,
		opacity: 0
	}} animate={{
		height: "auto",
		opacity: 1
	}} exit={{
		height: 0,
		opacity: 0
	}} transition={{
		duration: 0.2,
		easing: [
			0.23,
			1,
			0.32,
			1
		]
	}} class="overflow-hidden">
            <div class="border-t border-border max-h-[200px] overflow-y-auto">
              <For each={uncommittedFiles()}>{(file) => {
                const FileIcon = getFileIconByExtension(file.displayPath);
                const handleFileClick = () => {
                  const filePaths = uncommittedFiles().map((f) => f.displayPath);
                  setFilteredDiffFiles(filePaths.length > 0 ? filePaths : null);
                  setFocusedDiffFile(file.displayPath);
                  setDiffSidebarOpen(true);
                };
                const handleKeyDown = (e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFileClick();
                  }
                };
                return <div role="button" tabIndex={0} onClick={handleFileClick} onKeyDown={handleKeyDown} aria-label={`View diff for ${file.displayPath}`} class="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none rounded-sm">
                  {FileIcon && <FileIcon class="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
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
              }}</For>
            </div>
          </Motion.div>
        </Show>
      </Presence>
    </div>;
}
