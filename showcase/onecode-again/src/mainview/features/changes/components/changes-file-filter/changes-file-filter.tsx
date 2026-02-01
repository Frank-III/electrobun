import { createSignal, createMemo, Show, mergeProps, splitProps } from "solid-js";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
import { Search, X } from "lucide-solid";
import { SearchCombobox } from "../../../../components/ui/search-combobox";
import { PopoverTrigger } from "../../../../components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { AgentIcon, CircleFilterIcon } from "../../../../components/ui/icons";
export interface SubChatFilterItem {
	id: string;
	name: string;
	filePaths: string[];
	fileCount: number;
}
interface ChangesFileFilterProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	class?: string;
	/** Available subchats for filtering */
	subChats?: SubChatFilterItem[];
	/** Currently selected subchat ID for filtering */
	selectedSubChatId?: string | null;
	/** Callback when subchat filter changes */
	onSubChatFilterChange?: (subChatId: string | null) => void;
}
export function ChangesFileFilter(props: ChangesFileFilterProps) {
	const merged = mergeProps({ placeholder: "Filter files...", subChats: [] }, props);
	const [local] = splitProps(merged, ["value", "onChange", "placeholder", "class", "subChats", "selectedSubChatId", "onSubChatFilterChange"]);
	const [isSubChatFilterOpen, setIsSubChatFilterOpen] = createSignal(false);
	const selectedSubChat = createMemo(() => {
		if (!local.selectedSubChatId) return null;
		return local.subChats.find((sc) => sc.id === local.selectedSubChatId) || null;
	});
	const handleSubChatSelect = (subChat: SubChatFilterItem) => {
		// Toggle off if same subchat selected
		if (local.selectedSubChatId === subChat.id) {
			local.onSubChatFilterChange?.(null);
		} else {
			local.onSubChatFilterChange?.(subChat.id);
		}
		setIsSubChatFilterOpen(false);
	};
	const handleClearSubChatFilter = () => {
		local.onSubChatFilterChange?.(null);
	};
	const renderSubChatItem = (subChat: SubChatFilterItem) => {
		return <div class="flex items-center gap-2 flex-1 min-w-0">
				<AgentIcon class="w-4 h-4 text-muted-foreground flex-shrink-0" />
				<span class="text-sm truncate flex-1">
					{subChat.name || "New Chat"}
				</span>
				<span class="text-xs text-muted-foreground whitespace-nowrap">
					{subChat.fileCount} file{subChat.fileCount !== 1 ? "s" : ""}
				</span>
			</div>;
	};
	const hasSubChats = local.subChats.length > 0;
	return <div class={cn("flex flex-col gap-1.5 px-2 py-1.5",local.class)}>
			{	/* Search row */}
			<div class="flex items-center gap-1">
				{ /* Search input */}
				<div class="relative flex-1">
					<Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
				<Input type="search" value={local.value} onInput={(e) => local.onChange(e.currentTarget.value)} placeholder={local.placeholder} class="h-7 pl-7 pr-7 text-xs bg-muted/50" />
				<Show when={local.value}>
					<button type="button" onClick={() => local.onChange("")} class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors">
							<X class="size-3 text-muted-foreground" />
						</button>
					</Show>
				</div>

				{ /* Subchat filter button */}
				<Show when={hasSubChats}>
				<SearchCombobox isOpen={isSubChatFilterOpen()} onOpenChange={setIsSubChatFilterOpen} items={local.subChats} onSelect={handleSubChatSelect} placeholder="Search chats..." emptyMessage="No chats with changes" getItemValue={(subChat) => `${subChat.name || "New Chat"} ${subChat.id}`} renderItem={renderSubChatItem} side="bottom" align="end" sideOffset={4} collisionPadding={16} trigger={<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<PopoverTrigger asChild>
								<Button variant={local.selectedSubChatId ? "secondary" : "ghost"} size="icon" class={cn("h-7 w-7 p-0 flex-shrink-0 rounded-md transition-colors", local.selectedSubChatId && "bg-primary/10 hover:bg-primary/20")}>
									<CircleFilterIcon class={cn("h-4 w-4", local.selectedSubChatId ? "text-primary" : "text-muted-foreground")} />
										</Button>
									</PopoverTrigger>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{selectedSubChat() ? `Filtering: ${selectedSubChat()!.name || "New Chat"}` : "Filter by chat"}
								</TooltipContent>
							</Tooltip>} />
				</Show>
			</div>

			{ /* Active subchat filter bar */}
			<Show when={selectedSubChat()}>
				{(subChat) => <div class="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-muted/80 border border-border/50">
					<div class="flex items-center gap-1.5 min-w-0">
						<span class="text-[10px] text-muted-foreground flex-shrink-0 uppercase tracking-wide">
							Filtered
						</span>
						<span class="text-muted-foreground/30 flex-shrink-0">•</span>
						<span class="text-xs text-foreground/80 truncate">
							{subChat().name || "New Chat"}
						</span>
						<span class="text-[10px] text-muted-foreground flex-shrink-0">
							({subChat().fileCount})
						</span>
					</div>
					<button type="button" onClick={handleClearSubChatFilter} class="p-0.5 rounded hover:bg-foreground/10 transition-colors flex-shrink-0">
						<X class="w-3.5 h-3.5 text-muted-foreground" />
					</button>
				</div>}
			</Show>
		</div>;
 }
