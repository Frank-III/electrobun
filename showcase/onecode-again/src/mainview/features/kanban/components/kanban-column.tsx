import { createMemo, For, Show } from "solid-js";
import { cn } from "../../../lib/utils";
import { KanbanCard, type KanbanCardData } from "./kanban-card";
import type { SubChatStatus } from "../lib/derive-status";
interface KanbanColumnProps {
	title: string;
	status: SubChatStatus;
	cards: KanbanCardData[];
	isMultiSelectMode: boolean;
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
const STATUS_COLORS: Record<SubChatStatus, string> = {
	draft: "bg-muted-foreground/20",
	"in-progress": "bg-blue-500",
	"needs-input": "bg-amber-500",
	done: "bg-emerald-500"
};
export function KanbanColumn(props: KanbanColumnProps) {
	// Sort cards: pinned first, then by updatedAt desc
	const sortedCards = createMemo(() => {
		const pinned = props.cards.filter((c) => c.isPinned);
		const unpinned = props.cards.filter((c) => !c.isPinned);
		// Sort each group by updatedAt desc
		const sortByDate = (a: KanbanCardData, b: KanbanCardData) => {
			const aTime = a.updatedAt?.getTime() || a.createdAt.getTime();
			const bTime = b.updatedAt?.getTime() || b.createdAt.getTime();
			return bTime - aTime;
		};
		pinned.sort(sortByDate);
		unpinned.sort(sortByDate);
		return [...pinned, ...unpinned];
	});
	return <div class="flex flex-col min-w-[140px] max-w-[240px] flex-1 h-full">
      {	/* Column header */}
      <div class="flex items-center gap-2 px-2 py-2 mb-2">
        <span class={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_COLORS[props.status])} />
        <h3 class="text-sm font-medium text-foreground">{props.title}</h3>
        <span class="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
          {props.cards.length}
        </span>
      </div>

      { /* Cards container with scroll */}
      <div class="flex-1 overflow-y-auto px-1 pb-4 space-y-2">
        <Show when={sortedCards().length > 0} fallback={
          <div class="px-3 py-8 text-center text-sm text-muted-foreground/60">
            No workspaces
          </div>
        }>
          <For each={sortedCards()}>
            {(card) => (
              <KanbanCard card={card} isMultiSelectMode={props.isMultiSelectMode} onClick={(e) => props.onCardClick(card, e)} onCheckboxClick={props.onCheckboxClick} onTogglePin={props.onTogglePin} onRename={props.onRename} onArchive={props.onArchive} onCopyBranch={props.onCopyBranch} onExportChat={props.onExportChat} onCopyChat={props.onCopyChat} />
            )}
          </For>
        </Show>
      </div>
    </div>;
}
