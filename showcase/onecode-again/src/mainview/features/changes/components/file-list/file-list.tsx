import type { ChangedFile } from "../../../../../shared/changes-types";
import type { ChangesViewMode } from "../../types";
import { FileListGrouped } from "./file-list-grouped";
import { FileListTree } from "./file-list-tree";
interface FileListProps {
	files: ChangedFile[];
	viewMode: ChangesViewMode;
	selectedFile: ChangedFile | null;
	selectedCommitHash: string | null;
	/** Single click - opens in preview mode */
	onFileSelect: (file: ChangedFile) => void;
	/** Double click - opens pinned (permanent) */
	onFileDoubleClick?: (file: ChangedFile) => void;
	showStats?: boolean;
	/** Show checkbox for staging (GitHub Desktop style) */
	showCheckbox?: boolean;
	/** Whether files in this list are staged (for checkbox state) */
	isStaged?: boolean;
	/** Callback for staging a file */
	onStage?: (file: ChangedFile) => void;
	/** Callback for unstaging a file */
	onUnstage?: (file: ChangedFile) => void;
	/** Whether an action is currently pending */
	isActioning?: boolean;
	/** Worktree path for constructing absolute paths */
	worktreePath?: string;
	/** Callback for discarding changes */
	onDiscard?: (file: ChangedFile) => void;
}
export function FileList(props: FileListProps) {
	const showStats = () => props.showStats ?? true;
	const showCheckbox = () => props.showCheckbox ?? false;
	const isStaged = () => props.isStaged ?? false;
	if (props.files.length === 0) {
		return null;
	}
	if (props.viewMode === "tree") {
		return <FileListTree files={props.files} selectedFile={props.selectedFile} selectedCommitHash={props.selectedCommitHash} onFileSelect={props.onFileSelect} onFileDoubleClick={props.onFileDoubleClick} showStats={showStats()} showCheckbox={showCheckbox()} isStaged={isStaged()} onStage={props.onStage} onUnstage={props.onUnstage} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard} />;
	}
	// Grouped mode - group files by folder
	return <FileListGrouped files={props.files} selectedFile={props.selectedFile} selectedCommitHash={props.selectedCommitHash} onFileSelect={props.onFileSelect} onFileDoubleClick={props.onFileDoubleClick} showStats={showStats()} showCheckbox={showCheckbox()} isStaged={isStaged()} onStage={props.onStage} onUnstage={props.onUnstage} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard} />;
}
