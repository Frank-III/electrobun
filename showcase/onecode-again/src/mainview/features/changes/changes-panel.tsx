import { splitProps } from "solid-js";
import type { ChangeCategory, ChangedFile } from "../../../shared/changes-types";
import { ChangesView } from "./changes-view";
import type { SubChatFilterItem } from "./components/changes-file-filter";
import type { CommitInfo } from "./components/history-view";
interface ChangesPanelProps {
	worktreePath: string;
	/** Currently selected file path for highlighting */
	selectedFilePath?: string | null;
	/** Callback when a file is selected */
	onFileSelect?: (file: ChangedFile, category: ChangeCategory) => void;
	/** Callback when a file is double-clicked (pinned) */
	onFileOpenPinned?: (file: ChangedFile, category: ChangeCategory) => void;
	/** Callback to create a PR (sends prompt to chat) */
	onCreatePr?: () => void;
	/** Called after a successful commit to reset diff view state */
	onCommitSuccess?: () => void;
	/** Available subchats for filtering */
	subChats?: SubChatFilterItem[];
	/** Currently selected subchat ID for filtering (passed from Review button) */
	initialSubChatFilter?: string | null;
	/** Chat ID for AI-generated commit messages */
	chatId?: string;
	/** Selected commit hash for History tab */
	selectedCommitHash?: string | null;
	/** Callback when commit is selected in History tab */
	onCommitSelect?: (commit: CommitInfo | null) => void;
	/** Callback when file is selected in commit History */
	onCommitFileSelect?: (file: ChangedFile, commitHash: string) => void;
	/** Callback when active tab changes (Changes/History) */
	onActiveTabChange?: (tab: "changes" | "history") => void;
	/** Number of commits ahead of upstream (for unpushed indicator) */
	pushCount?: number;
}
export function ChangesPanel(props: ChangesPanelProps) {
	const [local] = splitProps(props, ["worktreePath", "selectedFilePath", "onFileSelect", "onFileOpenPinned", "onCreatePr", "onCommitSuccess", "subChats", "initialSubChatFilter", "chatId", "selectedCommitHash", "onCommitSelect", "onCommitFileSelect", "onActiveTabChange", "pushCount"]);
	if (!local.worktreePath) {
		return <div class="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
				No worktree path available
			</div>;
	}
	return <div class="flex flex-col h-full overflow-hidden">
			<ChangesView worktreePath={local.worktreePath} selectedFilePath={local.selectedFilePath} onFileSelect={local.onFileSelect} onFileOpenPinned={local.onFileOpenPinned} onCreatePr={local.onCreatePr} onCommitSuccess={local.onCommitSuccess} subChats={local.subChats} initialSubChatFilter={local.initialSubChatFilter} chatId={local.chatId} selectedCommitHash={local.selectedCommitHash} onCommitSelect={local.onCommitSelect} onCommitFileSelect={local.onCommitFileSelect} onActiveTabChange={local.onActiveTabChange} pushCount={local.pushCount} />
		</div>;
}
