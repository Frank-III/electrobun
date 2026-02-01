import { createMemo, For } from "solid-js";
import { KanbanColumn } from "./kanban-column";
import type { KanbanCardData } from "./kanban-card";
import type { SubChatStatus } from "../lib/derive-status";
interface KanbanBoardProps {
	cards: KanbanCardData[];
	pinnedChatIds: Set<string>;
	isMultiSelectMode: boolean;
	selectedChatIds: Set<string>;
	onCardClick: (card: KanbanCardData, e: MouseEvent) => void;
	onCheckboxClick: (e: MouseEvent, chatId: string) => void;
	onTogglePin: (chatId: string) => void;
	onRename: (chat: {
		id: string;
		name: string | null;
	}) => void;
	onArchive: (chatId: string) => void;
	onCopyBranch: (branch: string) => void;
	onExportChat: (params: {
		chatId: string;
		format: "markdown" | "json" | "text";
	}) => void;
	onCopyChat: (params: {
		chatId: string;
		format: "markdown" | "json" | "text";
	}) => void;
}
// 4 columns: drafts + workspace statuses
const COLUMNS: {
	status: SubChatStatus;
	title: string;
}[] = [
	{
		status: "draft",
		title: "Drafts"
	},
	{
		status: "in-progress",
		title: "In Progress"
	},
	{
		status: "needs-input",
		title: "Need Input"
	},
	{
		status: "done",
		title: "Done"
	}
];
export function KanbanBoard(props: KanbanBoardProps) {
	// Group cards by status
	const cardsByStatus = createMemo(() => {
		const grouped: Record<SubChatStatus, KanbanCardData[]> = {
			draft: [],
			"in-progress": [],
			"needs-input": [],
			done: []
		};
		for (const card of props.cards) {
			grouped[card.status].push(card);
		}
		return grouped;
	});
	return <div class="h-full overflow-x-auto">
      {	/* Centered container with max-width */}
      <div class="flex gap-3 h-full px-4 py-2 mx-auto max-w-5xl min-w-min">
        <For each={COLUMNS}>{(column) => <KanbanColumn title={column.title} status={column.status} cards={cardsByStatus()[column.status]} isMultiSelectMode={props.isMultiSelectMode} onCardClick={props.onCardClick} onCheckboxClick={props.onCheckboxClick} onTogglePin={props.onTogglePin} onRename={props.onRename} onArchive={props.onArchive} onCopyBranch={props.onCopyBranch} onExportChat={props.onExportChat} onCopyChat={props.onCopyChat} />}</For>
      </div>
    </div>;
}
