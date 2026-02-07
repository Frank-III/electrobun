import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../../../components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { cn } from "../../../../lib/utils";
import { createSignal, Index, Show, mergeProps, splitProps } from "solid-js";
import { Minus as HiMiniMinus, Plus as HiMiniPlus } from "lucide-solid";
import { useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../../lib/desktop-rpc";
import { ClipboardIcon, ExternalLinkIcon, FolderIcon, PlusIcon, TrashIcon, UndoIcon } from "../../../../components/ui/icons";
import { Minus, Plus } from "lucide-solid";
import type { ChangedFile } from "../../../../../shared/changes-types";
import { getStatusColor, getStatusIndicator } from "../../utils";
interface FileItemProps {
	file: ChangedFile;
	isSelected: boolean;
	/** Single click - opens in preview mode */
	onClick: () => void;
	/** Double click - opens pinned (permanent) */
	onDblClick?: () => void;
	showStats?: boolean;
	/** Number of level indentations (for tree view) */
	level?: number;
	/** Callback for staging the file (shown on hover for unstaged files) */
	onStage?: () => void;
	/** Callback for unstaging the file (shown on hover for staged files) */
	onUnstage?: () => void;
	/** Whether the action is currently pending */
	isActioning?: boolean;
	/** Worktree path for constructing absolute paths */
	worktreePath?: string;
	/** Callback for discarding changes */
	onDiscard?: () => void;
	/** Whether to show checkbox for staging (GitHub Desktop style) */
	showCheckbox?: boolean;
	/** Whether the file is staged (for checkbox state) */
	isStaged?: boolean;
}
function LevelIndicators(props: { level: number }) {
	const [local] = splitProps(props, ["level"]);
	if (local.level === 0) return null;
	return <div class="flex self-stretch shrink-0">
			<Index each={Array.from({ length: local.level })}>
				{() => <div class="w-3 self-stretch border-r border-border" />}
			</Index>
		</div>;
}
function getFileName(path: string): string {
	return path.split("/").pop() || path;
}
export function FileItem(props: FileItemProps) {
	const merged = mergeProps({
		showStats: true,
		level: 0,
		isActioning: false,
		showCheckbox: false,
		isStaged: false,
	}, props);
	const [local] = splitProps(merged, [
		"file",
		"isSelected",
		"onClick",
		"onDblClick",
		"showStats",
		"level",
		"onStage",
		"onUnstage",
		"isActioning",
		"worktreePath",
		"onDiscard",
		"showCheckbox",
		"isStaged",
	]);
	const [showDiscardDialog, setShowDiscardDialog] = createSignal(false);
	const fileName = getFileName(local.file.path);
	const statusBadgeColor = getStatusColor(local.file.status);
	const statusIndicator = getStatusIndicator(local.file.status);
	const showStatsDisplay = local.showStats && (local.file.additions > 0 || local.file.deletions > 0);
	const hasIndent = local.level > 0;
	const hasAction = local.onStage || local.onUnstage;
	const handleCheckboxChange = (checked: boolean) => {
		if (checked && local.onStage) {
			local.onStage();
		} else if (!checked && local.onUnstage) {
			local.onUnstage();
		}
	};
	const openInFinderMutation = useMutation(() => ({
		mutationFn: (input: { path: string }) => desktopRpc.external.openInFinder.mutate(input),
	}));
	const openInEditorMutation = useMutation(() => ({
		mutationFn: (input: { path: string; cwd?: string }) =>
			desktopRpc.external.openFileInEditor(input),
	}));
	const absolutePath = local.worktreePath ? `${local.worktreePath}/${local.file.path}` : null;
	const handleCopyPath = async () => {
		if (absolutePath) {
			await navigator.clipboard.writeText(absolutePath);
		}
	};
	const handleCopyRelativePath = async () => {
		await navigator.clipboard.writeText(local.file.path);
	};
	const handleRevealInFinder = () => {
		if (absolutePath) {
			openInFinderMutation.mutate({ path: absolutePath });
		}
	};
	const handleOpenInEditor = () => {
		if (absolutePath && local.worktreePath) {
			openInEditorMutation.mutate({
				path: absolutePath,
				cwd: local.worktreePath
			});
		}
	};
	const handleDiscardClick = () => {
		setShowDiscardDialog(true);
	};
	const handleConfirmDiscard = () => {
		setShowDiscardDialog(false);
		local.onDiscard?.();
	};
	const isDeleteAction = local.file.status === "untracked" || local.file.status === "added";
	const discardLabel = isDeleteAction ? "Delete" : "Discard Changes";
	const discardDialogTitle = isDeleteAction ? `Delete "${fileName}"?` : `Discard changes to "${fileName}"?`;
	const discardDialogDescription = isDeleteAction ? "This will permanently delete this file. This action cannot be undone." : "This will revert all changes to this file. This action cannot be undone.";
	const fileContent = <div class={cn("group w-full flex items-stretch gap-1 px-1.5 text-left rounded-sm", "cursor-pointer transition-colors overflow-hidden", local.isSelected ? "bg-muted" : "hover:bg-muted/80")}>
			<Show when={hasIndent}>
				<LevelIndicators level={local.level} />
			</Show>

			{	/* Checkbox for staging (GitHub Desktop style) */}
			<Show when={local.showCheckbox && (local.onStage || local.onUnstage)}>
				<div class="flex items-center px-0.5" onClick={(e) => e.stopPropagation()}>
					<Checkbox checked={local.isStaged} onCheckedChange={handleCheckboxChange} disabled={local.isActioning} class="size-3.5" />
				</div>
			</Show>

			<button type="button" onClick={local.onClick} onDblClick={local.onDblClick} class={cn("flex items-center gap-1.5 flex-1 min-w-0", hasIndent ? "py-0.5" : "py-1")}>
				<span class={cn("shrink-0 flex items-center text-xs", statusBadgeColor)}>
					{statusIndicator}
				</span>
				<span class="flex-1 min-w-0 flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<span class="text-xs text-start truncate overflow-hidden text-ellipsis">
								{fileName}
							</span>
						</TooltipTrigger>
							<TooltipContent side="right">{local.file.path}</TooltipContent>
						</Tooltip>
						<Show when={showStatsDisplay}>
							<span class="flex items-center gap-0.5 text-[10px] font-mono shrink-0 whitespace-nowrap opacity-60">
								<Show when={local.file.additions > 0}>
									<span class="text-green-600 dark:text-green-500">
										+{local.file.additions}
									</span>
								</Show>
								<Show when={local.file.deletions > 0}>
									<span class="text-red-600 dark:text-red-400">
										-{local.file.deletions}
									</span>
								</Show>
							</span>
						</Show>
				</span>
			</button>

			{ /* Hover actions (only when checkbox is not shown) */}
			<Show when={!local.showCheckbox && hasAction}>
				<div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
					<Show when={local.onStage}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" class="size-5 hover:bg-accent" onClick={(e) => {
		e.stopPropagation();
		local.onStage?.();
	}} disabled={local.isActioning}>
									<HiMiniPlus class="size-3" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">Stage</TooltipContent>
						</Tooltip>
					</Show>
					<Show when={local.onUnstage}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" class="size-5 hover:bg-accent" onClick={(e) => {
		e.stopPropagation();
		local.onUnstage?.();
	}} disabled={local.isActioning}>
									<HiMiniMinus class="size-3" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">Unstage</TooltipContent>
						</Tooltip>
					</Show>
				</div>
			</Show>
		</div>;
	return <Show when={local.worktreePath} fallback={fileContent}>
			<ContextMenu>
				<ContextMenuTrigger asChild>{fileContent}</ContextMenuTrigger>
				<ContextMenuContent class="w-48">
					<ContextMenuItem onClick={handleCopyPath}>
						<ClipboardIcon class="mr-2 size-4" />
						Copy Path
					</ContextMenuItem>
					<ContextMenuItem onClick={handleCopyRelativePath}>
						<ClipboardIcon class="mr-2 size-4" />
						Copy Relative Path
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onClick={handleRevealInFinder}>
						<FolderIcon class="mr-2 size-4" />
						Reveal in Finder
					</ContextMenuItem>
					<ContextMenuItem onClick={handleOpenInEditor}>
						<ExternalLinkIcon class="mr-2 size-4" />
						Open in Editor
					</ContextMenuItem>

					<Show when={local.onStage || local.onUnstage || local.onDiscard}>
						<ContextMenuSeparator />
					</Show>

					<Show when={local.onStage}>
						<ContextMenuItem onClick={local.onStage} disabled={local.isActioning}>
							<Plus class="mr-2 size-4" />
							Stage
						</ContextMenuItem>
					</Show>

					<Show when={local.onUnstage}>
						<ContextMenuItem onClick={local.onUnstage} disabled={local.isActioning}>
							<Minus class="mr-2 size-4" />
							Unstage
						</ContextMenuItem>
					</Show>

					<Show when={local.onDiscard}>
						<ContextMenuItem onClick={handleDiscardClick} disabled={local.isActioning} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
							{discardLabel}
						</ContextMenuItem>
					</Show>
				</ContextMenuContent>
			</ContextMenu>

			<AlertDialog open={showDiscardDialog()} onOpenChange={setShowDiscardDialog}>
				<AlertDialogContent class="w-[340px]">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{discardDialogTitle}
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogDescription class="px-5 pb-5">
						{discardDialogDescription}
					</AlertDialogDescription>
					<AlertDialogFooter>
						<Button variant="outline" size="sm" onClick={() => setShowDiscardDialog(false)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
							<Show when={isDeleteAction} fallback="Discard">
								Delete
							</Show>
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Show>;
}
