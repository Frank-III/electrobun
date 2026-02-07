import { createMemo, createSignal, mergeProps, Show } from "solid-js";
import { loadingSubChatsAtom } from "../atoms";
import { Plus, ChevronDown, Play, AlignJustify, FolderDown } from "lucide-solid";
import { IconSpinner, PlanIcon, AgentIcon, DiffIcon, CustomTerminalIcon, IconTextUndo } from "../../../components/ui/icons";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useAgentSubChatStore, type SubChatMeta } from "../stores/sub-chat-store";
import { PopoverTrigger } from "../../../components/ui/popover";
import { SearchCombobox } from "../../../components/ui/search-combobox";
import { formatTimeAgo } from "../utils/format-time-ago";
interface DiffStats {
	fileCount: number;
	additions: number;
	deletions: number;
	isLoading: boolean;
	hasChanges: boolean;
}
interface MobileChatHeaderProps {
	onCreateNew: () => void;
	onBackToChats?: () => void;
	onOpenPreview?: () => void;
	canOpenPreview?: boolean;
	onOpenDiff?: () => void;
	canOpenDiff?: boolean;
	diffStats?: DiffStats;
	onOpenTerminal?: () => void;
	canOpenTerminal?: boolean;
	isArchived?: boolean;
	onRestore?: () => void;
	onOpenLocally?: () => void;
	showOpenLocally?: boolean;
}
export function MobileChatHeader(rawProps: MobileChatHeaderProps) {
	const props = mergeProps({ canOpenPreview: false, canOpenDiff: false, canOpenTerminal: false, isArchived: false, showOpenLocally: false }, rawProps);
	const subChatStore = useAgentSubChatStore();
	const activeSubChatId = createMemo(() => subChatStore.activeSubChatId);
	const allSubChats = createMemo(() => subChatStore.allSubChats);
	const [loadingSubChats] = loadingSubChatsAtom;
	const [isHistoryOpen, setIsHistoryOpen] = createSignal(false);
	// Find active sub-chat metadata
	const activeSubChat = createMemo(() => {
		return allSubChats().find((sc) => sc.id === activeSubChatId());
	});
	const isLoading = createMemo(() => {
		const id = activeSubChatId();
		return id ? loadingSubChats().has(id) : false;
	});
	const mode = () => activeSubChat()?.mode || "agent";
	// Sort sub-chats by most recent first for history
	const sortedSubChats = createMemo(() => [...allSubChats()].sort((a, b) => {
		const aT = new Date(a.updated_at || a.created_at || "0").getTime();
		const bT = new Date(b.updated_at || b.created_at || "0").getTime();
		return bT - aT;
	}));
	const onSwitchFromHistory = (subChatId: string) => {
		const state = useAgentSubChatStore.getState();
		const isAlreadyOpen = state.openSubChatIds.includes(subChatId);
		if (!isAlreadyOpen) {
			state.addToOpenSubChats(subChatId);
		}
		state.setActiveSubChat(subChatId);
	};
	const handleSelectFromHistory = (subChat: SubChatMeta) => {
		onSwitchFromHistory(subChat.id);
		setIsHistoryOpen(false);
	};
	return <div class="flex items-center gap-1.5 h-7 w-full min-w-0" style={{ "-webkit-app-region": "drag" }}>
      {	/* Burger button - opens all projects */}
      <Show when={props.onBackToChats}><Button variant="ghost" size="icon" onClick={props.onBackToChats} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="All projects" style={{ "-webkit-app-region": "no-drag" }}>
          <AlignJustify class="h-4 w-4" />
        </Button></Show>

      { /* Active chat trigger - opens history (shrinks to content, max-width limited) */}
      <SearchCombobox isOpen={isHistoryOpen()} onOpenChange={setIsHistoryOpen} items={sortedSubChats()} onSelect={handleSelectFromHistory} placeholder="Search chats..." emptyMessage="No results" align="start" side="bottom" sideOffset={8} getItemValue={(subChat) => `${subChat.name || "New Chat"} ${subChat.id}`} renderItem={(subChat) => {
 const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at);
		const isActive = subChat.id === activeSubChatId();
		return <div class={cn("flex items-center gap-2 flex-1 min-w-0", isActive && "font-medium")}>
              <span class="text-sm truncate">
                {subChat.name || "New Chat"}
              </span>
              <span class="text-sm text-muted-foreground whitespace-nowrap">
                {timeAgo}
              </span>
            </div>;
	}} trigger={<PopoverTrigger asChild>
            <button class={cn("flex items-center gap-1.5 h-7 px-2 rounded-md text-sm", "bg-muted/50 hover:bg-muted transition-colors", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", "min-w-0 max-w-[50vw] shrink")} style={{ "-webkit-app-region": "no-drag" }}>
              {	/* Icon */}
              <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                <Show when={isLoading()} fallback={<Show when={mode() === "plan"} fallback={<AgentIcon class="w-3.5 h-3.5 text-muted-foreground" />}><PlanIcon class="w-3.5 h-3.5 text-muted-foreground" /></Show>}>
                  <IconSpinner class="w-3.5 h-3.5 text-muted-foreground" />
                </Show>
              </div>

              { /* Name */}
              <span class="truncate text-left">
                {activeSubChat()?.name || "New Chat"}
              </span>

              { /* Chevron */}
              <ChevronDown class="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </button>
          </PopoverTrigger>} />

      { /* Spacer to push buttons to the right */}
      <div class="flex-1" />

      { /* Action buttons - always on the right */}
      <div class="flex items-center gap-1 flex-shrink-0" style={{ "-webkit-app-region": "no-drag" }}>
        { /* Open Locally - only for sandbox chats */}
        <Show when={props.showOpenLocally && props.onOpenLocally}><Button variant="default" size="sm" onClick={props.onOpenLocally} class="h-7 px-2.5 gap-1.5 text-xs font-medium">
            <FolderDown class="h-3.5 w-3.5" />
            Open Locally
          </Button></Show>

        { /* Create new */}
        <Button variant="ghost" size="icon" onClick={props.onCreateNew} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
          <Plus class="h-4 w-4" />
        </Button>

        { /* Terminal button */}
        <Show when={props.onOpenTerminal && props.canOpenTerminal}><Button variant="ghost" size="icon" onClick={props.onOpenTerminal} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
            <CustomTerminalIcon class="h-4 w-4" />
          </Button></Show>

        { /* Diff button */}
        <Show when={props.onOpenDiff && props.canOpenDiff}><Button variant="ghost" size="icon" onClick={props.onOpenDiff} disabled={!props.diffStats?.hasChanges || props.diffStats?.isLoading} class={cn("h-7 w-7 p-0 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md", props.diffStats?.hasChanges && !props.diffStats?.isLoading ? "hover:bg-foreground/10" : "text-muted-foreground")}>
            <Show when={props.diffStats?.isLoading} fallback={<DiffIcon class="h-4 w-4" />}>
              <IconSpinner class="h-4 w-4" />
            </Show>
          </Button></Show>

        { /* Preview button */}
        <Show when={props.onOpenPreview && props.canOpenPreview}><Button variant="ghost" size="icon" onClick={props.onOpenPreview} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
            <Play class="h-4 w-4" />
          </Button></Show>

        { /* Restore button - only when viewing archived workspace */}
        <Show when={props.isArchived && props.onRestore}><Button variant="ghost" onClick={props.onRestore} class="h-7 px-2 gap-1.5 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md flex items-center">
            <IconTextUndo class="h-4 w-4" />
            <span class="text-xs">Restore</span>
          </Button></Show>
      </div>
    </div>;
 }
