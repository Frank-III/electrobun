import { For, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { GitCommit } from "lucide-solid";
import { IconSpinner, DiffIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getFileIconByExtension } from "@/features/agents/mentions/agents-file-mention";
/** Parsed diff file type */
interface ParsedDiffFile {
	key: string;
	oldPath: string;
	newPath: string;
	additions: number;
	deletions: number;
	isNewFile?: boolean;
	isDeletedFile?: boolean;
}
interface DiffSectionProps {
	chatId: string;
	isDiffSidebarOpen: boolean;
	setIsDiffSidebarOpen: (open: boolean) => void;
	diffStats?: {
		additions: number;
		deletions: number;
		fileCount: number;
	} | null;
	parsedFileDiffs?: ParsedDiffFile[];
	onCommit?: () => void;
	isCommitting?: boolean;
	isExpanded?: boolean;
}
/**
* Get file name from path
*/
function getFileName(path: string): string {
	const parts = path.split("/");
	return parts[parts.length - 1] || path;
}
/**
* Get file directory from path
*/
function getFileDir(path: string): string {
	const parts = path.split("/");
	if (parts.length <= 1) return "";
	return parts.slice(0, -1).join("/");
}
export function DiffSection(props: DiffSectionProps) {
	const hasChanges = () => props.diffStats && props.diffStats.fileCount > 0;
	const files = () => props.parsedFileDiffs || [];
	const isCommitting = () => props.isCommitting ?? false;
	// Limit files shown in widget (show first 5)
	const maxFilesToShow = 5;
	const visibleFiles = () => files().slice(0, maxFilesToShow);
	const remainingCount = () => files().length - maxFilesToShow;
	return <div class="px-3 py-2">
		<Show when={hasChanges()} fallback={<div class="flex items-center gap-2 text-xs text-muted-foreground py-2">
				<DiffIcon class="h-3.5 w-3.5" />
				<span>No changes</span>
			</div>}>
			<div class="space-y-2">
          {	/* Stats summary - same style as agent-diff-view */}
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-muted-foreground">
              {props.diffStats!.fileCount} file{props.diffStats!.fileCount !== 1 ? "s" : ""}
            </span>
            <span class="tabular-nums whitespace-nowrap">
              <Show when={props.diffStats!.additions > 0}>
                  <span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
                    +{props.diffStats!.additions}
                  </span>
                </Show>
              <Show when={props.diffStats!.deletions > 0}>
                  <span class="text-red-600 dark:text-red-400">
                    -{props.diffStats!.deletions}
                  </span>
                </Show>
            </span>
          </div>

          { /* File list - matching agent-diff-view header style */}
			<Show when={visibleFiles().length > 0}>
					<div class="space-y-0.5">
						<For each={visibleFiles()}>
							{(file) => {
								const displayPath = file.newPath || file.oldPath;
								const fileName = getFileName(displayPath);
								const dirPath = getFileDir(displayPath);
								const isNewFile = file.isNewFile;
								const isDeletedFile = file.isDeletedFile;
								const FileIcon = getFileIconByExtension(fileName);
								return <div class={cn("group flex items-center gap-2 font-mono text-xs", "py-1 px-1.5 rounded cursor-pointer", "hover:bg-accent/50 transition-colors")} onClick={() => props.setIsDiffSidebarOpen(true)}>
                    {		/* File icon */}
                    <div class="relative w-3.5 h-3.5 shrink-0">
                      {FileIcon && <FileIcon class="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>

                    { /* File name + path + status - same layout as agent-diff-view */}
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <span class="font-medium text-foreground shrink-0">
                        {fileName}
                      </span>
                      <Show when={dirPath}>
                          <span class="text-muted-foreground truncate text-[11px] min-w-0">
                            {dirPath}
                          </span>
                        </Show>
                      <Show when={isNewFile}>
                          <span class="shrink-0 text-[11px] text-emerald-600 dark:text-emerald-400">
                            (new)
                          </span>
                        </Show>
                      <Show when={isDeletedFile}>
                          <span class="shrink-0 text-[11px] text-red-600 dark:text-red-400">
                            (deleted)
                          </span>
                        </Show>
                    </div>

                    { /* Stats - same style as agent-diff-view */}
								<span class="shrink-0 font-mono text-[11px] tabular-nums whitespace-nowrap">
									<Show when={file.additions > 0}>
										<span class="mr-1.5 text-emerald-600 dark:text-emerald-400">
											+{file.additions}
										</span>
									</Show>
									<Show when={file.deletions > 0}>
										<span class="text-red-600 dark:text-red-400">
											-{file.deletions}
										</span>
									</Show>
								</span>
							</div>;
							}}
						</For>

              {	/* Show more indicator */}
              <Show when={remainingCount() > 0}>
                <button class="text-xs text-muted-foreground hover:text-foreground py-1 px-1.5 w-full text-left font-mono" onClick={() => props.setIsDiffSidebarOpen(true)}>
                  +{remainingCount()} more file{remainingCount() !== 1 ? "s" : ""}...
                </button>
              </Show>
            </div>
          </Show>

          { /* Action buttons */}
			<div class="flex gap-2 pt-1">
            { /* Commit button */}
            <Show when={props.onCommit}>
              <Button variant="default" size="sm" class="flex-1 h-7 text-xs" onClick={props.onCommit} disabled={isCommitting()}>
                <Show when={isCommitting()} fallback={<GitCommit class="h-3 w-3 mr-1.5" />}>
                  <IconSpinner class="h-3 w-3 mr-1.5" />
                </Show>
                Commit
              </Button>
            </Show>

            { /* View all button */}
            <Button variant="outline" size="sm" class={cn("h-7 text-xs", props.onCommit ? "flex-1" : "w-full")} onClick={() => props.setIsDiffSidebarOpen(true)}>
              <DiffIcon class="h-3 w-3 mr-1.5" />
              View All
            </Button>
			</div>
			</div>
		</Show>
    </div>;
 }
