import { createSignal, For } from "solid-js";
import type { ChangedFile } from "../../../../../shared/changes-types";
import { FileItem } from "../file-item";
import { FolderRow } from "../folder-row";
interface FileListGroupedProps {
	files: ChangedFile[];
	selectedFile: ChangedFile | null;
	selectedCommitHash: string | null;
	/** Single click - opens in preview mode */
	onFileSelect: (file: ChangedFile) => void;
	/** Double click - opens pinned (permanent) */
	onFileDoubleClick?: (file: ChangedFile) => void;
	showStats?: boolean;
	showCheckbox?: boolean;
	isStaged?: boolean;
	onStage?: (file: ChangedFile) => void;
	onUnstage?: (file: ChangedFile) => void;
	isActioning?: boolean;
	worktreePath?: string;
	onDiscard?: (file: ChangedFile) => void;
}
interface FolderGroup {
	folderPath: string;
	folderName: string;
	files: ChangedFile[];
}
function groupFilesByFolder(files: ChangedFile[]): FolderGroup[] {
	const folderMap = new Map<string, ChangedFile[]>();
	for (const file of files) {
		const pathParts = file.path.split("/");
		const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
		if (!folderMap.has(folderPath)) {
			folderMap.set(folderPath, []);
		}
		folderMap.get(folderPath)?.push(file);
	}
	return Array.from(folderMap.entries()).map(([folderPath, files]) => {
		const pathParts = folderPath.split("/");
		const folderName = folderPath === "" ? "" : pathParts[pathParts.length - 1];
		return {
			folderPath,
			folderName,
			files: files.sort((a, b) => {
				const aName = a.path.split("/").pop() || "";
				const bName = b.path.split("/").pop() || "";
				return aName.localeCompare(bName);
			})
		};
	}).sort((a, b) => a.folderPath.localeCompare(b.folderPath));
}
interface FolderGroupItemProps {
	group: FolderGroup;
	selectedFile: ChangedFile | null;
	onFileSelect: (file: ChangedFile) => void;
	onFileDoubleClick?: (file: ChangedFile) => void;
	showStats?: boolean;
	showCheckbox?: boolean;
	isStaged?: boolean;
	onStage?: (file: ChangedFile) => void;
	onUnstage?: (file: ChangedFile) => void;
	isActioning?: boolean;
	worktreePath?: string;
	onDiscard?: (file: ChangedFile) => void;
}
function FolderGroupItem(props: FolderGroupItemProps) {
	const [isExpanded, setIsExpanded] = createSignal(true);
	const isRoot = props.group.folderPath === "";
	const displayName = isRoot ? "Root Path" : props.group.folderPath;
	return <FolderRow name={displayName} isExpanded={isExpanded()} onToggle={setIsExpanded} fileCount={props.group.files.length} variant="grouped">
			<For each={props.group.files}>
				{(file) => <FileItem file={file} isSelected={props.selectedFile?.path === file.path} onClick={() => props.onFileSelect(file)} onDblClick={props.onFileDoubleClick ? () => props.onFileDoubleClick!(file) : undefined} showStats={props.showStats} showCheckbox={props.showCheckbox} isStaged={props.isStaged} onStage={props.onStage ? () => props.onStage!(file) : undefined} onUnstage={props.onUnstage ? () => props.onUnstage!(file) : undefined} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard ? () => props.onDiscard!(file) : undefined} />}
			</For>
		</FolderRow>;
}
export function FileListGrouped(props: FileListGroupedProps) {
	const showStats = () => props.showStats ?? true;
	const showCheckbox = () => props.showCheckbox ?? false;
	const isStaged = () => props.isStaged ?? false;
	const groups = groupFilesByFolder(props.files);
	return <div class="flex flex-col overflow-hidden">
			<For each={groups}>
				{(group) => <FolderGroupItem group={group} selectedFile={props.selectedFile} onFileSelect={props.onFileSelect} onFileDoubleClick={props.onFileDoubleClick} showStats={showStats()} showCheckbox={showCheckbox()} isStaged={isStaged()} onStage={props.onStage} onUnstage={props.onUnstage} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard} />}
			</For>
		</div>;
}
