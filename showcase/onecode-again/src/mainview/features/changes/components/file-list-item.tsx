import { Show } from "solid-js";
import { Eye } from "lucide-solid";
import { Checkbox } from "@/components/ui/checkbox";
import { Kbd } from "@/components/ui/kbd";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { getStatusIndicator } from "../utils/status";
import type { FileStatus } from "../../../../shared/changes-types";
export interface FileListItemProps {
	/** File path (relative) */
	filePath: string;
	/** File name (last part of path) */
	fileName: string;
	/** Directory path (without file name) */
	dirPath: string;
	/** File status for indicator color */
	status: FileStatus;
	/** Whether file is selected (highlighted) */
	isSelected?: boolean;
	/** Whether checkbox is checked */
	isChecked: boolean;
	/** Whether file is marked as viewed */
	isViewed: boolean;
	/** Whether file is untracked (affects context menu text) */
	isUntracked: boolean;
	/** Click handler */
	onSelect: () => void;
	/** Double click handler */
	onDoubleClick?: () => void;
	/** Checkbox change handler */
	onCheckboxChange: () => void;
	/** Copy absolute path */
	onCopyPath?: () => void;
	/** Copy relative path */
	onCopyRelativePath?: () => void;
	/** Open in Finder/Explorer */
	onRevealInFinder?: () => void;
	/** Toggle viewed state */
	onToggleViewed?: () => void;
	/** Discard changes */
	onDiscard?: () => void;
	/** Whether to show context menu (default true) */
	showContextMenu?: boolean;
}
/**
* Shared file list item component used in both changes-view and changes-widget
* Memoized to prevent re-renders
*/
export function FileListItem({ filePath, fileName, dirPath, status, isSelected = false, isChecked, isViewed, isUntracked, onSelect, onDoubleClick, onCheckboxChange, onCopyPath, onCopyRelativePath, onRevealInFinder, onToggleViewed, onDiscard, showContextMenu = true }: FileListItemProps) {
	const content = <div data-file-item class={cn("flex items-center gap-2 px-2 py-1 cursor-pointer", "hover:bg-muted/80 transition-colors", isSelected && "bg-muted")} onClick={onSelect} onDoubleClick={onDoubleClick}>
      <Checkbox checked={isChecked} onCheckedChange={onCheckboxChange} onClick={(e) => e.stopPropagation()} class="size-4 shrink-0 border-muted-foreground/50" />
      <div class="flex-1 min-w-0 flex items-center overflow-hidden">
        <Show when={dirPath}>
          <span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
            {dirPath}/
          </span>
        </Show>
        <span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
          {fileName}
        </span>
      </div>
      <div class="shrink-0 flex items-center gap-1.5">
        <Show when={isViewed}>
          <div class="size-4 rounded bg-emerald-500/20 flex items-center justify-center">
            <Eye class="size-2.5 text-emerald-500" />
          </div>
        </Show>
        {getStatusIndicator(status)}
      </div>
    </div>;
	if (!showContextMenu) {
		return content;
	}
	return <ContextMenu>
      <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
      <ContextMenuContent class="w-52">
        <Show when={onCopyPath}>
          <ContextMenuItem onClick={onCopyPath}>Copy Path</ContextMenuItem>
        </Show>
        <Show when={onCopyRelativePath}>
          <ContextMenuItem onClick={onCopyRelativePath}>
            Copy Relative Path
          </ContextMenuItem>
        </Show>
        <Show when={(onCopyPath || onCopyRelativePath) && onRevealInFinder}>
          <ContextMenuSeparator />
        </Show>
        <Show when={onRevealInFinder}>
          <ContextMenuItem onClick={onRevealInFinder}>
            Reveal in Finder
          </ContextMenuItem>
        </Show>
        <Show when={onToggleViewed}>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onToggleViewed} class="justify-between">
            {isViewed ? "Mark as unviewed" : "Mark as viewed"}
            <Kbd>V</Kbd>
          </ContextMenuItem>
        </Show>
        <Show when={onDiscard}>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onDiscard} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
            {isUntracked ? "Delete File..." : "Discard Changes..."}
          </ContextMenuItem>
        </Show>
      </ContextMenuContent>
    </ContextMenu>;
}
/**
* Helper to extract file name from path
*/
export function getFileName(path: string): string {
	const parts = path.split("/");
	return parts[parts.length - 1] || path;
}
/**
* Helper to extract directory from path
*/
export function getFileDir(path: string): string {
	const parts = path.split("/");
	if (parts.length <= 1) return "";
	return parts.slice(0, -1).join("/");
}
