import { createSignal, For } from "solid-js";
import type { ChangedFile } from "../../../../../shared/changes-types";
import { FileItem } from "../file-item";
import { FolderRow } from "../folder-row";
interface FileListTreeProps {
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
interface FileTreeNode {
	id: string;
	name: string;
	type: "file" | "folder";
	path: string;
	file?: ChangedFile;
	children?: FileTreeNode[];
}
function buildFileTree(files: ChangedFile[]): FileTreeNode[] {
	type TreeNodeInternal = Omit<FileTreeNode, "children"> & {
		children?: Record<string, TreeNodeInternal>;
	};
	const root: Record<string, TreeNodeInternal> = {};
	for (const file of files) {
		const parts = file.path.split("/");
		let current = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isLast = i === parts.length - 1;
			const pathSoFar = parts.slice(0, i + 1).join("/");
			if (!current[part]) {
				current[part] = {
					id: pathSoFar,
					name: part,
					type: isLast ? "file" : "folder",
					path: pathSoFar,
					file: isLast ? file : undefined,
					children: isLast ? undefined : {}
				};
			}
			if (!isLast && current[part].children) {
				current = current[part].children;
			}
		}
	}
	function convertToArray(nodes: Record<string, TreeNodeInternal>): FileTreeNode[] {
		return Object.values(nodes).map((node) => ({
			...node,
			children: node.children ? convertToArray(node.children) : undefined
		})).sort((a, b) => {
			if (a.type !== b.type) {
				return a.type === "folder" ? -1 : 1;
			}
			return a.name.localeCompare(b.name);
		});
	}
	return convertToArray(root);
}
interface TreeNodeComponentProps {
	node: FileTreeNode;
	level?: number;
	selectedPath: string | null;
	selectedCommitHash: string | null;
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
function TreeNodeComponent(props: TreeNodeComponentProps) {
	const level = () => props.level ?? 0;
	const [isExpanded, setIsExpanded] = createSignal(true);
	const hasChildren = props.node.children && props.node.children.length > 0;
	const isFile = props.node.type === "file";
	const isSelected = props.selectedPath === props.node.path && !props.selectedCommitHash;
	if (hasChildren) {
		return <FolderRow name={props.node.name} isExpanded={isExpanded()} onToggle={setIsExpanded} level={level()} variant="tree">
				<For each={props.node.children ?? []}>
					{(child) => <TreeNodeComponent node={child} level={level() + 1} selectedPath={props.selectedPath} selectedCommitHash={props.selectedCommitHash} onFileSelect={props.onFileSelect} onFileDoubleClick={props.onFileDoubleClick} showStats={props.showStats} showCheckbox={props.showCheckbox} isStaged={props.isStaged} onStage={props.onStage} onUnstage={props.onUnstage} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard} />}
				</For>
			</FolderRow>;
	}
	if (isFile && props.node.file) {
		const file = props.node.file;
		return <FileItem file={file} isSelected={isSelected} onClick={() => props.onFileSelect(file)} onDblClick={props.onFileDoubleClick ? () => props.onFileDoubleClick!(file) : undefined} showStats={props.showStats} showCheckbox={props.showCheckbox} isStaged={props.isStaged} level={level()} onStage={props.onStage ? () => props.onStage!(file) : undefined} onUnstage={props.onUnstage ? () => props.onUnstage!(file) : undefined} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard ? () => props.onDiscard!(file) : undefined} />;
	}
	return null;
}
export function FileListTree(props: FileListTreeProps) {
	const showStats = () => props.showStats ?? true;
	const showCheckbox = () => props.showCheckbox ?? false;
	const isStaged = () => props.isStaged ?? false;
	const tree = buildFileTree(props.files);
	return <div class="flex flex-col overflow-hidden">
			<For each={tree}>
				{(node) => <TreeNodeComponent node={node} selectedPath={props.selectedFile?.path ?? null} selectedCommitHash={props.selectedCommitHash} onFileSelect={props.onFileSelect} onFileDoubleClick={props.onFileDoubleClick} showStats={showStats()} showCheckbox={showCheckbox()} isStaged={isStaged()} onStage={props.onStage} onUnstage={props.onUnstage} isActioning={props.isActioning} worktreePath={props.worktreePath} onDiscard={props.onDiscard} />}
			</For>
		</div>;
}
