import { createMemo, createEffect, onCleanup, For, Show } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../../../lib/desktop-rpc";
import { formatRelativeDate } from "../../utils/date";
import { FileText, ArrowUp } from "lucide-solid";
import { cn } from "../../../../lib/utils";
import { getStatusIndicator } from "../../utils/status";
import { Button } from "../../../../components/ui/button";
import type { ChangedFile } from "../../../../../shared/changes-types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../../../../components/ui/context-menu";
import { toast } from "solid-sonner";
export interface CommitInfo {
	hash: string;
	shortHash: string;
	message: string;
	author: string;
	email: string;
	date: Date;
}
interface HistoryViewProps {
	worktreePath: string;
	selectedCommitHash?: string | null;
	selectedFilePath?: string | null;
	onCommitSelect?: (commit: CommitInfo | null) => void;
	onFileSelect?: (file: ChangedFile, commitHash: string) => void;
	pushCount?: number;
}
export function HistoryView(props: HistoryViewProps) {
	const historyQuery = useQuery(() => ({
		queryKey: ["changes", "getHistory", props.worktreePath, 50] as const,
		queryFn: () => desktopRpc.changes.getHistory({ worktreePath: props.worktreePath, limit: 50 }),
		enabled: !!props.worktreePath,
		staleTime: 3e4,
	}));
	const commits = () => historyQuery.data;
	const isLoading = () => historyQuery.isLoading;
	const refetchHistory = () => historyQuery.refetch();

	const worktreeRegisteredQuery = useQuery(() => ({
		queryKey: ["changes", "isWorktreeRegistered", props.worktreePath] as const,
		queryFn: () => desktopRpc.changes.isWorktreeRegistered({ worktreePath: props.worktreePath }),
		enabled: !!props.worktreePath,
	}));
	const isWorktreeRegistered = () => worktreeRegisteredQuery.data;

	const commitFilesQuery = useQuery(() => ({
		queryKey: ["changes", "getCommitFiles", props.worktreePath, props.selectedCommitHash ?? ""] as const,
		queryFn: () =>
			desktopRpc.changes.getCommitFiles({ worktreePath: props.worktreePath, commitHash: props.selectedCommitHash! }),
		enabled: !!props.worktreePath && !!props.selectedCommitHash,
		staleTime: 6e4,
	}));
	const commitFiles = () => commitFilesQuery.data;
	const isLoadingFiles = () => commitFilesQuery.isLoading;
	const filesError = () => commitFilesQuery.error;
	const refetchFiles = () => commitFilesQuery.refetch();
	// Auto-select first commit when history loads (if none selected)
	createEffect(() => {
		const c = commits();
		if (c && c.length > 0 && !props.selectedCommitHash && props.onCommitSelect) {
			props.onCommitSelect(c[0]);
		}
	});
	// Auto-select first file when commit files load
	createEffect(() => {
		const cf = commitFiles();
		if (cf && cf.length > 0 && props.selectedCommitHash && !props.selectedFilePath && props.onFileSelect) {
			props.onFileSelect(cf[0], props.selectedCommitHash);
		}
	});
	// Refetch history and commit files when window gains focus
	createEffect(() => {
		if (!props.worktreePath) return;
		const handleWindowFocus = () => {
			// Refetch commit history
			refetchHistory();
			// Refetch commit files if a commit is selected
			if (props.selectedCommitHash) {
				refetchFiles();
			}
		};
		window.addEventListener("focus", handleWindowFocus);
		onCleanup(() => window.removeEventListener("focus", handleWindowFocus));
	});
	const handleCommitClick = (commit: CommitInfo) => {
		props.onCommitSelect?.(commit);
	};
	const handleFileClick = (file: ChangedFile) => {
		if (props.selectedCommitHash) {
			props.onFileSelect?.(file, props.selectedCommitHash);
		}
	};
	if (isLoading()) {
		return (
			<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				Loading...
			</div>
		);
	}
	const commitsList = commits();
	if (!commitsList?.length) {
		return (
			<div class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				No commits yet
			</div>
		);
	}
	return (
		<div class="flex-1 overflow-y-auto">
			<Show when={isWorktreeRegistered() === false && props.worktreePath}>
				<div class="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs">
					Worktree not registered. Cannot load commit files.
				</div>
			</Show>
			<For each={commitsList}>
				{(commit, index) => (
					<HistoryCommitItem
						commit={commit}
						isSelected={props.selectedCommitHash === commit.hash}
						isUnpushed={index() < (props.pushCount || 0)}
						onClick={() => handleCommitClick(commit)}
					/>
				)}
			</For>
		</div>
	);
}
function HistoryCommitItem(props: {
	commit: CommitInfo;
	isSelected: boolean;
	isUnpushed?: boolean;
	onClick: () => void;
}) {
	const timeAgo = createMemo(() => formatRelativeDate(new Date(props.commit.date)));
	const handleCopySha = () => {
		navigator.clipboard.writeText(props.commit.hash);
		toast.success("Copied SHA to clipboard");
	};
	const handleOpenOnRemote = () => {
		// TODO: Get repository URL and construct commit URL
		// For now, just show a toast
		toast.info("Open on remote - not implemented yet");
	};
	return <ContextMenu>
			<ContextMenuTrigger asChild>
				<div class={cn("flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors", "hover:bg-muted/50 border-b border-border/30 last:border-b-0", props.isSelected && "bg-muted")} onClick={props.onClick}>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-medium truncate">{props.commit.message}</div>
						<div class="text-xs text-muted-foreground flex items-center gap-1">
							<span class="font-mono">{props.commit.shortHash}</span>
							<span>·</span>
							<span class="truncate">{props.commit.author}</span>
							<span>·</span>
							<span class="shrink-0">{timeAgo()}</span>
						</div>
					</div>
					<Show when={props.isUnpushed}><div class="flex items-center justify-center w-7 h-6 rounded bg-primary/10 shrink-0">
							<ArrowUp class="size-3.5 text-primary" />
						</div></Show>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent class="w-48">
				<ContextMenuItem onClick={handleCopySha}>
					Copy SHA
				</ContextMenuItem>
				<ContextMenuItem onClick={handleOpenOnRemote} disabled={props.isUnpushed}>
					Open on Remote
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>;
}
function CommitFileItem(props: {
	file: ChangedFile;
	isSelected: boolean;
	onClick: () => void;
}) {
	const fileName = props.file.path.split("/").pop() || props.file.path;
	const dirPath = props.file.path.includes("/") ? props.file.path.substring(0, props.file.path.lastIndexOf("/")) : "";
	return <div class={cn("flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors", "hover:bg-muted/80", props.isSelected && "bg-muted")} onClick={props.onClick}>
			<FileText class="size-3.5 text-muted-foreground shrink-0 ml-5" />
			<div class="flex-1 min-w-0 flex items-center overflow-hidden">
				<Show when={dirPath}><span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
						{dirPath}/
					</span></Show>
				<span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
					{fileName}
				</span>
			</div>
			<div class="shrink-0">{getStatusIndicator(props.file.status)}</div>
		</div>;
}
