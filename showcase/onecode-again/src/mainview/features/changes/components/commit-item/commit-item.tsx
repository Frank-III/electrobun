import { Show } from "solid-js";
import type { ChangedFile, CommitInfo } from "../../../../../shared/changes-types";
import type { ChangesViewMode } from "../../types";
import { formatRelativeDate } from "../../utils";
import { CollapsibleRow } from "../collapsible-row";
import { FileList } from "../file-list";
interface CommitItemProps {
	commit: CommitInfo;
	isExpanded: boolean;
	onToggle: () => void;
	selectedFile: ChangedFile | null;
	selectedCommitHash: string | null;
	/** Single click - opens in preview mode */
	onFileSelect: (file: ChangedFile, commitHash: string) => void;
	/** Double click - opens pinned (permanent) */
	onFileDoubleClick?: (file: ChangedFile, commitHash: string) => void;
	viewMode: ChangesViewMode;
	/** Worktree path for constructing absolute paths */
	worktreePath?: string;
}
function CommitHeader(props: {
	shortHash: string;
	message: string;
	date: Date;
}) {
	return <>
			<span class="text-[10px] font-mono text-muted-foreground shrink-0">
				{props.shortHash}
			</span>
			<span class="text-xs flex-1 truncate">{props.message}</span>
			<span class="text-[10px] text-muted-foreground shrink-0">
				{formatRelativeDate(props.date)}
			</span>
		</>;
}
export function CommitItem(props: CommitItemProps) {
	const hasFiles = props.commit.files.length > 0;
	const handleFileSelect = (file: ChangedFile) => {
		props.onFileSelect(file, props.commit.hash);
	};
	const handleFileDoubleClick = (file: ChangedFile) => {
		props.onFileDoubleClick?.(file, props.commit.hash);
	};
	const isCommitSelected = props.selectedCommitHash === props.commit.hash;
	return <CollapsibleRow isExpanded={props.isExpanded} onToggle={() => props.onToggle()} triggerClassName="mx-0.5" contentClassName="ml-4 pl-1.5 border-l border-border mt-0.5 mb-0.5" header={<CommitHeader shortHash={props.commit.shortHash} message={props.commit.message} date={props.commit.date} />}>
			<Show when={hasFiles}><FileList files={props.commit.files} viewMode={props.viewMode} selectedFile={isCommitSelected ? props.selectedFile : null} selectedCommitHash={props.selectedCommitHash} onFileSelect={handleFileSelect} onFileDoubleClick={handleFileDoubleClick} worktreePath={props.worktreePath} /></Show>
		</CollapsibleRow>;
}
